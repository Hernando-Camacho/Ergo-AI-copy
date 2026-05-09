"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

interface Patient { id: number; full_name: string; email: string; company: string; department: string; avg_score: number; }

export default function ReportsPage() {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState("activity");
  const [patients, setPatients] = useState<Patient[]>([]);
  const [globalActivity, setGlobalActivity] = useState<any[]>([]);
  const [session, setSession] = useState<any>(null);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [patientBreaks, setPatientBreaks] = useState<any[]>([]);
  const [prescriptionTitle, setPrescriptionTitle] = useState("");
  const [isSending, setIsSending] = useState(false);
  
  useEffect(() => {
    setMounted(true);
    const init = async () => {
      try {
        const sRes = await fetch('/api/auth/session');
        if (sRes.ok) setSession(await sRes.json());
        
        const [tRes, aRes] = await Promise.all([
          fetch('/api/stats/stats/users-triage'),
          fetch('/api/stats/stats/global-activity')
        ]);
        if (tRes.ok) setPatients(await tRes.json());
        if (aRes.ok) setGlobalActivity(await aRes.json());
      } catch (e) { console.error("Error Médico:", e); }
    };
    init();
  }, []);

  const exportMedicalReport = () => {
    window.print();
    alert("Reporte Médico generado para su descarga.");
  };

  const loadPatientDetails = async (patient: Patient) => {
    setSelectedPatient(patient);
    try {
      const res = await fetch(`/api/breaks?userId=${patient.id}`);
      if (res.ok) setPatientBreaks(await res.json());
    } catch (e) { console.error("Error cargando historial del paciente:", e); }
  };

  const sendPrescription = async () => {
    if (!prescriptionTitle || !selectedPatient) return;
    setIsSending(true);
    try {
      const res = await fetch('/api/stats/prescriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: selectedPatient.id,
          specialist_id: session.id,
          title: "Alerta de Salud Postural",
          content: prescriptionTitle,
          type: "recommendation"
        })
      });
      if (res.ok) {
        alert("✅ Prescripción enviada con éxito.");
        setPrescriptionTitle("");
      }
    } catch (e) { alert("❌ Error conectando con el servidor médico (Puerto 8000)."); }
    finally { setIsSending(false); }
  };

  if (!mounted) return null;

  return (
    <div className="space-y-10 max-w-7xl mx-auto pb-20 animate-in fade-in duration-700">
      <div className="flex justify-between items-center bg-white dark:bg-[#0B1B3D]/50 p-10 rounded-[3.5rem] shadow-xl border border-slate-100 dark:border-white/5">
        <div>
          <h1 className="text-5xl font-black text-[#0B1B3D] dark:text-white tracking-tighter">Centro de Triage</h1>
          <p className="text-slate-400 dark:text-blue-200/40 font-bold mt-2 text-lg">Monitoreo de Pacientes y Actividad Bio-Mecánica.</p>
          <Button onClick={exportMedicalReport} className="mt-6 bg-[#0B1B3D] text-white font-black px-6 py-2 rounded-xl text-xs">
            🖨️ IMPRIMIR EXPEDIENTES
          </Button>
        </div>
        <div className="text-right">
           <p className="text-xs font-black text-slate-300 dark:text-blue-200/20 uppercase tracking-widest">Especialista</p>
           <p className="text-xl font-black text-indigo-600 mt-1">{session?.name || '...'}</p>
        </div>
      </div>

      <div className="flex p-2 bg-slate-200/40 dark:bg-white/5 rounded-3xl w-fit mx-auto border border-white/50 backdrop-blur-xl">
        {["activity", "triage"].map(t => (
          <button key={t} onClick={() => setActiveTab(t)} className={`px-12 py-4 rounded-2xl text-xs font-black uppercase tracking-[0.2em] transition-all duration-500 ${activeTab === t ? "bg-[#0B1B3D] text-white shadow-2xl scale-105" : "text-slate-400 dark:text-blue-200/40 hover:text-slate-800"}`}>
            {t === 'activity' ? 'Actividad de Pacientes' : 'Triage Médico'}
          </button>
        ))}
      </div>

      {activeTab === "activity" && (
        <div className="bg-white dark:bg-[#0B1B3D]/50 p-12 rounded-[4rem] border border-slate-100 dark:border-white/5 shadow-xl animate-in slide-in-from-bottom-10 duration-500">
           <h3 className="text-2xl font-black text-[#0B1B3D] dark:text-white mb-10 text-center">Pacientes Activos por Fecha</h3>
           <div className="flex flex-wrap gap-8 justify-center">
              {globalActivity.map((a, i) => (
                <div key={i} className="flex flex-col items-center bg-indigo-50/50 p-10 rounded-[3rem] border border-indigo-100 w-48 shadow-inner hover:scale-110 transition-all cursor-pointer">
                   <p className="text-[12px] font-black text-indigo-400 uppercase tracking-widest">{new Date(a.day).toLocaleDateString([], {day:'2-digit', month:'short'})}</p>
                   <p className="text-6xl font-black text-[#0B1B3D] dark:text-white mt-4">{a.count}</p>
                   <p className="text-[10px] font-black text-indigo-600 uppercase mt-4">Sesiones Ergo</p>
                </div>
              ))}
           </div>
        </div>
      )}

      {activeTab === "triage" && (
        <div className="bg-white dark:bg-[#0B1B3D]/50 rounded-[4rem] border border-slate-100 dark:border-white/5 shadow-xl overflow-hidden animate-in slide-in-from-bottom-10 duration-500">
           <table className="w-full text-left">
              <thead>
                 <tr className="bg-slate-50 dark:bg-black/20 border-b border-slate-100 dark:border-white/5">
                    <th className="px-12 py-10 text-[10px] font-black text-slate-400 dark:text-blue-200/40 uppercase tracking-[0.3em]">Paciente / Depto</th>
                    <th className="px-12 py-10 text-[10px] font-black text-slate-400 dark:text-blue-200/40 uppercase tracking-[0.3em]">Riesgo</th>
                    <th className="px-12 py-10 text-[10px] font-black text-slate-400 dark:text-blue-200/40 uppercase tracking-[0.3em] text-right">Promedio Salud</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                 {patients.map(p => (
                    <tr key={p.id} onClick={() => loadPatientDetails(p)} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-all duration-300 cursor-pointer group">
                       <td className="px-12 py-10">
                          <p className="font-black text-[#0B1B3D] dark:text-white text-2xl tracking-tighter group-hover:text-indigo-600 transition-colors">{p.full_name}</p>
                          <p className="text-xs text-slate-400 dark:text-blue-200/40 font-bold uppercase mt-1">{p.company} • {p.department}</p>
                       </td>
                       <td className="px-12 py-10">
                          <div className={`px-6 py-2.5 rounded-2xl text-[10px] font-black w-fit shadow-sm ${p.avg_score === 0 ? 'bg-slate-100 text-slate-400 dark:text-blue-200/40' : p.avg_score < 50 ? 'bg-red-100 text-red-600' : p.avg_score < 80 ? 'bg-yellow-100 text-yellow-600' : 'bg-emerald-100 text-emerald-600'}`}>
                             {p.avg_score === 0 ? 'INACTIVO' : p.avg_score < 50 ? 'CRÍTICO' : p.avg_score < 80 ? 'MODERADO' : 'ÓPTIMO'}
                          </div>
                       </td>
                       <td className="px-12 py-10 text-right font-black text-5xl text-[#0B1B3D] dark:text-white tracking-tighter">{p.avg_score}%</td>
                    </tr>
                 ))}
              </tbody>
           </table>
        </div>
      )}
       {/* Panel Lateral de Detalle de Paciente */}
       {selectedPatient && (
         <div className="fixed inset-0 z-[100] flex justify-end bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
           <div className="w-full max-w-2xl bg-white dark:bg-[#050B1A] h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-500 overflow-y-auto">
              <div className="p-10 border-b border-slate-100 dark:border-white/5 flex justify-between items-center bg-slate-50 dark:bg-white/5">
                 <div>
                    <h2 className="text-3xl font-black text-[#0B1B3D] dark:text-white">{selectedPatient.full_name}</h2>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">{selectedPatient.department} • {selectedPatient.email}</p>
                 </div>
                 <button onClick={() => setSelectedPatient(null)} className="w-12 h-12 rounded-full bg-white dark:bg-white/10 shadow-md flex items-center justify-center text-2xl">✕</button>
              </div>

              <div className="p-10 space-y-10">
                 {/* Estadísticas Rápidas */}
                 <div className="grid grid-cols-2 gap-6">
                    <div className="bg-indigo-50 dark:bg-indigo-500/10 p-8 rounded-3xl border border-indigo-100 dark:border-indigo-500/20">
                       <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2">Salud Promedio</p>
                       <p className="text-5xl font-black text-indigo-600">{selectedPatient.avg_score}%</p>
                    </div>
                    <div className="bg-emerald-50 dark:bg-emerald-500/10 p-8 rounded-3xl border border-emerald-100 dark:border-emerald-500/20">
                       <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-2">Sesiones Totales</p>
                       <p className="text-5xl font-black text-emerald-600">{patientBreaks.length}</p>
                    </div>
                 </div>

                 {/* Historial de Sesiones */}
                 <div className="bg-white dark:bg-[#0B1B3D]/50 p-8 rounded-[2.5rem] border border-slate-100 dark:border-white/5">
                    <h3 className="text-lg font-black text-[#0B1B3D] dark:text-white mb-6">Últimas Intervenciones</h3>
                    <div className="space-y-4">
                       {patientBreaks.slice(0, 5).map((b, i) => (
                         <div key={i} className="flex items-center justify-between p-5 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5">
                            <div>
                               <p className="text-xs font-black text-[#0B1B3D] dark:text-white">{new Date(b.start_time).toLocaleDateString()}</p>
                               <p className="text-[10px] text-slate-400 font-bold">{Math.round(b.duration_seconds/60)} min</p>
                            </div>
                            <span className="text-lg font-black text-indigo-500">{b.score}%</span>
                         </div>
                       ))}
                       {patientBreaks.length === 0 && <p className="text-center text-slate-300 py-4">Sin datos registrados.</p>}
                    </div>
                 </div>

                 {/* Acción Médica */}
                 <div className="bg-[#0B1B3D] p-10 rounded-[3rem] text-white shadow-2xl">
                    <h3 className="text-xl font-black mb-6 flex items-center gap-3">
                       <span className="text-2xl">📢</span> Enviar Recomendación
                    </h3>
                    <div className="space-y-4">
                       <textarea 
                         value={prescriptionTitle}
                         onChange={e => setPrescriptionTitle(e.target.value)}
                         placeholder="Ej: Mantener espalda recta y realizar estiramientos cervicales..." 
                         className="w-full bg-white/10 border border-white/20 rounded-2xl p-6 text-sm font-bold text-white placeholder:text-white/30 focus:outline-none focus:border-indigo-400 transition-all h-32"
                       />
                       <Button 
                         disabled={isSending || !prescriptionTitle}
                         onClick={sendPrescription}
                         className="w-full h-16 bg-white text-[#0B1B3D] hover:bg-indigo-50 font-black rounded-2xl transition-all shadow-xl disabled:opacity-50"
                       >
                         {isSending ? "ENVIANDO..." : "ENVIAR ALERTA MÉDICA"}
                       </Button>
                    </div>
                 </div>
              </div>
           </div>
         </div>
       )}
    </div>
  );
}
