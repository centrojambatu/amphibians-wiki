import {Metadata} from "next";

export const metadata: Metadata = {
  title: "Fonoteca - Sapopedia",
  description: "Audios destacados sobre anfibios de Ecuador y del mundo",
};

export default function FonotecaLayout({children}: {children: React.ReactNode}) {
  return children;
}
