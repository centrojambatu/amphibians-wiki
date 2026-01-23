import type {Metadata} from "next";

export const metadata: Metadata = {
  title: "Fototeca - SapoPedia",
  description: "Galería de fotografías de anfibios de Ecuador y del mundo",
};

export default function FototecaLayout({children}: {children: React.ReactNode}) {
  return children;
}
