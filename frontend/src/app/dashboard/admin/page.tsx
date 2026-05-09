"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

interface User {
  id: number;
  full_name: string;
  email: string;
  role: string;
  is_active: boolean;
}

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("users");

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/users");
      const data = await res.json();
      if (data.users) {
        setUsers(data.users);
        setFilteredUsers(data.users);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    setFilteredUsers(
      users.filter(u => 
        u.email.toLowerCase().includes(searchTerm.toLowerCase()) || 
        u.full_name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [searchTerm, users]);

  const changeRole = async (email: string, newRole: string) => {
    // Update optimista
    const updatedUsers = users.map(u => u.email === email ? { ...u, role: newRole } : u);
    setUsers(updatedUsers);
    
    try {
      await fetch("/api/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, role: newRole }),
      });
    } catch (error) {
      console.error(error);
      fetchUsers(); // Revertir
    }
  };

  const downloadGeneralReport = () => {
    alert("Generando Reporte Ejecutivo de Salud Organizacional (PDF)...\nLa descarga comenzará en breve.");
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse max-w-6xl">
        <div className="h-10 bg-slate-200 rounded w-1/3"></div>
        <div className="h-24 bg-slate-200 rounded w-full mt-8"></div>
        <div className="h-96 bg-slate-200 rounded-xl mt-6"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2 text-[#0B1B3D]">Consola de Administración IT</h1>
          <p className="text-slate-500 font-medium">Gestión de identidades, configuración global y reportes ejecutivos.</p>
        </div>
      </div>

      <div className="flex gap-4 border-b border-slate-200 pb-px">
        <button 
          onClick={() => setActiveTab("users")}
          className={`pb-2 text-sm font-bold border-b-2 transition-colors ${activeTab === "users" ? "border-[#0B1B3D] text-[#0B1B3D]" : "border-transparent text-slate-400 hover:text-slate-600"}`}
        >
          Gestión de Usuarios
        </button>
        <button 
          onClick={() => setActiveTab("reports")}
          className={`pb-2 text-sm font-bold border-b-2 transition-colors ${activeTab === "reports" ? "border-[#0B1B3D] text-[#0B1B3D]" : "border-transparent text-slate-400 hover:text-slate-600"}`}
        >
          Reportes Corporativos
        </button>
        <button 
          onClick={() => setActiveTab("ai-config")}
          className={`pb-2 text-sm font-bold border-b-2 transition-colors ${activeTab === "ai-config" ? "border-[#0B1B3D] text-[#0B1B3D]" : "border-transparent text-slate-400 hover:text-slate-600"}`}
        >
          Ajustes Globales (IA)
        </button>
        <button 
          onClick={() => setActiveTab("logs")}
          className={`pb-2 text-sm font-bold border-b-2 transition-colors ${activeTab === "logs" ? "border-[#0B1B3D] text-[#0B1B3D]" : "border-transparent text-slate-400 hover:text-slate-600"}`}
        >
          Auditoría
        </button>
      </div>

      {activeTab === "users" && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden mt-6 shadow-sm">
          <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input 
                type="text" 
                placeholder="Buscar por email o nombre..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0B1B3D]/30 text-sm font-medium"
              />
            </div>
            <Button className="bg-[#0B1B3D] hover:bg-[#1C305C] text-white font-bold h-9">
              Nuevo Empleado
            </Button>
          </div>
          
          <table className="w-full text-left text-sm">
            <thead className="bg-white text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-bold">Email</th>
                <th className="px-6 py-4 font-bold">Nombre</th>
                <th className="px-6 py-4 font-bold text-center">Estado</th>
                <th className="px-6 py-4 font-bold text-right">Rol Asignado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-900">{user.email}</p>
                    <p className="text-xs text-slate-500 font-mono mt-0.5">ID: {user.id}</p>
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-700 capitalize">
                    {user.full_name}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {user.is_active ? (
                      <span className="inline-block px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold border border-emerald-200 shadow-sm">Activo</span>
                    ) : (
                      <span className="inline-block px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-bold border border-slate-200 shadow-sm">Suspendido</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="inline-flex bg-slate-100 border border-slate-200 rounded-lg p-1 shadow-inner">
                      <button
                        onClick={() => changeRole(user.email, 'user')}
                        className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${user.role === 'user' ? 'bg-white text-slate-800 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-700'}`}
                      >
                        Usuario
                      </button>
                      <button
                        onClick={() => changeRole(user.email, 'specialist')}
                        className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${user.role === 'specialist' ? 'bg-indigo-50 text-indigo-700 shadow-sm border border-indigo-200' : 'text-slate-500 hover:text-slate-700'}`}
                      >
                        Especialista
                      </button>
                      <button
                        onClick={() => changeRole(user.email, 'admin')}
                        className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${user.role === 'admin' ? 'bg-[#0B1B3D] text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                      >
                        Admin
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === "reports" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm">
            <h3 className="text-xl font-bold text-[#0B1B3D] mb-4">Reportes de RRHH</h3>
            <p className="text-slate-500 text-sm mb-6 font-medium">Genera documentos consolidados sobre el cumplimiento de pausas activas y reducción de riesgos por departamento.</p>
            <div className="space-y-3">
              <Button onClick={downloadGeneralReport} className="w-full bg-[#0B1B3D] hover:bg-[#1C305C] justify-start h-12">
                <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                Descargar Reporte Mensual (PDF)
              </Button>
              <Button variant="outline" className="w-full justify-start h-12 border-slate-200">
                <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                Exportar Datos de Usuarios (CSV)
              </Button>
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm">
            <h3 className="text-xl font-bold text-[#0B1B3D] mb-4">Estadísticas de Especialistas</h3>
            <p className="text-slate-500 text-sm mb-6 font-medium">Métricas sobre la efectividad de las prescripciones y número de consultas atendidas.</p>
            <div className="flex items-end gap-2">
              <span className="text-4xl font-extrabold text-emerald-600">85%</span>
              <span className="text-slate-400 font-bold mb-1">Efectividad Médica</span>
            </div>
          </div>
        </div>
      )}

      {activeTab === "ai-config" && (
        <div className="bg-white border border-slate-200 rounded-xl p-8 mt-6 shadow-sm max-w-2xl">
          <h3 className="text-lg font-bold text-[#0B1B3D] mb-6">Parametrización del Motor Biomédico</h3>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm font-bold text-slate-700">Tolerancia de Inclinación Cervical (Grados)</label>
                <span className="text-sm font-bold text-emerald-600">25°</span>
              </div>
              <input type="range" min="10" max="40" defaultValue="25" className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600" />
            </div>
            <Button className="bg-[#0B1B3D] hover:bg-[#1C305C] text-white font-bold h-10 px-6">Guardar Configuración</Button>
          </div>
        </div>
      )}

      {activeTab === "logs" && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden mt-6 shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-white text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 font-bold">Fecha / Hora</th>
                <th className="px-6 py-3 font-bold">Evento</th>
                <th className="px-6 py-3 font-bold">Actor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr className="hover:bg-slate-50">
                <td className="px-6 py-4 font-mono text-slate-600 text-xs">2026-05-09 10:45:12</td>
                <td className="px-6 py-4 font-medium text-emerald-600">Login Exitoso</td>
                <td className="px-6 py-4 font-bold text-slate-800">admin@ergoai.com</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
