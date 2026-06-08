import MoleculotecaListClient from "./MoleculotecaListClient";

export default function MoleculotecaPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-4xl font-bold text-gray-900">Moleculoteca</h1>
      </div>

      <MoleculotecaListClient />
    </main>
  );
}
