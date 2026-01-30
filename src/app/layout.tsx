import type {Metadata} from "next";

import Navbar from "@/components/Navbar";
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
        <Navbar />

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
