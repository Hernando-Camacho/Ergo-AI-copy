"use client";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";

export default function PausaActivaPage() {
  const [isActive, setIsActive] = useState(false);
  const [duration, setDuration] = useState(5); // en minutos
  const [timeLeft, setTimeLeft] = useState(0);
  const [score, setScore] = useState(100);
  const [isFinished, setIsFinished] = useState(false);
  const [metrics, setMetrics] = useState({ correct: 0, incorrect: 0 });
  const [suggestion, setSuggestion] = useState("Listo para iniciar. Mantén una postura recta frente a la cámara.");
  
  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
        
        // Simulación de detección de IA aleatoria cada 10 segundos
        if (timeLeft % 10 === 0 && timeLeft > 0) {
          const isError = Math.random() > 0.7; // 30% de probabilidad de error
          if (isError) {
            setScore((s) => Math.max(0, s - 5));
            setMetrics((m) => ({ ...m, incorrect: m.incorrect + 1 }));
            const errors = [
              "⚠️ Estás encorvando la espalda. Endereza la columna.",
              "⚠️ Cuello muy inclinado. Sube el monitor al nivel de tus ojos.",
              "⚠️ Hombros tensos. Relaja los hombros y respira."
            ];
            setSuggestion(errors[Math.floor(Math.random() * errors.length)]);
          } else {
            setMetrics((m) => ({ ...m, correct: m.correct + 1 }));
            const tips = [
              "✅ Excelente postura. Continúa así.",
              "✅ Gira lentamente el cuello hacia la derecha e izquierda.",
              "✅ Estira los brazos hacia el frente entrelazando los dedos.",
              "✅ Cierra los ojos 5 segundos para descansar la vista."
            ];
            setSuggestion(tips[Math.floor(Math.random() * tips.length)]);
          }
        }
      }, 1000);
    } else if (isActive && timeLeft === 0) {
      setIsActive(false);
      setIsFinished(true);
      setSuggestion("¡Pausa Activa finalizada! Buen trabajo cuidando tu salud.");
      saveBreakToDatabase();
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const saveBreakToDatabase = async () => {
    const email = localStorage.getItem("ergoai_user_email");
    if (!email) return;
    
    // Aquí llamaríamos a la API para guardar los datos. Por ahora es simulado.
    console.log("Guardando pausa en DB para", email, { duration, score, metrics });
  };

  const startBreak = () => {
    setTimeLeft(duration * 60);
    setIsActive(true);
    setIsFinished(false);
    setScore(100);
    setMetrics({ correct: 0, incorrect: 0 });
    setSuggestion("Pausa iniciada. Evaluando tu postura...");
  };

  const stopBreak = () => {
    setIsActive(false);
    setIsFinished(true);
    setSuggestion("Pausa cancelada manualmente.");
    saveBreakToDatabase();
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto h-full flex flex-col">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Módulo de Pausa Activa</h1>
        <p className="text-zinc-400">Dedica unos minutos para estirar tu cuerpo. Nuestra IA te guiará y corregirá tu postura.</p>
      </div>

      {/* Configuración (Solo si no está activo o terminado) */}
      {!isActive && !isFinished && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 text-center space-y-6">
          <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto border border-blue-500/30">
            <svg className="w-10 h-10 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-medium text-white mb-2">Configurar Pausa</h2>
            <p className="text-zinc-400 text-sm mb-6">Selecciona cuánto tiempo deseas realizar los ejercicios ergonómicos.</p>
            <div className="flex items-center justify-center gap-4 mb-8">
              {[3, 5, 10, 15].map((min) => (
                <button
                  key={min}
                  onClick={() => setDuration(min)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    duration === min 
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30" 
                      : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                  }`}
                >
                  {min} min
                </button>
              ))}
            </div>
            <Button onClick={startBreak} size="lg" className="px-10 h-14 bg-white text-black hover:bg-zinc-200 text-lg rounded-full">
              Iniciar Pausa Activa
            </Button>
          </div>
        </div>
      )}

      {/* Pantalla de Pausa en Curso */}
      {(isActive || isFinished) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
          {/* Asistente IA */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 flex flex-col items-center justify-center text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-zinc-800">
              {isActive && (
                <div 
                  className="h-full bg-blue-500 transition-all duration-1000" 
                  style={{ width: `${((duration * 60 - timeLeft) / (duration * 60)) * 100}%` }}
                />
              )}
            </div>
            
            <div className={`text-6xl font-mono font-bold mb-8 tracking-wider ${isActive ? 'text-white' : 'text-zinc-500'}`}>
              {formatTime(timeLeft)}
            </div>
            
            <div className={`p-6 rounded-2xl w-full border ${
              suggestion.includes('⚠️') ? 'bg-red-500/10 border-red-500/30 text-red-300' :
              suggestion.includes('✅') ? 'bg-green-500/10 border-green-500/30 text-green-300' :
              'bg-blue-500/10 border-blue-500/30 text-blue-300'
            }`}>
              <p className="text-lg font-medium">{suggestion}</p>
            </div>

            {isActive ? (
              <Button onClick={stopBreak} variant="destructive" className="mt-8">Terminar Anticipadamente</Button>
            ) : (
              <Button onClick={() => {setIsFinished(false); setIsActive(false)}} variant="outline" className="mt-8 border-zinc-700 text-white">Nueva Pausa</Button>
            )}
          </div>

          {/* Estadísticas en Vivo */}
          <div className="space-y-6">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <h3 className="font-medium text-white mb-4">Puntuación Ergonómica IA</h3>
              <div className="flex items-end gap-4">
                <div className={`text-5xl font-bold ${score > 80 ? 'text-green-400' : score > 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                  {score}%
                </div>
                <div className="text-zinc-500 text-sm pb-1">Precisión de Postura</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-zinc-900 border border-green-900/30 rounded-xl p-6">
                <div className="text-zinc-400 text-sm mb-1">Aciertos (Postura recta)</div>
                <div className="text-3xl font-bold text-green-400">{metrics.correct}</div>
              </div>
              <div className="bg-zinc-900 border border-red-900/30 rounded-xl p-6">
                <div className="text-zinc-400 text-sm mb-1">Errores detectados</div>
                <div className="text-3xl font-bold text-red-400">{metrics.incorrect}</div>
              </div>
            </div>
            
            {isFinished && (
              <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 text-center">
                <p className="text-green-400 font-medium">¡Resultados guardados exitosamente en tu expediente!</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
