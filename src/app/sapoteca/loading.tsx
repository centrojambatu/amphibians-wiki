export default function SapotecaLoading() {
  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-6 text-center">
        <h1 className="mb-2 text-4xl font-bold">Biblioteca</h1>
      </div>

      {/* Skeleton de estadísticas */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-lg border bg-white p-6">
            <div className="h-4 w-32 animate-pulse rounded bg-gray-200" />
            <div className="mt-3 h-7 w-16 animate-pulse rounded bg-gray-200" />
          </div>
        ))}
      </div>

      {/* Skeleton de histograma */}
      <div className="mb-8 rounded-lg border border-gray-200 bg-white p-6">
        <div className="mb-4 h-5 w-64 animate-pulse rounded bg-gray-200" />
        <div className="h-[252px] animate-pulse rounded bg-gray-100" />
      </div>

      {/* Layout filtros + contenido */}
      <div className="flex gap-6">
        {/* Skeleton del panel de filtros */}
        <div className="w-80 flex-shrink-0">
          <div className="rounded-lg border border-gray-200 bg-white px-6 py-4">
            <div className="space-y-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i}>
                  <div className="h-10 w-full animate-pulse rounded bg-gray-100" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Skeleton del contenido */}
        <div className="min-w-0 flex-1">
          <div className="mb-6 h-4 w-48 animate-pulse rounded bg-gray-200" />
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="rounded-lg border bg-white p-5">
                <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200" />
                <div className="mt-3 h-3 w-1/2 animate-pulse rounded bg-gray-100" />
                <div className="mt-2 h-3 w-full animate-pulse rounded bg-gray-100" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
