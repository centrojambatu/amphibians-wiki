import {revalidateTag} from "next/cache";
import {NextResponse} from "next/server";

const KNOWN_TAGS = new Set(["nombres", "tipos-publicacion"]);

export async function POST(request: Request) {
  const {searchParams} = new URL(request.url);
  const tag = searchParams.get("tag");
  const secret = searchParams.get("secret") ?? request.headers.get("x-revalidate-secret");

  if (!process.env.REVALIDATE_SECRET || secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({error: "Unauthorized"}, {status: 401});
  }

  if (!tag || !KNOWN_TAGS.has(tag)) {
    return NextResponse.json(
      {error: `Tag inválido. Usa uno de: ${[...KNOWN_TAGS].join(", ")}`},
      {status: 400},
    );
  }

  revalidateTag(tag);

  return NextResponse.json({revalidated: true, tag});
}
