import React, { useState, useEffect } from "react";
import { Calendar, User, Clock, BookOpen, AlertTriangle, Users, ArrowRight, CheckCircle, Download, FileText } from "lucide-react";

interface ScheduleSlot {
  id: string;
  turma: string; // "2PPAN" | "4PPAN" | "6PPAN"
  dia: "Segunda-feira" | "Terça-feira" | "Quarta-feira" | "Quinta-feira" | "Sexta-feira";
  horario: "19h00 - 19h50" | "19h50 - 20h40" | "20h50 - 21h40" | "21h40 - 22h30";
  coddisc: string;
  disciplina: string;
  professor: string;
}

const DEFAULT_SCHEDULE_DATA: ScheduleSlot[] = [
  // --- 2PPAN (2º Semestre) ---
  // Segunda-feira
  { id: "2-seg-1", turma: "2PPAN", dia: "Segunda-feira", horario: "19h00 - 19h50", coddisc: "16007PP", disciplina: "Fotografia Publicitária", professor: "LUIS FELIPE GOUVEIA PINHO" },
  { id: "2-seg-2", turma: "2PPAN", dia: "Segunda-feira", horario: "19h50 - 20h40", coddisc: "16007PP", disciplina: "Fotografia Publicitária", professor: "LUIS FELIPE GOUVEIA PINHO" },
  { id: "2-seg-3", turma: "2PPAN", dia: "Segunda-feira", horario: "20h50 - 21h40", coddisc: "16007PP", disciplina: "Fotografia Publicitária", professor: "LUIS FELIPE GOUVEIA PINHO" },
  { id: "2-seg-4", turma: "2PPAN", dia: "Segunda-feira", horario: "21h40 - 22h30", coddisc: "16007PP", disciplina: "Fotografia Publicitária", professor: "LUIS FELIPE GOUVEIA PINHO" },
  // Terça-feira
  { id: "2-ter-1", turma: "2PPAN", dia: "Terça-feira", horario: "19h00 - 19h50", coddisc: "16091PP", disciplina: "Sociedade e Criatividade", professor: "GRACIELA JOHNSSON CAMPOS JOKOWISKI" },
  { id: "2-ter-2", turma: "2PPAN", dia: "Terça-feira", horario: "19h50 - 20h40", coddisc: "16091PP", disciplina: "Sociedade e Criatividade", professor: "GRACIELA JOHNSSON CAMPOS JOKOWISKI" },
  { id: "2-ter-3", turma: "2PPAN", dia: "Terça-feira", horario: "20h50 - 21h40", coddisc: "PX001PUB", disciplina: "Programa de Extensão - PROEX I", professor: "INSTITUCIONAL" },
  { id: "2-ter-4", turma: "2PPAN", dia: "Terça-feira", horario: "21h40 - 22h30", coddisc: "PX001PUB", disciplina: "Programa de Extensão - PROEX I", professor: "INSTITUCIONAL" },
  // Quarta-feira
  { id: "2-qua-1", turma: "2PPAN", dia: "Quarta-feira", horario: "19h00 - 19h50", coddisc: "16079PP", disciplina: "Escrita Criativa", professor: "GABRIEL ALEXANDRE BOZZA" },
  { id: "2-qua-2", turma: "2PPAN", dia: "Quarta-feira", horario: "19h50 - 20h40", coddisc: "16079PP", disciplina: "Escrita Criativa", professor: "GABRIEL ALEXANDRE BOZZA" },
  { id: "2-qua-3", turma: "2PPAN", dia: "Quarta-feira", horario: "20h50 - 21h40", coddisc: "16079PP", disciplina: "Escrita Criativa", professor: "GABRIEL ALEXANDRE BOZZA" },
  { id: "2-qua-4", turma: "2PPAN", dia: "Quarta-feira", horario: "21h40 - 22h30", coddisc: "16079PP", disciplina: "Escrita Criativa", professor: "GABRIEL ALEXANDRE BOZZA" },
  // Quinta-feira
  { id: "2-qui-1", turma: "2PPAN", dia: "Quinta-feira", horario: "19h00 - 19h50", coddisc: "NCH001", disciplina: "Arte e Cultura no Mundo Contemporâneo", professor: "LEONARDO JOSE COSTA" },
  { id: "2-qui-2", turma: "2PPAN", dia: "Quinta-feira", horario: "19h50 - 20h40", coddisc: "NCH001", disciplina: "Arte e Cultura no Mundo Contemporâneo", professor: "LEONARDO JOSE COSTA" },
  // Sexta-feira
  { id: "2-sex-1", turma: "2PPAN", dia: "Sexta-feira", horario: "19h00 - 19h50", coddisc: "16005PP", disciplina: "Editoração Publicitária", professor: "GRACIELA JOHNSSON CAMPOS JOKOWISKI" },
  { id: "2-sex-2", turma: "2PPAN", dia: "Sexta-feira", horario: "19h50 - 20h40", coddisc: "16005PP", disciplina: "Editoração Publicitária", professor: "GRACIELA JOHNSSON CAMPOS JOKOWISKI" },
  { id: "2-sex-3", turma: "2PPAN", dia: "Sexta-feira", horario: "20h50 - 21h40", coddisc: "16005PP", disciplina: "Editoração Publicitária", professor: "GRACIELA JOHNSSON CAMPOS JOKOWISKI" },
  { id: "2-sex-4", turma: "2PPAN", dia: "Sexta-feira", horario: "21h40 - 22h30", coddisc: "16005PP", disciplina: "Editoração Publicitária", professor: "GRACIELA JOHNSSON CAMPOS JOKOWISKI" },

  // --- 4PPAN (4º Semestre) ---
  // Segunda-feira
  { id: "4-seg-1", turma: "4PPAN", dia: "Segunda-feira", horario: "19h00 - 19h50", coddisc: "16093PP", disciplina: "Novas Soluções Audiovisuais", professor: "GABRIEL ALEXANDRE BOZZA" },
  { id: "4-seg-2", turma: "4PPAN", dia: "Segunda-feira", horario: "19h50 - 20h40", coddisc: "16093PP", disciplina: "Novas Soluções Audiovisuais", professor: "GABRIEL ALEXANDRE BOZZA" },
  { id: "4-seg-3", turma: "4PPAN", dia: "Segunda-feira", horario: "20h50 - 21h40", coddisc: "16093PP", disciplina: "Novas Soluções Audiovisuais", professor: "GABRIEL ALEXANDRE BOZZA" },
  { id: "4-seg-4", turma: "4PPAN", dia: "Segunda-feira", horario: "21h40 - 22h30", coddisc: "16093PP", disciplina: "Novas Soluções Audiovisuais", professor: "GABRIEL ALEXANDRE BOZZA" },
  // Terça-feira
  { id: "4-ter-1", turma: "4PPAN", dia: "Terça-feira", horario: "19h00 - 19h50", coddisc: "16015PP", disciplina: "Produção Audiovisual", professor: "LUIS FELIPE GOUVEIA PINHO" },
  { id: "4-ter-2", turma: "4PPAN", dia: "Terça-feira", horario: "19h50 - 20h40", coddisc: "16015PP", disciplina: "Produção Audiovisual", professor: "LUIS FELIPE GOUVEIA PINHO" },
  { id: "4-ter-3", turma: "4PPAN", dia: "Terça-feira", horario: "20h50 - 21h40", coddisc: "16015PP", disciplina: "Produção Audiovisual", professor: "LUIS FELIPE GOUVEIA PINHO" },
  { id: "4-ter-4", turma: "4PPAN", dia: "Terça-feira", horario: "21h40 - 22h30", coddisc: "16015PP", disciplina: "Produção Audiovisual", professor: "LUIS FELIPE GOUVEIA PINHO" },
  // Quarta-feira
  { id: "4-qua-1", turma: "4PPAN", dia: "Quarta-feira", horario: "19h00 - 19h50", coddisc: "16016PP", disciplina: "Produção de Som", professor: "LEONARDO JOSE COSTA" },
  { id: "4-qua-2", turma: "4PPAN", dia: "Quarta-feira", horario: "19h50 - 20h40", coddisc: "16016PP", disciplina: "Produção de Som", professor: "LEONARDO JOSE COSTA" },
  { id: "4-qua-3", turma: "4PPAN", dia: "Quarta-feira", horario: "20h50 - 21h40", coddisc: "16016PP", disciplina: "Produção de Som", professor: "LEONARDO JOSE COSTA" },
  { id: "4-qua-4", turma: "4PPAN", dia: "Quarta-feira", horario: "21h40 - 22h30", coddisc: "16016PP", disciplina: "Produção de Som", professor: "LEONARDO JOSE COSTA" },
  // Quinta-feira
  { id: "4-qui-1", turma: "4PPAN", dia: "Quinta-feira", horario: "19h00 - 19h50", coddisc: "16094PP", disciplina: "Publicidade na Comunidade", professor: "GRACIELA JOHNSSON CAMPOS JOKOWISKI" },
  { id: "4-qui-2", turma: "4PPAN", dia: "Quinta-feira", horario: "19h50 - 20h40", coddisc: "16094PP", disciplina: "Publicidade na Comunidade", professor: "GRACIELA JOHNSSON CAMPOS JOKOWISKI" },
  { id: "4-qui-3", turma: "4PPAN", dia: "Quinta-feira", horario: "20h50 - 21h40", coddisc: "16094PP", disciplina: "Publicidade na Comunidade", professor: "GRACIELA JOHNSSON CAMPOS JOKOWISKI" },
  { id: "4-qui-4", turma: "4PPAN", dia: "Quinta-feira", horario: "21h40 - 22h30", coddisc: "16094PP", disciplina: "Publicidade na Comunidade", professor: "GRACIELA JOHNSSON CAMPOS JOKOWISKI" },
  // Sexta-feira
  { id: "4-sex-1", turma: "4PPAN", dia: "Sexta-feira", horario: "19h00 - 19h50", coddisc: "PX002PUB", disciplina: "Programa de Extensão - PROEX II", professor: "GABRIEL ALEXANDRE BOZZA" },
  { id: "4-sex-2", turma: "4PPAN", dia: "Sexta-feira", horario: "19h50 - 20h40", coddisc: "PX002PUB", disciplina: "Programa de Extensão - PROEX II", professor: "GABRIEL ALEXANDRE BOZZA" },

  // --- 6PPAN (6º Semestre) ---
  // Segunda-feira
  { id: "6-seg-1", turma: "6PPAN", dia: "Segunda-feira", horario: "19h00 - 19h50", coddisc: "16089PP", disciplina: "Live Marketing e Branded Experience", professor: "LEONARDO JOSE COSTA" },
  { id: "6-seg-2", turma: "6PPAN", dia: "Segunda-feira", horario: "19h50 - 20h40", coddisc: "16089PP", disciplina: "Live Marketing e Branded Experience", professor: "LEONARDO JOSE COSTA" },
  { id: "6-seg-3", turma: "6PPAN", dia: "Segunda-feira", horario: "20h50 - 21h40", coddisc: "16089PP", disciplina: "Live Marketing e Branded Experience", professor: "LEONARDO JOSE COSTA" },
  { id: "6-seg-4", turma: "6PPAN", dia: "Segunda-feira", horario: "21h40 - 22h30", coddisc: "16089PP", disciplina: "Live Marketing e Branded Experience", professor: "LEONARDO JOSE COSTA" },
  // Terça-feira
  { id: "6-ter-1", turma: "6PPAN", dia: "Terça-feira", horario: "19h00 - 19h50", coddisc: "16022PP", disciplina: "Ciberpublicidade", professor: "GUSTAVO FORAPANI" },
  { id: "6-ter-2", turma: "6PPAN", dia: "Terça-feira", horario: "19h50 - 20h40", coddisc: "16022PP", disciplina: "Ciberpublicidade", professor: "GUSTAVO FORAPANI" },
  { id: "6-ter-3", turma: "6PPAN", dia: "Terça-feira", horario: "20h50 - 21h40", coddisc: "16022PP", disciplina: "Ciberpublicidade", professor: "GUSTAVO FORAPANI" },
  { id: "6-ter-4", turma: "6PPAN", dia: "Terça-feira", horario: "21h40 - 22h30", coddisc: "16022PP", disciplina: "Ciberpublicidade", professor: "GUSTAVO FORAPANI" },
  // Quarta-feira
  { id: "6-qua-1", turma: "6PPAN", dia: "Quarta-feira", horario: "19h00 - 19h50", coddisc: "16042PP", disciplina: "Tendências em Publicidade", professor: "LUCAS DAMASIO" },
  { id: "6-qua-2", turma: "6PPAN", dia: "Quarta-feira", horario: "19h50 - 20h40", coddisc: "16042PP", disciplina: "Tendências em Publicidade", professor: "LUCAS DAMASIO" },
  { id: "6-qua-3", turma: "6PPAN", dia: "Quarta-feira", horario: "20h50 - 21h40", coddisc: "PX003PUB", disciplina: "Programa de Extensão - PROEX III", professor: "GABRIEL ALEXANDRE BOZZA" },
  { id: "6-qua-4", turma: "6PPAN", dia: "Quarta-feira", horario: "21h40 - 22h30", coddisc: "PX003PUB", disciplina: "Programa de Extensão - PROEX III", professor: "GABRIEL ALEXANDRE BOZZA" },
  // Quinta-feira
  { id: "6-qui-1", turma: "6PPAN", dia: "Quinta-feira", horario: "19h00 - 19h50", coddisc: "16040PP", disciplina: "Optativa", professor: "LUCAS DAMASIO" },
  { id: "6-qui-2", turma: "6PPAN", dia: "Quinta-feira", horario: "19h50 - 20h40", coddisc: "16040PP", disciplina: "Optativa", professor: "LUCAS DAMASIO" },
  { id: "6-qui-3", turma: "6PPAN", dia: "Quinta-feira", horario: "20h50 - 21h40", coddisc: "16040PP", disciplina: "Optativa", professor: "LUCAS DAMASIO" },
  { id: "6-qui-4", turma: "6PPAN", dia: "Quinta-feira", horario: "21h40 - 22h30", coddisc: "16040PP", disciplina: "Optativa", professor: "LUCAS DAMASIO" },
  // Sexta-feira
  { id: "6-sex-1", turma: "6PPAN", dia: "Sexta-feira", horario: "19h00 - 19h50", coddisc: "205ADM", disciplina: "Business Intelligence", professor: "PABLO HENRIQUE PASCHOAL CAPUCHO" },
  { id: "6-sex-2", turma: "6PPAN", dia: "Sexta-feira", horario: "19h50 - 20h40", coddisc: "205ADM", disciplina: "Business Intelligence", professor: "PABLO HENRIQUE PASCHOAL CAPUCHO" }
];

const DIAS = ["Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira"] as const;
const HORARIOS = ["19h00 - 19h50", "19h50 - 20h40", "20h50 - 21h40", "21h40 - 22h30"] as const;

export default function ScheduleViewer() {
  const [schedule, setSchedule] = useState<ScheduleSlot[]>([]);
  const [selectedTurma, setSelectedTurma] = useState<"2PPAN" | "4PPAN" | "6PPAN">("2PPAN");
  const [selectedProfessorFilter, setSelectedProfessorFilter] = useState<string>("ALL");
  const [editingSlot, setEditingSlot] = useState<ScheduleSlot | null>(null);
  const [editProfName, setEditProfName] = useState("");

  // Load from local storage or set defaults
  useEffect(() => {
    const cached = localStorage.getItem("unibrasil_pp_schedule_2026_2");
    if (cached) {
      try {
        setSchedule(JSON.parse(cached));
      } catch (e) {
        setSchedule(DEFAULT_SCHEDULE_DATA);
      }
    } else {
      setSchedule(DEFAULT_SCHEDULE_DATA);
    }
  }, []);

  const saveSchedule = (newSchedule: ScheduleSlot[]) => {
    setSchedule(newSchedule);
    localStorage.setItem("unibrasil_pp_schedule_2026_2", JSON.stringify(newSchedule));
  };

  // Get list of unique professors
  const uniqueProfessors: string[] = (Array.from(new Set(schedule.map((s) => s.professor).filter(Boolean))) as string[]).sort();

  // Reset to default schedule layout
  const handleResetSchedule = () => {
    if (window.confirm("Deseja realmente redefinir a grade de horários para o padrão oficial da UniBrasil (2026/2)?")) {
      saveSchedule(DEFAULT_SCHEDULE_DATA);
    }
  };

  // Update professor allocation for a slot
  const handleSaveProfessorEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSlot) return;

    const updated = schedule.map((s) => {
      if (s.id === editingSlot.id) {
        return { ...s, professor: editProfName.trim().toUpperCase() };
      }
      return s;
    });

    saveSchedule(updated);
    setEditingSlot(null);
  };

  // Pre-fill edit modal/popover
  const handleStartEdit = (slot: ScheduleSlot) => {
    setEditingSlot(slot);
    setEditProfName(slot.professor);
  };

  // Calculate workload in periods (50 min classes) per professor
  const getProfessorWorkload = (profName: string) => {
    return schedule.filter((s) => s.professor === profName).length;
  };

  // Check for scheduling conflicts (e.g., same professor allocated to different slots at the exact same day/time)
  const getConflicts = () => {
    const conflicts: string[] = [];
    const allocationMap = new Map<string, string[]>(); // key: dia-horario-professor, value: array of turmas

    schedule.forEach((s) => {
      if (!s.professor || s.professor === "INSTITUCIONAL") return;
      const key = `${s.dia}|${s.horario}|${s.professor}`;
      const existing = allocationMap.get(key) || [];
      allocationMap.set(key, [...existing, s.turma]);
    });

    allocationMap.forEach((turmas, key) => {
      if (turmas.length > 1) {
        const [dia, horario, professor] = key.split("|");
        conflicts.push(
          `Conflito: Prof. ${professor} está alocado(a) simultaneamente no ${dia} (${horario}) nas turmas: ${turmas.join(", ")}`
        );
      }
    });

    return conflicts;
  };

  const conflicts = getConflicts();

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      
      {/* Header Panel */}
      <div className="p-5 border-b border-slate-200 bg-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-amber-100 text-amber-800 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border border-amber-200">
              ANO LETIVO: 2026/2
            </span>
            <span className="bg-blue-100 text-blue-800 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border border-blue-200">
              GRADE DE HORÁRIOS DOCENTES
            </span>
          </div>
          <h2 className="text-lg font-sans font-extrabold text-slate-800 mt-1.5 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-600" />
            <span>Distribuição de Horários e Alocação de Professores</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Gestão integrada do Colegiado de Publicidade UniBrasil. Visualize conflitos de choque de horários e gerencie a carga horária de cada professor do curso.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
          <button
            onClick={handleResetSchedule}
            className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-800 transition-colors cursor-pointer"
          >
            Restaurar Grade de Aulas
          </button>
        </div>
      </div>

      {/* Main interactive area */}
      <div className="p-6 space-y-6">
        
        {/* Alerts & Warnings Panel (Conflicts detection) */}
        {conflicts.length > 0 ? (
          <div className="p-4 bg-rose-50 border border-rose-100 rounded-lg flex gap-3 items-start animate-pulse">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-rose-900 uppercase tracking-wider font-mono">Conflito de Choque de Horário Encontrado!</h4>
              <ul className="list-disc pl-4 space-y-1">
                {conflicts.map((conflict, i) => (
                  <li key={i} className="text-xs text-rose-700 font-sans font-medium">{conflict}</li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-lg flex gap-3 items-center">
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-wider font-mono">Nenhum choque de horário de professores</h4>
              <p className="text-[11px] text-emerald-700">Todas as alocações docentes para o segundo semestre de 2026 estão consistentes e livres de duplicidades.</p>
            </div>
          </div>
        )}

        {/* Filters Panel */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Turma Switcher */}
          <div className="bg-slate-50/70 p-3 border border-slate-150 rounded-xl space-y-2">
            <span className="block text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider">Visualizar Turma (PPC)</span>
            <div className="grid grid-cols-3 gap-1 bg-slate-200/50 p-1 rounded-lg">
              {(["2PPAN", "4PPAN", "6PPAN"] as const).map((turma) => (
                <button
                  key={turma}
                  onClick={() => {
                    setSelectedTurma(turma);
                    setSelectedProfessorFilter("ALL");
                  }}
                  className={`py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                    selectedTurma === turma
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-200"
                  }`}
                >
                  {turma === "2PPAN" ? "2º Período" : turma === "4PPAN" ? "4º Período" : "6º Período"}
                </button>
              ))}
            </div>
          </div>

          {/* Professor Highlight Filter */}
          <div className="bg-slate-50/70 p-3 border border-slate-150 rounded-xl space-y-2">
            <span className="block text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider">Destacar por Professor</span>
            <select
              value={selectedProfessorFilter}
              onChange={(e) => setSelectedProfessorFilter(e.target.value)}
              className="w-full bg-white border border-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none font-sans font-medium"
            >
              <option value="ALL">Mostrar todos os professores</option>
              {uniqueProfessors.map((prof) => (
                <option key={prof} value={prof}>
                  {prof} ({getProfessorWorkload(prof)} aulas/semana)
                </option>
              ))}
            </select>
          </div>

          {/* Quick stats on allocated faculty */}
          <div className="bg-slate-50/70 p-3 border border-slate-150 rounded-xl flex items-center justify-between">
            <div className="space-y-1">
              <span className="block text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider">Estatísticas do Corpo Docente</span>
              <div className="text-xs text-slate-600">
                <span className="font-bold text-slate-800">{uniqueProfessors.length}</span> professores alocados
              </div>
              <div className="text-[10px] text-slate-500 font-mono">
                Total de aulas/semana: {schedule.length} slots
              </div>
            </div>
            <div className="p-2.5 bg-indigo-50 border border-indigo-100 rounded-lg text-indigo-700 font-mono font-bold text-base">
              2026/2
            </div>
          </div>

        </div>

        {/* Visual Calendar Grid Table */}
        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-slate-900 text-white border-b border-slate-800 text-[10px] uppercase font-mono tracking-wider">
                <th className="py-3.5 px-4 font-semibold w-36 text-center border-r border-slate-800 bg-slate-950">Horário</th>
                {DIAS.map((dia) => (
                  <th key={dia} className="py-3.5 px-4 font-semibold text-center border-r border-slate-800">
                    {dia}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {HORARIOS.map((horario, index) => (
                <tr
                  key={horario}
                  className={`${index % 2 === 0 ? "bg-white" : "bg-slate-50/50"} border-b border-slate-200`}
                >
                  {/* Horário Sidebar column */}
                  <td className="py-5 px-4 font-mono text-[11px] font-bold text-slate-600 bg-slate-100/80 border-r border-slate-200 text-center flex flex-col items-center justify-center h-28">
                    <Clock className="w-3.5 h-3.5 text-slate-400 mb-1" />
                    <span>{horario}</span>
                    <span className="text-[9px] text-slate-400 font-normal mt-0.5">({index + 1}º tempo)</span>
                  </td>

                  {/* Day Columns */}
                  {DIAS.map((dia) => {
                    // Find the slot for this specific combination of (turma, dia, horario)
                    const slot = schedule.find(
                      (s) => s.turma === selectedTurma && s.dia === dia && s.horario === horario
                    );

                    const isHighlighted =
                      selectedProfessorFilter !== "ALL" && slot && slot.professor === selectedProfessorFilter;

                    const isDimmed =
                      selectedProfessorFilter !== "ALL" && slot && slot.professor !== selectedProfessorFilter;

                    return (
                      <td
                        key={dia}
                        onClick={() => slot && handleStartEdit(slot)}
                        className={`p-2.5 border-r border-slate-200 w-1/5 align-top transition-all ${
                          slot ? "cursor-pointer hover:bg-indigo-50/40" : "bg-slate-50/30"
                        } ${isHighlighted ? "bg-amber-100/60 border-2 border-amber-400" : ""} ${
                          isDimmed ? "opacity-35" : ""
                        }`}
                      >
                        {slot ? (
                          <div className="h-full flex flex-col justify-between gap-1 p-2 rounded-lg bg-white border border-slate-200/80 shadow-2xs hover:shadow-xs transition-shadow">
                            
                            {/* Class/Code */}
                            <div className="flex items-center justify-between">
                              <span className="font-mono text-[9px] font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded">
                                {slot.coddisc}
                              </span>
                              <span className="text-[8px] font-semibold text-slate-400 font-mono">
                                {slot.turma}
                              </span>
                            </div>

                            {/* Discipline name */}
                            <h5 className="font-sans font-bold text-[11px] text-slate-800 line-clamp-2 min-h-[32px] mt-1 leading-tight" title={slot.disciplina}>
                              {slot.disciplina}
                            </h5>

                            {/* Faculty name */}
                            <div className="mt-1.5 pt-1.5 border-t border-slate-100 flex items-center justify-between">
                              <div className="flex items-center gap-1.5 truncate">
                                <div className="p-0.5 bg-slate-100 rounded text-slate-500 shrink-0">
                                  <User className="w-2.5 h-2.5" />
                                </div>
                                <span className={`font-sans font-extrabold text-[9px] truncate ${
                                  slot.professor === "LUCAS DAMASIO"
                                    ? "text-amber-700 font-black"
                                    : "text-slate-600"
                                }`}>
                                  {slot.professor || "A definir"}
                                </span>
                              </div>
                            </div>

                          </div>
                        ) : (
                          <div className="h-full flex flex-col items-center justify-center text-slate-300 py-6 border border-dashed border-slate-200 rounded-lg bg-slate-50/40">
                            <span className="font-mono text-[9px] text-slate-400">Tempo Livre</span>
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Table of Workloads */}
        <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50/30 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-sans font-bold text-xs text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-4 h-4 text-slate-600" />
                <span>Consolidação da Carga Horária Docente — Semestre 2026/2</span>
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Quadro geral de alocação de créditos e aulas dos professores do Bacharelado de Publicidade.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {uniqueProfessors.map((prof) => {
              const count = getProfessorWorkload(prof);
              const totalHours = count * 50; // standard academic classes duration
              return (
                <div
                  key={prof}
                  onClick={() => setSelectedProfessorFilter(prof)}
                  className={`p-3.5 bg-white border rounded-xl shadow-2xs hover:shadow-xs transition-all cursor-pointer ${
                    selectedProfessorFilter === prof ? "border-amber-400 ring-2 ring-amber-200 bg-amber-50/20" : "border-slate-200 hover:border-indigo-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`font-sans font-bold text-[11px] truncate max-w-[80%] ${
                      prof === "LUCAS DAMASIO" ? "text-amber-600 font-extrabold" : "text-slate-700"
                    }`}>
                      {prof}
                    </span>
                    <span className="bg-slate-100 text-slate-700 text-[10px] font-mono font-bold px-2 py-0.5 rounded">
                      {count}h/a
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-2.5 text-[10px] text-slate-500">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>~{totalHours} minutos de aula/semana</span>
                  </div>
                  <div className="mt-1.5 text-[9px] text-indigo-600 font-bold flex items-center gap-1">
                    <span>Ver horários</span>
                    <ArrowRight className="w-2.5 h-2.5" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Popover / Form Modal for Editing Docente */}
      {editingSlot && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-100 bg-slate-50">
              <h3 className="font-sans font-bold text-slate-800 text-sm flex items-center gap-1.5">
                <User className="w-4 h-4 text-indigo-600" />
                <span>Alterar Alocação de Professor</span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-1">Modifique o professor responsável por este horário da grade.</p>
            </div>

            <form onSubmit={handleSaveProfessorEdit} className="p-5 space-y-4">
              
              {/* Slot description summary */}
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/60 text-xs space-y-1.5 text-slate-600">
                <div className="flex justify-between">
                  <strong>Componente:</strong>
                  <span className="font-semibold text-slate-800">{editingSlot.coddisc} - {editingSlot.disciplina}</span>
                </div>
                <div className="flex justify-between">
                  <strong>Turma:</strong>
                  <span className="font-semibold text-slate-800">{editingSlot.turma}</span>
                </div>
                <div className="flex justify-between">
                  <strong>Dia e Horário:</strong>
                  <span className="font-semibold text-slate-800">{editingSlot.dia} às {editingSlot.horario}</span>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-1">Nome do Professor Responsável</label>
                <input
                  type="text"
                  value={editProfName}
                  onChange={(e) => setEditProfName(e.target.value)}
                  placeholder="EX: PROF. DR. LUCAS DAMASIO"
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold uppercase text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingSlot(null)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-500 hover:bg-slate-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors"
                >
                  Confirmar Alocação
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
