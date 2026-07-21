import React, { useState, useEffect } from 'react';

export default function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [filters, setFilters] = useState({ department: '', type: '' });
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'gantt'

  useEffect(() => {
    // Fetch inicial da API Backend
    fetch('http://localhost:3001/api/projects', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
      .then(res => res.json())
      .then(data => setProjects(Array.isArray(data) ? data : []));
  }, []);

  // Aplicação simultânea dos filtros
  const filteredProjects = projects.filter(p => {
    return (
      (filters.department === '' || p.department === filters.department) &&
      (filters.type === '' || p.type === filters.type)
    );
  });

  // Cálculo dinâmico dos Big Numbers baseados nos dados filtrados
  const totalCost = filteredProjects.reduce((acc, p) => acc + (Number(p.estimated_cost) || 0), 0);
  const totalHours = filteredProjects.reduce((acc, p) => acc + (Number(p.estimated_hours) || 0), 0);

  return (
    <div className="p-6 bg-slate-900 text-white min-h-screen">
      <h1 className="text-2xl font-bold mb-4">ProjectFlow AI - Dashboard Executivo</h1>
      
      {/* Barra de Filtros */}
      <div className="flex gap-4 mb-6 bg-slate-800 p-4 rounded-lg">
        <select 
          className="bg-slate-700 p-2 rounded"
          onChange={e => setFilters({ ...filters, department: e.target.value })}
        >
          <option value="">Todos os Setores</option>
          <option value="TI">TI</option>
          <option value="Marketing">Marketing</option>
          <option value="Financeiro">Financeiro</option>
        </select>

        <select 
          className="bg-slate-700 p-2 rounded"
          onChange={e => setFilters({ ...filters, type: e.target.value })}
        >
          <option value="">Todos os Tipos</option>
          <option value="Projeto">Projeto</option>
          <option value="Ideia">Ideia</option>
        </select>
      </div>

      {/* Big Numbers (KPIs) */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-slate-800 p-4 rounded-lg">
          <p className="text-sm text-slate-400">Total de Demanda</p>
          <p className="text-3xl font-bold">{filteredProjects.length}</p>
        </div>
        <div className="bg-slate-800 p-4 rounded-lg">
          <p className="text-sm text-slate-400">Custo Total Previsto</p>
          <p className="text-3xl font-bold">R$ {totalCost.toLocaleString()}</p>
        </div>
        <div className="bg-slate-800 p-4 rounded-lg">
          <p className="text-sm text-slate-400">Horas Estimadas</p>
          <p className="text-3xl font-bold">{totalHours}h</p>
        </div>
      </div>

      {/* Alternador Gantt / Tabela */}
      <div className="mb-4">
        <button 
          onClick={() => setViewMode(viewMode === 'table' ? 'gantt' : 'table')}
          className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-500"
        >
          {viewMode === 'table' ? 'Ver como Gantt' : 'Ver como Tabela'}
        </button>
      </div>

      {/* Tabela de Projetos */}
      {viewMode === 'table' ? (
        <table className="w-full text-left bg-slate-800 rounded-lg overflow-hidden">
          <thead className="bg-slate-700">
            <tr>
              <th className="p-3">Título</th>
              <th className="p-3">Setor</th>
              <th className="p-3">Tipo</th>
              <th className="p-3">Complexidade</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredProjects.map(p => (
              <tr key={p.id} className="border-b border-slate-700">
                <td className="p-3">{p.title}</td>
                <td className="p-3">{p.department}</td>
                <td className="p-3">{p.type}</td>
                <td className="p-3">{p.complexity_score}/100</td>
                <td className="p-3">{p.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="bg-slate-800 p-6 rounded-lg text-center text-slate-400">
          [ Renderização do Gráfico de Gantt via biblioteca vis-timeline/frappe-gantt ]
        </div>
      )}
    </div>
  );
}