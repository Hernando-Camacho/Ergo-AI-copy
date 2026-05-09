"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(false); // No más timeout artificial
  const [patientSearch, setPatientSearch] = useState("");

  const departmentData = [
    { name: 'Ventas', riesgoAlto: 40, riesgoModerado: 30, riesgoBajo: 30 },
    { name: 'IT', riesgoAlto: 65, riesgoModerado: 25, riesgoBajo: 10 },
    { name: 'Diseño', riesgoAlto: 55, riesgoModerado: 30, riesgoBajo: 15 },
    { name: 'RRHH', riesgoAlto: 10, riesgoModerado: 20, riesgoBajo: 70 },
    { name: 'Finanzas', riesgoAlto: 25, riesgoModerado: 45, riesgoBajo: 30 },
  ];

  const downloadIndividualReport = (id: string) => {
    alert(`Generando Expediente Ergonómico para el paciente ${id}...\nIncluyendo historial de posturas y cumplimiento de pausas.`);
  };

  const scheduleAppointment = (id: string) => {
    alert(`Cita programada con el paciente ${id} para evaluación presencial.`);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2 text-[#0B1B3D]">Hub de Salud Organizacional</h1>
          <p className="text-slate-500 font-medium">Analítica predictiva y gestión de pacientes críticos.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 bg-white shadow-sm font-semibold">
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            Exportar Global HIPAA
          </Button>
        </div>
      </div>

      <div className="flex gap-4 border-b border-slate-200 pb-px">
        <button onClick={() => setActiveTab("overview")} className={`pb-2 text-sm font-bold border-b-2 transition-colors ${activeTab === "overview" ? "border-[#0B1B3D] text-[#0B1B3D]" : "border-transparent text-slate-400 hover:text-slate-600"}`}>
          Vista General
        </button>
        <button onClick={() => setActiveTab("consultations")} className={`pb-2 text-sm font-bold border-b-2 transition-colors ${activeTab === "consultations" ? "border-[#0B1B3D] text-[#0B1B3D]" : "border-transparent text-slate-400 hover:text-slate-600"}`}>
          Gestión de Consultas
        </button>
        <button onClick={() => setActiveTab("prescribe")} className={`pb-2 text-sm font-bold border-b-2 transition-colors ${activeTab === "prescribe" ? "border-[#0B1B3D] text-[#0B1B3D]" : "border-transparent text-slate-400 hover:text-slate-600"}`}>
          Recetario Digital
        </button>
      </div>

      {activeTab === "overview" && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <p className="text-slate-500 text-sm font-bold uppercase tracking-tight">Pacientes</p>
              <p className="text-3xl font-extrabold text-[#0B1B3D] mt-1">124</p>
            </div>
            <div className="bg-white border border-red-200 rounded-xl p-5 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-2 h-full bg-red-500"></div>
              <p className="text-slate-500 text-sm font-bold uppercase tracking-tight">Críticos</p>
              <p className="text-3xl font-extrabold text-red-600 mt-1">8</p>
            </div>
            <div className="bg-white border border-yellow-200 rounded-xl p-5 shadow-sm">
              <p className="text-slate-500 text-sm font-bold uppercase tracking-tight">Riesgo Moderado</p>
              <p className="text-3xl font-extrabold text-yellow-600 mt-1">32</p>
            </div>
            <div className="bg-white border border-emerald-200 rounded-xl p-5 shadow-sm">
              <p className="text-slate-500 text-sm font-bold uppercase tracking-tight">Salud Óptima</p>
              <p className="text-3xl font-extrabold text-emerald-600 mt-1">84</p>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-8 mt-6 shadow-sm">
            <h3 className="text-lg font-bold text-[#0B1B3D] mb-6">Mapa de Riesgos por Departamento</h3>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={departmentData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" stroke="#475569" fontSize={12} fontWeight="bold" tickLine={false} axisLine={false} />
                  <Tooltip cursor={{fill: '#f8fafc'}} />
                  <Bar dataKey="riesgoAlto" stackId="a" fill="#ef4444" />
                  <Bar dataKey="riesgoModerado" stackId="a" fill="#f59e0b" />
                  <Bar dataKey="riesgoBajo" stackId="a" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}

      {activeTab === "consultations" && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden mt-6 shadow-sm">
          <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
            <div className="relative w-64">
              <input 
                type="text" 
                placeholder="ID de Paciente..." 
                className="w-full pl-4 pr-4 py-2 rounded-lg border border-slate-200 text-sm"
                value={patientSearch}
                onChange={(e) => setPatientSearch(e.target.value)}
              />
            </div>
            <p className="text-xs font-bold text-slate-500 uppercase">Prioridad: Casos Críticos Primero</p>
          </div>
          <table className="w-full text-left text-sm">
            <thead className="bg-white text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-bold">Paciente</th>
                <th className="px-6 py-4 font-bold text-center">Riesgo</th>
                <th className="px-6 py-4 font-bold text-right">Acciones Médicas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr className="hover:bg-slate-50">
                <td className="px-6 py-4 font-mono text-slate-900 font-bold">EMP-8291 <span className="ml-2 font-medium text-slate-400 font-sans">(IT)</span></td>
                <td className="px-6 py-4 text-center"><span className="px-2.5 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold">CRÍTICO</span></td>
                <td className="px-6 py-4 text-right space-x-2">
                  <Button onClick={() => downloadIndividualReport("EMP-8291")} size="sm" variant="outline" className="h-8 text-xs font-bold border-slate-300">Descargar Reporte</Button>
                  <Button onClick={() => scheduleAppointment("EMP-8291")} size="sm" className="h-8 text-xs font-bold bg-[#0B1B3D]">Programar Cita</Button>
                </td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="px-6 py-4 font-mono text-slate-900 font-bold">EMP-3102 <span className="ml-2 font-medium text-slate-400 font-sans">(Diseño)</span></td>
                <td className="px-6 py-4 text-center"><span className="px-2.5 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-bold">MODERADO</span></td>
                <td className="px-6 py-4 text-right space-x-2">
                  <Button onClick={() => downloadIndividualReport("EMP-3102")} size="sm" variant="outline" className="h-8 text-xs font-bold border-slate-300">Descargar Reporte</Button>
                  <Button onClick={() => scheduleAppointment("EMP-3102")} size="sm" variant="outline" className="h-8 text-xs font-bold border-slate-300">Citar Evaluación</Button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {activeTab === "prescribe" && (
        <div className="bg-white border border-slate-200 rounded-xl p-8 mt-6 shadow-sm max-w-2xl">
          <h3 className="text-xl font-bold text-[#0B1B3D] mb-2">Recetario Ergonómico Digital</h3>
          <p className="text-slate-500 text-sm mb-8 font-medium">Emite prescripciones de ejercicios o descansos obligatorios que se inyectarán en la vista del empleado.</p>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">ID del Paciente Objetivo</label>
              <input type="text" placeholder="Ej. EMP-8291" className="w-full h-11 px-4 rounded-lg bg-slate-50 border border-slate-200" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Prescripción / Tratamiento</label>
              <textarea rows={4} placeholder="Indica los ejercicios o ajustes de estación de trabajo..." className="w-full p-4 rounded-lg bg-slate-50 border border-slate-200 resize-none"></textarea>
            </div>
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-11 px-8 w-full shadow-lg shadow-emerald-600/20">
              Emitir y Notificar Paciente
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
