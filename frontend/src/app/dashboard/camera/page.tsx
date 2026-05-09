"use client";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

export default function CameraPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;
    
    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        setError("No se pudo acceder a la cámara. Asegúrate de dar permisos.");
        console.error(err);
      }
    };

    if (isActive) {
      startCamera();
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isActive]);

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Monitoreo de Cámara IA</h1>
        <p className="text-zinc-400">Analiza tu postura en tiempo real usando MediaPipe JS en el navegador.</p>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="col-span-2 bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden flex flex-col shadow-lg">
          <div className="p-4 border-b border-zinc-800 bg-zinc-950 flex justify-between items-center">
            <h3 className="font-medium flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
              {isActive ? "Feed de Video Activo" : "Cámara Desactivada"}
            </h3>
            <Button 
              variant={isActive ? "outline" : "default"}
              className={isActive ? "border-zinc-700 text-white hover:bg-zinc-800" : "bg-blue-600 text-white hover:bg-blue-700"}
              onClick={() => setIsActive(!isActive)}
            >
              {isActive ? "Detener Cámara" : "Iniciar Análisis"}
            </Button>
          </div>
          <div className="flex-1 bg-black relative flex items-center justify-center min-h-[400px]">
            {error ? (
              <p className="text-red-400 p-4 text-center">{error}</p>
            ) : isActive ? (
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-center text-zinc-600">
                <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <p>Haz clic en "Iniciar Análisis" para activar la cámara</p>
              </div>
            )}
            
            {/* Overlay IA simulado */}
            {isActive && !error && (
              <div className="absolute inset-0 pointer-events-none border-4 border-transparent">
                {/* Cuadros simulados de seguimiento del esqueleto para la demo */}
                <div className="absolute top-10 left-10 text-xs bg-black/50 text-green-400 px-2 py-1 rounded font-mono backdrop-blur-sm">
                  POSTURA: CORRECTA (92%)
                </div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-64 border-2 border-green-500/50 border-dashed rounded-lg"></div>
              </div>
            )}
          </div>
        </div>

        <div className="col-span-1 space-y-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <h3 className="font-medium text-white mb-4">Métricas en Tiempo Real</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-zinc-400">Alineación de Columna</span>
                  <span className={isActive ? "text-green-400 font-medium" : "text-zinc-600"}>{isActive ? "95%" : "--"}</span>
                </div>
                <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <div className={`h-full ${isActive ? 'bg-green-500 w-[95%]' : 'w-0'} transition-all duration-1000`} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-zinc-400">Distancia al Monitor</span>
                  <span className={isActive ? "text-blue-400 font-medium" : "text-zinc-600"}>{isActive ? "60cm (Óptima)" : "--"}</span>
                </div>
                <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <div className={`h-full ${isActive ? 'bg-blue-500 w-[60%]' : 'w-0'} transition-all duration-1000`} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-zinc-400">Inclinación de Cuello</span>
                  <span className={isActive ? "text-yellow-400 font-medium" : "text-zinc-600"}>{isActive ? "15° (Leve)" : "--"}</span>
                </div>
                <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <div className={`h-full ${isActive ? 'bg-yellow-500 w-[85%]' : 'w-0'} transition-all duration-1000`} />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-blue-900/20 border border-blue-900/50 rounded-xl p-6">
            <h3 className="font-medium text-blue-300 mb-2">Nota sobre Privacidad</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              El procesamiento de MediaPipe se realiza enteramente en tu navegador web. Ningún fotograma de video se envía a nuestros servidores. Solo transmitimos las coordenadas numéricas para generar tus reportes de salud.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
