import React, { useState } from "react";
import { Discipline } from "../types";
import { Search, Plus, Filter, Edit3, Trash2, Sparkles, X, HelpCircle } from "lucide-react";

interface PracticeSpreadsheetProps {
  disciplines: Discipline[];
  onSelectDiscipline: (discipline: Discipline) => void;
  onUpdateDiscipline: (updated: Discipline) => void;
  onAddDiscipline: (newDiscipline: Discipline) => void;
  onDeleteDiscipline: (id: string) => void;
  selectedDisciplineId?: string;
}

export default function PracticeSpreadsheet({
  disciplines,
  onSelectDiscipline,
  onUpdateDiscipline,
  onAddDiscipline,
  onDeleteDiscipline,
  selectedDisciplineId
}: PracticeSpreadsheetProps) {
  // Filters and search states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState<string>("TODOS");
  const [selectedArea, setSelectedArea] = useState<string>("TODAS");

  // Add / Edit Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDiscipline, setEditingDiscipline] = useState<Discipline | null>(null);

  // Form input states
  const [formNome, setFormNome] = useState("");
  const [formAreaConhecimento, setFormAreaConhecimento] = useState("BÁSICA DO CURSO");
  const [formPeriodo, setFormPeriodo] = useState(1);
  const [formTipo, setFormTipo] = useState("PRESENCIAL");
  const [formCh, setFormCh] = useState(80);
  const [formChTeo, setFormChTeo] = useState(80);
  const [formChPra, setFormChPra] = useState(0);
  const [formChEst, setFormChEst] = useState(0);
  const [formChEad, setFormChEad] = useState(0);
  const [formChExt, setFormChExt] = useState(0);
  const [formChAds, setFormChAds] = useState(13);
  const [formCredito, setFormCredito] = useState(4);
  const [formEmenta, setFormEmenta] = useState("");
  const [formJustificativa, setFormJustificativa] = useState("");
  const [formObservacoes, setFormObservacoes] = useState("");
  const [formPraticaAtividade, setFormPraticaAtividade] = useState("");
  const [formAmbientePratica, setFormAmbientePratica] = useState("");
  const [formNivelExigencia, setFormNivelExigencia] = useState("Exigência Média");
  const [formLocalPratica, setFormLocalPratica] = useState("");
  const [formTipoPratica, setFormTipoPratica] = useState("");
  const [formCompetenciaDesenvolvida, setFormCompetenciaDesenvolvida] = useState("");
  const [formCapacidadeAtividade, setFormCapacidadeAtividade] = useState("");
  const [formDocumentoEvidencia, setFormDocumentoEvidencia] = useState("");
  const [formFragilidadeOportunidade, setFormFragilidadeOportunidade] = useState("");

  const areas = [
    "BÁSICA DO CURSO",
    "PROJETO EXTENSÃO",
    "BÁSICA - NÚCLEO COMUM",
    "INSTITUCIONAL"
  ];

  const tipos = [
    "PRESENCIAL",
    "A DISTÂNCIA",
    "PROEX"
  ];

  // Open form for adding new discipline
  const handleOpenAddForm = () => {
    setEditingDiscipline(null);
    setFormNome("");
    setFormAreaConhecimento("BÁSICA DO CURSO");
    setFormPeriodo(1);
    setFormTipo("PRESENCIAL");
    setFormCh(80);
    setFormChTeo(80);
    setFormChPra(0);
    setFormChEst(0);
    setFormChEad(0);
    setFormChExt(0);
    setFormChAds(13);
    setFormCredito(4);
    setFormEmenta("");
    setFormJustificativa("");
    setFormObservacoes("");
    setFormPraticaAtividade("");
    setFormAmbientePratica("");
    setFormNivelExigencia("Exigência Média");
    setFormLocalPratica("");
    setFormTipoPratica("");
    setFormCompetenciaDesenvolvida("");
    setFormCapacidadeAtividade("");
    setFormDocumentoEvidencia("");
    setFormFragilidadeOportunidade("");
    setIsFormOpen(true);
  };

  // Open form for editing existing discipline
  const handleOpenEditForm = (d: Discipline, e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid triggering row selection
    setEditingDiscipline(d);
    setFormNome(d.nome);
    setFormAreaConhecimento(d.areaConhecimento);
    setFormPeriodo(d.periodo);
    setFormTipo(d.tipo);
    setFormCh(d.ch);
    setFormChTeo(d.chTeo);
    setFormChPra(d.chPra);
    setFormChEst(d.chEst);
    setFormChEad(d.chEad);
    setFormChExt(d.chExt);
    setFormChAds(d.chAds);
    setFormCredito(d.credito);
    setFormEmenta(d.ementa || "");
    setFormJustificativa(d.justificativa || "");
    setFormObservacoes(d.observacoes || "");
    setFormPraticaAtividade(d.praticaAtividade || "");
    setFormAmbientePratica(d.ambientePratica || "");
    setFormNivelExigencia(d.nivelExigencia || "Exigência Média");
    setFormLocalPratica(d.localPratica || "");
    setFormTipoPratica(d.tipoPratica || "");
    setFormCompetenciaDesenvolvida(d.competenciaDesenvolvida || "");
    setFormCapacidadeAtividade(d.capacidadeAtividade || "");
    setFormDocumentoEvidencia(d.documentoEvidencia || "");
    setFormFragilidadeOportunidade(d.fragilidadeOportunidade || "");
    setIsFormOpen(true);
  };

  // Submit Form
  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();

    const disciplineData = {
      nome: formNome,
      areaConhecimento: formAreaConhecimento,
      periodo: Number(formPeriodo) || 1,
      tipo: formTipo,
      ch: Number(formCh) || 0,
      chTeo: Number(formChTeo) || 0,
      chPra: Number(formChPra) || 0,
      chEst: Number(formChEst) || 0,
      chEad: Number(formChEad) || 0,
      chExt: Number(formChExt) || 0,
      chAds: Number(formChAds) || 0,
      credito: Number(formCredito) || 0,
      ementa: formEmenta,
      justificativa: formJustificativa,
      observacoes: formObservacoes,
      praticaAtividade: formPraticaAtividade,
      ambientePratica: formAmbientePratica,
      nivelExigencia: formNivelExigencia,
      localPratica: formLocalPratica,
      tipoPratica: formTipoPratica,
      competenciaDesenvolvida: formCompetenciaDesenvolvida,
      capacidadeAtividade: formCapacidadeAtividade,
      documentoEvidencia: formDocumentoEvidencia,
      fragilidadeOportunidade: formFragilidadeOportunidade
    };

    if (editingDiscipline) {
      // Update
      onUpdateDiscipline({
        ...editingDiscipline,
        ...disciplineData
      });
    } else {
      // Add
      const newDis: Discipline = {
        id: `16${Date.now().toString().slice(-3)}PP`,
        ...disciplineData
      };
      onAddDiscipline(newDis);
    }

    setIsFormOpen(false);
  };

  // Handle inline change for Área de Conhecimento
  const handleAreaChange = (d: Discipline, newArea: string, e: React.ChangeEvent<HTMLSelectElement>) => {
    e.stopPropagation();
    onUpdateDiscipline({
      ...d,
      areaConhecimento: newArea
    });
  };

  // Filter disciplines
  const filteredDisciplines = disciplines.filter((d) => {
    const matchesSearch = 
      d.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (d.ementa && d.ementa.toLowerCase().includes(searchTerm.toLowerCase())) ||
      d.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesPeriod = 
      selectedPeriod === "TODOS" || d.periodo.toString() === selectedPeriod;

    const matchesArea = 
      selectedArea === "TODAS" || d.areaConhecimento === selectedArea;

    return matchesSearch && matchesPeriod && matchesArea;
  });

  const getAreaBadgeColor = (area: string) => {
    switch (area) {
      case "BÁSICA DO CURSO":
        return "text-indigo-700 bg-indigo-50 border-indigo-100";
      case "PROJETO EXTENSÃO":
        return "text-fuchsia-700 bg-fuchsia-50 border-fuchsia-100";
      case "BÁSICA - NÚCLEO COMUM":
        return "text-cyan-700 bg-cyan-50 border-cyan-100";
      case "INSTITUCIONAL":
        return "text-slate-700 bg-slate-100 border-slate-200";
      default:
        return "text-slate-700 bg-slate-50 border-slate-100";
    }
  };

  const getTipoBadgeColor = (tipo: string) => {
    switch (tipo) {
      case "PRESENCIAL":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "A DISTÂNCIA":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "PROEX":
        return "bg-purple-50 text-purple-700 border-purple-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
      {/* Top Bar with actions and filters */}
      <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        
        {/* Search */}
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            id="search-input"
            type="text"
            placeholder="Buscar por disciplina ou ementa..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 border border-slate-300 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-sans"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Semestre / Período */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Filter className="w-3.5 h-3.5" />
            <span>Semestre:</span>
            <select
              id="period-filter"
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="border border-slate-300 rounded-lg px-2 py-1.5 bg-white text-slate-700 text-xs focus:outline-none"
            >
              <option value="TODOS">Todos os Semestres</option>
              <option value="1">1º Semestre</option>
              <option value="2">2º Semestre</option>
              <option value="3">3º Semestre</option>
              <option value="4">4º Semestre</option>
              <option value="5">5º Semestre</option>
              <option value="6">6º Semestre</option>
              <option value="7">7º Semestre</option>
            </select>
          </div>

          {/* Área de Conhecimento */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <span>Área Conhecimento:</span>
            <select
              id="area-filter"
              value={selectedArea}
              onChange={(e) => setSelectedArea(e.target.value)}
              className="border border-slate-300 rounded-lg px-2 py-1.5 bg-white text-slate-700 text-xs focus:outline-none"
            >
              <option value="TODAS">Todas</option>
              {areas.map((area) => (
                <option key={area} value={area}>{area}</option>
              ))}
            </select>
          </div>

          {/* Add Button */}
          <button
            id="btn-add-discipline"
            onClick={handleOpenAddForm}
            className="ml-auto lg:ml-2 flex items-center gap-1 bg-slate-900 hover:bg-amber-600 text-white font-bold text-xs px-3 py-1.5 rounded-lg transition-colors shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nova Disciplina</span>
          </button>
        </div>
      </div>

      {/* Spreadsheet Grid Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[2000px]">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-mono text-[10px] uppercase tracking-wider">
              <th className="py-3 px-4 font-semibold w-24">Cód</th>
              <th className="py-3 px-4 font-semibold">Disciplina / Componente Curricular</th>
              <th className="py-3 px-3 font-semibold text-center w-24">Semestre</th>
              <th className="py-3 px-3 font-semibold text-center w-24">Tipo</th>
              <th className="py-3 px-2 font-semibold text-center w-16">CH</th>
              <th className="py-3 px-2 font-semibold text-center w-16">TEO</th>
              <th className="py-3 px-2 font-semibold text-center w-16">PRA</th>
              <th className="py-3 px-2 font-semibold text-center w-16">EAD</th>
              <th className="py-3 px-2 font-semibold text-center w-16">EXT</th>
              <th className="py-3 px-2 font-semibold text-center w-16">ADS</th>
              <th className="py-3 px-2 font-semibold text-center w-16">Cred</th>
              <th className="py-3 px-4 font-semibold w-64 min-w-[240px]">Prática/Atividade</th>
              <th className="py-3 px-4 font-semibold w-48 min-w-[180px]">Ambiente de Prática</th>
              <th className="py-3 px-4 font-semibold w-52 min-w-[200px]">Local / Laboratório / Núcleo / Parceiro</th>
              <th className="py-3 px-4 font-semibold w-44 min-w-[160px]">Tipo de Prática</th>
              <th className="py-3 px-4 font-semibold w-64 min-w-[240px]">Competência / Habilidade Desenvolvida</th>
              <th className="py-3 px-4 font-semibold w-40 min-w-[140px]">Capacidade da Atividade</th>
              <th className="py-3 px-4 font-semibold w-48 min-w-[180px]">Documento / Evidência</th>
              <th className="py-3 px-4 font-semibold w-64 min-w-[240px]">Fragilidade / Oportunidade de Melhoria</th>
              <th className="py-3 px-3 font-semibold text-center w-28">Nível Exigência</th>
              <th className="py-3 px-4 text-center w-28">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {filteredDisciplines.length === 0 ? (
              <tr>
                <td colSpan={21} className="text-center py-12 text-slate-400 bg-slate-50/50">
                  <div className="flex flex-col items-center justify-center gap-2">
                     <HelpCircle className="w-8 h-8 text-slate-300" />
                     <p className="font-medium text-slate-600">Nenhum componente curricular encontrado</p>
                     <p className="text-xs">Ajuste seus filtros ou adicione uma nova disciplina customizada.</p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredDisciplines.map((d) => {
                const isSelected = selectedDisciplineId === d.id;
                return (
                  <tr
                    key={d.id}
                    onClick={() => onSelectDiscipline(d)}
                    className={`group cursor-pointer transition-colors ${
                      isSelected 
                        ? "bg-slate-100/70 border-l-4 border-amber-500" 
                        : "hover:bg-slate-50/50 border-l-4 border-transparent"
                    }`}
                  >
                    {/* ID / Código */}
                    <td className="py-3 px-4 font-mono text-slate-500 font-semibold">
                      {d.id}
                    </td>

                    {/* Disciplina */}
                    <td className="py-3 px-4">
                      <div className="flex flex-col gap-1">
                        <span className="font-sans font-bold text-slate-800 group-hover:text-blue-700 transition-colors">
                          {d.nome}
                        </span>
                        
                        <div className="flex items-center gap-1.5 flex-wrap" onClick={(e) => e.stopPropagation()}>
                          {/* Interactive Area de Conhecimento dropdown directly in grid */}
                          <select
                            value={d.areaConhecimento}
                            onChange={(e) => handleAreaChange(d, e.target.value, e)}
                            className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border ${getAreaBadgeColor(d.areaConhecimento)} focus:outline-none`}
                          >
                            {areas.map(a => (
                              <option key={a} value={a}>{a}</option>
                            ))}
                          </select>
                          
                          {d.observacoes && (
                            <span className="text-[10px] text-slate-400 truncate max-w-xs font-sans">
                              • {d.observacoes}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Semestre */}
                    <td className="py-3 px-3 text-center font-mono font-medium text-slate-700">
                      {d.periodo}º Semestre
                    </td>

                    {/* Tipo */}
                    <td className="py-3 px-3 text-center">
                      <span className={`text-[9px] font-bold font-mono px-2 py-0.5 rounded border ${getTipoBadgeColor(d.tipo)}`}>
                        {d.tipo}
                      </span>
                    </td>

                    {/* Hours details with JetBrains Mono numbers */}
                    <td className="py-3 px-2 text-center font-mono font-bold text-slate-800">{d.ch}h</td>
                    <td className="py-3 px-2 text-center font-mono text-slate-600">{d.chTeo > 0 ? `${d.chTeo}h` : "-"}</td>
                    <td className="py-3 px-2 text-center font-mono text-slate-600">{d.chPra > 0 ? `${d.chPra}h` : "-"}</td>
                    <td className="py-3 px-2 text-center font-mono text-slate-600">{d.chEad > 0 ? `${d.chEad}h` : "-"}</td>
                    <td className="py-3 px-2 text-center font-mono text-slate-600">{d.chExt > 0 ? `${d.chExt}h` : "-"}</td>
                    <td className="py-3 px-2 text-center font-mono text-slate-600">{d.chAds > 0 ? `${d.chAds}h` : "-"}</td>
                    
                    {/* Crédito */}
                    <td className="py-3 px-2 text-center font-mono font-bold text-amber-600">{d.credito > 0 ? d.credito : "-"}</td>

                    {/* Prática/Atividade */}
                    <td className="py-3 px-4 font-sans text-slate-700 break-words whitespace-normal leading-relaxed">
                      {d.praticaAtividade || "-"}
                    </td>

                    {/* Ambiente de Prática */}
                    <td className="py-3 px-4 font-sans text-slate-600 break-words whitespace-normal leading-relaxed">
                      {d.ambientePratica || "-"}
                    </td>

                    {/* Local / Laboratório / Núcleo / Parceiro */}
                    <td className="py-3 px-4 font-sans text-slate-600 break-words whitespace-normal leading-relaxed">
                      {d.localPratica || "-"}
                    </td>

                    {/* Tipo de Prática */}
                    <td className="py-3 px-4 font-sans text-slate-600 break-words whitespace-normal leading-relaxed">
                      {d.tipoPratica || "-"}
                    </td>

                    {/* Competência / Habilidade Desenvolvida */}
                    <td className="py-3 px-4 font-sans text-slate-600 break-words whitespace-normal leading-relaxed">
                      {d.competenciaDesenvolvida || "-"}
                    </td>

                    {/* Capacidade da Atividade */}
                    <td className="py-3 px-4 font-sans text-slate-600 break-words whitespace-normal leading-relaxed">
                      {d.capacidadeAtividade || "-"}
                    </td>

                    {/* Documento / Evidência */}
                    <td className="py-3 px-4 font-sans text-slate-600 break-words whitespace-normal leading-relaxed">
                      {d.documentoEvidencia || "-"}
                    </td>

                    {/* Fragilidade / Oportunidade de Melhoria */}
                    <td className="py-3 px-4 font-sans text-slate-600 break-words whitespace-normal leading-relaxed">
                      {d.fragilidadeOportunidade || "-"}
                    </td>

                    {/* Nível de Exigência */}
                    <td className="py-3 px-3 text-center">
                      {d.nivelExigencia ? (
                        <span className={`text-[9px] font-bold font-mono px-2 py-0.5 rounded border ${
                          d.nivelExigencia === "Exigência Alta"
                            ? "bg-rose-50 text-rose-700 border-rose-200"
                            : d.nivelExigencia === "Exigência Média"
                            ? "bg-amber-50 text-amber-700 border-amber-200"
                            : "bg-blue-50 text-blue-700 border-blue-200"
                        }`}>
                          {d.nivelExigencia}
                        </span>
                      ) : "-"}
                    </td>

                    {/* Ações */}
                    <td className="py-3 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-center gap-1">
                        {/* Edit Action */}
                        <button
                          id={`btn-edit-${d.id}`}
                          onClick={(e) => handleOpenEditForm(d, e)}
                          title="Editar ementas e cargas horárias"
                          className="p-1 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete Action */}
                        <button
                          id={`btn-delete-${d.id}`}
                          onClick={() => onDeleteDiscipline(d.id)}
                          title="Excluir disciplina"
                          className="p-1 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>

                        {/* Focus AI Indicator */}
                        <button
                          onClick={() => onSelectDiscipline(d)}
                          title="Sugerir campanhas com IA"
                          className={`p-1 rounded-lg transition-colors cursor-pointer ${
                            isSelected 
                              ? "text-purple-600 bg-purple-50" 
                              : "text-slate-400 hover:text-purple-600 hover:bg-purple-50"
                          }`}
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Grid Bottom Info */}
      <div className="p-4 bg-slate-50 border-t border-slate-100 text-xs text-slate-500 flex justify-between items-center">
        <span>Visualizando <strong>{filteredDisciplines.length}</strong> de <strong>{disciplines.length}</strong> disciplinas do curso</span>
        <span className="font-mono text-[10px] bg-slate-200 text-slate-600 px-2 py-0.5 rounded font-bold">UniBrasil - PP (Curitiba, PR)</span>
      </div>

      {/* Form Dialog Modal for Add/Edit */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl max-w-xl w-full border border-slate-200 overflow-hidden my-8 max-h-[90vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <div>
                <h3 className="text-sm font-sans font-bold text-slate-800">
                  {editingDiscipline ? `Editar Disciplina: ${editingDiscipline.id}` : "Adicionar Novo Componente Curricular"}
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">Ajuste as cargas horárias, ementas e bibliografias conforme PPC UniBrasil</p>
              </div>
              <button 
                onClick={() => setIsFormOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 hover:bg-slate-100 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmitForm} className="p-5 overflow-y-auto flex-1 space-y-3 text-xs">
              
              {/* Nome */}
              <div>
                <label className="block font-mono font-bold text-slate-500 uppercase mb-1">Nome da Disciplina *</label>
                <input
                  id="form-nome"
                  type="text"
                  required
                  placeholder="Ex: Teoria da Comunicação"
                  value={formNome}
                  onChange={(e) => setFormNome(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Área Conhecimento & Tipo */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-mono font-bold text-slate-500 uppercase mb-1">Área Conhecimento</label>
                  <select
                    id="form-area"
                    value={formAreaConhecimento}
                    onChange={(e) => setFormAreaConhecimento(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    {areas.map((a) => (
                      <option key={a} value={a}>{a}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-mono font-bold text-slate-500 uppercase mb-1">Tipo de Curso</label>
                  <select
                    id="form-tipo"
                    value={formTipo}
                    onChange={(e) => setFormTipo(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    {tipos.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Semestre & Créditos & CH */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-mono font-bold text-slate-500 uppercase mb-1">Semestre (1-7)</label>
                  <select
                    id="form-periodo"
                    value={formPeriodo}
                    onChange={(e) => setFormPeriodo(Number(e.target.value))}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white focus:outline-none"
                  >
                    {[1, 2, 3, 4, 5, 6, 7].map((num) => (
                      <option key={num} value={num}>{num}º Semestre</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-mono font-bold text-slate-500 uppercase mb-1">Carga Horária (CH)</label>
                  <input
                    id="form-ch"
                    type="number"
                    min={0}
                    required
                    value={formCh}
                    onChange={(e) => setFormCh(Number(e.target.value))}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white"
                  />
                </div>
                <div>
                  <label className="block font-mono font-bold text-slate-500 uppercase mb-1">Créditos</label>
                  <input
                    id="form-credito"
                    type="number"
                    min={0}
                    required
                    value={formCredito}
                    onChange={(e) => setFormCredito(Number(e.target.value))}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white"
                  />
                </div>
              </div>

              {/* Hourly division fields */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                <h4 className="font-mono font-bold text-slate-500 uppercase mb-1 text-[10px]">Divisão de Horas (Relógio)</h4>
                
                <div className="grid grid-cols-5 gap-2">
                  <div>
                    <label className="block font-mono text-[9px] text-slate-400 mb-0.5">Teórica (TEO)</label>
                    <input
                      type="number"
                      min={0}
                      value={formChTeo}
                      onChange={(e) => setFormChTeo(Number(e.target.value))}
                      className="w-full px-2 py-1 border border-slate-300 rounded text-center"
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-[9px] text-slate-400 mb-0.5">Prática (PRA)</label>
                    <input
                      type="number"
                      min={0}
                      value={formChPra}
                      onChange={(e) => setFormChPra(Number(e.target.value))}
                      className="w-full px-2 py-1 border border-slate-300 rounded text-center"
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-[9px] text-slate-400 mb-0.5">Estágio (EST)</label>
                    <input
                      type="number"
                      min={0}
                      value={formChEst}
                      onChange={(e) => setFormChEst(Number(e.target.value))}
                      className="w-full px-2 py-1 border border-slate-300 rounded text-center"
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-[9px] text-slate-400 mb-0.5">EAD</label>
                    <input
                      type="number"
                      min={0}
                      value={formChEad}
                      onChange={(e) => setFormChEad(Number(e.target.value))}
                      className="w-full px-2 py-1 border border-slate-300 rounded text-center"
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-[9px] text-slate-400 mb-0.5">Extensão (EXT)</label>
                    <input
                      type="number"
                      min={0}
                      value={formChExt}
                      onChange={(e) => setFormChExt(Number(e.target.value))}
                      className="w-full px-2 py-1 border border-slate-300 rounded text-center"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-200">
                  <div>
                    <label className="block font-mono text-[9px] text-slate-400 mb-0.5">ADS Supervisionada (CH ADS)</label>
                    <input
                      type="number"
                      min={0}
                      value={formChAds}
                      onChange={(e) => setFormChAds(Number(e.target.value))}
                      className="w-full px-2 py-1 border border-slate-300 rounded"
                    />
                  </div>
                  <div className="flex flex-col justify-end">
                    <p className="text-[10px] text-slate-400 leading-normal text-right">A soma das horas teórica, prática, estágio, EAD e extensão deve idealmente corresponder à CH total da disciplina.</p>
                  </div>
                </div>
              </div>

              {/* Ementa */}
              <div>
                <label className="block font-mono font-bold text-slate-500 uppercase mb-1">Ementa Curricular</label>
                <textarea
                  id="form-ementa"
                  rows={2}
                  placeholder="Escreva a ementa ou tópicos oficiais desta disciplina..."
                  value={formEmenta}
                  onChange={(e) => setFormEmenta(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 font-sans"
                />
              </div>

              {/* Exossistema Prático */}
              <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-lg space-y-2">
                <h4 className="font-mono font-bold text-blue-800 uppercase text-[10px] flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  <span>Exossistema Prático do Curso</span>
                </h4>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-mono text-[9px] font-bold text-slate-500 uppercase mb-1">Prática / Atividade</label>
                    <input
                      type="text"
                      placeholder="Ex: Oficinas de redação publicitária"
                      value={formPraticaAtividade}
                      onChange={(e) => setFormPraticaAtividade(e.target.value)}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-[9px] font-bold text-slate-500 uppercase mb-1">Ambiente de Prática</label>
                    <input
                      type="text"
                      placeholder="Ex: Laboratório de Informática"
                      value={formAmbientePratica}
                      onChange={(e) => setFormAmbientePratica(e.target.value)}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-mono text-[9px] font-bold text-slate-500 uppercase mb-1">Local / Laboratório / Núcleo / Parceiro</label>
                    <input
                      type="text"
                      placeholder="Ex: Agência Experimental de PP"
                      value={formLocalPratica}
                      onChange={(e) => setFormLocalPratica(e.target.value)}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-[9px] font-bold text-slate-500 uppercase mb-1">Tipo de Prática</label>
                    <input
                      type="text"
                      placeholder="Ex: Simulação de Atendimento"
                      value={formTipoPratica}
                      onChange={(e) => setFormTipoPratica(e.target.value)}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-mono text-[9px] font-bold text-slate-500 uppercase mb-1">Competência / Habilidade Desenvolvida</label>
                    <input
                      type="text"
                      placeholder="Ex: Domínio de softwares gráficos"
                      value={formCompetenciaDesenvolvida}
                      onChange={(e) => setFormCompetenciaDesenvolvida(e.target.value)}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-[9px] font-bold text-slate-500 uppercase mb-1">Capacidade da Atividade</label>
                    <input
                      type="text"
                      placeholder="Ex: 25 alunos por sessão"
                      value={formCapacidadeAtividade}
                      onChange={(e) => setFormCapacidadeAtividade(e.target.value)}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-mono text-[9px] font-bold text-slate-500 uppercase mb-1">Documento / Evidência</label>
                    <input
                      type="text"
                      placeholder="Ex: Relatório de Projeto Acadêmico"
                      value={formDocumentoEvidencia}
                      onChange={(e) => setFormDocumentoEvidencia(e.target.value)}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-[9px] font-bold text-slate-500 uppercase mb-1">Nível de Exigência</label>
                    <select
                      value={formNivelExigencia}
                      onChange={(e) => setFormNivelExigencia(e.target.value)}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white text-xs"
                    >
                      <option value="Exigência Baixa">Exigência Baixa</option>
                      <option value="Exigência Média">Exigência Média</option>
                      <option value="Exigência Alta">Exigência Alta</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-mono text-[9px] font-bold text-slate-500 uppercase mb-1">Fragilidade / Oportunidade de Melhoria</label>
                  <input
                    type="text"
                    placeholder="Ex: Necessidade de renovação dos computadores do Lab A"
                    value={formFragilidadeOportunidade}
                    onChange={(e) => setFormFragilidadeOportunidade(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white"
                  />
                </div>
              </div>

              {/* Justificativa */}
              <div>
                <label className="block font-mono font-bold text-slate-500 uppercase mb-1">Metodologias e Bibliografias recomendadas</label>
                <textarea
                  id="form-justificativa"
                  rows={2}
                  placeholder="Justificativa pedagógica ou obras sugeridas..."
                  value={formJustificativa}
                  onChange={(e) => setFormJustificativa(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 font-sans"
                />
              </div>

              {/* Observações */}
              <div>
                <label className="block font-mono font-bold text-slate-500 uppercase mb-1">Anotações / Observações Adicionais</label>
                <input
                  id="form-observacoes"
                  type="text"
                  placeholder="Anotações pessoais ou diretrizes criativas da agência experimental..."
                  value={formObservacoes}
                  onChange={(e) => setFormObservacoes(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg font-medium hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-slate-950 hover:bg-amber-600 text-white font-bold rounded-lg transition-colors shadow-xs cursor-pointer"
                >
                  {editingDiscipline ? "Salvar Alterações" : "Salvar Disciplina"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
}
