"use client";

import {QueryClient} from "@tanstack/react-query";
import {ReactQueryDevtools} from "@tanstack/react-query-devtools";
import {createSyncStoragePersister} from "@tanstack/query-sync-storage-persister";
import {PersistQueryClientProvider} from "@tanstack/react-query-persist-client";
import {useState} from "react";

const MAX_AGE = 24 * 60 * 60 * 1000;

export default function Providers({children}: {children: React.ReactNode}) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000,
            gcTime: MAX_AGE,
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      }),
  );

  // `storage: undefined` en el servidor deja el persister como no-op.
  const [persister] = useState(() =>
    createSyncStoragePersister({
      storage: typeof window === "undefined" ? undefined : window.localStorage,
      key: "rq-cache-amphibians-v1",
    }),
  );

  // PersistQueryClientProvider (en vez de restaurar a mano dentro de un
  // useEffect) coordina la restauración con la hidratación vía `isRestoring`:
  // si la caché de localStorage entraba a mitad de hidratación, el cliente
  // pintaba ya la lista mientras el HTML del servidor traía "Cargando…", y
  // React abortaba la hidratación de ese subárbol.
  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{persister, maxAge: MAX_AGE, buster: "v1"}}
    >
      {children}
      <ReactQueryDevtools buttonPosition="bottom-left" initialIsOpen={false} />
    </PersistQueryClientProvider>
  );
}
