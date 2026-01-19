import { createServiceClient } from "@/utils/supabase/server";

// interface Post {
//   id: string;
//   title: string;
//   content: string;
// }

// Next.js will invalidate the cache when a
// request comes in, at most once every 24 hours.
export const revalidate = 86400; // 24 hours

export async function generateStaticParams() {
  // const posts: Post[] = await fetch("https://api.vercel.app/blog").then((res) => res.json());

  // return posts.map((post) => ({
  //   id: String(post.id),
  // }));

  const supabaseClient = createServiceClient();

  const { data: taxons, error } = await supabaseClient
    .from("taxon")
    .select("id_taxon");

  if (!taxons) {
    return [];
  }

  if (error) {
    console.error(error);
  }

  return taxons.map((taxon) => ({
    id: String(taxon.id_taxon),
  }));
}

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabaseClient = createServiceClient();
  const { data: taxons, error } = await supabaseClient
    .from("ficha_especie")
    .select("*")
    .eq("taxon_id", Number(id));

  if (error) {
    console.error(error);
  }

  console.log(taxons);

  return (
    <main>
      {/* <h1>Sapopedia</h1> */}
      {/* <h1>{taxons?.[0].nombre_comun}</h1> */}
      <p>{taxons?.[0]?.taxon_id}</p>
    </main>
  );
}
