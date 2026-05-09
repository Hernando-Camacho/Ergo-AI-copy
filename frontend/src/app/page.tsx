import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-sans text-slate-900 relative overflow-hidden">
      {/* Background gradients for premium medical feel */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-100 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-100/50 rounded-full blur-[120px]" />
      </div>

      <header className="flex items-center justify-between px-8 py-6 w-full max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0B1B3D] to-[#1C305C] flex items-center justify-center font-bold text-white shadow-lg shadow-blue-900/20">
            E
          </div>
          <span className="text-2xl font-bold tracking-tight text-[#0B1B3D]">
            Ergo<span className="text-emerald-600">AI</span>
          </span>
        </div>
        <nav className="hidden md:flex gap-8 text-sm font-semibold text-slate-600">
          <Link href="#features" className="hover:text-[#0B1B3D] transition-colors">Características</Link>
          <Link href="#how-it-works" className="hover:text-[#0B1B3D] transition-colors">Evidencia Médica</Link>
          <Link href="#enterprise" className="hover:text-[#0B1B3D] transition-colors">Soluciones HR</Link>
        </nav>
        <div className="flex gap-4">
          <Link href="/login">
            <Button variant="ghost" className="text-slate-600 hover:text-[#0B1B3D] hover:bg-slate-200 font-semibold">
              Portal de Salud
            </Button>
          </Link>
          <Link href="/login">
            <Button className="bg-[#0B1B3D] text-white hover:bg-[#1C305C] shadow-md font-semibold">
              Prueba Gratuita
            </Button>
          </Link>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 pt-20 pb-32 w-full max-w-5xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-sm font-medium text-emerald-700 mb-8 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Tecnología Predictiva en Vivo
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-tight text-[#0B1B3D]">
          El estándar médico en <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">
            Prevención Ergonómica
          </span>
        </h1>
        
        <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
          ErgoAI analiza la higiene postural de tu equipo mediante Inteligencia Artificial directamente en el navegador, reduciendo lesiones musculoesqueléticas con total privacidad de datos.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Link href="/login" className="w-full sm:w-auto">
            <Button size="lg" className="w-full h-14 px-8 bg-emerald-600 hover:bg-emerald-700 text-white text-lg rounded-full shadow-[0_0_30px_-5px_rgba(16,185,129,0.4)] transition-all hover:scale-105 font-bold">
              Iniciar Diagnóstico
            </Button>
          </Link>
          <Link href="/login" className="w-full sm:w-auto">
            <Button size="lg" variant="outline" className="w-full h-14 px-8 text-lg rounded-full border-slate-300 text-slate-700 hover:bg-slate-100 transition-all font-semibold bg-white shadow-sm">
              Acceso a Especialistas
            </Button>
          </Link>
        </div>

        {/* Mockup Image Area */}
        <div className="mt-24 w-full max-w-4xl relative rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl">
          <div className="w-full h-[400px] rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden relative">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:24px_24px]"></div>
            <div className="text-center z-10 bg-white/80 p-8 rounded-2xl backdrop-blur-sm border border-slate-200 shadow-sm">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-slate-800 font-bold text-xl mb-2">Análisis de Postura Integrado</p>
              <p className="text-slate-500 font-medium">Procesamiento Edge seguro sin envío de video</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
