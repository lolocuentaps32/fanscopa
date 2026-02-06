
import React, { useState, useEffect } from 'react';
import { Registration } from '../types';
import { storageService } from '../store/dataStore';
import { analyzeRegistrations } from '../services/geminiService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const AdminDashboard: React.FC = () => {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [analysis, setAnalysis] = useState<any>(null);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);

  useEffect(() => {
    setRegistrations(storageService.getRegistrations());
  }, []);

  const handleStatusChange = (dni: string, newStatus: Registration['STATUS']) => {
    const updated = storageService.updateRegistration(dni, { STATUS: newStatus });
    setRegistrations(updated);
  };

  const handleAnalyze = async () => {
    setLoadingAnalysis(true);
    try {
      const result = await analyzeRegistrations(registrations);
      setAnalysis(result);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAnalysis(false);
    }
  };

  // Charts data
  const statusData = [
    { name: 'Aceptado', count: registrations.filter(r => r.STATUS === 'Aceptado').length },
    { name: 'Pendiente', count: registrations.filter(r => r.STATUS === 'Pendiente').length },
    { name: 'Procesando', count: registrations.filter(r => r.STATUS === 'Procesando').length },
    { name: 'Rechazado', count: registrations.filter(r => r.STATUS === 'Rechazado').length },
  ];

  const COLORS = ['#10b981', '#f59e0b', '#3b82f6', '#ef4444'];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-slate-800">Panel de Administración (CRM)</h1>
        <button 
          onClick={handleAnalyze}
          disabled={loadingAnalysis}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-semibold transition disabled:opacity-50 flex items-center gap-2"
        >
          {loadingAnalysis ? (
            <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
          ) : '✨ Análisis IA de Solicitudes'}
        </button>
      </div>

      {analysis && (
        <div className="bg-indigo-50 border border-indigo-100 p-6 rounded-xl shadow-sm animate-fade-in">
          <h2 className="text-xl font-semibold text-indigo-900 mb-2">Resumen Inteligente</h2>
          <p className="text-indigo-800 mb-4">{analysis.summary}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <span className="block text-sm font-medium text-slate-500">Abonados</span>
              <span className="text-2xl font-bold text-indigo-600">{(analysis.metrics.abonadosPerc * 100).toFixed(1)}%</span>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <span className="block text-sm font-medium text-slate-500">Top Localidades</span>
              <div className="flex flex-wrap gap-2 mt-1">
                {analysis.metrics.topLocations.map((loc: string) => (
                  <span key={loc} className="px-2 py-1 bg-slate-100 rounded text-xs text-slate-600">{loc}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold mb-4 text-slate-700">Estado de Solicitudes</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#4f46e5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col items-center">
          <h3 className="text-lg font-semibold mb-4 text-slate-700">Distribución de Tipos</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                  data={[
                    { name: 'VIP', value: registrations.filter(r => r.VIP).length },
                    { name: 'Normal', value: registrations.filter(r => !r.VIP).length }
                  ]}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  <Cell fill="#f59e0b" />
                  <Cell fill="#6366f1" />
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
          <h3 className="font-semibold text-slate-700">Lista de Solicitudes</h3>
          <span className="text-sm text-slate-500">{registrations.length} total</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-sm uppercase tracking-wider">
                <th className="px-6 py-4 font-medium">Nombre</th>
                <th className="px-6 py-4 font-medium">Solicitud</th>
                <th className="px-6 py-4 font-medium">DNI</th>
                <th className="px-6 py-4 font-medium">Estado</th>
                <th className="px-6 py-4 font-medium text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {registrations.map((reg) => (
                <tr key={reg.DNI} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-900">{reg.NOMBRE} {reg.APELLIDOS}</div>
                    <div className="text-xs text-slate-500">{reg.EMAIL}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-slate-600">{reg.SOLICITUD}</span>
                    <div className="flex gap-1 mt-1">
                      {reg.VIP && <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 text-[10px] rounded font-bold">VIP</span>}
                      {reg.ABONADO && <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] rounded font-bold">ABONADO</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-mono text-slate-500">{reg.DNI}</td>
                  <td className="px-6 py-4">
                    <select 
                      value={reg.STATUS}
                      onChange={(e) => handleStatusChange(reg.DNI, e.target.value as Registration['STATUS'])}
                      className={`text-xs font-semibold px-2 py-1 rounded-full border-0 focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500 
                        ${reg.STATUS === 'Aceptado' ? 'bg-emerald-100 text-emerald-700' : 
                          reg.STATUS === 'Pendiente' ? 'bg-amber-100 text-amber-700' :
                          reg.STATUS === 'Rechazado' ? 'bg-rose-100 text-rose-700' : 'bg-blue-100 text-blue-700'}`}
                    >
                      <option value="Pendiente">Pendiente</option>
                      <option value="Procesando">Procesando</option>
                      <option value="Aceptado">Aceptado</option>
                      <option value="Rechazado">Rechazado</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-indigo-600 hover:text-indigo-900 text-sm font-medium">Ver detalles</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
