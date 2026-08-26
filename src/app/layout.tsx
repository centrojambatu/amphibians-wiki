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
        </Providers>
      </body>
    </html>
  );
}
