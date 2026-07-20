import React, { useState, useEffect } from "react";
import { Discipline } from "./types";
import { INITIAL_DISCIPLINES_DATA } from "./data";
import StatsCards from "./components/StatsCards";
import PracticeSpreadsheet from "./components/PracticeSpreadsheet";
import DocumentViewer from "./components/DocumentViewer";
import AiAssistant from "./components/AiAssistant";
import ScheduleViewer from "./components/ScheduleViewer";
import StudentControl from "./components/StudentControl";
import LessonPlanGenerator from "./components/LessonPlanGenerator";
import { BookOpen, FileText, Sparkles, RefreshCw, GraduationCap, Calendar, Users } from "lucide-react";

export default function App() {
  // Main state for disciplines
  const [disciplines, setDisciplines] = useState<Discipline[]>([]);
  const [selectedDiscipline, setSelectedDiscipline] = useState<Discipline | null>(null);
  const [activeTab, setActiveTab] = useState<"PLANILHA" | "DOCUMENTO" | "HORARIOS" | "CONTROLE_ALUNOS" | "PLANO_AULA">("PLANILHA");

  // Load from local storage on mount
  useEffect(() => {
    const cached = localStorage.getItem("unibrasil_pp_practices_v2");
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        setDisciplines(parsed);
        if (parsed.length > 0) {
          setSelectedDiscipline(parsed[0]);
        }
      } catch (err) {
        console.error("Erro ao ler localStorage", err);
        setDisciplines(INITIAL_DISCIPLINES_DATA);
        setSelectedDiscipline(INITIAL_DISCIPLINES_DATA[0]);
      }
    } else {
      setDisciplines(INITIAL_DISCIPLINES_DATA);
      setSelectedDiscipline(INITIAL_DISCIPLINES_DATA[0]);
    }
  }, []);

  // Save to local storage on changes
  const saveAndSetDisciplines = (newDisciplines: Discipline[]) => {
    setDisciplines(newDisciplines);
    localStorage.setItem("unibrasil_pp_practices_v2", JSON.stringify(newDisciplines));
  };

  // Select discipline
  const handleSelectDiscipline = (dis: Discipline) => {
    setSelectedDiscipline(dis);
  };

  // Add custom discipline row
  const handleAddDiscipline = (newDis: Discipline) => {
    const updated = [newDis, ...disciplines];
    saveAndSetDisciplines(updated);
    setSelectedDiscipline(newDis);
  };

  // Update discipline row
  const handleUpdateDiscipline = (updatedDis: Discipline) => {
    const updated = disciplines.map((dis) => (dis.id === updatedDis.id ? updatedDis : dis));
    saveAndSetDisciplines(updated);
    
    // Maintain focus on selected discipline
    if (selectedDiscipline && selectedDiscipline.id === updatedDis.id) {
      setSelectedDiscipline(updatedDis);
    }
  };

  // Delete discipline row
  const handleDeleteDiscipline = (id: string) => {
    if (window.confirm("Deseja realmente excluir esta disciplina da sua planilha?")) {
      const updated = disciplines.filter((dis) => dis.id !== id);
      saveAndSetDisciplines(updated);
      
      if (selectedDiscipline && selectedDiscipline.id === id) {
        setSelectedDiscipline(updated.length > 0 ? updated[0] : null);
      }
    }
  };

  // Overwrite selected discipline details with AI generated suggestions
  const handleApplyAiSuggestions = (
    id: string,
    suggestions: {
      ementa: string;
      justificativa: string;
      observacoes: string;
    }
  ) => {
    const updated = disciplines.map((dis) => {
      if (dis.id === id) {
        return {
          ...dis,
          ementa: suggestions.ementa,
          justificativa: suggestions.justificativa,
          observacoes: suggestions.observacoes
        };
      }
      return dis;
    });

    saveAndSetDisciplines(updated);

    // Update active selection
    const match = updated.find((dis) => dis.id === id);
    if (match) {
      setSelectedDiscipline(match);
    }
  };

  // Append AI campaign details to notes/observations of discipline
  const handleAppendObservations = (id: string, text: string) => {
    const updated = disciplines.map((dis) => {
      if (dis.id === id) {
        const currentObs = dis.observacoes ? `${dis.observacoes} | ` : "";
        return {
          ...dis,
          observacoes: `${currentObs}${text}`
        };
      }
      return dis;
    });
    saveAndSetDisciplines(updated);

    const match = updated.find((dis) => dis.id === id);
    if (match) {
      setSelectedDiscipline(match);
    }
  };

  // Reset to course defaults
  const handleResetToDefaults = () => {
    if (window.confirm("Atenção: Isso redefinirá a planilha para as disciplinas oficiais padrão da UniBrasil, apagando quaisquer alterações personalizadas. Continuar?")) {
      saveAndSetDisciplines(INITIAL_DISCIPLINES_DATA);
      setSelectedDiscipline(INITIAL_DISCIPLINES_DATA[0]);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800 antialiased selection:bg-blue-100 selection:text-blue-900">
      
      {/* Institutional Top Navbar (UniBrasil Theme) */}
      <header className="bg-slate-900 text-white border-b-4 border-amber-500 shadow-sm sticky top-0 z-20 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Logo Brand */}
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-tr from-blue-700 to-indigo-800 rounded-lg shadow-inner border border-blue-500">
              <GraduationCap className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <h1 className="text-sm font-sans font-extrabold tracking-wider text-slate-100 uppercase">UniBrasil</h1>
              <p className="text-[10px] font-mono font-medium text-amber-400 tracking-widest uppercase">Painel Gestor de Curso - Publicidade e Propaganda</p>
            </div>
          </div>

          {/* Tab Selection */}
          <div className="flex items-center bg-slate-800 p-1.5 rounded-lg border border-slate-700">
            <button
              id="tab-planilha"
              onClick={() => setActiveTab("PLANILHA")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                activeTab === "PLANILHA"
                  ? "bg-slate-900 text-amber-400 shadow-xs"
                  : "text-slate-400 hover:text-slate-100"
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Matriz de Disciplinas</span>
            </button>
            <button
              id="tab-documento"
              onClick={() => setActiveTab("DOCUMENTO")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                activeTab === "DOCUMENTO"
                  ? "bg-slate-900 text-amber-400 shadow-xs"
                  : "text-slate-400 hover:text-slate-100"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Visualizar Dossiê PPC</span>
            </button>
            <button
              id="tab-horarios"
              onClick={() => setActiveTab("HORARIOS")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                activeTab === "HORARIOS"
                  ? "bg-slate-900 text-amber-400 shadow-xs"
                  : "text-slate-400 hover:text-slate-100"
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Horários de Aula (2026/2)</span>
            </button>
            <button
              id="tab-controle-alunos"
              onClick={() => setActiveTab("CONTROLE_ALUNOS")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                activeTab === "CONTROLE_ALUNOS"
                  ? "bg-slate-900 text-amber-400 shadow-xs"
                  : "text-slate-400 hover:text-slate-100"
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Controle de Notas e Faltas (1º Bim)</span>
            </button>
            <button
              id="tab-plano-aula"
              onClick={() => setActiveTab("PLANO_AULA")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                activeTab === "PLANO_AULA"
                  ? "bg-slate-900 text-amber-400 shadow-xs"
                  : "text-slate-400 hover:text-slate-100"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Plano de Aula</span>
            </button>
          </div>

          {/* Quick Resets */}
          <button
            id="btn-reset-defaults"
            onClick={handleResetToDefaults}
            title="Restaurar grade curricular oficial"
            className="flex items-center gap-1.5 border border-slate-700 hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-xs px-3 py-2 rounded-lg transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Grade Padrão PPC</span>
          </button>

        </div>
      </header>

      {/* Main Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        
        {/* Intro Alert Box */}
        <div className="bg-gradient-to-r from-blue-900 to-indigo-950 text-white rounded-xl p-5 mb-6 shadow-md border border-blue-800 flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
          <div className="space-y-1">
            <h2 className="text-base font-sans font-bold text-slate-100 flex items-center gap-2">
              <Sparkles className="w-4.5 h-4.5 text-amber-400 animate-pulse fill-amber-400/20" />
              <span>Gestor Curricular UniBrasil — Publicidade e Propaganda</span>
            </h2>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Consolide, altere e preencha as ementas, cargas horárias relógio (Teórica, Prática, EAD, Extensão, ADS) e créditos da matriz de Publicidade. Use o <strong>Assistente Criativo IA</strong> para redigir propostas de ementas e briefs de campanhas publicitárias em tempo real.
            </p>
          </div>
          <div className="shrink-0 flex items-center gap-2 text-[10px] font-mono bg-blue-950/80 border border-blue-800 px-3 py-1.5 rounded-lg text-amber-400 font-bold self-start md:self-auto">
            <span>PPC REVISÃO</span>
            <span className="text-slate-600">|</span>
            <span>CURITIBA, PR</span>
          </div>
        </div>

        {/* Global Progress Indicators */}
        <div className="no-print">
          <StatsCards disciplines={disciplines} />
        </div>

        {/* Workspace Layout depending on activeTab */}
        {activeTab === "HORARIOS" ? (
          <div id="view-schedule" className="no-print">
            <ScheduleViewer />
          </div>
        ) : activeTab === "CONTROLE_ALUNOS" ? (
          <div id="view-students" className="space-y-6">
            <StudentControl 
              disciplines={disciplines} 
              onImportNewDisciplines={(newDisList) => {
                const updated = [...disciplines];
                let changed = false;
                newDisList.forEach(item => {
                  const alreadyExists = updated.some(d => d.id.toUpperCase() === item.id.toUpperCase());
                  if (!alreadyExists) {
                    updated.push({
                      id: item.id,
                      periodo: selectedDiscipline?.periodo || 1,
                      nome: item.nome,
                      areaConhecimento: "OBRIGATÓRIA DO CURSO",
                      tipo: "PRESENCIAL",
                      ch: (item as any).ch || 80,
                      chTeo: ((item as any).ch || 80) / 2,
                      chPra: ((item as any).ch || 80) / 2,
                      chEst: 0,
                      chEad: 0,
                      chExt: 0,
                      chAds: 13,
                      credito: 4,
                      ementa: "Disciplina adicionada automaticamente ao importar a pauta de notas e faltas."
                    });
                    changed = true;
                  }
                });
                if (changed) {
                  saveAndSetDisciplines(updated);
                }
              }}
            />
          </div>
        ) : activeTab === "PLANO_AULA" ? (
          <div id="view-lesson-plan" className="space-y-6">
            <LessonPlanGenerator disciplines={disciplines} />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
            {/* Main Panel Content (Column span 3 in lg screen) */}
            <div className="lg:col-span-3 space-y-6">
              {activeTab === "PLANILHA" ? (
                <div id="view-spreadsheet" className="no-print">
                  <PracticeSpreadsheet
                    disciplines={disciplines}
                    onSelectDiscipline={handleSelectDiscipline}
                    onUpdateDiscipline={handleUpdateDiscipline}
                    onAddDiscipline={handleAddDiscipline}
                    onDeleteDiscipline={handleDeleteDiscipline}
                    selectedDisciplineId={selectedDiscipline?.id}
                  />
                </div>
              ) : (
                <div id="view-document">
                  <DocumentViewer disciplines={disciplines} />
                </div>
              )}
            </div>

            {/* AI Advisor Panel (Column span 1) */}
            <div className="lg:col-span-1 no-print">
              <AiAssistant
                selectedDiscipline={selectedDiscipline}
                onApplyAiSuggestions={handleApplyAiSuggestions}
                onAppendObservations={handleAppendObservations}
              />
            </div>
          </div>
        )}
      </main>

      {/* Corporate Academic Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 py-6 text-center text-xs text-slate-500 no-print">
        <div className="max-w-7xl mx-auto px-4 space-y-2">
          <p className="font-semibold text-slate-400">UniBrasil Centro Universitário - Escola de Ciências Humanas e Sociais Aplicadas</p>
          <p className="text-[10px] font-mono uppercase tracking-wider text-slate-600">Rua Konrad Adenauer, 442 - Tarumã, Curitiba - PR</p>
          <p className="text-[10px] text-slate-600 pt-2">Painel gestor de Curso - Publicidade e Propaganda - Prof. Lucas Damasio</p>
        </div>
      </footer>

    </div>
  );
}
