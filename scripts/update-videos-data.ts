/**
 * Script para actualizar automáticamente videos-data.ts con información de YouTube
 * 
 * Uso:
 * 1. Configura YOUTUBE_API_KEY en tu archivo .env.local
 * 2. Ejecuta: npx tsx scripts/update-videos-data.ts
 */

import * as fs from "fs";
import * as path from "path";

const videoIdsEcuador = [
  "RItLaaBXezE",
  "kgtKCaB3zQc",
  "-ztTTLmO-G0",
  "yC1QVRhnnl0",
  "z01JHh5Y_Ds",
  "o6yefgZ8jmI",
  "272E18j8zgw",
  "F2ZV6SJd0zU",
  "j56Fy-8AH0Y",
  "U8yXu_4nl10",
  "Qk8r86wlyMc",
  "FsZnZAx3gPY",
];

interface VideoInfo {
  id: string;
  title: string;
  channelTitle: string;
  thumbnail?: string;
  duration?: string;
  viewCount?: number;
  publishedAt?: string;
}

async function getVideoInfo(videoId: string, apiKey: string): Promise<VideoInfo | null> {
  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,contentDetails&id=${videoId}&key=${apiKey}`,
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Error ${response.status}: ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();

    if (!data.items || data.items.length === 0) {
      console.warn(`⚠️ Video ${videoId} no encontrado`);
      return null;
    }

    const video = data.items[0];
    const snippet = video.snippet;
    const statistics = video.statistics;
    const contentDetails = video.contentDetails;

    // Formatear duración (ISO 8601 a MM:SS o HH:MM:SS)
    const formatDuration = (duration: string): string => {
      const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
      if (!match) return "";

      const hours = parseInt(match[1] || "0", 10);
      const minutes = parseInt(match[2] || "0", 10);
      const seconds = parseInt(match[3] || "0", 10);

      if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
      }
      return `${minutes}:${seconds.toString().padStart(2, "0")}`;
    };

    // Formatear fecha
    const formatDate = (dateString: string): string => {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - date.getTime());
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays < 30) {
        return `hace ${diffDays} días`;
      }
      if (diffDays < 365) {
        const months = Math.floor(diffDays / 30);
        return `hace ${months} ${months === 1 ? "mes" : "meses"}`;
      }
      const years = Math.floor(diffDays / 365);
      return `hace ${years} ${years === 1 ? "año" : "años"}`;
    };

    const thumbnail = snippet.thumbnails.high?.url || snippet.thumbnails.medium?.url;

    return {
      id: videoId,
      title: snippet.title,
      channelTitle: snippet.channelTitle,
      thumbnail: thumbnail || undefined,
      duration: formatDuration(contentDetails.duration),
      viewCount: parseInt(statistics.viewCount || "0", 10),
      publishedAt: formatDate(snippet.publishedAt),
    };
  } catch (error) {
    console.error(`❌ Error al obtener información del video ${videoId}:`, error);
    return null;
  }
}

function generateTypeScriptCode(videos: VideoInfo[]): string {
  let code = "export const videosEcuador: VideoData[] = [\n";
  
  videos.forEach((video) => {
    code += "  {\n";
    code += `    id: "${video.id}",\n`;
    code += `    title: ${JSON.stringify(video.title)},\n`;
    code += `    channelTitle: ${JSON.stringify(video.channelTitle)},\n`;
    if (video.thumbnail) {
      code += `    thumbnail: ${JSON.stringify(video.thumbnail)},\n`;
    }
    if (video.duration) {
      code += `    duration: "${video.duration}",\n`;
    }
    if (video.viewCount) {
      code += `    viewCount: ${video.viewCount},\n`;
    }
    if (video.publishedAt) {
      code += `    publishedAt: "${video.publishedAt}",\n`;
    }
    code += "  },\n";
  });
  
  code += "];\n";
  return code;
}

async function main() {
  const apiKey = process.env.YOUTUBE_API_KEY;

  if (!apiKey) {
    console.error("❌ YOUTUBE_API_KEY no está configurada");
    console.log("\n💡 Para obtener una API key:");
    console.log("1. Ve a https://console.cloud.google.com/");
    console.log("2. Crea un proyecto o selecciona uno existente");
    console.log("3. Habilita la API de YouTube Data API v3");
    console.log("4. Crea credenciales (API Key)");
    console.log("5. Agrega YOUTUBE_API_KEY=tu_api_key en tu archivo .env.local\n");
    process.exit(1);
  }

  console.log("🔍 Obteniendo información de videos de YouTube...\n");

  const videos: VideoInfo[] = [];

  for (let i = 0; i < videoIdsEcuador.length; i++) {
    const videoId = videoIdsEcuador[i];
    console.log(`📹 [${i + 1}/${videoIdsEcuador.length}] Procesando: ${videoId}...`);
    const info = await getVideoInfo(videoId, apiKey);
    if (info) {
      videos.push(info);
      console.log(`   ✅ ${info.title.substring(0, 60)}${info.title.length > 60 ? "..." : ""}`);
    }
    // Pequeña pausa para no exceder límites de la API
    if (i < videoIdsEcuador.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 200));
    }
  }

  if (videos.length === 0) {
    console.error("\n❌ No se pudo obtener información de ningún video");
    process.exit(1);
  }

  console.log(`\n✅ Se obtuvieron ${videos.length} videos exitosamente\n`);

  // Leer el archivo actual
  const filePath = path.join(process.cwd(), "src/app/videoteca/videos-data.ts");
  let fileContent = fs.readFileSync(filePath, "utf-8");

  // Reemplazar el array videosEcuador
  const startMarker = "export const videosEcuador: VideoData[] = [";
  const endMarker = "];";
  
  const startIndex = fileContent.indexOf(startMarker);
  const endIndex = fileContent.indexOf(endMarker, startIndex);

  if (startIndex === -1 || endIndex === -1) {
    console.error("❌ No se pudo encontrar el array videosEcuador en el archivo");
    process.exit(1);
  }

  const newCode = generateTypeScriptCode(videos);
  const before = fileContent.substring(0, startIndex);
  const after = fileContent.substring(endIndex + endMarker.length);

  const newContent = before + newCode + "\n\n" + after;

  // Escribir el archivo actualizado
  fs.writeFileSync(filePath, newContent, "utf-8");

  console.log("📝 Archivo videos-data.ts actualizado exitosamente!");
  console.log(`\n📊 Resumen:`);
  console.log(`   - Videos procesados: ${videos.length}`);
  console.log(`   - Archivo actualizado: ${filePath}\n`);
}

main().catch((error) => {
  console.error("❌ Error:", error);
  process.exit(1);
});
