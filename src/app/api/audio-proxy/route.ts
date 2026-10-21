import {NextResponse} from "next/server";

// WordPress (Hostinger) no envía Access-Control-Allow-Origin, así que el navegador
// bloquea el fetch que hace wavesurfer para dibujar el espectrograma. Este proxy
// sirve el audio desde nuestro propio dominio. Solo admite hosts conocidos para no
// convertirse en un proxy abierto.
const HOSTS_PERMITIDOS = new Set(["anfibiosecuador.ec", "www.anfibiosecuador.ec"]);

// Encabezados que se reenvían para que el <audio> pueda hacer streaming y saltos.
const HEADERS_RESPUESTA = [
  "content-type",
  "content-length",
  "content-range",
  "accept-ranges",
  "last-modified",
  "etag",
];

export async function GET(request: Request) {
  const audioUrl = new URL(request.url).searchParams.get("url");

  if (!audioUrl) {
    return NextResponse.json({error: "URL de audio requerida"}, {status: 400});
  }

  let destino: URL;

  try {
    destino = new URL(audioUrl);
  } catch {
    return NextResponse.json({error: "URL de audio inválida"}, {status: 400});
  }

  if (destino.protocol !== "https:" || !HOSTS_PERMITIDOS.has(destino.hostname)) {
    return NextResponse.json({error: "Host no permitido"}, {status: 403});
  }

  const range = request.headers.get("range");
  const upstream = await fetch(destino, {
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; AmphibiansWiki/1.0)",
      ...(range ? {Range: range} : {}),
    },
  });

  if (!upstream.ok && upstream.status !== 206) {
    return NextResponse.json(
      {error: `Error al obtener audio: ${String(upstream.status)}`},
      {status: upstream.status},
    );
  }

  const headers = new Headers({"Cache-Control": "public, max-age=86400"});

  for (const nombre of HEADERS_RESPUESTA) {
    const valor = upstream.headers.get(nombre);

    if (valor) headers.set(nombre, valor);
  }

  return new Response(upstream.body, {status: upstream.status, headers});
}
