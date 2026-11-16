import { useEffect, useRef, useState } from "react";
import { Download, Loader2, Moon, MousePointer2, RotateCcw, Sun, SunMoon } from "lucide-react";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { cn } from "@/lib/utils";
import { ITEMS, STATION_SECONDS, WAYPOINTS, nightFromHour, virtualHour } from "@/lib/room";
import RoomScene, { CAMERA_HOME, TARGET_HOME } from "@/components/room/RoomScene";
import { CV_OBJECTS as objects } from "@/data/cvContent";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";

type DayMode = "auto" | "day" | "night";
const CYCLE = STATION_SECONDS * WAYPOINTS.length;
const glass = "rounded-2xl border border-white/10 bg-slate-900/75 text-white shadow-2xl backdrop-blur-xl";
const segBtn =
  "flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-300 transition-[background-color,color] hover:bg-white/10 hover:text-white data-[active=true]:bg-white/15 data-[active=true]:text-white";

export default function Home() {
  const [hovered, setHovered] = useState<string | null>(null);
  const [mode, setMode] = useState<DayMode>("auto");
  const [now, setNow] = useState(() => new Date());
  // Seconds into the routine, anchored to the real clock so every visitor sees the same position.
  const [sim, setSim] = useState(() => (Date.now() / 1000) % CYCLE);
  const controlsRef = useRef<OrbitControlsImpl | null>(null);
  const [downloading, setDownloading] = useState(false);
  const downloadCv = async () => {
    setDownloading(true);
    try {
      const { downloadCv: run } = await import("@/lib/cvPdf"); // heavy PDF engine, loaded on demand
      await run(objects);
    } catch {
      toast.error("No se pudo generar el CV. Inténtalo de nuevo.");
    } finally {
      setDownloading(false);
    }
  };

  useEffect(() => {
    let last = performance.now();
    const id = setInterval(() => {
      const t = performance.now();
      setSim((s) => (s + (t - last) / 1000) % CYCLE);
      setNow(new Date());
      last = t;
    }, 250);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    document.body.style.cursor = hovered ? "pointer" : "";
  }, [hovered]);

  const idx = Math.floor(sim / STATION_SECONDS) % WAYPOINTS.length;
  const station = WAYPOINTS[idx];
  const vHour = virtualHour(now.getTime());
  const nightTarget = mode === "auto" ? nightFromHour(vHour) : mode === "night" ? 1 : 0;
  const isNight = nightTarget > 0.5;

  const resetCamera = () => {
    const c = controlsRef.current;
    if (!c) return;
    c.object.position.set(...CAMERA_HOME);
    c.target.set(...TARGET_HOME);
    c.update();
  };

  return (
    <main data-testid="room-page" className={cn("relative h-dvh w-full overflow-hidden", isNight ? "bg-[#0B1020]" : "bg-[#F6E3D0]")}>
      <div className="absolute inset-0" data-testid="room-canvas">
        <RoomScene
          nightTarget={nightTarget}
          station={station}
          hovered={hovered}
          setHovered={setHovered}
          objects={objects}
          controlsRef={controlsRef}
        />
      </div>

      {/* Brand */}
      <header className="pointer-events-none absolute top-5 left-5 z-30 max-w-xs sm:top-7 sm:left-7">
        <p className={cn("font-mono text-[11px] tracking-[0.25em] uppercase", isNight ? "text-slate-400" : "text-slate-600")}>
          Habitación virtual 3D
        </p>
        <h1 data-testid="app-title" className="neon-title font-heading text-4xl font-semibold tracking-tight sm:text-5xl">
          CV creativo
        </h1>
        <p className={cn("mt-2 text-sm leading-relaxed", isNight ? "text-slate-300" : "text-slate-700")}>
          Pasa el cursor por los objetos para descubrir qué cuenta cada uno.
        </p>
      </header>

      {/* Top-right controls */}
      <div className="absolute top-5 right-5 z-30 flex flex-wrap items-center justify-end gap-2 sm:top-7 sm:right-7">
        <div className={cn(glass, "flex items-center gap-1 p-1")} role="group" aria-label="Ciclo día y noche">
          {(
            [
              ["auto", "Auto", SunMoon],
              ["day", "Día", Sun],
              ["night", "Noche", Moon],
            ] as const
          ).map(([m, label, Icon]) => (
            <button key={m} type="button" data-testid={`daynight-${m}`} data-active={mode === m} onClick={() => setMode(m)} className={segBtn}>
              <Icon className="size-3.5" />
              {label}
            </button>
          ))}
          {mode === "auto" && (
            <span
              data-testid="virtual-clock"
              title="Ciclo rápido: un día completo cada 10 minutos"
              className="ml-1 border-l border-white/10 pr-2 pl-2.5 font-mono text-xs text-sky-300"
            >
              {String(Math.floor(vHour)).padStart(2, "0")}:{String(Math.floor((vHour % 1) * 60)).padStart(2, "0")}
            </span>
          )}
        </div>
        <button
          type="button"
          data-testid="reset-camera-btn"
          onClick={resetCamera}
          className={cn(glass, "grid size-10 place-items-center transition-[background-color,transform] hover:bg-slate-800/90 active:scale-95")}
          aria-label="Resetear cámara"
          title="Resetear cámara"
        >
          <RotateCcw className="size-4" />
        </button>
        <button
          type="button"
          data-testid="download-cv-btn"
          onClick={downloadCv}
          disabled={downloading}
          className="flex h-10 items-center gap-2 rounded-xl bg-[#FF2A6D] px-4 text-sm font-medium text-white shadow-[0_0_24px_rgba(255,42,109,0.45)] transition-[background-color,box-shadow,transform] hover:bg-[#ff4b85] active:scale-95 disabled:opacity-60"
        >
          {downloading ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
          {downloading ? "Generando…" : "Descargar CV"}
        </button>
      </div>

      {/* Object quick-nav */}
      <nav
        aria-label="Objetos de la habitación"
        className={cn(glass, "absolute bottom-5 left-1/2 z-30 flex max-w-[calc(100%-2.5rem)] -translate-x-1/2 gap-1 overflow-x-auto p-1.5")}
      >
        {ITEMS.map(({ key, name, icon: Icon }) => (
          <button
            key={key}
            type="button"
            data-testid={`object-chip-${key}`}
            data-active={hovered === key}
            onMouseEnter={() => setHovered(key)}
            onMouseLeave={() => setHovered((h) => (h === key ? null : h))}
            onFocus={() => setHovered(key)}
            onBlur={() => setHovered(null)}
            className={cn(segBtn, "shrink-0 py-2 whitespace-nowrap data-[active=true]:bg-[#FF2A6D]/25")}
          >
            <Icon className="size-3.5" />
            {name}
          </button>
        ))}
      </nav>

      <p
        className={cn(
          "pointer-events-none absolute right-6 bottom-24 z-20 hidden items-center gap-1.5 text-xs md:flex",
          isNight ? "text-slate-400" : "text-slate-600",
        )}
      >
        <MousePointer2 className="size-3.5" /> Arrastra para girar · rueda para zoom
      </p>
      <Toaster offset={{ bottom: 88, right: 24 }} />
    </main>
  );
}
