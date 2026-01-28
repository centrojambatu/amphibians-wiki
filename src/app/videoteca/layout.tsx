import {Metadata} from "next";

export const metadata: Metadata = {
  title: "Videoteca - Sapopedia",
  description: "Videos destacados sobre anfibios de Ecuador y del mundo",
};

export default function VideotecaLayout({children}: {children: React.ReactNode}) {
  return children;
}
