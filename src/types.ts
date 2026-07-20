export interface Discipline {
  id: string;
  periodo: number; // Semestre: 1, 2, 3, 4, 5, 6, 7
  nome: string;
  areaConhecimento: string; // e.g. "BÁSICA DO CURSO", "PROJETO EXTENSÃO", etc.
  tipo: string; // "PRESENCIAL", "A DISTÂNCIA", "PROEX", etc.
  ch: number; // Carga Horária Total
  chTeo: number; // Carga Horária Teórica
  chPra: number; // Carga Horária Prática
  chEst: number; // Carga Horária Estágio
  chEad: number; // Carga Horária EAD
  chExt: number; // Carga Horária Extensão
  chAds: number; // CH ADS (Atividades Discentes Supervisionadas)
  credito: number; // Créditos
  ementa?: string;
  bibliografiaBasica?: string[];
  bibliografiaComplementar?: string[];
  justificativa?: string;
  observacoes?: string;
  praticaAtividade?: string; // e.g. "Criação de portfólio"
  ambientePratica?: string; // e.g. "Estúdio de Fotografia"
  nivelExigencia?: string; // "Exigência Baixa" | "Exigência Média" | "Exigência Alta"
  localPratica?: string; // Local / Laboratório / Núcleo / Parceiro
  tipoPratica?: string; // Tipo de Prática
  competenciaDesenvolvida?: string; // Competência / Habilidade Desenvolvida
  capacidadeAtividade?: string; // Capacidade da Atividade
  documentoEvidencia?: string; // Documento / Evidência
  fragilidadeOportunidade?: string; // Fragilidade / Oportunidade de Melhoria
}

export interface CampaignSuggestion {
  titulo: string;
  cliente: string;
  desafio: string;
  pecasSugeridas: string[];
}
