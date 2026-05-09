"use client";
import { useState, useEffect, useRef } from "react";
import Script from "next/script";
import { Button } from "@/components/ui/button";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

import { evaluatePosture, Keypoint as ErgoKeypoint } from "@/lib/ergonomics";
import { drawSkeleton } from "@/lib/drawSkeleton";

declare global {
  interface Window {
    poseDetection: any;
    tf: any;
  }
}

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<'calendar' | 'camera' | 'background'>('calendar');
  
  // Model & Camera State
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [tfLoaded, setTfLoaded] = useState(false);
  const [modelReady, setModelReady] = useState(false);
  
  const detectorRef = useRef<any>(null);
  const animationRef = useRef<number | null>(null);

  // Biometrics & AI Suggestions
  const [biometricState, setBiometricState] = useState<'optimal' | 'warning' | 'critical'>('optimal');
  const [postureScore, setPostureScore] = useState(100);
  const [debugData, setDebugData] = useState<{ angle: number, asym: number }>({ angle: 0, asym: 0 });
  const [suggestion, setSuggestion] = useState("Listo para analizar tu postura. Inicia la cámara.");
  const badPostureTimerRef = useRef<number>(0); // Contador de tiempo en mala postura
  const lastNotificationRef = useRef<number>(0);

  // Active Break Timer State
  const [breakDuration, setBreakDuration] = useState(5); // in minutes
  const [breakTimeLeft, setBreakTimeLeft] = useState(0);
  const [isBreakActive, setIsBreakActive] = useState(false);

  // Background Settings State
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  // Mock Calendar Data
  const daysInMonth = Array.from({ length: 30 }, (_, i) => ({
    day: i + 1,
    status: Math.random() > 0.8 ? 'missed' : Math.random() > 0.2 ? 'active' : 'none'
  }));

  const [chartData, setChartData] = useState([
    { time: '09:00', score: 98 }, { time: '10:00', score: 85 }, { time: '11:00', score: 92 }
  ]);

  // Request Notification Permissions on load
  useEffect(() => {
    if ("Notification" in window) {
      if (Notification.permission === "granted") {
        setNotificationsEnabled(true);
      }
    }
  }, []);

  const requestNotifications = async () => {
    if (!("Notification" in window)) {
      alert("Este navegador no soporta notificaciones de escritorio");
      return;
    }
    const permission = await Notification.requestPermission();
    setNotificationsEnabled(permission === "granted");
  };

  // Initialize TensorFlow Model
  useEffect(() => {
    if (tfLoaded && window.poseDetection && !detectorRef.current) {
      const initModel = async () => {
        try {
          const detectorConfig = { modelType: window.poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING };
          detectorRef.current = await window.poseDetection.createDetector(window.poseDetection.SupportedModels.MoveNet, detectorConfig);
          setModelReady(true);
        } catch (e) {
          console.error("Error cargando modelo MoveNet:", e);
        }
      };
      initModel();
    }
  }, [tfLoaded]);

  // Main TF Loop
  const processFrame = async () => {
    if (!videoRef.current || !canvasRef.current || !detectorRef.current || !isCameraActive) return;
    const video = videoRef.current;
    
    if (video.readyState < 2) {
      animationRef.current = requestAnimationFrame(processFrame);
      return;
    }

    try {
      const width = video.videoWidth;
      const height = video.videoHeight;
      canvasRef.current.width = width;
      canvasRef.current.height = height;

      // Throttle if tab is hidden (Background Mode)
      const isHidden = document.visibilityState === "hidden";
      if (isHidden) {
        await new Promise(r => setTimeout(r, 1000)); // Esperar 1 segundo si está en background
      }

      const poses = await detectorRef.current.estimatePoses(video);
      const ctx = canvasRef.current.getContext('2d');
      
      if (ctx && poses.length > 0) {
        const keypoints = poses[0].keypoints as ErgoKeypoint[];
        if (!isHidden) drawSkeleton(keypoints, ctx, width, height);

        const evaluation = evaluatePosture(keypoints);
        
        // Update states sparingly (10% of frames when visible, 100% when hidden/slow)
        if (isHidden || Math.random() < 0.1) {
          setBiometricState(evaluation.status);
          setDebugData({ angle: evaluation.neckAngle, asym: evaluation.asymmetry });
          
          if (evaluation.status === 'optimal') {
            badPostureTimerRef.current = 0;
            if (isBreakActive) {
              setSuggestion("✅ Postura ideal para el ejercicio. Mantén la posición.");
            } else {
              setSuggestion("✅ Excelente ergonomía. Tienes alineación cervical perfecta.");
            }
            setPostureScore(prev => Math.min(100, prev + 1));
          } else {
            // Bad posture logic
            badPostureTimerRef.current += isHidden ? 10 : 1; // Approx frames/seconds
            setPostureScore(prev => Math.max(0, prev - 2));

            if (badPostureTimerRef.current > 30) { // Approx 3 seconds of bad posture
              setSuggestion(`⚠️ Cuello muy inclinado (${evaluation.neckAngle}°). ¡Haz rotaciones lentas hacia la izquierda!`);
              
              // Trigger Notification if Background
              if (isHidden && notificationsEnabled) {
                const now = Date.now();
                if (now - lastNotificationRef.current > 60000) { // Limit to 1 per minute
                  new Notification("ErgoAI: Alerta Ergonómica", {
                    body: `Tu cuello lleva inclinado ${evaluation.neckAngle}°. Por favor, endereza tu espalda.`,
                    icon: "/favicon.ico"
                  });
                  lastNotificationRef.current = now;
                }
              }
            } else {
              setSuggestion(`Precaución: Inclinación detectada (${evaluation.neckAngle}°). Corrige pronto.`);
            }
          }
        }
      } else if (ctx) {
        ctx.clearRect(0, 0, width, height);
      }
    } catch (e) {
      console.error(e);
    }

    if (isCameraActive) {
      animationRef.current = requestAnimationFrame(processFrame);
    }
  };

  // Camera stream management
  useEffect(() => {
    let stream: MediaStream | null = null;
    if (isCameraActive) {
      navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } })
        .then(s => {
          stream = s;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.onloadeddata = () => processFrame();
          }
        })
        .catch(console.error);
    } else {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
    }
    return () => {
      if (stream) stream.getTracks().forEach(track => track.stop());
    };
  }, [isCameraActive]);

  // Break Timer loop
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isBreakActive && breakTimeLeft > 0) {
      interval = setInterval(() => setBreakTimeLeft(prev => prev - 1), 1000);
    } else if (isBreakActive && breakTimeLeft === 0) {
      setIsBreakActive(false);
      setIsCameraActive(false);
      setSuggestion("🎉 ¡Pausa Activa completada exitosamente! Gran trabajo.");
      alert("¡Pausa Activa Terminada! Tus estadísticas se han guardado.");
    }
    return () => clearInterval(interval);
  }, [isBreakActive, breakTimeLeft]);

  const startActiveBreak = () => {
    if (!modelReady) {
      alert("Espera un momento, los modelos de IA aún se están cargando...");
      return;
    }
    setBreakTimeLeft(breakDuration * 60);
    setIsBreakActive(true);
    setIsCameraActive(true);
    setSuggestion("Iniciando rutina... Siéntate derecho frente a la cámara.");
    badPostureTimerRef.current = 0;
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <>
      <Script src="https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-core@4.2.0" strategy="beforeInteractive" />
      <Script src="https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-converter@4.2.0" strategy="beforeInteractive" />
      <Script src="https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-backend-webgl@4.2.0" strategy="beforeInteractive" />
      <Script src="https://cdn.jsdelivr.net/npm/@tensorflow-models/pose-detection@2.1.3" strategy="beforeInteractive" onLoad={() => setTfLoaded(true)} />

      <div className="space-y-6 max-w-6xl mx-auto">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2 text-[#0B1B3D]">Portal de Salud Personal</h1>
            <p className="text-slate-500 font-medium">Gestión integral de tu bienestar ergonómico.</p>
          </div>
          <div className="flex items-center gap-4">
            {!modelReady && (
              <span className="flex items-center text-xs font-bold text-amber-600 bg-amber-50 px-3 py-1 rounded border border-amber-200">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse mr-2"></span>
                Iniciando Motor IA...
              </span>
            )}
            <div className={`px-4 py-2 rounded-lg border flex items-center gap-3 bg-white shadow-sm transition-all
              ${biometricState === 'optimal' ? 'border-emerald-200' : biometricState === 'warning' ? 'border-yellow-200' : 'border-red-200'}`}
            >
              <span className="text-xs font-bold text-slate-500 uppercase">Estado</span>
              <span className={`text-sm font-bold ${biometricState === 'optimal' ? 'text-emerald-600' : biometricState === 'warning' ? 'text-yellow-600' : 'text-red-600'}`}>
                {biometricState === 'optimal' ? 'Óptimo' : biometricState === 'warning' ? 'Precaución' : 'Crítico'}
              </span>
            </div>
          </div>
        </div>

        {/* Custom Tabs Navigation */}
        <div className="flex gap-4 border-b border-slate-200 pb-px">
          <button onClick={() => setActiveTab("calendar")} className={`pb-2 text-sm font-bold border-b-2 transition-colors ${activeTab === "calendar" ? "border-[#0B1B3D] text-[#0B1B3D]" : "border-transparent text-slate-400 hover:text-slate-600"}`}>
            Resumen Mensual
          </button>
          <button onClick={() => setActiveTab("camera")} className={`pb-2 text-sm font-bold border-b-2 transition-colors ${activeTab === "camera" ? "border-emerald-600 text-emerald-600" : "border-transparent text-slate-400 hover:text-slate-600"}`}>
            Cámara & Pausa Activa IA
          </button>
          <button onClick={() => setActiveTab("background")} className={`pb-2 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === "background" ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-400 hover:text-slate-600"}`}>
            Monitoreo 2do Plano {notificationsEnabled && <span className="w-2 h-2 rounded-full bg-indigo-500"></span>}
          </button>
        </div>

        {/* TAB 1: CALENDAR & SUMMARY */}
        {activeTab === "calendar" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                <p className="text-slate-500 text-sm font-bold uppercase tracking-wide">Pausas Realizadas</p>
                <p className="text-4xl font-extrabold text-[#0B1B3D] mt-2">12 <span className="text-lg text-emerald-500 font-medium">este mes</span></p>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                <p className="text-slate-500 text-sm font-bold uppercase tracking-wide">Puntaje Ergonómico Promedio</p>
                <p className="text-4xl font-extrabold text-emerald-600 mt-2">92% <span className="text-lg text-slate-400 font-medium">/100</span></p>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                <p className="text-slate-500 text-sm font-bold uppercase tracking-wide">Alertas Críticas</p>
                <p className="text-4xl font-extrabold text-red-600 mt-2">3 <span className="text-lg text-slate-400 font-medium">corregidas</span></p>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm">
              <h3 className="text-lg font-bold text-[#0B1B3D] mb-6">Calendario de Actividad Ergonómica (Mayo)</h3>
              <div className="grid grid-cols-7 gap-2 md:gap-4">
                {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(d => (
                  <div key={d} className="text-center text-xs font-bold text-slate-400 mb-2">{d}</div>
                ))}
                {daysInMonth.map((day, idx) => (
                  <div 
                    key={idx} 
                    className={`aspect-square rounded-lg flex items-center justify-center text-sm font-bold border transition-all hover:scale-105 cursor-pointer
                      ${day.status === 'active' ? 'bg-emerald-100 border-emerald-200 text-emerald-700 shadow-sm' : 
                        day.status === 'missed' ? 'bg-red-50 border-red-100 text-red-500' : 
                        'bg-slate-50 border-slate-100 text-slate-400'}`}
                  >
                    {day.day}
                  </div>
                ))}
              </div>
              <div className="mt-6 flex justify-end gap-6 text-sm">
                <span className="flex items-center gap-2 text-slate-500"><div className="w-3 h-3 rounded bg-emerald-100 border border-emerald-200"></div> Pausa Completada</span>
                <span className="flex items-center gap-2 text-slate-500"><div className="w-3 h-3 rounded bg-red-50 border border-red-100"></div> Postura Deficiente</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ACTIVE BREAK & CAMERA */}
        {activeTab === "camera" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="col-span-2 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm flex flex-col">
              <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                <h3 className="font-bold text-[#0B1B3D] flex items-center gap-2">
                  Visión AI 
                  {isCameraActive && <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>}
                </h3>
                <div className="flex gap-2">
                  <Button 
                    variant={isCameraActive && !isBreakActive ? "destructive" : "outline"}
                    className={isCameraActive && !isBreakActive ? "" : "border-emerald-200 text-emerald-700"}
                    onClick={() => setIsCameraActive(!isCameraActive)}
                    disabled={isBreakActive}
                  >
                    {isCameraActive && !isBreakActive ? "Apagar Cámara" : "Probar Cámara"}
                  </Button>
                </div>
              </div>
              <div className="flex-1 bg-[#050f24] min-h-[480px] relative flex items-center justify-center overflow-hidden">
                {isCameraActive ? (
                  <div className="relative w-full h-full flex items-center justify-center">
                    <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover opacity-60 transform scale-x-[-1]" />
                    <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full object-cover transform scale-x-[-1]" />
                    {isBreakActive && (
                      <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-md border border-white/20 text-white px-6 py-3 rounded-xl shadow-2xl font-mono text-3xl font-bold">
                        {formatTime(breakTimeLeft)}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-slate-400 text-center">La cámara está inactiva.<br/>Pulsa iniciar rutina para comenzar.</div>
                )}
              </div>
            </div>

            <div className="space-y-6">
              {!isBreakActive ? (
                <div className="bg-white border border-emerald-200 rounded-xl p-6 shadow-md shadow-emerald-900/5">
                  <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                  <h3 className="font-bold text-[#0B1B3D] mb-2 text-xl">Rutina de Pausa Activa</h3>
                  <p className="text-sm text-slate-500 mb-6">La IA de MediaPipe corregirá tus posturas y contará tu tiempo de relajación muscular.</p>
                  
                  <div className="flex gap-2 mb-6">
                    {[3, 5, 10].map(min => (
                      <button key={min} onClick={() => setBreakDuration(min)} className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all border ${breakDuration === min ? 'bg-emerald-600 border-emerald-700 text-white shadow-md' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'}`}>
                        {min} min
                      </button>
                    ))}
                  </div>
                  
                  <Button onClick={startActiveBreak} className="w-full h-12 bg-[#0B1B3D] hover:bg-[#1C305C] text-white font-bold text-lg rounded-xl">
                    Comenzar Rutina
                  </Button>
                </div>
              ) : (
                <div className="bg-[#0B1B3D] rounded-xl p-6 shadow-xl relative overflow-hidden">
                  <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-500/20 rounded-full blur-3xl"></div>
                  <h3 className="font-bold text-white mb-2 flex items-center gap-2 text-lg">Entrenador IA</h3>
                  <p className="text-emerald-400 font-medium mb-6 animate-pulse">Analizando tu alineación cervical...</p>
                  
                  <div className={`p-5 rounded-xl border mb-6 backdrop-blur-md transition-colors ${
                    biometricState === 'critical' ? 'bg-red-500/20 border-red-500/50 text-red-100' :
                    biometricState === 'warning' ? 'bg-yellow-500/20 border-yellow-500/50 text-yellow-100' :
                    'bg-white/10 border-white/20 text-blue-50'
                  }`}>
                    <p className="font-medium leading-relaxed text-lg">{suggestion}</p>
                  </div>

                  <Button onClick={() => { setIsBreakActive(false); setIsCameraActive(false); }} variant="destructive" className="w-full font-bold">
                    Abortar Rutina
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: BACKGROUND MONITORING */}
        {activeTab === "background" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 bg-white border border-slate-200 rounded-xl p-8 shadow-sm max-w-2xl mx-auto text-center">
            <div className="w-20 h-20 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
              <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
            </div>
            <h2 className="text-2xl font-bold text-[#0B1B3D] mb-4">Guardián Ergonómico Constante</h2>
            <p className="text-slate-600 text-lg mb-8">
              Activa la cámara y continúa trabajando en otras pestañas. ErgoAI bajará su consumo a 1 frame por segundo y te enviará una notificación a tu escritorio si detecta que te encorvas.
            </p>
            
            <div className="flex flex-col gap-4 max-w-xs mx-auto">
              {!notificationsEnabled ? (
                <Button onClick={requestNotifications} className="h-12 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-md shadow-lg">
                  Permitir Notificaciones
                </Button>
              ) : (
                <div className="px-4 py-3 bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold rounded-lg mb-4 flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  Notificaciones Autorizadas
                </div>
              )}

              <Button 
                onClick={() => setIsCameraActive(!isCameraActive)}
                disabled={!notificationsEnabled}
                variant={isCameraActive ? "destructive" : "default"}
                className={`h-12 font-bold text-md shadow-md ${!isCameraActive && notificationsEnabled ? "bg-[#0B1B3D] hover:bg-[#1C305C]" : ""}`}
              >
                {isCameraActive ? "Apagar Guardián" : "Encender Guardián"}
              </Button>
            </div>
            
            {isCameraActive && (
              <p className="mt-8 text-sm font-bold text-emerald-600 animate-pulse bg-emerald-50 py-2 px-4 rounded-full inline-block border border-emerald-200">
                Guardián activo. Puedes minimizar esta ventana o cambiar de pestaña.
              </p>
            )}
          </div>
        )}
      </div>
    </>
  );
}
