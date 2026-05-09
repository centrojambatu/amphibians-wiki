import {Metadata} from "next";

export const metadata: Metadata = {
  title: "Audioteca - Sapopedia",
  description: "Listado de especies con cantos disponibles",
};

export default function AudiotecaLayout({children}: {children: React.ReactNode}) {
  return children;
}
