import React from "react";
import { Discipline } from "../types";
import { Clock, Award, Compass, BookOpen } from "lucide-react";

interface StatsCardsProps {
  disciplines: Discipline[];
}

export default function StatsCards({ disciplines }: StatsCardsProps) {
  // Compute totals
  const totalDisciplinesHours = disciplines.reduce((acc, d) => acc + d.ch, 0);
  const totalTeo = disciplines.reduce((acc, d) => acc + d.chTeo, 0);
  const totalPra = disciplines.reduce((acc, d) => acc + d.chPra, 0);
  const totalEad = disciplines.reduce((acc, d) => acc + d.chEad, 0);
  const totalExt = disciplines.reduce((acc, d) => acc + d.chExt, 0);
  const totalAds = disciplines.reduce((acc, d) => acc + d.chAds, 0);
  const totalCredits = disciplines.reduce((acc, d) => acc + d.credito, 0);

  // Atividades Complementares constant target
  const atividadesComplementaresHours = 120;
  const totalGeralHours = totalDisciplinesHours + atividadesComplementaresHours;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Carga Horária Geral */}
      <div id="stat-card-total-hours" className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-sm transition-all hover:shadow-md hover:border-blue-300">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-xs font-mono font-medium text-slate-500 uppercase tracking-wider">Carga Horária Geral</p>
            <h3 className="text-2xl font-sans font-bold text-slate-800 mt-1">{totalGeralHours}h</h3>
          </div>
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg">
            <Clock className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3 text-xs text-slate-500 space-y-1">
          <p><span className="font-semibold text-blue-600">{totalDisciplinesHours}h</span> em disciplinas obrigatórias</p>
          <p><span className="font-semibold text-indigo-500">{atividadesComplementaresHours}h</span> em Atividades Complementares</p>
        </div>
      </div>

      {/* Créditos Totais */}
      <div id="stat-card-credits" className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-sm transition-all hover:shadow-md hover:border-amber-300">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-xs font-mono font-medium text-slate-500 uppercase tracking-wider">Créditos Acadêmicos</p>
            <h3 className="text-2xl font-sans font-bold text-amber-600 mt-1">{totalCredits}</h3>
          </div>
          <div className="p-2.5 bg-amber-50 text-amber-600 rounded-lg">
            <Award className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3 text-xs text-slate-500 space-y-1">
          <p><span className="font-semibold text-amber-600">{disciplines.length}</span> disciplinas na matriz curricular</p>
          <p>Média de <span className="font-semibold text-slate-700">{(totalCredits / (disciplines.length || 1)).toFixed(1)}</span> créditos por disciplina</p>
        </div>
      </div>

      {/* Horas Teóricas & Práticas */}
      <div id="stat-card-theory-practice" className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-sm transition-all hover:shadow-md hover:border-emerald-300">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-xs font-mono font-medium text-slate-500 uppercase tracking-wider">Teórica vs Prática</p>
            <h3 className="text-2xl font-sans font-bold text-slate-800 mt-1">
              <span className="text-emerald-600">{totalPra}h</span>
              <span className="text-slate-400 font-light mx-1">/</span>
              <span className="text-slate-600 font-medium text-lg">{totalTeo}h</span>
            </h3>
          </div>
          <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg">
            <BookOpen className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3 text-xs text-slate-500 space-y-1">
          <p><span className="font-semibold text-emerald-600">{totalPra}h</span> de atividades práticas (MEC)</p>
          <p><span className="font-semibold text-slate-600">{totalTeo}h</span> de conteúdo teórico de base</p>
        </div>
      </div>

      {/* Extensão & EAD & ADS */}
      <div id="stat-card-extension-ead" className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-sm transition-all hover:shadow-md hover:border-purple-300">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-xs font-mono font-medium text-slate-500 uppercase tracking-wider">Extensão, EAD & ADS</p>
            <h3 className="text-2xl font-sans font-bold text-purple-700 mt-1">
              {totalExt}h <span className="text-slate-300 text-sm font-light">EXT</span>
            </h3>
          </div>
          <div className="p-2.5 bg-purple-50 text-purple-600 rounded-lg">
            <Compass className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3 text-xs text-slate-500 space-y-1">
          <p><span className="font-semibold text-purple-600">{totalExt}h</span> de Projetos de Extensão (PROEX)</p>
          <p><span className="font-semibold text-indigo-600">{totalEad}h</span> EAD | <span className="font-semibold text-indigo-600">{totalAds}h</span> CH ADS</p>
        </div>
      </div>
    </div>
  );
}
