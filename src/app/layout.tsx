import type {Metadata} from "next";

import Link from "next/link";
import localFont from "next/font/local";

import {Button} from "@/components/ui/button";
import {ThemeProvider} from "@/components/theme-provider";
import {ThemeSwitcher} from "@/components/theme-switcher";
import "./globals.css";

const styreneB = localFont({
  src: [
    {
      path: "../../public/fonts/styrene/StyreneB-Thin-Trial-BF63f6cc84a4246.otf",
      weight: "100",
      style: "normal",
    },
    {
      path: "../../public/fonts/styrene/StyreneB-ThinItalic-Trial-BF63f6cbe8d3333.otf",
      weight: "100",
      style: "italic",
    },
    {
      path: "../../public/fonts/styrene/StyreneB-Light-Trial-BF63f6cbe64b47b.otf",
      weight: "300",
      style: "normal",
    },
    {
      path: "../../public/fonts/styrene/StyreneB-LightItalic-Trial-BF63f6cbe9d67d1.otf",
      weight: "300",
      style: "italic",
    },
    {
      path: "../../public/fonts/styrene/StyreneB-Regular-Trial-BF63f6cbe9db1d5.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/styrene/StyreneB-RegularItalic-Trial-BF63f6cbe5c1942.otf",
      weight: "400",
      style: "italic",
    },
    {
      path: "../../public/fonts/styrene/StyreneB-Medium-Trial-BF63f6cc85760c2.otf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../public/fonts/styrene/StyreneB-MediumItalic-Trial-BF63f6cc84a421a.otf",
      weight: "500",
      style: "italic",
    },
    {
      path: "../../public/fonts/styrene/StyreneB-Bold-Trial-BF63f6cbe9f13bb.otf",
      weight: "700",
      style: "normal",
    },
    {
      path: "../../public/fonts/styrene/StyreneB-BoldItalic-Trial-BF63f6cbe6863e6.otf",
      weight: "700",
      style: "italic",
    },
    {
      path: "../../public/fonts/styrene/StyreneB-Black-Trial-BF63f6cbe3dc69b.otf",
      weight: "900",
      style: "normal",
    },
    {
      path: "../../public/fonts/styrene/StyreneB-BlackItalic-Trial-BF63f6cbe2d985b.otf",
      weight: "900",
      style: "italic",
    },
  ],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Anfibios de Ecuador - SapoPedia",
  description:
    "Enciclopedia electrónica de anfibios de Ecuador. Explora la increíble diversidad de ranas, sapos, salamandras y cecilias.",
};

export default function RootLayout({children}: {children: React.ReactNode}) {
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
                <Link className="text-2xl font-bold" href="/" style={{color: "#006d1b"}}>
                  🐸 Anfibios de Ecuador
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
