"use client";

import {useEffect, useState} from "react";
import Link from "next/link";
import {keepPreviousData, useQuery} from "@tanstack/react-query";
import {Video as VideoIcon, RotateCcw, Search, X, Check} from "lucide-react";
import Lightbox, {type Slide} from "yet-another-react-lightbox";
import Captions from "yet-another-react-lightbox/plugins/captions";
import Fullscreen from "yet-another-react-lightbox/plugins/fullscreen";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/captions.css";

import {Button} from "@/components/ui/button";
import CatalogoMultiSelect from "@/components/CatalogoMultiSelect";
import SpeciesSearchInput from "@/components/SpeciesSearchInput";
import YearRangeFilter from "@/components/YearRangeFilter";
import {Input} from "@/components/ui/input";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);

    return () => clearTimeout(id);
  }, [value, delay]);

  return debounced;
}

function FilterCheckbox({checked}: {checked: boolean}) {
  return (
    <div
      className={[
        "flex h-[17px] w-[17px] shrink-0 items-center justify-center rounded-[4px] border-[1.5px] transition-all",
        checked
          ? "border-[#4ba24b] bg-[#4ba24b] shadow-[inset_0_1px_2px_rgba(0,0,0,0.12)]"
          : "border-gray-300 bg-white",
      ].join(" ")}
    >
      <Check
        className={[
          "h-[10px] w-[10px] text-white transition-all",
          checked ? "scale-100 opacity-100" : "scale-50 opacity-0",
        ].join(" ")}
        strokeWidth={3}
      />
    </div>
  );
}

function AccordionButtonFilter({
  label,
  apiPath,
  selected,
  onChange,
}: {
  label: string;
  apiPath: string;
  selected: string[];
  onChange: (val: string[]) => void;
}) {
  const {data: options = []} = useQuery<string[]>({
    queryKey: [apiPath, "all"],
    queryFn: async () => {
      const res = await fetch(`${apiPath}?q=`);

      if (!res.ok) return [];

      return res.json();
    },
  });

  const toggle = (opt: string) => {
    if (selected.includes(opt)) onChange(selected.filter((s) => s !== opt));
    else onChange([...selected, opt]);
  };

  return (
    <AccordionItem value={label}>
      <AccordionTrigger className="!items-start">
        <div className="flex flex-col items-start">
          <span className="font-semibold">{label}</span>
          {selected.length > 0 && (
            <span className="mt-1 text-xs font-normal text-gray-500">{selected.join(", ")}</span>
          )}
        </div>
      </AccordionTrigger>
      <AccordionContent>
        {options.length === 0 ? (
          <p className="py-2 text-xs text-gray-500">No hay opciones disponibles</p>
        ) : (
          <div className="flex flex-col gap-2">
            {options.map((opt) => {
              const isSelected = selected.includes(opt);

              return (
                <Button
                  key={opt}
                  className="h-auto min-h-[32px] w-full justify-start rounded-md px-2 py-1 text-left text-sm break-words whitespace-normal"
                  size="sm"
                  style={{
                    borderColor: isSelected ? undefined : "#e8e8e8",
                    color: isSelected ? undefined : "#2d2d2d",
                  }}
                  variant={isSelected ? "default" : "outline"}
                  onClick={() => toggle(opt)}
                >
                  {opt}
                </Button>
              );
            })}
          </div>
        )}
      </AccordionContent>
    </AccordionItem>
  );
}

function TextMultiSelect({
  apiPath,
  placeholder,
  selected,
  onChange,
  chipBg,
  chipText,
}: {
  apiPath: string;
  placeholder: string;
  selected: string[];
  onChange: (val: string[]) => void;
  chipBg: string;
  chipText: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 300);
  const enabled = debouncedQuery.length >= 2;
  const {data: options = [], isFetching: loading} = useQuery<string[]>({
    queryKey: [apiPath, debouncedQuery],
    queryFn: async () => {
      const res = await fetch(`${apiPath}?q=${encodeURIComponent(debouncedQuery)}`);

      if (!res.ok) return [];

      return res.json();
    },
    enabled,
  });

  const toggle = (val: string) => {
    if (selected.includes(val)) onChange(selected.filter((s) => s !== val));
    else onChange([...selected, val]);
  };

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <div className="relative">
            <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <Input
              className="w-full pl-10 text-sm"
              placeholder={placeholder}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setOpen(e.target.value.length >= 2);
              }}
              onFocus={() => {
                if (query.length >= 2) setOpen(true);
              }}
            />
          </div>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="z-[1100] max-h-[220px] w-[--radix-popover-trigger-width] overflow-y-auto p-0"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <Command shouldFilter={false}>
            <CommandList>
              {options.length === 0 && debouncedQuery.length >= 2 && (
                <CommandEmpty className="px-4 py-3 text-sm text-gray-400">
                  {loading ? "Buscando..." : "Sin resultados."}
                </CommandEmpty>
              )}
              {options.length > 0 && (
                <CommandGroup>
                  {options.map((opt) => (
                    <CommandItem
                      key={opt}
                      className="cursor-pointer"
                      value={opt}
                      onSelect={() => toggle(opt)}
                    >
                      <div className="flex items-center gap-2.5">
                        <FilterCheckbox checked={selected.includes(opt)} />
                        <span className="text-sm">{opt}</span>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {selected.map((opt) => (
            <span
              key={opt}
              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] ${chipBg} ${chipText}`}
            >
              {opt.length > 30 ? opt.slice(0, 30) + "..." : opt}
              <button type="button" onClick={() => toggle(opt)}>
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

interface EspecieItem {
  id: number;
  nombre_cientifico: string;
  nombre_comun: string | null;
  slug: string;
  fotografia_url: string | null;
  orden?: string | null;
  familia?: string | null;
  genero?: string | null;
  video_url?: string | null;
  video_thumbnail?: string | null;
  video_nombre?: string | null;
}

interface VideoCard {
  enlace: string | null;
  thumbnail: string | null;
  autor: string | null;
  nombre: string | null;
  nombre_cientifico?: string | null;
  fotografia_url?: string | null;
}

interface EstadisticasVideoteca {
  total_videos: number;
  video_premiado: VideoCard | null;
  primer_video: VideoCard | null;
  video_destacado_reciente: VideoCard | null;
  video_destacado: VideoCard | null;
  video_posiblemente_extinta: VideoCard | null;
}

function pauseOtherVideos(e: React.SyntheticEvent<HTMLVideoElement>) {
  const current = e.currentTarget;

  document.querySelectorAll<HTMLVideoElement>("video").forEach((video) => {
    if (video !== current && !video.paused) video.pause();
  });
}

function getYouTubeId(url: string): string | null {
  const patterns = [
    /youtube\.com\/watch\?v=([\w-]+)/,
    /youtu\.be\/([\w-]+)/,
    /youtube\.com\/embed\/([\w-]+)/,
    /youtube\.com\/shorts\/([\w-]+)/,
  ];

  for (const re of patterns) {
    const m = url.match(re);

    if (m) return m[1];
  }

  return null;
}

function VideoPreview({src, poster}: {src: string; poster?: string | null}) {
  const [paused, setPaused] = useState(true);
  const youtubeId = getYouTubeId(src);

  if (youtubeId) {
    return (
      <iframe
        allowFullScreen
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        className="h-full w-full grayscale transition-[filter] duration-700 ease-in-out group-hover:grayscale-0"
        sandbox="allow-same-origin allow-scripts allow-popups allow-presentation"
        src={`https://www.youtube.com/embed/${youtubeId}`}
        title="YouTube video"
      />
    );
  }

  return (
    <video
      controls
      className={`h-full w-full object-cover transition-[filter] duration-700 ease-in-out ${
        paused ? "grayscale group-hover:grayscale-0" : ""
      }`}
      poster={poster ?? undefined}
      preload="none"
      src={src}
      onPause={() => setPaused(true)}
      onPlay={(e) => {
        setPaused(false);
        pauseOtherVideos(e);
      }}
    />
  );
}

function StatCard({
  label,
  caption,
  italicCaption = true,
  videoSrc,
  posterSrc,
  headerContent,
}: {
  label: string;
  caption?: string | null;
  italicCaption?: boolean;
  videoSrc?: string | null;
  posterSrc?: string | null;
  headerContent?: React.ReactNode;
}) {
  return (
    <div
      className="group flex flex-col overflow-hidden rounded-md border bg-white text-center transition-shadow hover:shadow-md"
      style={{borderColor: "#dddddd"}}
    >
      <div className="flex aspect-video w-full items-center justify-center overflow-hidden bg-gray-50">
        {headerContent ? (
          headerContent
        ) : videoSrc ? (
          <VideoPreview poster={posterSrc} src={videoSrc} />
        ) : (
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <VideoIcon className="h-4 w-4" />
            <span>Sin video</span>
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col items-center justify-center p-2">
        <span className="text-sm font-semibold" style={{color: "#666666"}}>
          {label}
        </span>
        {caption && (
          <span
            className={`mt-0.5 text-xs ${italicCaption ? "italic" : ""}`}
            style={{color: "#888888"}}
          >
            {caption}
          </span>
        )}
      </div>
    </div>
  );
}

const PUBLICACION_URL =
  "https://www.routledge.com/An-Introduction-to-the-Amphibians-of-Ecuador-Diversity-Conservation-and-Cultural-History/Coloma-Duellman/p/book/9780367653569";

function CitationLink({label, url}: {label: string; url: string}) {
  return (
    <a
      className="citation-link"
      href={url}
      rel="noopener noreferrer"
      style={{
        fontSize: 20,
        fontWeight: 600,
        textDecoration: "none",
        transition: "color 200ms",
      }}
      target="_blank"
    >
      {label}
    </a>
  );
}

const PRIMERA_PELICULA_SLIDES: Slide[] = [
  {
    src: "https://deepskyblue-beaver-511675.hostingersite.com/wp-content/uploads/2026/05/Captura-de-pantalla-2026-05-28-a-las-15.12.41.png",
    alt: "Primera película anfibios Ecuador - Gastrotheca riobambae",
    title: (
      <span
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          gap: 4,
          fontSize: 20,
          paddingLeft: 56,
        }}
      >
        <span>Primera película anfibios Ecuador</span>
        <CitationLink label="Coloma & Duellman, 2024" url={PUBLICACION_URL} />
      </span>
    ),
    description: (
      <span style={{display: "block", paddingBottom: 24, paddingTop: 8}}>
        La primera película conocida de una especie ecuatoriana, realizada en 1957 en Londres por
        Emmanuel Ciprian Amoroso. La foto muestra el amplexus de una
        <br />
        pareja en apareamiento de <i>Gastrotheca riobambae</i>, donde el macho está abriendo la
        bolsa con sus patas posteriores. Tomada de Harrison Matthews (1958).
      </span>
    ),
  },
];

export default function VideotecaPage() {
  const [searchInput, setSearchInput] = useState("");
  const [peliculaAbierta, setPeliculaAbierta] = useState(false);
  const [localidadesFilter, setLocalidadesFilter] = useState<string[]>([]);
  const [autoresFilter, setAutoresFilter] = useState<string[]>([]);
  const [catalogosFilter, setCatalogosFilter] = useState<string[]>([]);
  const [familiasFilter, setFamiliasFilter] = useState<string[]>([]);
  const [generosFilter, setGenerosFilter] = useState<string[]>([]);
  const [anioEspecifico, setAnioEspecifico] = useState<string>("");
  const [anioDesde, setAnioDesde] = useState<string>("");
  const [anioHasta, setAnioHasta] = useState<string>("");

  const search = searchInput.trim();
  const localidadesKey = localidadesFilter.join("||");
  const autoresKey = autoresFilter.join("||");
  const catalogosKey = catalogosFilter.join("||");
  const familiasKey = familiasFilter.join("||");
  const generosKey = generosFilter.join("||");

  const hasFilters =
    localidadesFilter.length > 0 ||
    autoresFilter.length > 0 ||
    catalogosFilter.length > 0 ||
    familiasFilter.length > 0 ||
    generosFilter.length > 0 ||
    searchInput.trim().length > 0 ||
    anioEspecifico.length > 0 ||
    anioDesde.length > 0 ||
    anioHasta.length > 0;

  const clearFilters = () => {
    setSearchInput("");
    setLocalidadesFilter([]);
    setAutoresFilter([]);
    setCatalogosFilter([]);
    setFamiliasFilter([]);
    setGenerosFilter([]);
    setAnioEspecifico("");
    setAnioDesde("");
    setAnioHasta("");
  };

  const {
    data: especies = [],
    isLoading: loadingEspecies,
    isFetching: fetchingEspecies,
  } = useQuery<EspecieItem[]>({
    queryKey: [
      "videoteca",
      "especies",
      search,
      localidadesKey,
      autoresKey,
      catalogosKey,
      familiasKey,
      generosKey,
      anioEspecifico,
      anioDesde,
      anioHasta,
    ],
    queryFn: async () => {
      const params = new URLSearchParams();

      if (search) params.set("search", search);
      if (localidadesKey) params.set("localidades", localidadesKey);
      if (autoresKey) params.set("autores", autoresKey);
      if (catalogosKey) params.set("catalogos", catalogosKey);
      if (familiasKey) params.set("familias", familiasKey);
      if (generosKey) params.set("generos", generosKey);
      if (anioEspecifico) params.set("anio", anioEspecifico);
      if (anioDesde) params.set("anio_desde", anioDesde);
      if (anioHasta) params.set("anio_hasta", anioHasta);
      const response = await fetch(`/api/videoteca/especies?${params.toString()}`);

      if (!response.ok) throw new Error("Error al cargar especies");

      return response.json();
    },
    placeholderData: keepPreviousData,
  });

  const {data: stats} = useQuery<EstadisticasVideoteca>({
    queryKey: ["videoteca", "estadisticas"],
    queryFn: async () => {
      const response = await fetch("/api/videoteca/estadisticas");

      if (!response.ok) throw new Error("Error al cargar estadísticas");

      return response.json();
    },
  });

  return (
    <div className="bg-background min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-4xl font-bold text-gray-900">Videoteca</h1>
          <p className="mt-2 text-gray-600">
            <span className="font-semibold" style={{color: "#f07304"}}>
              {stats?.total_videos?.toLocaleString() ?? "—"}
            </span>{" "}
            videos
          </p>
        </div>

        <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <div
            className="flex flex-col justify-center rounded-md border p-2"
            style={{borderColor: "#dddddd"}}
          >
            <a
              className="hover:text-gray-900"
              href="https://deepskyblue-beaver-511675.hostingersite.com/peliculas-anfibios"
              rel="noopener noreferrer"
              style={{
                color: "#666666",
                fontSize: "13px",
                fontFamily:
                  '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif',
                fontWeight: "600",
              }}
              target="_blank"
            >
              Películas
            </a>
            <a
              className="hover:text-gray-900"
              href="https://www.youtube.com/@ArcaDeLosSapos"
              rel="noopener noreferrer"
              style={{
                color: "#666666",
                fontSize: "13px",
                fontFamily:
                  '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif',
                fontWeight: "600",
              }}
              target="_blank"
            >
              YouTube
            </a>
          </div>

          <button
            className="cursor-pointer text-left focus:outline-none"
            type="button"
            onClick={() => setPeliculaAbierta(true)}
          >
            <StatCard
              caption="Gastrotheca riobambae"
              headerContent={
                <img
                  alt="Primera película anfibios Ecuador"
                  className="h-full w-full object-cover grayscale transition-[filter] duration-700 ease-in-out group-hover:grayscale-0"
                  loading="lazy"
                  src="https://deepskyblue-beaver-511675.hostingersite.com/wp-content/uploads/2026/05/Captura-de-pantalla-2026-05-28-a-las-15.12.41.png"
                />
              }
              label="Primera película anfibios Ecuador"
            />
          </button>

          <StatCard
            caption={stats?.video_posiblemente_extinta?.nombre_cientifico ?? null}
            label="Video posiblemente extinta"
            posterSrc={
              stats?.video_posiblemente_extinta?.thumbnail ??
              stats?.video_posiblemente_extinta?.fotografia_url
            }
            videoSrc={stats?.video_posiblemente_extinta?.enlace}
          />

          <StatCard
            caption={stats?.video_premiado?.autor ?? null}
            italicCaption={false}
            label="Video premiado"
            posterSrc={stats?.video_premiado?.thumbnail ?? stats?.video_premiado?.fotografia_url}
            videoSrc={stats?.video_premiado?.enlace}
          />

          <StatCard
            caption={stats?.video_destacado_reciente?.nombre_cientifico ?? null}
            label="Video especie más reciente"
            posterSrc={
              stats?.video_destacado_reciente?.thumbnail ??
              stats?.video_destacado_reciente?.fotografia_url
            }
            videoSrc={stats?.video_destacado_reciente?.enlace}
          />

          <StatCard
            caption={stats?.video_destacado?.autor ?? null}
            italicCaption={false}
            label="Video destacado"
            posterSrc={stats?.video_destacado?.thumbnail ?? stats?.video_destacado?.fotografia_url}
            videoSrc={stats?.video_destacado?.enlace}
          />
        </div>

        <section className="mb-12">
          <div className="flex flex-col gap-4 lg:flex-row lg:gap-6">
            <aside className="lg:w-80 lg:flex-shrink-0">
              <div className="sticky top-4 flex flex-col rounded-lg border border-gray-200 bg-white shadow-sm">
                <div className="flex-shrink-0 px-6 pt-6 pb-2">
                  <SpeciesSearchInput
                    apiPath="/api/videoteca/especies"
                    placeholder="Nombre científico o común"
                    value={searchInput}
                    onChange={setSearchInput}
                  />
                </div>

                <div className="flex flex-shrink-0 justify-end px-6 py-2">
                  <Button
                    className="gap-1.5 rounded-md border border-gray-200 bg-white px-4 py-2 text-sm font-normal text-gray-700 shadow-sm transition-colors hover:border-gray-300 hover:bg-gray-50"
                    disabled={!hasFilters}
                    type="button"
                    variant="ghost"
                    onClick={clearFilters}
                  >
                    <RotateCcw className="h-3.5 w-3.5 shrink-0 text-black" />
                    Limpiar
                  </Button>
                </div>

                <div className="mt-2 min-h-0 w-full flex-1 border-t">
                  <Accordion
                    className="[&>[data-slot=accordion-item]]:border-b [&>[data-slot=accordion-item]]:px-6"
                    type="multiple"
                  >
                    <AccordionButtonFilter
                      apiPath="/api/videoteca/familias"
                      label="Familia"
                      selected={familiasFilter}
                      onChange={setFamiliasFilter}
                    />
                    <AccordionButtonFilter
                      apiPath="/api/videoteca/generos"
                      label="Género"
                      selected={generosFilter}
                      onChange={setGenerosFilter}
                    />
                  </Accordion>

                  <div className="space-y-3 px-6 py-4">
                    <TextMultiSelect
                      apiPath="/api/videoteca/localidades"
                      chipBg="bg-green-100"
                      chipText="text-green-800"
                      placeholder="Localidad"
                      selected={localidadesFilter}
                      onChange={setLocalidadesFilter}
                    />
                    <TextMultiSelect
                      apiPath="/api/videoteca/autores"
                      chipBg="bg-blue-100"
                      chipText="text-blue-800"
                      placeholder="Autor"
                      selected={autoresFilter}
                      onChange={setAutoresFilter}
                    />
                    <CatalogoMultiSelect
                      apiPath="/api/videoteca/catalogos"
                      placeholder="CJ 10441"
                      selected={catalogosFilter}
                      onChange={setCatalogosFilter}
                    />

                    <YearRangeFilter
                      desde={anioDesde}
                      hasta={anioHasta}
                      yearMax={new Date().getFullYear()}
                      yearMin={1970}
                      onChange={(d, h) => {
                        setAnioDesde(d);
                        setAnioHasta(h);
                        if (anioEspecifico) setAnioEspecifico("");
                      }}
                    />
                  </div>
                </div>
              </div>
            </aside>

            <div className="min-w-0 flex-1">
              <div className="text-muted-foreground mb-3 flex items-center gap-2 text-xs">
                <span>
                  {`${String(especies.length)} ${especies.length === 1 ? "especie" : "especies"}`}
                </span>
                {fetchingEspecies && (
                  <span
                    aria-label="Actualizando"
                    className="border-muted-foreground/30 border-t-muted-foreground inline-block h-3 w-3 animate-spin rounded-full border-2"
                  />
                )}
              </div>

              {loadingEspecies && especies.length === 0 ? (
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center">
                  <p className="text-gray-600">Cargando especies...</p>
                </div>
              ) : especies.length > 0 ? (
                <div
                  className={`grid grid-cols-1 gap-3 transition-opacity duration-200 sm:grid-cols-2 lg:grid-cols-3 ${
                    fetchingEspecies ? "opacity-60" : "opacity-100"
                  }`}
                >
                  {especies.map((especie) => {
                    const href = `/sapopedia/species/${especie.slug}/videos?from=videoteca${searchInput.trim() ? `&search=${encodeURIComponent(searchInput.trim())}` : ""}`;
                    const queryParam = (especie.nombre_cientifico || "")
                      .split(/\s+/)
                      .map(encodeURIComponent)
                      .join("+");
                    const youtubeUrl = `https://www.youtube.com/results?search_query=${queryParam}`;
                    const googleVideosUrl = `https://www.google.com/search?tbm=vid&q=${queryParam}`;

                    return (
                      <div
                        key={especie.id}
                        className="group flex flex-col overflow-hidden rounded-md border bg-white text-center transition-shadow hover:shadow-md"
                        style={{borderColor: "#dddddd"}}
                      >
                        <div className="aspect-video w-full overflow-hidden bg-gray-50">
                          {especie.video_url ? (
                            <VideoPreview
                              poster={especie.video_thumbnail ?? especie.fotografia_url}
                              src={especie.video_url}
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-gray-300">
                              <VideoIcon className="h-10 w-10" />
                            </div>
                          )}
                        </div>
                        <Link
                          className="flex flex-1 flex-wrap items-baseline justify-start gap-x-2 px-2 pt-3 pb-1 text-left no-underline hover:bg-gray-50"
                          href={href}
                        >
                          <span className="text-sm font-semibold italic" style={{color: "#666666"}}>
                            {especie.nombre_cientifico}
                          </span>
                          {especie.nombre_comun && (
                            <>
                              <span className="text-xs" style={{color: "#f07304"}}>
                                |
                              </span>
                              <span className="text-xs" style={{color: "#888888"}}>
                                {especie.nombre_comun}
                              </span>
                            </>
                          )}
                        </Link>
                        <div className="flex items-center justify-start gap-2 px-2 pt-1 pb-3">
                          <a
                            className="text-[11px] font-medium text-gray-600 no-underline transition-colors hover:text-gray-900"
                            href={googleVideosUrl}
                            rel="noopener noreferrer"
                            target="_blank"
                          >
                            Google Videos
                          </a>
                          <span aria-hidden className="h-3 w-px bg-gray-300" />
                          <a
                            className="text-[11px] font-medium text-gray-600 no-underline transition-colors hover:text-gray-900"
                            href={youtubeUrl}
                            rel="noopener noreferrer"
                            target="_blank"
                          >
                            YouTube
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : hasFilters ? (
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center">
                  <p className="text-gray-600">No se encontraron especies con esos filtros.</p>
                </div>
              ) : (
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center">
                  <p className="text-gray-600">No hay especies con videos publicados.</p>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>

      <Lightbox
        captions={{descriptionTextAlign: "center", descriptionMaxLines: 4}}
        close={() => setPeliculaAbierta(false)}
        controller={{closeOnBackdropClick: true}}
        open={peliculaAbierta}
        plugins={[Captions, Fullscreen, Zoom]}
        slides={PRIMERA_PELICULA_SLIDES}
        zoom={{maxZoomPixelRatio: 4, scrollToZoom: true}}
      />
    </div>
  );
}
