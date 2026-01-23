"use client";

import {useEffect, useRef, useState} from "react";

interface AudioSpectrogramProps {
  audioElement: HTMLAudioElement | null;
  width?: number;
  height?: number;
}

export default function AudioSpectrogram({audioElement, width = 320, height = 150}: AudioSpectrogramProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const spectrogramDataRef = useRef<number[][]>([]);
  const initializedRef = useRef<HTMLAudioElement | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Configurar canvas
    canvas.width = width;
    canvas.height = height;
    
    // Dibujar fondo negro inicial
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    if (!audioElement) {
      ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
      ctx.font = "12px monospace";
      ctx.textAlign = "center";
      ctx.fillText("Esperando audio...", canvas.width / 2, canvas.height / 2);
      setIsLoading(false);
      return;
    }

    const audio = audioElement;

    // Si ya se inicializó para este elemento, no hacerlo de nuevo
    if (initializedRef.current === audio && audioContextRef.current) {
      setIsLoading(false);
      return;
    }

    // Limpiar referencias anteriores si cambió el elemento
    if (initializedRef.current !== audio && initializedRef.current !== null) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (sourceRef.current) {
        sourceRef.current.disconnect();
      }
      if (audioContextRef.current && audioContextRef.current.state !== "closed") {
        audioContextRef.current.close();
      }
      spectrogramDataRef.current = [];
    }

    const initAudio = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Esperar a que el audio esté listo
        if (audio.readyState < 2) {
          await new Promise<void>((resolve) => {
            const handleCanPlay = () => {
              audio.removeEventListener("canplay", handleCanPlay);
              resolve();
            };
            audio.addEventListener("canplay", handleCanPlay);
            setTimeout(() => {
              audio.removeEventListener("canplay", handleCanPlay);
              resolve();
            }, 5000);
          });
        }

        // Crear AudioContext
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        
        if (audioContext.state === "suspended") {
          await audioContext.resume();
        }

        // Verificar si el audio ya tiene una fuente conectada
        let source: MediaElementAudioSourceNode;
        try {
          source = audioContext.createMediaElementSource(audio);
        } catch (err) {
          console.error("Error al crear MediaElementSource:", err);
          throw new Error("El elemento de audio ya está conectado a otro AudioContext.");
        }

        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 2048; // Mayor resolución
        analyser.smoothingTimeConstant = 0.3; // Menos suavizado para más detalle
        source.connect(analyser);
        analyser.connect(audioContext.destination);

        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        audioContextRef.current = audioContext;
        analyserRef.current = analyser;
        sourceRef.current = source;
        dataArrayRef.current = dataArray;
        initializedRef.current = audio;

        // Función optimizada para dibujar el espectrograma
        const drawSpectrogram = () => {
          const currentAnalyser = analyserRef.current;
          const currentDataArray = dataArrayRef.current;
          
          if (!currentAnalyser || !currentDataArray || !ctx || !canvas) return;

          currentAnalyser.getByteFrequencyData(currentDataArray);

          // Agregar nueva columna de datos
          const normalizedData = Array.from(currentDataArray).map((value) => value / 255);
          spectrogramDataRef.current.push(normalizedData);

          // Mantener solo las últimas columnas que caben en el canvas
          const maxColumns = Math.floor(canvas.width / 2);
          if (spectrogramDataRef.current.length > maxColumns) {
            spectrogramDataRef.current.shift();
          }

          // Limpiar canvas
          ctx.fillStyle = "#000000";
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          const data = spectrogramDataRef.current;
          if (data.length === 0) {
            // Mostrar mensaje si no hay datos aún
            ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
            ctx.font = "11px monospace";
            ctx.textAlign = "center";
            ctx.fillText("Reproduce el audio para ver el espectrograma", canvas.width / 2, canvas.height / 2);
            return;
          }

          const columnWidth = canvas.width / data.length;
          const frequencyBins = data[0]?.length || 0;

          // Dibujar cada columna del espectrograma (optimizado)
          data.forEach((column, xIndex) => {
            const x = xIndex * columnWidth;
            
            // Usar ImageData para mejor rendimiento
            column.forEach((value, yIndex) => {
              const y = canvas.height - (yIndex / frequencyBins) * canvas.height;
              const barHeight = canvas.height / frequencyBins;

              // Color basado en la intensidad (escala de colores mejorada)
              const intensity = Math.pow(value, 0.7); // Gamma correction para mejor visualización
              const hue = 240 - intensity * 120; // De azul a verde
              const saturation = 100;
              const lightness = 20 + intensity * 60;

              ctx.fillStyle = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
              ctx.fillRect(x, y, columnWidth, barHeight);
            });
          });

          // Dibujar líneas de cuadrícula (menos frecuentes para mejor rendimiento)
          ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
          ctx.lineWidth = 1;

          // Líneas horizontales (frecuencias) - solo 3 líneas
          for (let i = 1; i < 3; i++) {
            const y = (canvas.height / 3) * i;
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
            ctx.stroke();
          }

          // Etiquetas de frecuencia simplificadas
          ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
          ctx.font = "10px monospace";
          ctx.textAlign = "right";
          for (let i = 0; i <= 2; i++) {
            const y = (canvas.height / 2) * (2 - i);
            const freq = (i * 10) / 2;
            ctx.fillText(`${freq.toFixed(0)} kHz`, canvas.width - 5, y - 2);
          }
        };

        // Función de actualización optimizada
        const updateSpectrogram = () => {
          if (!audio.paused && !audio.ended) {
            drawSpectrogram();
            animationFrameRef.current = requestAnimationFrame(updateSpectrogram);
          } else {
            animationFrameRef.current = null;
          }
        };

        // Event listeners
        const handlePlay = async () => {
          if (audioContext.state === "suspended") {
            await audioContext.resume();
          }
          // Iniciar el loop de animación
          if (!animationFrameRef.current) {
            updateSpectrogram();
          }
        };

        const handlePause = () => {
          if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = null;
          }
          // Dibujar una última vez para mantener el estado actual
          drawSpectrogram();
        };

        const handleEnded = () => {
          if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = null;
          }
        };

        audio.addEventListener("play", handlePlay);
        audio.addEventListener("pause", handlePause);
        audio.addEventListener("ended", handleEnded);

        // Dibujar espectrograma inicial
        drawSpectrogram();
        
        // Iniciar actualización continua si el audio ya está reproduciéndose
        if (!audio.paused && !audio.ended) {
          updateSpectrogram();
        }

        setIsLoading(false);
      } catch (err) {
        console.error("Error inicializando audio:", err);
        const errorMessage = err instanceof Error ? err.message : "Error al cargar el espectrograma";
        setError(errorMessage);
        setIsLoading(false);
        
        if (ctx && canvas) {
          ctx.fillStyle = "#000000";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.fillStyle = "#ff0000";
          ctx.font = "12px monospace";
          ctx.textAlign = "center";
          ctx.fillText("Error al cargar", canvas.width / 2, canvas.height / 2);
        }
      }
    };

    initAudio();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [audioElement, width, height]);

  if (error) {
    return (
      <div className="flex h-[150px] items-center justify-center rounded-lg bg-gray-100 text-sm text-gray-500">
        {error}
      </div>
    );
  }

  return (
    <div className="relative">
      {isLoading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-gray-900/50">
          <div className="text-sm text-white">Cargando...</div>
        </div>
      )}
      <canvas
        ref={canvasRef}
        className="rounded-lg"
        height={height}
        style={{width: "100%", height: "auto"}}
        width={width}
      />
    </div>
  );
}
