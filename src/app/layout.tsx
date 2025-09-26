import type {Metadata} from "next";

import Link from "next/link";

import {Button} from "@/components/ui/button";
import "./globals.css";

export const metadata: Metadata = {
  title: "Anfibios de Ecuador - SapoPedia",
  description:
    "Enciclopedia electrónica de anfibios de Ecuador. Explora la increíble diversidad de ranas, sapos, salamandras y cecilias.",
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="es">
      <body className="bg-background min-h-screen font-sans antialiased">
        <header className="bg-background/95 supports-[backdrop-filter]:bg-background/60 border-b backdrop-blur">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Link className="text-primary text-2xl font-bold" href="/">
                🐸 Anfibios de Ecuador
              </Link>
              <nav className="flex items-center gap-4">
                <Link href="/">
                  <Button variant="ghost">Inicio</Button>
                </Link>
                <Link href="/sapopedia">
                  <Button variant="ghost">SapoPedia</Button>
                </Link>
                <Link href="/blog">
                  <Button variant="ghost">Blog</Button>
                </Link>
              </nav>
            </div>
          </div>
        </header>

        <main className="flex-1">{children}</main>

        <footer className="bg-background/95 supports-[backdrop-filter]:bg-background/60 border-t backdrop-blur">
          <div className="container mx-auto px-4 py-8">
            <div className="text-muted-foreground text-center text-sm">
              <p className="mb-2">© 2024 Centro Jambatu</p>
              <p>Enciclopedia electrónica de Anfibios de Ecuador</p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
