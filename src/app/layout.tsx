import type {Metadata} from "next";

import Navbar from "@/components/Navbar";
import Providers from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Anfibios de Ecuador - Sapopedia",
  description:
    "Enciclopedia electrónica de anfibios de Ecuador. Explora la increíble diversidad de ranas, sapos, salamandras y cecilias.",
};

export default function RootLayout({children}: Readonly<{children: React.ReactNode}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className="bg-background min-h-screen font-sans antialiased" suppressHydrationWarning>
        <Providers>
          <Navbar />

          <main className="flex-1">{children}</main>

          <footer className="bg-background/95 supports-[backdrop-filter]:bg-background/60 border-t backdrop-blur">
            <div className="container mx-auto flex flex-col items-center justify-center gap-1 px-4 py-3 text-center text-[11px] text-muted-foreground sm:flex-row sm:gap-2">
              <span>© {new Date().getFullYear()} Centro Jambatu</span>
              <span className="hidden text-gray-300 sm:inline">·</span>
              <span>Enciclopedia electrónica de Anfibios de Ecuador</span>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
