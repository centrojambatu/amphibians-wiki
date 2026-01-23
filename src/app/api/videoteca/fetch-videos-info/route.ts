import {NextResponse} from "next/server";

/**
 * API route para obtener información de videos de YouTube
 * Uso: POST /api/videoteca/fetch-videos-info
 * Body: { videoIds: string[] }
 */

interface VideoInfo {
  id: string;
  title: string;
  channelTitle: string;
  thumbnail: string;
  duration: string;
  viewCount: number;
  publishedAt: string;
}

async function getVideoInfo(videoId: string, apiKey: string): Promise<VideoInfo | null> {
  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,contentDetails&id=${videoId}&key=${apiKey}`,
    );

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.items || data.items.length === 0) {
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
    console.error(`Error al obtener información del video ${videoId}:`, error);
    return null;
  }
}

export async function POST(request: Request) {
  try {
    const {videoIds} = await request.json();

    if (!Array.isArray(videoIds) || videoIds.length === 0) {
      return NextResponse.json({error: "videoIds debe ser un array no vacío"}, {status: 400});
    }

    const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

    if (!YOUTUBE_API_KEY) {
      return NextResponse.json(
        {
          error: "YOUTUBE_API_KEY no está configurada",
          message: "Configura YOUTUBE_API_KEY en tus variables de entorno",
        },
        {status: 500},
      );
    }

    const videos: VideoInfo[] = [];

    // Procesar videos en lotes para evitar exceder límites de la API
    for (const videoId of videoIds) {
      const info = await getVideoInfo(videoId, YOUTUBE_API_KEY);
      if (info) {
        videos.push(info);
      }
      // Pequeña pausa entre requests
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    return NextResponse.json({videos});
  } catch (error) {
    console.error("Error al obtener información de videos:", error);
    return NextResponse.json(
      {error: error instanceof Error ? error.message : "Error desconocido"},
      {status: 500},
    );
  }
}
