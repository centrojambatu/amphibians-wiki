import type { Metadata } from "next";

import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeSwitcher } from "@/components/theme-switcher";
import "./globals.css";

export const metadata: Metadata = {
  title: "Anfibios de Ecuador - SapoPedia",
  description:
    "Enciclopedia electrónica de anfibios de Ecuador. Explora la increíble diversidad de ranas, sapos, salamandras y cecilias.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html suppressHydrationWarning lang="es">
      <body className="bg-background min-h-screen font-sans antialiased">
        <ThemeProvider
          disableTransitionOnChange
          enableSystem
          attribute="class"
          defaultTheme="system"
        >
          <header className="bg-background/95 supports-[backdrop-filter]:bg-background/60 border-b backdrop-blur">
            <div className="container mx-auto px-4 py-4">
              <div className="flex items-center justify-between">
                <Link href="/" className="flex items-center">
                  <Image
                    src="/assets/references/logo.png"
                    alt="Anfibios de Ecuador"
                    width={150}
                    height={45}
                    className="h-auto w-auto"
                    priority
                  />
                </Link>
                <nav className="flex items-center gap-4">
                  <Link href="/">
                    <Button variant="ghost">Inicio</Button>
                  </Link>
                  <Link href="/sapopedia">
                    <Button variant="ghost">SapoPedia</Button>
                  </Link>
                  <Link href="/sapopedia/lista-roja">
                    <Button variant="ghost">Lista Roja</Button>
                  </Link>
                  <Link href="/sapopedia/nombres">
                    <Button variant="ghost">Nombres</Button>
                  </Link>
                  <Link href="/sapoteca">
                    <Button variant="ghost">Sapoteca</Button>
                  </Link>
                  <Link href="/mapoteca">
                    <Button variant="ghost">Mapoteca</Button>
                  </Link>
                  <Link href="/sapopedia/editor-citas">
                    <Button variant="ghost">Editor Ficha Especie</Button>
                  </Link>
                  <ThemeSwitcher />
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
        </ThemeProvider>
      </body>
    </html>
  );
}
