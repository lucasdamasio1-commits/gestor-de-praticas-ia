import React, { useState } from "react";
import { Discipline, CampaignSuggestion } from "../types";
import { Sparkles, Loader2, Save, Lightbulb, CheckCircle2, Plus, AlertCircle } from "lucide-react";

interface AiAssistantProps {
  selectedDiscipline: Discipline | null;
  onApplyAiSuggestions: (
    id: string, 
    suggestions: {
      ementa: string;
      justificativa: string;
      observacoes: string;
    }
  ) => void;
  onAppendObservations: (id: string, text: string) => void;
}

export default function AiAssistant({ 
  selectedDiscipline, 
  onApplyAiSuggestions,
  onAppendObservations
}: AiAssistantProps) {
  const [loading, setLoading] = useState(false);
  const [currentAction, setCurrentAction] = useState<"description" | "campaign" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isFallback, setIsFallback] = useState(false);

  // Result storage
  const [generatedDesc, setGeneratedDesc] = useState<{
    descricao: string;
    objetivos: string[];
    competencias: string[];
    entregaveisSugeridos: string[];
  } | null>(null);

  const [generatedCampaigns, setGeneratedCampaigns] = useState<CampaignSuggestion[] | null>(null);

  // Handle generating academic details
  const handleGenerateDescription = async () => {
    if (!selectedDiscipline) return;
    setLoading(true);
    setCurrentAction("description");
    setError(null);
    setGeneratedDesc(null);
    setGeneratedCampaigns(null);
    setIsFallback(false);

    try {
      const res = await fetch("/api/gemini/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "generateDescription",
          activityName: selectedDiscipline.nome,
          category: selectedDiscipline.areaConhecimento,
          currentDescription: selectedDiscipline.ementa
        })
      });

      const data = await res.json();
      if (data && data.data) {
        setGeneratedDesc(data.data);
        if (data.isFallback) {
          setIsFallback(true);
        }
      } else {
        throw new Error("Resposta inválida do servidor");
      }
    } catch (err: any) {
      console.error(err);
      setError("Não foi possível conectar ao Assistente de IA. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  // Handle generating campaign ideas
  const handleGenerateCampaigns = async () => {
    if (!selectedDiscipline) return;
    setLoading(true);
    setCurrentAction("campaign");
    setError(null);
    setGeneratedDesc(null);
    setGeneratedCampaigns(null);
    setIsFallback(false);

    try {
      const res = await fetch("/api/gemini/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "suggestCampaign",
          activityName: selectedDiscipline.nome,
          category: selectedDiscipline.areaConhecimento
        })
      });

      const data = await res.json();
      if (data && data.data && data.data.campanhas) {
        setGeneratedCampaigns(data.data.campanhas);
        if (data.isFallback) {
          setIsFallback(true);
        }
      } else {
        throw new Error("Resposta inválida do servidor");
      }
    } catch (err: any) {
      console.error(err);
      setError("Não foi possível carregar as ideias de campanha. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  // Apply suggestions to the state
  const handleApplyDescription = () => {
    if (!selectedDiscipline || !generatedDesc) return;
    
    // Convert suggestions beautifully into our ementa and justificativa
    const objectivesText = generatedDesc.objetivos.map(o => `• ${o}`).join("\n");
    const competenciesText = generatedDesc.competencias.map(c => `#${c}`).join(" ");
    const deliverablesText = generatedDesc.entregaveisSugeridos.map(d => `• Entregável: ${d}`).join("\n");

    const appliedData = {
      ementa: generatedDesc.descricao,
      justificativa: `Objetivos Educacionais sugeridos:\n${objectivesText}\n\nEntregáveis Acadêmicos sugeridos:\n${deliverablesText}`,
      observacoes: `[Competências IA] ${competenciesText}`
    };

    onApplyAiSuggestions(selectedDiscipline.id, appliedData);
    setGeneratedDesc(null); // Clear after applying
  };

  // Add campaign ideas into notes
  const handleSaveCampaignToNotes = (campaign: CampaignSuggestion) => {
    if (!selectedDiscipline) return;
    const campaignText = `[Campanha Sugerida pela IA] Título: ${campaign.titulo} | Cliente: ${campaign.cliente} | Desafio: ${campaign.desafio} | Peças: ${campaign.pecasSugeridas.join(", ")}`;
    onAppendObservations(selectedDiscipline.id, campaignText);
    alert("Idéia de campanha adicionada às anotações da disciplina com sucesso!");
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-lg p-5 text-white flex flex-col h-full justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center gap-2 mb-4 border-b border-slate-800 pb-3">
          <Sparkles className="w-5 h-5 text-purple-400 fill-purple-400/20" />
          <div>
            <h3 className="font-sans font-bold text-sm tracking-wide">Assistente de Publicidade IA</h3>
            <p className="text-[10px] text-slate-400 font-mono">MODELO: GEMINI 3.5 FLASH</p>
          </div>
        </div>

        {/* Selected Discipline Panel */}
        {!selectedDiscipline ? (
          <div className="text-center py-10 px-4 bg-slate-950/50 rounded-lg border border-slate-800/80 my-4">
            <Lightbulb className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-xs font-sans text-slate-300 font-semibold">Nenhuma Disciplina Selecionada</p>
            <p className="text-[10px] text-slate-500 mt-1">Clique em qualquer linha da planilha para preencher, expandir e criar briefings criativos com inteligência artificial.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-3 bg-slate-950/80 rounded-lg border-l-2 border-purple-500 text-xs">
              <span className="text-[9px] font-mono uppercase tracking-wider text-purple-400">{selectedDiscipline.areaConhecimento}</span>
              <h4 className="font-sans font-bold text-slate-100 mt-0.5 truncate">{selectedDiscipline.nome}</h4>
              <p className="text-[10px] text-slate-400 mt-1 line-clamp-2">{selectedDiscipline.ementa || "Nenhuma ementa cadastrada."}</p>
            </div>

            {/* AI Prompts Actions buttons */}
            <div className="grid grid-cols-2 gap-2">
              <button
                id="btn-ai-describe"
                disabled={loading}
                onClick={handleGenerateDescription}
                className="flex items-center justify-center gap-1.5 bg-purple-700 hover:bg-purple-800 disabled:bg-slate-800 text-white text-[11px] font-bold py-2 px-3 rounded-lg transition-colors cursor-pointer"
              >
                {loading && currentAction === "description" ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5 text-purple-200" />
                )}
                <span>Sugerir Ementa</span>
              </button>

              <button
                id="btn-ai-campaign"
                disabled={loading}
                onClick={handleGenerateCampaigns}
                className="flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-700 disabled:bg-slate-800 text-white text-[11px] font-bold py-2 px-3 rounded-lg transition-colors cursor-pointer border border-slate-700"
              >
                {loading && currentAction === "campaign" ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                )}
                <span>Idéias de Campanhas</span>
              </button>
            </div>

            {/* Fallback Warning */}
            {isFallback && (
              <div className="flex items-start gap-1.5 bg-amber-900/20 border border-amber-800/50 p-2 rounded text-[10px] text-amber-400">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>Modo de assistência rápida ativo. Conteúdo acadêmico UniBrasil pré-carregado.</span>
              </div>
            )}

            {/* Error message */}
            {error && (
              <p className="text-[11px] text-red-400 font-mono bg-red-950/40 p-2.5 rounded border border-red-900/50">
                {error}
              </p>
            )}

            {/* Render response content */}
            {generatedDesc && (
              <div className="mt-4 bg-slate-950/80 rounded-lg p-3.5 border border-slate-800 space-y-3 max-h-[350px] overflow-y-auto">
                <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                  <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase">Sugestões Geradas</span>
                  <button
                    id="btn-apply-desc"
                    onClick={handleApplyDescription}
                    className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] px-2 py-1 rounded font-bold transition-colors cursor-pointer"
                  >
                    <Save className="w-3 h-3" />
                    <span>Aplicar</span>
                  </button>
                </div>

                <div className="space-y-2">
                  <div>
                    <span className="block text-[9px] font-mono text-slate-400 uppercase">Ementa Sugerida</span>
                    <p className="text-xs text-slate-200 mt-0.5 leading-relaxed">{generatedDesc.descricao}</p>
                  </div>

                  <div>
                    <span className="block text-[9px] font-mono text-slate-400 uppercase mb-1">Objetivos sugeridos</span>
                    <ul className="list-disc list-inside text-[11px] text-slate-300 space-y-0.5">
                      {generatedDesc.objetivos.map((obj, i) => (
                        <li key={i} className="line-clamp-2">{obj}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <span className="block text-[9px] font-mono text-slate-400 uppercase mb-1">Competências</span>
                    <div className="flex flex-wrap gap-1">
                      {generatedDesc.competencias.map((comp, i) => (
                        <span key={i} className="text-[9px] font-medium bg-slate-800 px-1.5 py-0.5 rounded text-slate-300">
                          {comp}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="block text-[9px] font-mono text-slate-400 uppercase mb-1">Entregáveis Acadêmicos</span>
                    <ul className="text-[11px] text-slate-300 space-y-0.5">
                      {generatedDesc.entregaveisSugeridos.map((ent, i) => (
                        <li key={i} className="flex items-start gap-1">
                          <span className="text-purple-400">•</span>
                          <span>{ent}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {generatedCampaigns && (
              <div className="mt-4 bg-slate-950/80 rounded-lg p-3.5 border border-slate-800 space-y-3 max-h-[350px] overflow-y-auto">
                <span className="block text-[10px] font-mono font-bold text-purple-400 uppercase border-b border-slate-800 pb-2">
                  Briefings e Projetos Criativos
                </span>

                <div className="space-y-3 divide-y divide-slate-900">
                  {generatedCampaigns.map((camp, idx) => (
                    <div key={idx} className="pt-2.5 first:pt-0 space-y-1.5">
                      <div className="flex justify-between items-start gap-2">
                        <h5 className="font-sans font-bold text-slate-100 text-[11px]">{camp.titulo}</h5>
                        <button
                          onClick={() => handleSaveCampaignToNotes(camp)}
                          title="Salvar idéia nas anotações desta disciplina"
                          className="flex items-center gap-0.5 text-[9px] bg-slate-800 hover:bg-purple-900 hover:text-white px-1.5 py-0.5 rounded text-slate-400 font-medium transition-all"
                        >
                          <Plus className="w-2.5 h-2.5" />
                          <span>Anotar</span>
                        </button>
                      </div>
                      
                      <p className="text-[10px] text-slate-400"><strong className="text-slate-300">Cliente:</strong> {camp.cliente}</p>
                      <p className="text-[10px] text-slate-300 leading-normal"><strong className="text-slate-400 font-mono text-[9px]">Desafio:</strong> {camp.desafio}</p>
                      
                      <div className="flex flex-wrap gap-1 mt-1">
                        {camp.pecasSugeridas.map((peca, pIdx) => (
                          <span key={pIdx} className="text-[9px] bg-purple-950/60 border border-purple-800 text-purple-300 px-1 rounded">
                            {peca}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="mt-6 border-t border-slate-800 pt-3">
        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 bg-slate-950/40 p-2 rounded">
          <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />
          <span>Escreva anotações e salve no dossiê oficial para download ou impressão.</span>
        </div>
      </div>
    </div>
  );
}
