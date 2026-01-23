/**
 * Script para obtener información de videos de YouTube
 * Uso: npx tsx scripts/fetch-youtube-videos-info.ts
 */

const videoIds = [
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
  thumbnail: string;
  duration: string;
  viewCount: number;
  publishedAt: string;
}

async function getVideoInfo(videoId: string): Promise<VideoInfo | null> {
  const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

  if (!YOUTUBE_API_KEY) {
    console.error("❌ YOUTUBE_API_KEY no está configurada en las variables de entorno");
    console.log("💡 Configura YOUTUBE_API_KEY en tu archivo .env.local");
    return null;
  }

  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,contentDetails&id=${videoId}&key=${YOUTUBE_API_KEY}`,
    );

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
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

    return {
      id: videoId,
      title: snippet.title,
      channelTitle: snippet.channelTitle,
      thumbnail: snippet.thumbnails.high?.url || snippet.thumbnails.medium?.url || "",
      duration: formatDuration(contentDetails.duration),
      viewCount: parseInt(statistics.viewCount || "0", 10),
      publishedAt: formatDate(snippet.publishedAt),
    };
  } catch (error) {
    console.error(`❌ Error al obtener información del video ${videoId}:`, error);
    return null;
  }
}

async function main() {
  console.log("🔍 Obteniendo información de videos de YouTube...\n");

  const videos: VideoInfo[] = [];

  for (const videoId of videoIds) {
    console.log(`📹 Procesando video: ${videoId}...`);
    const info = await getVideoInfo(videoId);
    if (info) {
      videos.push(info);
      console.log(`✅ ${info.title}`);
    }
    // Pequeña pausa para no exceder límites de la API
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  console.log("\n📋 Información obtenida:\n");
  console.log(JSON.stringify(videos, null, 2));

  // Generar código TypeScript
  console.log("\n📝 Código TypeScript para videos-data.ts:\n");
  console.log("export const videosEcuador: VideoData[] = [");
  videos.forEach((video) => {
    console.log("  {");
    console.log(`    id: "${video.id}",`);
    console.log(`    title: ${JSON.stringify(video.title)},`);
    console.log(`    channelTitle: ${JSON.stringify(video.channelTitle)},`);
    if (video.thumbnail) {
      console.log(`    thumbnail: ${JSON.stringify(video.thumbnail)},`);
    }
    if (video.duration) {
      console.log(`    duration: "${video.duration}",`);
    }
    if (video.viewCount) {
      console.log(`    viewCount: ${video.viewCount},`);
    }
    if (video.publishedAt) {
      console.log(`    publishedAt: "${video.publishedAt}",`);
    }
    console.log("  },");
  });
  console.log("];");
}

main().catch(console.error);
