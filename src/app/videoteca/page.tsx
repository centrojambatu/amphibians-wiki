import {Metadata} from "next";
import {videosEcuador, videosMundo, VideoData} from "./videos-data";

export const metadata: Metadata = {
  title: "Videoteca - SapoPedia",
  description: "Videos destacados sobre anfibios de Ecuador y del mundo",
};

export default function VideotecaPage() {
  // Videos obtenidos manualmente desde videos-data.ts

  return (
    <div className="bg-background min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Videoteca</h1>
          <p className="mt-2 text-gray-600">
            Videos destacados sobre anfibios de Ecuador y del mundo del canal{" "}
            <a
              className="text-green-600 hover:underline"
              href="https://www.youtube.com/@ArcaDeLosSapos"
              rel="noopener noreferrer"
              target="_blank"
            >
              Arca de los Sapos
            </a>
          </p>
        </div>

        {/* Sección Anfibios Ecuador */}
        <section className="mb-12">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Anfibios Ecuador</h2>
              <p className="mt-1 text-sm text-gray-600">
                Videos destacados de SapoPediaEcuador (Enciclopedia Electrónica de los Anfibios de
                Ecuador)
              </p>
            </div>
            {videosEcuador.length > 0 && (
              <a
                className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700"
                href={`https://www.youtube.com/@ArcaDeLosSapos/playlists`}
                rel="noopener noreferrer"
                target="_blank"
              >
                <svg
                  className="h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
                Reproducir todo
              </a>
            )}
          </div>

          {videosEcuador.length > 0 ? (
            <div className="relative">
              <div className="flex gap-4 overflow-x-auto pb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                {videosEcuador.map((video) => (
                  <VideoCard key={video.id} video={video} />
                ))}
              </div>
            </div>
          ) : (
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center">
              <p className="text-gray-600">
                No hay videos configurados. Agrega videos en{" "}
                <code className="rounded bg-gray-200 px-2 py-1 text-sm">src/app/videoteca/videos-data.ts</code>
              </p>
            </div>
          )}
        </section>

        {/* Sección Anfibios Mundo */}
        <section className="mb-12">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Anfibios mundo</h2>
              <p className="mt-1 text-sm text-gray-600">Videos destacados sobre Anfibios del mundo</p>
            </div>
            {videosMundo.length > 0 && (
              <a
                className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700"
                href={`https://www.youtube.com/@ArcaDeLosSapos/playlists`}
                rel="noopener noreferrer"
                target="_blank"
              >
                <svg
                  className="h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
                Reproducir todo
              </a>
            )}
          </div>

          {videosMundo.length > 0 ? (
            <div className="relative">
              <div className="flex gap-4 overflow-x-auto pb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                {videosMundo.map((video) => (
                  <VideoCard key={video.id} video={video} />
                ))}
              </div>
            </div>
          ) : (
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center">
              <p className="text-gray-600">
                No hay videos configurados. Agrega videos en{" "}
                <code className="rounded bg-gray-200 px-2 py-1 text-sm">src/app/videoteca/videos-data.ts</code>
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

// Componente para mostrar una tarjeta de video
function VideoCard({video}: {video: VideoData}) {
  const formatViews = (views?: number) => {
    if (!views) return "";
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)} M`;
    }
    if (views >= 1000) {
      return `${(views / 1000).toFixed(1)} K`;
    }
    return views.toString();
  };

  return (
    <div className="flex-shrink-0" style={{width: "320px"}}>
      <a
        className="block"
        href={`https://www.youtube.com/watch?v=${video.id}`}
        rel="noopener noreferrer"
        target="_blank"
      >
        <div className="group relative cursor-pointer overflow-hidden rounded-lg">
          {/* Thumbnail */}
          <div className="relative aspect-video w-full overflow-hidden bg-gray-200">
            <img
              alt={video.title}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              src={video.thumbnail || `https://img.youtube.com/vi/${video.id}/maxresdefault.jpg`}
            />
            {/* Duración */}
            {video.duration && (
              <div className="absolute bottom-2 right-2 rounded bg-black/80 px-1.5 py-0.5 text-xs font-semibold text-white">
                {video.duration}
              </div>
            )}
          </div>

          {/* Información del video */}
          <div className="mt-2">
            <h3 className="line-clamp-2 text-sm font-medium text-gray-900 group-hover:text-red-600">
              {video.title}
            </h3>
            <p className="mt-1 text-xs text-gray-600">{video.channelTitle}</p>
            {(video.viewCount || video.publishedAt) && (
              <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
                {video.viewCount && (
                  <>
                    <span>{formatViews(video.viewCount)} visualizaciones</span>
                    {video.publishedAt && <span>·</span>}
                  </>
                )}
                {video.publishedAt && <span>{video.publishedAt}</span>}
              </div>
            )}
          </div>
        </div>
      </a>
    </div>
  );
}
