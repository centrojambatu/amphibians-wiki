/**
 * Script para obtener información de videos de YouTube usando oEmbed (sin API key)
 * Uso: npx tsx scripts/fetch-videos-oembed.ts
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

async function getVideoInfo(videoId: string): Promise<VideoInfo | null> {
  try {
    // Usar oEmbed de YouTube (no requiere API key)
    const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
    
    const response = await fetch(oembedUrl);

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    // oEmbed solo proporciona información básica
    // Para obtener más detalles, intentamos obtener el título de la página
    return {
      id: videoId,
      title: data.title || "Video de Anfibios Ecuador",
      channelTitle: data.author_name || "Arca de los Sapos",
      thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
    };
  } catch (error) {
    console.error(`❌ Error al obtener información del video ${videoId}:`, error);
    // Retornar información básica si falla
    return {
      id: videoId,
      title: "Video de Anfibios Ecuador",
      channelTitle: "Arca de los Sapos",
      thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
    };
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
  console.log("🔍 Obteniendo información de videos de YouTube (sin API key)...\n");

  const videos: VideoInfo[] = [];

  for (let i = 0; i < videoIdsEcuador.length; i++) {
    const videoId = videoIdsEcuador[i];
    console.log(`📹 [${i + 1}/${videoIdsEcuador.length}] Procesando: ${videoId}...`);
    const info = await getVideoInfo(videoId);
    if (info) {
      videos.push(info);
      console.log(`   ✅ ${info.title.substring(0, 60)}${info.title.length > 60 ? "..." : ""}`);
    }
    // Pequeña pausa para no hacer demasiadas requests
    if (i < videoIdsEcuador.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 500));
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
  console.log("ℹ️  Nota: oEmbed solo proporciona título y autor. Para obtener duración, visualizaciones y fecha, necesitarías la API de YouTube.");
}

main().catch((error) => {
  console.error("❌ Error:", error);
  process.exit(1);
});
