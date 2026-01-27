/* eslint-disable @typescript-eslint/no-unsafe-assignment */
interface Post {
  id: string;
  title: string;
  content: string;
}

// Next.js will invalidate the cache when a
// request comes in, at most once every 60 seconds.
export const revalidate = 60;

export async function generateStaticParams() {
  try {
    const posts: Post[] = await fetch("https://api.vercel.app/blog").then((res) =>
      res.json(),
    );

    return posts.map((post) => ({
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-conversion
      id: String(post.id),
    }));
  } catch (error) {
    // Si falla el fetch durante el build, retornar array vacío
    // La página se generará dinámicamente cuando se acceda
    console.warn("Failed to fetch blog posts during build:", error);
    return [];
  }
}

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  
  try {
    const post: Post = await fetch(`https://api.vercel.app/blog/${id}`).then(
      (res) => res.json(),
    );

    return (
      <main>
        <h1>{post.title}</h1>
        <p>{post.content}</p>
      </main>
    );
  } catch (error) {
    return (
      <main>
        <h1>Post no encontrado</h1>
        <p>No se pudo cargar el contenido del blog.</p>
      </main>
    );
  }
}
