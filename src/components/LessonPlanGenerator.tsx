import React, { useState, useEffect } from "react";
import { BookOpen, Sparkles, Download, Edit3, CheckCircle, RefreshCw, AlertCircle, Plus, Trash2, Calendar, User, Clock, FileText } from "lucide-react";
import { Discipline } from "../types";

// Fallback schedule in case unibrasil_pp_schedule_2026_2 is empty
const DEFAULT_SCHEDULE_SLOTS = [
  { coddisc: "16007PP", disciplina: "Fotografia Publicitária", professor: "LUIS FELIPE GOUVEIA PINHO", turma: "2PPAN" },
  { coddisc: "16091PP", disciplina: "Sociedade e Criatividade", professor: "GRACIELA JOHNSSON CAMPOS JOKOWISKI", turma: "2PPAN" },
  { coddisc: "16079PP", disciplina: "Escrita Criativa", professor: "GABRIEL ALEXANDRE BOZZA", turma: "2PPAN" },
  { coddisc: "NCH001", disciplina: "Arte e Cultura no Mundo Contemporâneo", professor: "LEONARDO JOSE COSTA", turma: "2PPAN" },
  { coddisc: "16005PP", disciplina: "Editoração Publicitária", professor: "GRACIELA JOHNSSON CAMPOS JOKOWISKI", turma: "2PPAN" },
  { coddisc: "16093PP", disciplina: "Novas Soluções Audiovisuais", professor: "GABRIEL ALEXANDRE BOZZA", turma: "4PPAN" },
  { coddisc: "16015PP", disciplina: "Produção Audiovisual", professor: "LUIS FELIPE GOUVEIA PINHO", turma: "4PPAN" },
  { coddisc: "16016PP", disciplina: "Produção de Som", professor: "LEONARDO JOSE COSTA", turma: "4PPAN" },
  { coddisc: "16094PP", disciplina: "Publicidade na Comunidade", professor: "GRACIELA JOHNSSON CAMPOS JOKOWISKI", turma: "4PPAN" },
  { coddisc: "16089PP", disciplina: "Live Marketing e Branded Experience", professor: "LEONARDO JOSE COSTA", turma: "6PPAN" },
  { coddisc: "16022PP", disciplina: "Ciberpublicidade", professor: "GUSTAVO FORAPANI", turma: "6PPAN" },
  { coddisc: "16042PP", disciplina: "Tendências em Publicidade", professor: "LUCAS DAMASIO", turma: "6PPAN" },
  { coddisc: "16040PP", disciplina: "Optativa", professor: "LUCAS DAMASIO", turma: "6PPAN" },
  { coddisc: "205ADM", disciplina: "Business Intelligence", professor: "PABLO HENRIQUE PASCHOAL CAPUCHO", turma: "6PPAN" },
  { coddisc: "PX001PUB", disciplina: "Programa de Extensão - PROEX I", professor: "INSTITUCIONAL", turma: "2PPAN" },
  { coddisc: "PX002PUB", disciplina: "Programa de Extensão - PROEX II", professor: "GABRIEL ALEXANDRE BOZZA", turma: "4PPAN" },
  { coddisc: "PX003PUB", disciplina: "Programa de Extensão - PROEX III", professor: "GABRIEL ALEXANDRE BOZZA", turma: "6PPAN" }
];

interface WeekPlan {
  semana: number;
  conteudo: string;
  atividades: string;
}

interface LessonPlanState {
  coddisc: string;
  disciplina: string;
  professor: string;
  turma: string;
  ementa: string;
  periodo: string;
  chTotal: number;
  chTeo: number;
  chPra: number;
  chExt: number;
  chEad: number;
  chAds: number;
  creditos: number;
  objetivoGeral: string;
  objetivosEspecificos: string[];
  competencias: string[];
  metodologia: string;
  atividadesDiscentes: string;
  procedimentosAvaliacao: string;
  atividadesAds: {
    bimestre1: string;
    bimestre2: string;
  };
  atividadesAvaliativas: {
    bimestre1: { descricao: string; peso: string };
    bimestre2: { descricao: string; peso: string };
  };
  cronograma: WeekPlan[];
  referenciasBasicas: string[];
  referenciasComplementares: string[];
  sugestoesLeitura: string;
}

interface LessonPlanGeneratorProps {
  disciplines: Discipline[];
}

export default function LessonPlanGenerator({ disciplines }: LessonPlanGeneratorProps) {
  const [allocatedDisciplines, setAllocatedDisciplines] = useState<{ coddisc: string; disciplina: string; professor: string; turma: string }[]>([]);
  const [selectedKey, setSelectedKey] = useState<string>("");
  
  // Lesson Plan Fields State
  const [planState, setPlanState] = useState<LessonPlanState | null>(null);
  
  // UI states
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [successMsg, setSuccessMsg] = useState<string>("");
  const [isEditMode, setIsEditMode] = useState<boolean>(false);

  // New item draft states (for lists)
  const [newObjEsp, setNewObjEsp] = useState("");
  const [newRefBas, setNewRefBas] = useState("");
  const [newRefComp, setNewRefComp] = useState("");
  const [newCompetencia, setNewCompetencia] = useState("");

  // Load disciplines allocated from schedule or default
  useEffect(() => {
    const cached = localStorage.getItem("unibrasil_pp_schedule_2026_2");
    let slots = DEFAULT_SCHEDULE_SLOTS;
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          slots = parsed.map((s: any) => ({
            coddisc: s.coddisc || "",
            disciplina: s.disciplina || "",
            professor: s.professor || "Não Definido",
            turma: s.turma || ""
          }));
        }
      } catch (e) {
        console.error("Erro ao carregar horários para Plano de Aula:", e);
      }
    }

    // Dynamic strip-out of the retired discipline "Mídia - (3PPAN - Lucas)" to completely retire it from the platform
    slots = slots.filter(s => !(s.coddisc === "16010PP" || (s.disciplina === "Mídia" && s.turma === "3PPAN")));

    // Deduplicate slots based on coddisc and professor
    const uniqueMap = new Map<string, { coddisc: string; disciplina: string; professor: string; turma: string }>();
    slots.forEach(s => {
      const key = `${s.coddisc}-${s.professor}`;
      if (!uniqueMap.has(key) && s.coddisc && s.disciplina) {
        uniqueMap.set(key, {
          coddisc: s.coddisc,
          disciplina: s.disciplina,
          professor: s.professor,
          turma: s.turma
        });
      }
    });

    const list = Array.from(uniqueMap.values());
    setAllocatedDisciplines(list);

    // Auto-select first item
    if (list.length > 0) {
      const firstKey = `${list[0].coddisc}-${list[0].professor}`;
      setSelectedKey(firstKey);
      generateInitialPlan(list[0]);
    }
  }, [disciplines]);

  // Handler when selecting a different allocated discipline
  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const key = e.target.value;
    setSelectedKey(key);
    const item = allocatedDisciplines.find(d => `${d.coddisc}-${d.professor}` === key);
    if (item) {
      generateInitialPlan(item);
    }
  };

  // Pre-fill initial plan values from PPC list or default fallbacks
  const generateInitialPlan = (allocated: { coddisc: string; disciplina: string; professor: string; turma: string }) => {
    setErrorMsg("");
    setSuccessMsg("");
    
    // Find matching discipline in PPC matrix (to get syllabus ementa)
    const ppcMatch = disciplines.find(
      d => d.id.toUpperCase() === allocated.coddisc.toUpperCase() ||
           d.nome.toLowerCase() === allocated.disciplina.toLowerCase()
    );

    const ementaText = ppcMatch?.ementa || "Ementa não encontrada no PPC para esta disciplina. Preencha manualmente ou gere com IA.";
    const chTotal = ppcMatch?.ch || 80;
    const chTeo = ppcMatch?.chTeo || 40;
    const chPrac = ppcMatch?.chPra || 40;
    const chExt = ppcMatch?.chExt || 0;
    const chEad = ppcMatch?.chEad || 0;
    const chAds = ppcMatch?.chAds || 0;
    const creditos = ppcMatch?.credito || 4;
    const periodoNum = ppcMatch?.periodo || (allocated.turma === "2PPAN" ? 2 : allocated.turma === "4PPAN" ? 4 : 6);

    // Build realistic fallbacks for core communication disciplines to provide outstanding instant previews
    const fallbacks = getRichFallbackPlan(allocated.disciplina, allocated.coddisc, ementaText, chTeo, chPrac, chAds);

    setPlanState({
      coddisc: allocated.coddisc,
      disciplina: allocated.disciplina,
      professor: allocated.professor,
      turma: allocated.turma,
      ementa: ementaText,
      periodo: `${periodoNum}º Período - Turma ${allocated.turma}`,
      chTotal,
      chTeo,
      chPra: chPrac,
      chExt,
      chEad,
      chAds,
      creditos,
      objetivoGeral: fallbacks.objetivoGeral,
      objetivosEspecificos: fallbacks.objetivosEspecificos,
      competencias: fallbacks.competencias,
      metodologia: fallbacks.metodologia,
      atividadesDiscentes: fallbacks.atividadesDiscentes,
      procedimentosAvaliacao: fallbacks.procedimentosAvaliacao,
      atividadesAds: fallbacks.atividadesAds,
      atividadesAvaliativas: fallbacks.atividadesAvaliativas,
      cronograma: fallbacks.cronograma,
      referenciasBasicas: fallbacks.referenciasBasicas,
      referenciasComplementares: fallbacks.referenciasComplementares,
      sugestoesLeitura: fallbacks.sugestoesLeitura
    });
    setIsEditMode(false);
  };

  // Core smart helper for outstanding local fallback content based on selected discipline
  const getRichFallbackPlan = (nome: string, cod: string, ementa: string, chTeo: number, chPra: number, chAds: number) => {
    const nameLower = nome.toLowerCase();
    
    if (nameLower.includes("mídia") || cod === "16010PP") {
      return {
        objetivoGeral: "Como objetivo geral, a disciplina deverá capacitar os discentes para compreender a mídia como parte integrante do ecossistema publicitário contemporâneo, com capacidade para analisar, planejar e avaliar estratégias de mídia de forma crítica, ética e contextualizada, considerando os aspectos históricos, socioculturais, tecnológicos e simbólicos envolvidos nos processos comunicacionais.",
        objetivosEspecificos: [
          "Compreender a mídia como elemento estratégico nos processos de comunicação publicitária;",
          "Analisar criticamente meios e plataformas midiáticas, tradicionais e digitais;",
          "Planejar estratégias de mídia articuladas à pesquisa, aos dados e aos objetivos de comunicação;",
          "Interpretar indicadores e métricas de mídia de forma contextualizada e não meramente instrumental;",
          "Avaliar os impactos éticos, sociais e culturais das decisões de mídia;",
          "Integrar teoria e prática na elaboração de propostas de mídia adequadas aos desafios contemporâneos da publicidade."
        ],
        competencias: [
          "Interpretar dados e indicadores de mídia de forma contextualizada;",
          "Relacionar informações quantitativas e qualitativas aos aspectos culturais, sociais e simbólicos do consumo;",
          "Utilizar a pesquisa como base para decisões estratégicas de mídia, e não apenas como etapa técnica do planejamento;",
          "Planejar estratégias de mídia alinhadas aos objetivos de comunicação e de negócio;",
          "Integrar meios tradicionais, digitais e emergentes de forma coerente;",
          "Pensar a mídia como parte de um sistema amplo de produção de sentidos, e não apenas como compra de espaços;",
          "Compreender a mídia como fenômeno histórico, cultural e político;",
          "Avaliar os impactos sociais, éticos e simbólicos das estratégias midiáticas;",
          "Compreender como diferentes meios e plataformas constroem sentidos;",
          "Adequar formatos, narrativas e linguagens às especificidades de cada mídia;",
          "Avaliar criticamente conteúdos publicitários em múltiplos ambientes (on-line e off-line);",
          "Entender o funcionamento estratégico das plataformas digitais, algoritmos e métricas;",
          "Atuar de forma ética e reflexiva em ambientes mediados por tecnologia;",
          "Integrar raciocínio estratégico e criatividade nas decisões de mídia digital."
        ],
        metodologia: "Aulas expositivas dialogadas com discussões dirigidas, estudo de caso, seminários e atividades práticas. Análise de práticas de mercado relacionadas à disciplina. Orientação de grupo para desenvolvimento dos trabalhos da disciplina e sala de aula invertida.",
        atividadesDiscentes: "Participação nos debates em sala de aula, realização de apresentações e seminários, leituras de artigos e materiais sugeridos, prática de negociação de mídia e planejamento de veiculação, análise de conceitos sobre estratégia.",
        procedimentosAvaliacao: "A disciplina utilizará dos seguintes métodos de avaliação:\n1.º Bimestre: Avaliação formativa (4,0), Avaliação somativa (6,0)\n2.º Bimestre: Avaliação formativa (4,0), Avaliação somativa (6,0)",
        atividadesAds: {
          bimestre1: "Pesquisa e análise de mídia kit online de veículos indicados e análise de adequação por público. (Carga horária: 4h)",
          bimestre2: "Leitura de textos indicados, preparação de resenha e elaboração de seminário. (Carga horária: 3h)"
        },
        atividadesAvaliativas: {
          bimestre1: {
            descricao: "Participação das atividades e discussões em aula (Valor: 1,0); Plano de mídia – Primeira parte (Valor: 3,0); Avaliação individual – prova escrita teórica (Valor: 6,0).",
            peso: "Formativa: 4.0 | Somativa: 6.0"
          },
          bimestre2: {
            descricao: "Participação das atividades e discussões em aula (Valor: 1,0); Seminário (Valor: 1,0); Plano de Mídia – Segunda parte (Valor: 2,0); Avaliação individual – prova escrita teórica (Valor: 6,0).",
            peso: "Formativa: 4.0 | Somativa: 6.0"
          }
        },
        cronograma: [
          { semana: 1, conteudo: "Apresentação do professor e plano de ensino / Introdução ao conceito de mídia.", atividades: "Discussão inicial sobre consumo e ecossistema de canais. (2h)" },
          { semana: 2, conteudo: "O papel do profissional de mídia.", atividades: "Análise da rotina de agência e estrutura de veiculação. (2h)" },
          { semana: 3, conteudo: "Conceito de estratégias em mídia.", atividades: "Discussão de cases de sucesso e adequação de canais. (2h)" },
          { semana: 4, conteudo: "Principais métricas de avaliação (GRP, CPM, CPP, Cobertura, Frequência).", atividades: "Exercício prático em sala para fixação dos cálculos. (2h)" },
          { semana: 5, conteudo: "Criatividade e planejamento em mídia.", atividades: "Brainstorm de canais de divulgação alternativos. (2h)" },
          { ...getMidiaWeek(6) },
          { ...getMidiaWeek(7) },
          { ...getMidiaWeek(8) },
          { ...getMidiaWeek(9) },
          { ...getMidiaWeek(10) },
          { ...getMidiaWeek(11) },
          { ...getMidiaWeek(12) },
          { ...getMidiaWeek(13) },
          { ...getMidiaWeek(14) },
          { ...getMidiaWeek(15) },
          { ...getMidiaWeek(16) },
          { ...getMidiaWeek(17) },
          { ...getMidiaWeek(18) },
          { ...getMidiaWeek(19) },
          { ...getMidiaWeek(20) }
        ],
        referenciasBasicas: [
          "CIPRIANI, Fabio. Estratégia em mídias sociais. 2. ed. Rio de Janeiro: Elsevier, 2014.",
          "JUSKI, Juliane do R.; BISOL, Laísa V.; SILVA, Fernando Lopes da; et al. Crítica da Mídia. Porto Alegre: SAGAH, 2020. E-book. p.Capa. ISBN 9786556900452.",
          "PRIEST, Susanna Hornig. Pesquisa de mídia: introdução. Tradução de Karla Costa Reis. 2. ed. Porto Alegre: Penso, 2011."
        ],
        referenciasComplementares: [
          "GOODRICH, Willian B.; SISSORS, Jack Z. Praticando o planejamento de mídia: 36 exercícios. São Paulo: Nobel, 2001.",
          "MARQUES, Vasco. Redes Sociais 360. 2. ed. São Paulo: Actual Editora, 2020. E-book. p.1. ISBN 9789896946555.",
          "CAMPOS, Alexandre de; GOULART, Verci Douglas G. Técnicas de Vendas e E-commerce. Rio de Janeiro: Expressa, 2020. E-book. p.1. ISBN 9788536533865.",
          "SISSORS, Jack Z.; BUMBA, Lincoln J. Planejamento de mídia. Tradução de Karin Wright. 1. ed. São Paulo: Nobel, 2003.",
          "THOMPSON, John B. A mídia e a modernidade: Uma teoria social da mídia. Petrópolis: Vozes, 2001."
        ],
        sugestoesLeitura: "Ocorrerão sugestões de leituras de materiais de mercado, artigos e capítulos de livros durante o decorrer da disciplina."
      };
    }
    
    if (nameLower.includes("fotografia")) {
      return {
        objetivoGeral: "Capacitar os estudantes para a compreensão e aplicação de técnicas avançadas de iluminação, composição e pós-produção na fotografia publicitária, integrando expressão criativa e técnica de estúdio ao posicionamento estético de marcas.",
        objetivosEspecificos: [
          "Dominar o controle manual da câmera (exposição, abertura, velocidade, ISO) em ambiente de estúdio profissional.",
          "Aplicar esquemas de iluminação clássicos e criativos para retratos editoriais e fotografia de produto (still).",
          "Desenvolver o olhar crítico para direção de arte fotográfica e composição harmônica no plano publicitário.",
          "Realizar tratamento digital profissional de imagens, retoques e fusões criativas com foco em peças comerciais."
        ],
        competencias: [
          "Compor imagens publicitárias com domínio estético e técnico de enquadramentos;",
          "Dominar técnicas avançadas de iluminação de estúdio para produtos e modelos;",
          "Utilizar softwares profissionais de tratamento digital e pós-produção comercial;",
          "Gerenciar projetos de produção fotográfica desde o briefing até a entrega final."
        ],
        metodologia: "Aulas práticas no Estúdio de Fotografia do UniBrasil. Exercícios reais de simulação de briefings de marcas parceiras. Aulas em Laboratório de Informática para manipulação digital das fotos. Critique sessions coletivas para aperfeiçoar o portfólio discente.",
        atividadesDiscentes: "Aulas práticas no Estúdio de Fotografia, exercícios individuais e coletivos de iluminação, sessões de crítica (feedback), manipulação digital de imagens em laboratório, e desenvolvimento de ensaios fotográficos.",
        procedimentosAvaliacao: "A disciplina utilizará avaliação formativa (4,0) e somativa (6,0). O processo avaliativo considera a entrega do portfólio prático de ensaios fotográficos e as atividades integradas de estúdio, além da Atividade Discente Supervisionada (ADS) de 13h.",
        atividadesAds: {
          bimestre1: "Desenvolvimento de portfólio preliminar contendo ensaios experimentais individuais sob supervisão e monitoria. (Carga horária: 7h)",
          bimestre2: "Edição avançada de fotografias comerciais utilizando softwares de tratamento e montagem em laboratório. (Carga horária: 6h)"
        },
        atividadesAvaliativas: {
          bimestre1: {
            descricao: "Avaliação prática individual em estúdio (6,0); Portfólio de ensaio de produtos still life (3,0); Entrega e validação do progresso da ADS (1,0).",
            peso: "Total: 10.0"
          },
          bimestre2: {
            descricao: "Projeto prático final integrador - produção de editorial completo para marca real (6,0); Apresentação oral e defesa do briefing fotográfico (3,0); Entrega da ADS final de tratamento (1,0).",
            peso: "Total: 10.0"
          }
        },
        cronograma: Array.from({ length: 20 }, (_, i) => ({
          semana: i + 1,
          conteudo: getFotografiaWeek(i + 1).c,
          atividades: getFotografiaWeek(i + 1).a
        })),
        referenciasBasicas: [
          "KOBRE, Kenneth. Fotojornalismo: o guia do profissional. Rio de Janeiro: Campus, 2011.",
          "AUMONT, Jacques. A imagem. Campinas: Papirus, 2012.",
          "LANGFORD, Michael. Fotografia básica de Langford. São Paulo: Senac, 2014."
        ],
        referenciasComplementares: [
          "BARTHES, Roland. A câmara clara. Rio de Janeiro: Nova Fronteira, 2015.",
          "SONTAG, Susan. Sobre fotografia. São Paulo: Companhia das Letras, 2012.",
          "KELBY, Scott. Luz, câmera e fotografia de produtos. Rio de Janeiro: Alta Books, 2018."
        ],
        sugestoesLeitura: "Leitura de artigos recomendados sobre as tendências de manipulação e fotografia digital na publicidade contemporânea."
      };
    }

    if (nameLower.includes("escrita") || nameLower.includes("redação")) {
      return {
        objetivoGeral: "Desenvolver as habilidades de redação criativa e persuasiva voltadas à publicidade e propaganda, capacitando os alunos a redigir títulos, roteiros, manifestos de marca e microcopy para diversas plataformas de mídia.",
        objetivosEspecificos: [
          "Compreender a estrutura de narrativas de marca (storytelling) aplicadas a campanhas digitais e tradicionais.",
          "Dominar técnicas de redação de slogans, chamadas de ação (CTAs) e copy otimizado para SEO e engajamento.",
          "Escrever roteiros publicitários detalhados para rádio, cinema e redes sociais, controlando ritmo, tom de voz e tempo de fala.",
          "Praticar o desbloqueio criativo individual e dinâmicas de brainstorm em grupo."
        ],
        competencias: [
          "Redigir slogans, headlines e body copy de alta memorabilidade e poder persuasivo;",
          "Desenvolver roteiros técnicos de rádio, TV e mídias sociais seguindo padrões técnicos;",
          "Aplicar técnicas de storytelling e tom de voz integrado ao branding de marcas;",
          "Dominar conceitos de UX Writing, microcopy e copywriting aplicados a plataformas digitais."
        ],
        metodologia: "Oficinas práticas de escrita em tempo real (copywriting workshops). Simulações de briefings urgentes de agências. Análise crítica de grandes slogans e cases de sucesso da publicidade brasileira e internacional.",
        atividadesDiscentes: "Oficinas práticas de escrita criativa (workshops), leitura de manifestos de marca, análise crítica de roteiros de rádio e TV, simulações de brainstorming, redação de peças em sala.",
        procedimentosAvaliacao: "A disciplina utilizará avaliação formativa (4,0) e somativa (6,0). O processo avaliativo considera o Dossiê de Redação Publicitária e as atividades de escrita criativa, juntamente com o cumprimento da Atividade Discente Supervisionada (ADS).",
        atividadesAds: {
          bimestre1: "Exercícios práticos de reescrita de anúncios tradicionais para mídias digitais. (Carga horária: 4h)",
          bimestre2: "Fichamento individual e análise estilística de manifestos de marcas de relevância internacional. (Carga horária: 3h)"
        },
        atividadesAvaliativas: {
          bimestre1: {
            descricao: "Dossiê de Redação Publicitária contendo: 3 slogans e 2 anúncios impressos (6,0); Oficina prática de manifesto (3,0); Entrega do relatório da ADS (1,0).",
            peso: "Total: 10.0"
          },
          bimestre2: {
            descricao: "Roteiro e Storyboard de Comercial de TV/Redes Sociais de 30 segundos (6,0); Apresentação e pitch criativo (3,0); Entrega final da ADS de fichamento (1,0).",
            peso: "Total: 10.0"
          }
        },
        cronograma: Array.from({ length: 20 }, (_, i) => ({
          semana: i + 1,
          conteudo: getEscritaWeek(i + 1).c,
          atividades: getEscritaWeek(i + 1).a
        })),
        referenciasBasicas: [
          "REZENDE, Almir. Redação publicitária: teoria e prática. São Paulo: Atlas, 2018.",
          "CARRASCOSA, João Anzanello. Redação publicitária: estudos sobre a retórica do consumo. São Paulo: Futura, 2016.",
          "OGILVY, David. Confissões de um publicitário. Rio de Janeiro: Bertrand Brasil, 2011."
        ],
        referenciasComplementares: [
          "MCKEE, Robert. Story: substância, estrutura, estilo e os princípios da escrita de roteiro. Curitiba: Arte & Letra, 2017.",
          "CARDOSO, Rafael. Design e escrita. São Paulo: Cosac Naify, 2012.",
          "SCHWAB, Victor. Como escrever anúncios que vendem. Rio de Janeiro: Alta Books, 2019."
        ],
        sugestoesLeitura: "Acompanhamento de newsletters de agências de publicidade e estudos sobre comportamento do consumidor digital."
      };
    }

    if (nameLower.includes("audiovisual") || nameLower.includes("som") || nameLower.includes("produção")) {
      return {
        objetivoGeral: "Capacitar os alunos nas etapas de pré-produção, gravação, direção de cena e pós-produção audiovisual e de áudio, preparando-os para a entrega de comerciais de TV, spots de rádio e novos formatos multimídia.",
        objetivosEspecificos: [
          "Dominar a linguagem audiovisual: enquadramentos, decupagem de roteiros, movimentos de câmera e iluminação de cena.",
          "Captar, editar e mixar áudio profissional, compreendendo sonorização, efeitos sonoros (foley) e trilha de apoio.",
          "Praticar a direção de atores, locutores e equipe técnica de gravação sob as restrições de tempo do briefing comercial.",
          "Operar softwares profissionais de edição de vídeo de forma linear e não linear."
        ],
        competencias: [
          "Planejar a pré-produção de comerciais (casting, locação, cronograma e decupagem);",
          "Operar equipamentos de captação de imagem e áudio profissional em estúdio de TV;",
          "Editar e finalizar comerciais aplicando técnicas profissionais de corte e mixagem;",
          "Trabalhar de forma colaborativa nas diferentes funções de um set de filmagem."
        ],
        metodologia: "Aulas em estúdio de TV e Rádio do UniBrasil. Desenvolvimento de produções audiovisuais completas em equipe. Simulação de papéis reais do set de gravação (diretor, produtor, câmera, sonoplasta, editor).",
        atividadesDiscentes: "Produções de spots e comerciais no Estúdio de TV e Rádio, decupagem de roteiros em sala de aula, captação prática, edição e finalização em ilhas de edição, e apresentações dos vídeos prontos.",
        procedimentosAvaliacao: "A disciplina utilizará avaliação formativa (4,0) e somativa (6,0). Avaliação baseia-se na entrega dos produtos audiovisuais finalizados, na atuação individual no set, e no cumprimento de Atividade Discente Supervisionada (ADS).",
        atividadesAds: {
          bimestre1: "Planejamento e decupagem técnica de roteiro para o spot de rádio. (Carga horária: 4h)",
          bimestre2: "Criação de storyboard detalhado e cronograma de produção para o comercial de TV. (Carga horária: 4h)"
        },
        atividadesAvaliativas: {
          bimestre1: {
            descricao: "Produção de Spot de Rádio de 30 segundos (gravação e sonorização) (6,0); Decupagem e roteiro preliminar (3,0); Entrega de relatório da ADS (1,0).",
            peso: "Total: 10.0"
          },
          bimestre2: {
            descricao: "Filme Publicitário de 30 segundos finalizado em grupo (6,0); Atuação individual no set de gravação (3,0); Entrega final do storyboard da ADS (1,0).",
            peso: "Total: 10.0"
          }
        },
        cronograma: Array.from({ length: 20 }, (_, i) => ({
          semana: i + 1,
          conteudo: getAudiovisualWeek(i + 1).c,
          atividades: getAudiovisualWeek(i + 1).a
        })),
        referenciasBasicas: [
          "RODRIGUES, Chris. O cinema e a produção. Rio de Janeiro: Lamparina, 2015.",
          "FELDMAN, Daniel. Produção de vídeo publicitário: do roteiro à pós-produção. São Paulo: Senac, 2018.",
          "MURCH, Walter. Num piscar de olhos: a edição de filmes sob a ótica de um editor. Rio de Janeiro: Jorge Zahar, 2012."
        ],
        referenciasComplementares: [
          "SION, Michel. O som no cinema. São Paulo: Martins Fontes, 2014.",
          "ALBERGARIA, Pedro. Direção de arte para cinema e TV. Lisboa: Edições 70, 2013.",
          "KATZ, Steven. Da imagem à ação: direção cinematográfica de cena. Rio de Janeiro: Campus, 2011."
        ],
        sugestoesLeitura: "Estudo de manuais de roteirização e análise técnica de comerciais brasileiros clássicos."
      };
    }

    // Default dynamic strategy for any other discipline
    const hasAds = chAds > 0;
    const isTeorica = chTeo >= chPra;

    return {
      objetivoGeral: `Capacitar o estudante na compreensão dos fundamentos de ${nome}, integrando a fundamentação teórica com atividades práticas voltadas ao mercado de publicidade regional de Curitiba, estimulando o espírito crítico, inovação e rigor conceitual.`,
      objetivosEspecificos: [
        `Compreencer os conceitos estruturantes de ${nome} e sua relevância no ecossistema publicitário moderno.`,
        "Aplicar metodologias e ferramentas práticas para o diagnóstico e solução de problemas reais de comunicação.",
        "Desenvolver relatórios de cunho estratégico e apresentações de alto impacto para clientes e conselhos acadêmicos.",
        "Estimular o raciocínio criativo integrado às demandas contemporâneas de marketing e comportamento do consumidor."
      ],
      competencias: [
        `Analisar o impacto e aplicação prática de ${nome} no mercado publicitário contemporâneo;`,
        "Formular propostas de comunicação estratégicas baseadas em dados e diagnósticos reais;",
        "Aplicar teorias e conceitos estruturantes à resolução de briefings comerciais complexos;",
        "Produzir relatórios analíticos e defesas técnicas com clareza, ética e rigor acadêmico."
      ],
      metodologia: "Aulas expositivas dialogadas intercaladas com dinâmicas de metodologias ativas de aprendizagem, estudos de caso e projetos integradores aplicados em agência experimental. Discussão de artigos contemporâneos e análise de mercado.",
      atividadesDiscentes: "Leitura de artigos acadêmicos e do mercado publicitário, elaboração de resenhas críticas, participação em dinâmicas de metodologias ativas e debates em grupo, e desenvolvimento de relatórios.",
      procedimentosAvaliacao: `A disciplina utilizará avaliação formativa (4,0) e somativa (6,0). A nota formativa inclui participação ativa nas atividades e trabalhos em equipe${hasAds ? `, bem como a Atividade Discente Supervisionada (ADS) de ${chAds}h` : ""}, enquanto a somativa foca na verificação individual de desempenho.`,
      atividadesAds: {
        bimestre1: hasAds ? `Pesquisa bibliográfica orientada e análise crítica de campo aplicada aos temas de ${nome}. (Carga horária: ${Math.ceil(chAds / 2)}h)` : "Esta disciplina não possui carga horária de Atividade Discente Supervisionada (ADS).",
        bimestre2: hasAds ? `Leitura de textos indicados pelo docente e preparação de resenha analítica individual sobre ${nome}. (Carga horária: ${Math.floor(chAds / 2)}h)` : "Esta disciplina não possui carga horária de Atividade Discente Supervisionada (ADS)."
      },
      atividadesAvaliativas: {
        bimestre1: {
          descricao: hasAds
            ? `Participação nas discussões presenciais (1,0); Entrega de relatório da ADS (1,0); Trabalho prático ou seminário (2,0); ${isTeorica ? "Avaliação individual escrita (prova teórica)" : "Avaliação prática individual em laboratório/estúdio"} (6,0).`
            : `Participação nas discussões presenciais (1,0); Trabalho prático ou seminário (3,0); ${isTeorica ? "Avaliação individual escrita (prova teórica)" : "Avaliação prática individual em laboratório/estúdio"} (6,0).`,
          peso: "Total: 10.0"
        },
        bimestre2: {
          descricao: hasAds
            ? `Participação nas discussões de classe (1,0); Entrega final da resenha da ADS (1,0); Projeto integrado prático final (2,0); ${isTeorica ? "Avaliação individual escrita (prova teórica)" : "Avaliação prática individual em laboratório/estúdio"} (6,0).`
            : `Participação nas discussões de classe (1,0); Projeto integrado prático final (3,0); ${isTeorica ? "Avaliação individual escrita (prova teórica)" : "Avaliação prática individual em laboratório/estúdio"} (6,0).`,
          peso: "Total: 10.0"
        }
      },
      cronograma: Array.from({ length: 20 }, (_, i) => ({
        semana: i + 1,
        conteudo: `Módulo ${Math.ceil((i + 1) / 5)}: Abordagem teórica e conceitual sobre ${(i + 1) % 2 === 0 ? "técnicas aplicadas" : "processos integrados"} de ${nome}.`,
        atividades: `Discussão de estudo de caso, atividade em grupo ${i + 1 % 3 === 0 ? "no laboratório de informática" : "na sala de aula"} e feedback. (2h)`
      })),
      referenciasBasicas: [
        "KOTLER, Philip. Marketing 5.0: tecnologia para a humanidade. Rio de Janeiro: Sextante, 2021.",
        "SANTAELLA, Lucia. Comunicação e pesquisa. São Paulo: Hacker, 2015.",
        "PEREZ, Clotilde. Signos da marca: expressividade e leitura. São Paulo: Thomson, 2018."
      ],
      referenciasComplementares: [
        "JENKINS, Henry. Cultura da convergência. São Paulo: Aleph, 2019.",
        "LIMA, Rogério. Teoria integrada de publicidade. São Paulo: Atlas, 2016.",
        "BAUMAN, Zygmunt. Modernidade líquida. Rio de Janeiro: Jorge Zahar, 2011."
      ],
      sugestoesLeitura: "Leituras sugeridas de materiais de mercado, cases contemporâneos de publicidade e capítulos de livros indicados pelo professor."
    };
  };

  // Helper for Mídia weekly content
  const getMidiaWeek = (week: number) => {
    const data = [
      { semana: 6, conteudo: "Plano de mídia 1 - Diagnóstico e Pesquisa (Parte A).", atividades: "Oficina prática em laboratório de informática com pesquisas de audiência e mercado. (2h)" },
      { semana: 7, conteudo: "Plano de mídia 1 - Definição de Objetivos e Metas (Parte B).", atividades: "Elaboração de objetivos de comunicação baseados em briefing de cliente real. (2h)" },
      { semana: 8, conteudo: "Avaliação individual - prova escrita de 1º Bimestre.", atividades: "Aplicação de avaliação individual teórica escrita sem consulta. (2h)" },
      { semana: 9, conteudo: "Debate: mídias digitais vs. mídias tradicionais – complementares ou excludentes.", atividades: "Debate estruturado dividindo a turma em defensores de meios offline e online. (2h)" },
      { semana: 10, conteudo: "IA agentica e mídia.", atividades: "Análise de canais de compra de mídia programática auxiliada por algoritmos de IA. (2h)" },
      { semana: 11, conteudo: "Influência cultural e social na mídia.", atividades: "Estudo sobre rituais de consumo de conteúdo em diferentes camadas sociais. (2h)" },
      { semana: 12, conteudo: "Elementos da pesquisa em mídia.", atividades: "Análise crítica de dados consolidados de leitura de relatórios de mercado. (2h)" },
      { semana: 13, conteudo: "Seminário: Estratégias em mídia - Apresentações de Grupos (Parte A).", atividades: "Apresentação e defesa crítica de plano estratégico de marcas selecionadas. (2h)" },
      { semana: 14, conteudo: "Seminário: Estratégias em mídia - Apresentações de Grupos (Parte B).", atividades: "Continuação das exposições orais de estratégias de canais. (2h)" },
      { semana: 15, conteudo: "Dinâmica: negociação e práticas de mercado.", atividades: "Simulação prática de negociação comercial de espaços de mídia. (2h)" },
      { semana: 16, conteudo: "Plano de Mídia 2 - Elaboração do Fluxograma e Distribuição de Verba.", atividades: "Oficina de planilha de fluxograma de inserções publicitárias e orçamento. (2h)" },
      { semana: 17, conteudo: "Avaliação individual - prova escrita de 2º Bimestre.", atividades: "Aplicação da segunda avaliação teórica individual sem consulta. (2h)" },
      { semana: 18, conteudo: "Visita Técnica em veículo (Rádio CBN).", atividades: "Estudo prático de campo guiado pelo professor para vivência no veículo de comunicação. (Externo 2h)" },
      { semana: 19, conteudo: "Exame final.", atividades: "Aplicação de exame escrito integrativo de recuperação sem consulta. (2h)" },
      { semana: 20, conteudo: "Revisão e dúvidas.", atividades: "Devolutiva dos exames finais, fechamento e encerramento pedagógico do semestre. (2h)" }
    ];
    return data.find(d => d.semana === week) || { semana: week, conteudo: "Conteúdo a definir.", atividades: "Atividades práticas. (2h)" };
  };

  // Cronograma helpers for outstanding photorealistic fallbacks
  const getFotografiaWeek = (week: number) => {
    const data = [
      { wk: 1, c: "Apresentação do Plano de Ensino, introdução histórica e a linguagem fotográfica na publicidade.", a: "Discussão de fotos publicitárias icônicas e referências visuais." },
      { wk: 2, c: "Fundamentos técnicos: O triângulo de exposição (Abertura, Velocidade do Obturador e Sensibilidade ISO).", a: "Exercício prático de calibração e medição de luz usando fotômetro manual." },
      { wk: 3, c: "Distância focal e tipos de lentes (Grande angular, Normal, Teleobjetiva) e profundidade de campo.", a: "Laboratório prático variando profundidade de campo com lentes diversas." },
      { wk: 4, c: "Composição visual na publicidade: Regra dos terços, linhas guias, simetria, enquadramentos e ângulos.", a: "Saída fotográfica no campus UniBrasil para captação livre." },
      { wk: 5, c: "Introdução à Iluminação: Luz natural vs. artificial, luz direta, difusa e rebatida. Qualidade da luz.", a: "Exercício com rebatedores e difusores em locação externa." },
      { wk: 6, c: "O Estúdio Fotográfico: Equipamentos de estúdio (flashes geradores, tochas, softboxes, sombrinhas, colmeias).", a: "Treinamento de montagem de equipamentos com segurança no Estúdio UniBrasil." },
      { wk: 7, c: "Iluminação de Retrato Editoral (Editorial Portrait): Esquemas clássicos de luz (Rembrandt, Split, Butterfly, Rim Light).", a: "Sessão prática em duplas clicando retratos publicitários conceituais." },
      { wk: 8, c: "Fotografia de Produto (Still): Desafios de reflexo, textura e transparência em objetos foscos e metálicos.", a: "Montagem de miniestúdio/softbox portátil para fotografar embalagens." },
      { wk: 9, c: "Pós-Produção Fotográfica I: Fluxo de trabalho no Adobe Lightroom (importação, catalogação, balanço de branco e cores).", a: "Laboratório de informática: tratamento básico do primeiro lote de fotos." },
      { wk: 10, c: "Avaliação do 1º Bimestre: Entrega do portfólio individual Still e Retrato.", a: "Apresentação e crítica coletiva das imagens entregues." },
      { wk: 11, c: "Fotografia Gastronômica: Food styling, truques de produção culinária, luz de recorte e frescor dos alimentos.", a: "Prática de fotografia de pratos e bebidas com iluminação lateral dedicada." },
      { wk: 12, c: "Fotografia de Moda e Lifestyle: Direção de modelos, locação urbana e integração com o conceito de marca.", a: "Sessão fotográfica externa simulando um catálogo de marca local de vestuário." },
      { wk: 13, c: "Direção de Arte na Fotografia Publicitária: Criação de Moodboard, paleta de cores e seleção de props (objetos de cena).", a: "Elaboração em grupo do briefing criativo para o projeto final." },
      { wk: 14, c: "A fotografia nas Redes Sociais: Formatos verticais (Instagram/Pinterest), estética de conteúdo espontâneo vs. hiperproduzido.", a: "Produção rápida em estúdio de fotos adaptáveis para canais digitais." },
      { wk: 15, c: "Tratamento de Imagem II: Adobe Photoshop intermediário (remoção de imperfeições, retoque de pele, filtros e curvas).", a: "Edição avançada das imagens do projeto de moda/lifestyle." },
      { wk: 16, c: "Fusão e Montagem Digital: Introdução ao recorte preciso, substituição de fundos e manipulação não destrutiva.", a: "Exercício prático de montagem de anúncio impresso integrado (produto + fundo temático)." },
      { wk: 17, c: "A Fotografia e a Legislação: Direitos autorais, uso comercial de imagens, autorização de imagem de modelos e contratos.", a: "Estudo de caso sobre processos e boas práticas contratuais na fotografia comercial." },
      { wk: 18, c: "Produção e Execução do Projeto Final (Campanha Principal). Apoio no estúdio e laboratório.", a: "Gravação livre em estúdio sob supervisão direta do professor." },
      { wk: 19, c: "Pós-produção final, diagramação de catálogo ou peças e fechamento de arquivos para impressão e web.", a: "Ajustes finais no laboratório de informática." },
      { wk: 20, c: "Avaliação do 2º Bimestre: Mostra de Fotografia Publicitária e banca avaliadora.", a: "Exposição dos trabalhos impressos/digitais com feedback detalhado do colegiado." }
    ];
    return data[week - 1] || { wk: week, c: "Conteúdo a definir.", a: "Atividades práticas." };
  };

  const getEscritaWeek = (week: number) => {
    const data = [
      { wk: 1, c: "Apresentação e o papel do Redator na Agência de Publicidade. O Redator e a dupla de criação.", a: "Exercícios rápidos de associação livre e análise de briefings." },
      { wk: 2, c: "A anatomia do texto publicitário: Título (Headline), Subtítulo, Texto de Apoio (Body Copy) e Assinatura.", a: "Redação de títulos com abordagens variadas (informativo, provocativo, poético)." },
      { wk: 3, c: "A arte do Slogan: Memorabilidade, sonoridade, síntese e o DNA da marca traduzido em poucas palavras.", a: "Desafio de criação de slogans para produtos complexos." },
      { wk: 4, c: "Storytelling Corporativo: Criação de mitos fundadores, jornada do herói aplicada ao consumo e conexão humana.", a: "Oficina prática de redação de um mini-manifesto para uma marca local." },
      { wk: 5, c: "Planejamento Criativo e Persona: Linguagem adequada ao público-alvo, tom de voz e diretrizes de marca.", a: "Construção do guia de tom de voz (Brand Voice Manual) de uma marca hipotética." },
      { wk: 6, c: "Redação Audiovisual I: O roteiro de Rádio (Spot). Ritmo, uso de locução, efeitos sonoros (foley) e trilhas.", a: "Oficina de redação de roteiro de spot de 30 segundos com contagem de palavras." },
      { wk: 7, c: "Redação Audiovisual II: O roteiro de Filme/TV. Formato duas colunas (Áudio e Vídeo). Storyboard e decupagem.", a: "Elaboração de roteiro de campanha institucional emocionante em formato de vídeo." },
      { wk: 8, c: "Redação Digital I: Microcopy, UX Writing e caminhos de conversão em landing pages e aplicativos.", a: "Revisão e reescrita de textos de interface focando na clareza e ação." },
      { wk: 9, c: "Redação Digital II: Redes sociais. Criação de postagens, estratégias de ganchos (Hooks) e legendas engajadoras.", a: "Desenvolvimento de um calendário de posts escritos com foco no Instagram e LinkedIn." },
      { wk: 10, c: "Avaliação do 1º Bimestre: Entrega do portfólio escrito individual de mídia impressa e áudio.", a: "Leitura dramática dos roteiros de rádio gravados no laboratório." },
      { wk: 11, c: "Técnicas de Copywriting: Fórmulas consagradas de vendas (AIDA, PAS, FAB) e gatilhos mentais (escassez, autoridade).", a: "Exercício de reescrita de e-mail marketing aplicando as fórmulas." },
      { wk: 12, c: "Publicidade de Guerrilha e Texto Não Convencional: Copy em locais alternativos (banco da praça, ônibus, sacolas).", a: "Brainstorm criativo de ativações urbanas focadas em mensagens textuais inovadoras." },
      { wk: 13, c: "O Texto na Mídia Exterior: Outdoor, painéis de LED, mobiliário urbano. Regras de concisão máxima (máximo 6 palavras).", a: "Desenvolvimento de campanha em outdoor para exibição rápida em rodovias de Curitiba." },
      { wk: 14, c: "Redação Corporativa e Relações Públicas: Comunicado de imprensa (Press Release) e gestão de crises textuais.", a: "Oficina de redação de release oficial de lançamento de um produto inovador." },
      { wk: 15, c: "A Inteligência Artificial na Redação: Prompting avançado, uso cooperativo de LLMs para brainstorm e refinamento.", a: "Exercício de refatoração de copy humano gerando variações rápidas com apoio de IA." },
      { wk: 16, c: "Revisão e Técnicas de Edição Textual: Concisão, eliminação de clichês, ritmo de leitura e ortografia aplicada.", a: "Oficina de 'enxugamento de texto' (poda de copy) visando ganho de impacto." },
      { wk: 17, c: "Elaboração do Roteiro Final para a Campanha de 2º Bimestre.", a: "Sessão de mentoria individual com foco na correção de roteiros." },
      { wk: 18, c: "Trabalho prático orientado: Ensaios de redação de pitch, justificativa conceitual e defesa de campanha.", a: "Redação da defesa técnica que acompanhará o portfólio visual da agência." },
      { wk: 19, c: "Fechamento do Portfólio de Redação Publicitária integrado com direção de arte.", a: "Apoio individual do professor na revisão ortográfica e expressiva final." },
      { wk: 20, c: "Avaliação do 2º Bimestre: Pitching de Agência Experimental e Defesa de Campanha.", a: "Apresentação oral dos manifestos e comerciais escritos perante o colegiado." }
    ];
    return data[week - 1] || { wk: week, c: "Conteúdo a definir.", a: "Atividades práticas." };
  };

  const getAudiovisualWeek = (week: number) => {
    const data = [
      { wk: 1, c: "Introdução à Produção Audiovisual na Publicidade: Formatos, funções no set e fluxo de produção.", a: "Análise de comerciais premiados com foco em cortes e narrativa visual." },
      { wk: 2, c: "Linguagem e Gramática do Audiovisual: Tipos de planos, ângulos de câmera, enquadramentos e movimentos.", a: "Exercício prático de gravação em smartphone aplicando enquadramentos básicos." },
      { wk: 3, c: "Roteiro Técnico, Storyboard e Decupagem de Cena: Traduzindo ideias escritas em orientações de filmagem.", a: "Criação de um storyboard rascunhado para um comercial simples de 15s." },
      { wk: 4, c: "A Câmera: Funcionamento técnico, exposição, balanço de brancos, foco e taxas de quadros (frame rates).", a: "Prática com câmeras DSLR/Mirrorless do estúdio UniBrasil." },
      { wk: 5, c: "Iluminação de Vídeo: Esquema clássico de 3 pontos (Chave, Preenchimento, Contra), luz de fundo e contrastes.", a: "Montagem de set de iluminação contínua focada em entrevistas e depoimentos." },
      { wk: 6, c: "Áudio para Vídeo: Captação de som direto, microfones lapela, shotgun, gravadores externos e monitoramento.", a: "Prática de gravação de locução externa com controle de ruído." },
      { wk: 7, c: "Estudo e Pré-produção do Projeto I: Agendamento de estúdio, casting de atores, cronograma e locações.", a: "Elaboração do caderno de produção do primeiro exercício em grupo." },
      { wk: 8, c: "Gravação Supervisionada - Projeto I. Atendimento ao plano de filmagem.", a: "Filmagem de comercial institucional de 15 segundos nas dependências do campus." },
      { wk: 9, c: "Edição de Vídeo I: Interface do software de edição (Premiere/DaVinci), importação, cortes e sincronização de áudio.", a: "Primeira montagem (rough cut) do vídeo gravado na semana anterior." },
      { wk: 10, c: "Avaliação do 1º Bimestre: Entrega e exibição do comercial institucional de 15 segundos finalizado.", a: "Cine-clube UniBrasil: exibição dos vídeos e crítica técnica do professor." },
      { wk: 11, c: "Linguagem Sonora Publicitária: Sonoplastia, efeitos sonoros (foley), mixagem de canais e trilhas sonoras brancas.", a: "Exercício prático de sonorização de um vídeo mudo utilizando banco de efeitos." },
      { wk: 12, c: "Fotografia de Cinema Aplicada à Publicidade: Color grading, correção primária de cores e atmosfera do filme.", a: "Laboratório de informática: aplicação de LUTs e ajustes de curvas de cor em vídeo." },
      { wk: 13, c: "Novos Formatos Verticais: Reels, Shorts e TikTok. Dinâmica de edição rápida, legendas dinâmicas e transições.", a: "Produção em tempo real de um anúncio de guerrilha vertical gravado no laboratório." },
      { wk: 14, c: "Direção de Arte no Audiovisual: Figurino, props, maquiagem e psicologia das cores aplicada ao cenário.", a: "Planejamento estético do projeto final de 30 segundos." },
      { wk: 15, c: "Pré-produção avançada: Roteiro e decupagem técnica do comercial final de 30 segundos.", a: "Apresentação do plano de produção para aprovação do professor." },
      { wk: 16, c: "Gravação Supervisionada do Comercial Final - Set 1.", a: "Sessão de filmagens no Estúdio de TV da UniBrasil ou locações aprovadas." },
      { wk: 17, c: "Gravação Supervisionada do Comercial Final - Set 2.", a: "Conclusão das filmagens de apoio (B-roll) e captação de áudio/locuções." },
      { wk: 18, c: "Pós-Produção Avançada: Edição, sonorização final, letreiros, transições e crédito.", a: "Montagem final em laboratório com mentoria direta do professor." },
      { wk: 19, c: "Correção de Cor Final, mixagem de áudio em -14 LUFS e exportação em formatos comerciais de exibição.", a: "Fechamento técnico do arquivo final." },
      { wk: 20, c: "Avaliação do 2º Bimestre: Festival de Comercial Publicitário UniBrasil.", a: "Apresentação dos comerciais de 30 segundos perante comissão de professores convidados." }
    ];
    return data[week - 1] || { wk: week, c: "Conteúdo a definir.", a: "Atividades práticas." };
  };

  // Call server-side API to generate Lesson Plan with Gemini
  const handleGenerateWithAI = async () => {
    if (!planState) return;
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");
    
    try {
      const response = await fetch("/api/gemini/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "generateLessonPlan",
          disciplineName: planState.disciplina,
          coddisc: planState.coddisc,
          syllabus: planState.ementa,
          period: planState.periodo,
          professor: planState.professor,
          chTeo: planState.chTeo,
          chPra: planState.chPra,
          chAds: planState.chAds
        })
      });

      const resData = await response.json();
      if (resData.success && resData.data) {
        const aiData = resData.data;
        setPlanState(prev => {
          if (!prev) return null;
          return {
            ...prev,
            objetivoGeral: aiData.objetivoGeral || prev.objetivoGeral,
            objetivosEspecificos: aiData.objetivosEspecificos || prev.objetivosEspecificos,
            competencias: aiData.competencias || prev.competencias || [],
            metodologia: aiData.metodologia || prev.metodologia,
            atividadesDiscentes: aiData.atividadesDiscentes || prev.atividadesDiscentes || "",
            procedimentosAvaliacao: aiData.procedimentosAvaliacao || prev.procedimentosAvaliacao || "",
            atividadesAds: aiData.atividadesAds || prev.atividadesAds || { bimestre1: "", bimestre2: "" },
            atividadesAvaliativas: aiData.atividadesAvaliativas || prev.atividadesAvaliativas,
            cronograma: aiData.cronograma || prev.cronograma,
            referenciasBasicas: aiData.referencias?.basicas || prev.referenciasBasicas,
            referenciasComplementares: aiData.referencias?.complementares || prev.referenciasComplementares,
            sugestoesLeitura: aiData.sugestoesLeitura || prev.sugestoesLeitura || ""
          };
        });
        setSuccessMsg("Plano de Aula sugerido com inteligência do Gemini com sucesso!");
      } else {
        throw new Error(resData.error || "Erro desconhecido ao chamar IA");
      }
    } catch (e: any) {
      console.warn("Falha ao gerar com IA, mantendo fallback rico local:", e);
      
      let rawMsg = e.message || "Erro desconhecido";
      let cleanMsg = rawMsg;

      // Se a mensagem de erro vier serializada como JSON, vamos extrair a mensagem interna amigável
      if (typeof rawMsg === "string" && rawMsg.trim().startsWith("{") && rawMsg.trim().endsWith("}")) {
        try {
          const parsed = JSON.parse(rawMsg.trim());
          if (parsed.error && parsed.error.message) {
            cleanMsg = parsed.error.message;
          } else if (parsed.message) {
            cleanMsg = parsed.message;
          }
        } catch (jsonErr) {
          // Mantém original se falhar o parse
        }
      }

      // Identifica indisponibilidade temporária (Erro 503 ou UNAVAILABLE)
      const isTemporaryDemandError = 
        cleanMsg.includes("503") || 
        cleanMsg.toLowerCase().includes("high demand") || 
        cleanMsg.toLowerCase().includes("unavailable") || 
        cleanMsg.toLowerCase().includes("temporary");

      if (isTemporaryDemandError) {
        setErrorMsg("O servidor do Gemini está enfrentando alta demanda temporária (Erro 503). O plano local foi mantido automaticamente com a estrutura pedagógica de alto padrão da Escola de Comunicação UniBrasil!");
      } else {
        setErrorMsg(`Falha na chamada do Gemini: ${cleanMsg}. Mantendo o plano local de alto padrão.`);
      }
    } finally {
      setLoading(false);
    }
  };

  // Handlers for manual edits of plan fields
  const handleUpdateField = (field: keyof LessonPlanState, value: any) => {
    if (!planState) return;
    setPlanState({
      ...planState,
      [field]: value
    });
  };

  const handleUpdateBimestre = (bim: "bimestre1" | "bimestre2", field: "descricao" | "peso", value: string) => {
    if (!planState) return;
    setPlanState({
      ...planState,
      atividadesAvaliativas: {
        ...planState.atividadesAvaliativas,
        [bim]: {
          ...planState.atividadesAvaliativas[bim],
          [field]: value
        }
      }
    });
  };

  const handleUpdateAds = (bim: "bimestre1" | "bimestre2", value: string) => {
    if (!planState) return;
    setPlanState({
      ...planState,
      atividadesAds: {
        ...planState.atividadesAds,
        [bim]: value
      }
    });
  };

  const handleUpdateCronogramaWeek = (index: number, field: keyof WeekPlan, value: any) => {
    if (!planState) return;
    const updatedCronograma = [...planState.cronograma];
    updatedCronograma[index] = {
      ...updatedCronograma[index],
      [field]: value
    };
    setPlanState({
      ...planState,
      cronograma: updatedCronograma
    });
  };

  const handleAddWeek = () => {
    if (!planState) return;
    const newWeekNum = planState.cronograma.length + 1;
    setPlanState({
      ...planState,
      cronograma: [...planState.cronograma, { semana: newWeekNum, conteudo: "", atividades: "" }]
    });
  };

  const handleRemoveWeek = (index: number) => {
    if (!planState) return;
    const filtered = planState.cronograma.filter((_, i) => i !== index).map((w, idx) => ({
      ...w,
      semana: idx + 1 // Re-index week numbers
    }));
    setPlanState({
      ...planState,
      cronograma: filtered
    });
  };

  // Add items to list fields
  const handleAddObjEsp = () => {
    if (!planState || !newObjEsp.trim()) return;
    setPlanState({
      ...planState,
      objetivosEspecificos: [...planState.objetivosEspecificos, newObjEsp.trim()]
    });
    setNewObjEsp("");
  };

  const handleRemoveObjEsp = (idx: number) => {
    if (!planState) return;
    setPlanState({
      ...planState,
      objetivosEspecificos: planState.objetivosEspecificos.filter((_, i) => i !== idx)
    });
  };

  const handleAddCompetencia = () => {
    if (!planState || !newCompetencia.trim()) return;
    setPlanState({
      ...planState,
      competencias: [...planState.competencias, newCompetencia.trim()]
    });
    setNewCompetencia("");
  };

  const handleRemoveCompetencia = (idx: number) => {
    if (!planState) return;
    setPlanState({
      ...planState,
      competencias: planState.competencias.filter((_, i) => i !== idx)
    });
  };

  const handleAddRefBasica = () => {
    if (!planState || !newRefBas.trim()) return;
    setPlanState({
      ...planState,
      referenciasBasicas: [...planState.referenciasBasicas, newRefBas.trim()]
    });
    setNewRefBas("");
  };

  const handleRemoveRefBasica = (idx: number) => {
    if (!planState) return;
    setPlanState({
      ...planState,
      referenciasBasicas: planState.referenciasBasicas.filter((_, i) => i !== idx)
    });
  };

  const handleAddRefComplementar = () => {
    if (!planState || !newRefComp.trim()) return;
    setPlanState({
      ...planState,
      referenciasComplementares: [...planState.referenciasComplementares, newRefComp.trim()]
    });
    setNewRefComp("");
  };

  const handleRemoveRefComplementar = (idx: number) => {
    if (!planState) return;
    setPlanState({
      ...planState,
      referenciasComplementares: planState.referenciasComplementares.filter((_, i) => i !== idx)
    });
  };

  // Export to .docx using advanced HTML-to-Word schema mapping
  const handleExportDOCX = () => {
    if (!planState) return;

    const listToHtmlLi = (list: string[]) => {
      return list.map(item => `<li>${item}</li>`).join("");
    };

    const cronogramaToHtmlRows = (cron: WeekPlan[]) => {
      return cron.map(w => `
        <tr>
          <td style="width: 10%; text-align: center; font-weight: bold; font-family: Calibri, Arial;">Semana ${w.semana}</td>
          <td style="width: 50%; font-family: Calibri, Arial;">${w.conteudo || "A definir"}</td>
          <td style="width: 40%; font-family: Calibri, Arial;">${w.atividades || "Atividades práticas sugeridas"}</td>
        </tr>
      `).join("");
    };

    const docxHtml = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="utf-8">
        <title>Plano de Ensino e Aula - ${planState.disciplina}</title>
        <style>
          @page {
            size: 21cm 29.7cm; /* A4 size */
            margin: 2.5cm 2.5cm 2.5cm 2.5cm;
          }
          body {
            font-family: 'Calibri', 'Arial', sans-serif;
            font-size: 11pt;
            line-height: 1.4;
            color: #111827;
          }
          .title {
            font-size: 16pt;
            text-align: center;
            font-weight: bold;
            color: #1e3a8a;
            text-transform: uppercase;
            margin-bottom: 25px;
            border-bottom: 3px double #3b82f6;
            padding-bottom: 8px;
          }
          .institution {
            font-size: 12pt;
            text-align: center;
            font-weight: bold;
            color: #0f172a;
            margin-bottom: 3px;
          }
          .department {
            font-size: 10pt;
            text-align: center;
            color: #475569;
            margin-bottom: 20px;
          }
          .section-title {
            font-size: 12pt;
            font-weight: bold;
            color: #1e3a8a;
            border-bottom: 1.5px solid #1e3a8a;
            margin-top: 25px;
            margin-bottom: 10px;
            padding-bottom: 3px;
            text-transform: uppercase;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
            font-size: 10pt;
          }
          table, th, td {
            border: 1px solid #64748b;
          }
          th, td {
            padding: 8px;
            text-align: left;
            vertical-align: top;
          }
          th {
            background-color: #f1f5f9;
            font-weight: bold;
            color: #0f172a;
            text-transform: uppercase;
            font-size: 9.5pt;
          }
          .meta-table td {
            padding: 6px 10px;
          }
          .meta-label {
            font-weight: bold;
            background-color: #f8fafc;
            width: 25%;
          }
          ul {
            margin-top: 5px;
            margin-bottom: 5px;
            padding-left: 20px;
          }
          li {
            margin-bottom: 5px;
          }
          .signature-box {
            margin-top: 50px;
            width: 100%;
          }
          .signature-box td {
            border: none;
            text-align: center;
            padding-top: 40px;
            font-size: 10pt;
          }
          .signature-line {
            border-top: 1px solid #111827;
            width: 80%;
            margin: 0 auto 5px auto;
          }
        </style>
      </head>
      <body>
        <div class="institution">UNIBRASIL CENTRO UNIVERSITÁRIO</div>
        <div class="department">ESCOLA DE COMUNICAÇÃO SOCIAL — CURSO DE PUBLICIDADE E PROPAGANDA</div>
        
        <div class="title">Plano de Ensino e Cronograma de Aula (2026/2)</div>

        <div class="section-title">1. Dados de Identificação</div>
        <table>
          <tr>
            <td class="meta-label">Disciplina:</td>
            <td><strong>${planState.disciplina}</strong></td>
            <td class="meta-label">Código:</td>
            <td><strong>${planState.coddisc}</strong></td>
          </tr>
          <tr>
            <td class="meta-label">Professor(a):</td>
            <td>${planState.professor}</td>
            <td class="meta-label">Período/Turma:</td>
            <td>${planState.periodo}</td>
          </tr>
          <tr>
            <td class="meta-label">Carga Horária Total:</td>
            <td>${planState.chTotal}h (Teórica: ${planState.chTeo}h | Prática: ${planState.chPra}h | Ext: ${planState.chExt}h | Ead: ${planState.chEad}h)</td>
            <td class="meta-label">Créditos:</td>
            <td>${planState.creditos}</td>
          </tr>
        </table>

        <div class="section-title">2. Ementa (Matriz PPC)</div>
        <p style="text-align: justify; background-color: #f8fafc; padding: 10px; border: 1px solid #cbd5e1;">${planState.ementa}</p>

        <div class="section-title">3. Objetivos do Componente Curricular</div>
        <p><strong>Objetivo Geral:</strong><br/>${planState.objetivoGeral}</p>
        <p><strong>Objetivos Específicos:</strong></p>
        <ul>
          ${listToHtmlLi(planState.objetivosEspecificos)}
        </ul>

        <div class="section-title">4. Encaminhamento Metodológico</div>
        <p style="text-align: justify;">${planState.metodologia}</p>

        <div class="section-title">5. Atividades de Avaliação de Desempenho</div>
        <table>
          <thead>
            <tr>
              <th style="width: 15%;">Bimestre</th>
              <th style="width: 60%;">Descrição da Atividade Avaliativa Sugerida</th>
              <th style="width: 25%;">Peso Acadêmico</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="font-weight: bold; text-align: center;">1º Bimestre</td>
              <td>${planState.atividadesAvaliativas.bimestre1.descricao}</td>
              <td style="text-align: center;">${planState.atividadesAvaliativas.bimestre1.peso}</td>
            </tr>
            <tr>
              <td style="font-weight: bold; text-align: center;">2º Bimestre</td>
              <td>${planState.atividadesAvaliativas.bimestre2.descricao}</td>
              <td style="text-align: center;">${planState.atividadesAvaliativas.bimestre2.peso}</td>
            </tr>
          </tbody>
        </table>

        <div class="section-title">6. Cronograma Semanal (2026/2)</div>
        <table>
          <thead>
            <tr>
              <th style="width: 12%; text-align: center;">Semana</th>
              <th style="width: 53%;">Conteúdo Programático Planejado</th>
              <th style="width: 35%;">Atividades e Estratégias Metodológicas</th>
            </tr>
          </thead>
          <tbody>
            ${cronogramaToHtmlRows(planState.cronograma)}
          </tbody>
        </table>

        <div class="section-title">7. Referências Bibliográficas</div>
        <p><strong>Referências Básicas:</strong></p>
        <ul>
          ${listToHtmlLi(planState.referenciasBasicas)}
        </ul>
        <p><strong>Referências Complementares:</strong></p>
        <ul>
          ${listToHtmlLi(planState.referenciasComplementares)}
        </ul>

        <table class="signature-box">
          <tr>
            <td>
              <div class="signature-line"></div>
              <strong>Prof(a). ${planState.professor}</strong><br/>
              Professor(a) Responsável
            </td>
            <td>
              <div class="signature-line"></div>
              <strong>Prof. Lucas Damasio</strong><br/>
              Coordenador de Publicidade e Propaganda
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    // Package as Word-readable blob
    const blob = new Blob(["\ufeff" + docxHtml], { type: "application/msword" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Plano_de_Aula_${planState.disciplina.replace(/\s+/g, "_")}_2026_2.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    setSuccessMsg("Documento .docx (.doc) do Plano de Aula gerado e baixado com sucesso!");
  };

  return (
    <div className="space-y-6">
      
      {/* Upper Control Card */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-5 no-print">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-sm font-sans font-extrabold text-slate-800 flex items-center gap-1.5 uppercase tracking-wide">
              <Calendar className="w-4.5 h-4.5 text-amber-500" />
              <span>Gerador de Planos de Aula</span>
            </h3>
            <p className="text-xs text-slate-500">
              Cruze as alocações da grade de horários (2026/2) com as ementas oficiais do PPC para confeccionar planos de ensino e cronogramas completos de aula.
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <label className="text-xs font-mono font-bold text-slate-500 uppercase shrink-0">Selecionar Disciplina:</label>
            <select
              value={selectedKey}
              onChange={handleSelectChange}
              className="px-3 py-1.5 border border-slate-300 rounded-lg bg-white text-xs font-medium text-slate-700 focus:ring-2 focus:ring-amber-400 focus:outline-hidden min-w-[280px]"
            >
              {allocatedDisciplines.map(d => (
                <option key={`${d.coddisc}-${d.professor}`} value={`${d.coddisc}-${d.professor}`}>
                  {d.disciplina} ({d.turma} - {d.professor.split(" ")[0]})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex flex-wrap items-center gap-3 mt-4 pt-4 border-t border-slate-100">
          <button
            onClick={handleGenerateWithAI}
            disabled={loading}
            className="flex items-center gap-1.5 bg-gradient-to-r from-blue-700 to-indigo-800 hover:from-blue-800 hover:to-indigo-900 text-white text-xs font-bold px-4 py-2 rounded-lg shadow-sm hover:shadow-xs transition-all disabled:opacity-50 cursor-pointer"
          >
            <Sparkles className={`w-4 h-4 text-amber-300 ${loading ? "animate-spin" : ""}`} />
            <span>{loading ? "Processando pelo Gemini..." : "Gerar com IA (Gemini)"}</span>
          </button>
          
          <button
            onClick={() => setIsEditMode(!isEditMode)}
            className="flex items-center gap-1.5 border border-slate-300 hover:bg-slate-50 text-slate-600 text-xs font-bold px-3 py-2 rounded-lg transition-colors cursor-pointer"
          >
            <Edit3 className="w-4 h-4 text-slate-500" />
            <span>{isEditMode ? "Ver Modo de Visualização" : "Editar Plano de Aula"}</span>
          </button>

          <button
            onClick={handleExportDOCX}
            className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold px-4 py-2 rounded-lg shadow-xs hover:shadow-2xs transition-colors ml-auto cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Baixar Plano (.docx)</span>
          </button>
        </div>

        {/* Status Indicators */}
        {errorMsg && (
          <div className="flex items-start gap-2 text-xs bg-rose-50 text-rose-800 border border-rose-100 p-3 rounded-lg mt-4 animate-fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
            <div>
              <p className="font-semibold">Aviso Pedagógico</p>
              <p>{errorMsg}</p>
            </div>
          </div>
        )}

        {successMsg && (
          <div className="flex items-start gap-2 text-xs bg-emerald-50 text-emerald-800 border border-emerald-100 p-3 rounded-lg mt-4 animate-fade-in">
            <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
            <p className="font-semibold">{successMsg}</p>
          </div>
        )}
      </div>

      {/* Main Content Layout (Editor / Document) */}
      {planState && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
          
          {/* Edit Mode Panel (Shown if isEditMode is true) */}
          {isEditMode ? (
            <div className="xl:col-span-1 bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-5 no-print max-h-[85vh] overflow-y-auto">
              <h4 className="text-xs font-bold font-mono text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <Edit3 className="w-4 h-4 text-amber-500" />
                <span>Painel de Edição Ativa</span>
              </h4>

              {/* Basic Fields */}
              <div className="space-y-3 pt-2">
                <div>
                  <label className="block text-[10px] font-mono font-bold text-slate-500 uppercase mb-1">Nome da Disciplina</label>
                  <input
                    type="text"
                    value={planState.disciplina}
                    onChange={(e) => handleUpdateField("disciplina", e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-mono font-bold text-slate-500 uppercase mb-1">Código</label>
                    <input
                      type="text"
                      value={planState.coddisc}
                      onChange={(e) => handleUpdateField("coddisc", e.target.value)}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono font-bold text-slate-500 uppercase mb-1">Turma</label>
                    <input
                      type="text"
                      value={planState.turma}
                      onChange={(e) => handleUpdateField("turma", e.target.value)}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-mono font-bold text-slate-500 uppercase mb-1">Professor(a) Responsável</label>
                  <input
                    type="text"
                    value={planState.professor}
                    onChange={(e) => handleUpdateField("professor", e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono font-bold text-slate-500 uppercase mb-1">Ementa do PPC (Syllabus)</label>
                  <textarea
                    rows={4}
                    value={planState.ementa}
                    onChange={(e) => handleUpdateField("ementa", e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-sans leading-relaxed"
                  />
                </div>
              </div>

              {/* Objectives */}
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <div>
                  <label className="block text-[10px] font-mono font-bold text-slate-500 uppercase mb-1">Objetivo Geral</label>
                  <textarea
                    rows={2}
                    value={planState.objetivoGeral}
                    onChange={(e) => handleUpdateField("objetivoGeral", e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono font-bold text-slate-500 uppercase mb-1">Objetivos Específicos</label>
                  <div className="space-y-1.5 max-h-32 overflow-y-auto mb-2 border border-slate-100 p-2 rounded-lg bg-slate-50/50">
                    {planState.objetivosEspecificos.map((obj, i) => (
                      <div key={i} className="flex items-center justify-between gap-1 bg-white p-1.5 rounded-md border border-slate-200 text-[11px] text-slate-600">
                        <span className="truncate flex-1">{obj}</span>
                        <button
                          onClick={() => handleRemoveObjEsp(i)}
                          className="text-rose-500 hover:text-rose-700 p-0.5"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-1">
                    <input
                      type="text"
                      placeholder="Adicionar novo objetivo..."
                      value={newObjEsp}
                      onChange={(e) => setNewObjEsp(e.target.value)}
                      className="flex-1 px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs"
                    />
                    <button
                      onClick={handleAddObjEsp}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 rounded-lg border border-slate-300 flex items-center"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Competencias section */}
                <div className="pt-3 border-t border-slate-100">
                  <label className="block text-[10px] font-mono font-bold text-slate-500 uppercase mb-1">Competências Profissionais</label>
                  <div className="space-y-1.5 max-h-32 overflow-y-auto mb-2 border border-slate-100 p-2 rounded-lg bg-slate-50/50">
                    {(planState.competencias || []).map((comp, i) => (
                      <div key={i} className="flex items-center justify-between gap-1 bg-white p-1.5 rounded-md border border-slate-200 text-[11px] text-slate-600">
                        <span className="truncate flex-1">{comp}</span>
                        <button
                          onClick={() => handleRemoveCompetencia(i)}
                          className="text-rose-500 hover:text-rose-700 p-0.5"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                    {(planState.competencias || []).length === 0 && (
                      <span className="text-[11px] text-slate-400 italic p-1 block">Nenhuma competência adicionada</span>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <input
                      type="text"
                      placeholder="Adicionar nova competência..."
                      value={newCompetencia}
                      onChange={(e) => setNewCompetencia(e.target.value)}
                      className="flex-1 px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs"
                    />
                    <button
                      onClick={handleAddCompetencia}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 rounded-lg border border-slate-300 flex items-center"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Methodology */}
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <div>
                  <label className="block text-[10px] font-mono font-bold text-slate-500 uppercase mb-1">Metodologia e Recursos</label>
                  <textarea
                    rows={3}
                    value={planState.metodologia}
                    onChange={(e) => handleUpdateField("metodologia", e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono font-bold text-slate-500 uppercase mb-1">Atividades Dirigidas e Práticas (Discentes)</label>
                  <textarea
                    rows={3}
                    value={planState.atividadesDiscentes || ""}
                    onChange={(e) => handleUpdateField("atividadesDiscentes", e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
                    placeholder="Descrição das atividades desenvolvidas pelos alunos..."
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono font-bold text-slate-500 uppercase mb-1">Procedimentos de Avaliação</label>
                  <textarea
                    rows={3}
                    value={planState.procedimentosAvaliacao || ""}
                    onChange={(e) => handleUpdateField("procedimentosAvaliacao", e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
                    placeholder="Procedimentos e critérios institucionais..."
                  />
                </div>

                {/* ADS Section inside edit panel */}
                <div className="p-3 bg-amber-50/50 border border-amber-200/60 rounded-lg space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-amber-800 uppercase">Atividade Discente Supervisionada (ADS)</span>
                    <span className="text-[9px] font-mono bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-sm font-bold">chADS: {planState.chAds}h</span>
                  </div>
                  <div>
                    <label className="block text-[9px] font-mono font-semibold text-slate-500 uppercase mb-0.5">ADS - 1º Bimestre</label>
                    <textarea
                      rows={2}
                      value={planState.atividadesAds?.bimestre1 || ""}
                      onChange={(e) => handleUpdateAds("bimestre1", e.target.value)}
                      className="w-full px-2 py-1 border border-slate-300 rounded-md text-xs bg-white"
                      placeholder="Atividades supervisionadas do 1B..."
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-mono font-semibold text-slate-500 uppercase mb-0.5">ADS - 2º Bimestre</label>
                    <textarea
                      rows={2}
                      value={planState.atividadesAds?.bimestre2 || ""}
                      onChange={(e) => handleUpdateAds("bimestre2", e.target.value)}
                      className="w-full px-2 py-1 border border-slate-300 rounded-md text-xs bg-white"
                      placeholder="Atividades supervisionadas do 2B..."
                    />
                  </div>
                </div>
              </div>

              {/* Evaluation */}
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <h5 className="text-[10px] font-mono font-bold text-slate-500 uppercase">Avaliação de Desempenho</h5>
                
                <div className="p-3 bg-blue-50/30 border border-blue-100/50 rounded-lg space-y-2">
                  <span className="text-[10px] font-bold text-blue-900 uppercase">1º Bimestre</span>
                  <textarea
                    rows={2}
                    placeholder="Descrição da Atividade"
                    value={planState.atividadesAvaliativas.bimestre1.descricao}
                    onChange={(e) => handleUpdateBimestre("bimestre1", "descricao", e.target.value)}
                    className="w-full px-2 py-1 border border-slate-300 rounded-md text-xs bg-white"
                  />
                  <input
                    type="text"
                    placeholder="Distribuição de pesos (ex: 4.0 Prova / 6.0 Prática)"
                    value={planState.atividadesAvaliativas.bimestre1.peso}
                    onChange={(e) => handleUpdateBimestre("bimestre1", "peso", e.target.value)}
                    className="w-full px-2 py-1 border border-slate-300 rounded-md text-xs bg-white"
                  />
                </div>

                <div className="p-3 bg-blue-50/30 border border-blue-100/50 rounded-lg space-y-2">
                  <span className="text-[10px] font-bold text-blue-900 uppercase">2º Bimestre</span>
                  <textarea
                    rows={2}
                    placeholder="Descrição da Atividade"
                    value={planState.atividadesAvaliativas.bimestre2.descricao}
                    onChange={(e) => handleUpdateBimestre("bimestre2", "descricao", e.target.value)}
                    className="w-full px-2 py-1 border border-slate-300 rounded-md text-xs bg-white"
                  />
                  <input
                    type="text"
                    placeholder="Distribuição de pesos"
                    value={planState.atividadesAvaliativas.bimestre2.peso}
                    onChange={(e) => handleUpdateBimestre("bimestre2", "peso", e.target.value)}
                    className="w-full px-2 py-1 border border-slate-300 rounded-md text-xs bg-white"
                  />
                </div>
              </div>

              {/* References */}
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <h5 className="text-[10px] font-mono font-bold text-slate-500 uppercase">Referências Bibliográficas</h5>
                
                {/* Basicas */}
                <div>
                  <span className="text-[10px] font-bold text-slate-600 uppercase block mb-1">Básicas</span>
                  <div className="space-y-1 max-h-24 overflow-y-auto mb-1 border border-slate-100 p-1.5 rounded-lg bg-slate-50/50">
                    {planState.referenciasBasicas.map((ref, i) => (
                      <div key={i} className="flex items-center justify-between gap-1 bg-white p-1 rounded border border-slate-200 text-[10px]">
                        <span className="truncate flex-1">{ref}</span>
                        <button onClick={() => handleRemoveRefBasica(i)} className="text-rose-500 hover:text-rose-700 p-0.5">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-1">
                    <input
                      type="text"
                      placeholder="Adicionar referência básica..."
                      value={newRefBas}
                      onChange={(e) => setNewRefBas(e.target.value)}
                      className="flex-1 px-2 py-1 border border-slate-300 rounded-md text-xs"
                    />
                    <button onClick={handleAddRefBasica} className="bg-slate-100 hover:bg-slate-200 px-2 rounded-md border border-slate-300">
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Complementares */}
                <div>
                  <span className="text-[10px] font-bold text-slate-600 uppercase block mb-1">Complementares</span>
                  <div className="space-y-1 max-h-24 overflow-y-auto mb-1 border border-slate-100 p-1.5 rounded-lg bg-slate-50/50">
                    {planState.referenciasComplementares.map((ref, i) => (
                      <div key={i} className="flex items-center justify-between gap-1 bg-white p-1 rounded border border-slate-200 text-[10px]">
                        <span className="truncate flex-1">{ref}</span>
                        <button onClick={() => handleRemoveRefComplementar(i)} className="text-rose-500 hover:text-rose-700 p-0.5">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-1">
                    <input
                      type="text"
                      placeholder="Adicionar referência complementar..."
                      value={newRefComp}
                      onChange={(e) => setNewRefComp(e.target.value)}
                      className="flex-1 px-2 py-1 border border-slate-300 rounded-md text-xs"
                    />
                    <button onClick={handleAddRefComplementar} className="bg-slate-100 hover:bg-slate-200 px-2 rounded-md border border-slate-300">
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Sugestoes de Leitura */}
                <div className="pt-2 border-t border-slate-100">
                  <label className="block text-[10px] font-mono font-bold text-slate-500 uppercase mb-1">Sugestões de Leitura Complementar</label>
                  <textarea
                    rows={2}
                    value={planState.sugestoesLeitura || ""}
                    onChange={(e) => handleUpdateField("sugestoesLeitura", e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
                    placeholder="Artigos, portais, blogs de publicidade..."
                  />
                </div>
              </div>
            </div>
          ) : (
            // Sidebar Quick Info in normal view mode
            <div className="xl:col-span-1 bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4 no-print">
              <h4 className="text-xs font-bold font-mono text-slate-500 uppercase tracking-wider">
                Resumo Acadêmico da Grade
              </h4>
              <div className="p-4 bg-slate-50 rounded-xl space-y-3.5 border border-slate-100">
                <div className="flex gap-3">
                  <div className="p-2 bg-amber-100 text-amber-700 rounded-lg self-start">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Distribuição de Horário</h5>
                    <p className="text-xs font-bold text-slate-700">Carga Horária: {planState.chTotal} horas-relógio</p>
                    <p className="text-[11px] text-slate-500 leading-relaxed mt-0.5">
                      Teórica: <strong>{planState.chTeo}h</strong> | Prática: <strong>{planState.chPra}h</strong>
                      {planState.chExt > 0 && ` | Extensão: ${planState.chExt}h`}
                      {planState.chEad > 0 && ` | EAD: ${planState.chEad}h`}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="p-2 bg-blue-100 text-blue-700 rounded-lg self-start">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Professor Vinculado</h5>
                    <p className="text-xs font-bold text-slate-700">{planState.professor}</p>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">CÓD: {planState.coddisc}</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="p-2 bg-indigo-100 text-indigo-700 rounded-lg self-start">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">PPC Matriz Curricular</h5>
                    <p className="text-xs font-bold text-slate-700">{planState.turma} - Comunicação Social</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">Créditos Acadêmicos: {planState.creditos}</p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-amber-50/50 border border-amber-100 rounded-xl space-y-2 text-xs text-slate-600">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Sparkles className="w-4.5 h-4.5 text-amber-500 animate-pulse" />
                  Assistente de Ensino UniBrasil
                </span>
                <p className="leading-relaxed text-[11px]">
                  Ao clicar em <strong>"Gerar com IA"</strong>, o Gemini analisará a ementa de <em>{planState.disciplina}</em> para estruturar objetivos específicos, dinâmicas de estúdio/laboratório e um plano de 20 semanas alinhado aos padrões da nossa Escola de Comunicação.
                </p>
              </div>
            </div>
          )}

          {/* Main Document Preview Pane (A4 Page style) */}
          <div className="xl:col-span-2 space-y-6">
            
            {/* The Document Sheet */}
            <div className="bg-white rounded-xl shadow-md border border-slate-200 p-8 sm:p-12 font-sans text-slate-900 leading-relaxed max-w-full overflow-hidden relative">
              
              {/* Institutional Header with Logo */}
              <div className="border-b-4 border-blue-900 pb-5 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  {/* Styled UniBrasil emblem representation */}
                  <div className="w-12 h-12 bg-blue-900 text-white flex items-center justify-center rounded-lg font-black text-xl tracking-wider shadow-sm select-none">
                    UB
                  </div>
                  <div>
                    <h1 className="text-sm font-sans font-black tracking-wider text-blue-900 uppercase">UniBrasil Centro Universitário</h1>
                    <p className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest">Escola de Comunicação Social | Publicidade e Propaganda</p>
                  </div>
                </div>
                <div className="text-center sm:text-right">
                  <span className="inline-block text-[10px] font-mono font-bold bg-amber-500 text-slate-950 px-2.5 py-1 rounded-md uppercase tracking-wider shadow-xs">
                    PPC INSTITUCIONAL
                  </span>
                  <p className="text-[9px] font-mono font-bold text-slate-400 mt-1 uppercase">Vigência: 2026/2</p>
                </div>
              </div>

              {/* Document Title */}
              <div className="text-center my-6">
                <h2 className="text-lg sm:text-xl font-sans font-black text-slate-900 uppercase tracking-wide">
                  Plano de Ensino, Aprendizagem e Cronograma Semanal
                </h2>
                <p className="text-xs font-mono text-slate-500 mt-1">Padrão Institucional do Colegiado de Curso</p>
              </div>

              {/* SECTION I: IDENTIFICAÇÃO */}
              <div className="my-6">
                <h3 className="text-xs font-mono font-bold text-blue-900 uppercase tracking-widest border-b-2 border-blue-900 pb-1 mb-3 flex items-center gap-1">
                  <span className="bg-blue-900 text-white px-1.5 py-0.5 rounded-xs text-[10px]">I</span>
                  <span>Identificação Geral</span>
                </h3>
                <div className="border border-slate-300 rounded-lg overflow-hidden">
                  <div className="grid grid-cols-1 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-300 text-xs bg-slate-50/40">
                    <div className="p-3 sm:col-span-3">
                      <span className="text-slate-400 block font-mono text-[9px] uppercase">Disciplina</span>
                      <strong className="text-slate-800 text-[13px]">{planState.disciplina}</strong>
                    </div>
                    <div className="p-3">
                      <span className="text-slate-400 block font-mono text-[9px] uppercase">Código</span>
                      <strong className="text-slate-800 font-mono text-[13px]">{planState.coddisc}</strong>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-slate-300 border-t border-slate-300 text-xs bg-slate-50/40">
                    <div className="p-3">
                      <span className="text-slate-400 block font-mono text-[9px] uppercase">Professor(a) Responsável</span>
                      <strong className="text-slate-700 font-medium">{planState.professor}</strong>
                    </div>
                    <div className="p-3">
                      <span className="text-slate-400 block font-mono text-[9px] uppercase">Período / Turma / Curso</span>
                      <strong className="text-slate-700 font-medium">{planState.periodo} - Publicidade e Propaganda</strong>
                    </div>
                  </div>
                  <div className="p-3 border-t border-slate-300 text-xs bg-slate-50/40 space-y-1">
                    <span className="text-slate-400 block font-mono text-[9px] uppercase">Distribuição Detalhada de Carga Horária (Matriz PPC)</span>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-[11px] font-mono text-slate-700">
                      <div>Teórica: <strong className="text-blue-900">{planState.chTeo}h</strong></div>
                      <div>Prática: <strong className="text-blue-900">{planState.chPra}h</strong></div>
                      <div>Ativ. Extensão: <strong className="text-blue-900">{planState.chExt || 0}h</strong></div>
                      <div>EAD: <strong className="text-blue-900">{planState.chEad || 0}h</strong></div>
                      <div>ADS: <strong className="text-amber-600">{planState.chAds || 0}h</strong></div>
                    </div>
                    <div className="pt-1 text-[11px] border-t border-dashed border-slate-200 mt-1 flex justify-between">
                      <span>Carga Horária Total: <strong>{planState.chTotal} horas-relógio</strong></span>
                      <span>Créditos: <strong>{planState.creditos}</strong></span>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION II: EMENTA */}
              <div className="my-6">
                <h3 className="text-xs font-mono font-bold text-blue-900 uppercase tracking-widest border-b-2 border-blue-900 pb-1 mb-3 flex items-center gap-1">
                  <span className="bg-blue-900 text-white px-1.5 py-0.5 rounded-xs text-[10px]">II</span>
                  <span>Ementa Curricular</span>
                </h3>
                <p className="text-[11px] leading-relaxed text-slate-700 bg-slate-50 p-4 rounded-lg border border-slate-200 text-justify">
                  {planState.ementa}
                </p>
              </div>

              {/* SECTION III: COMPETÊNCIAS E OBJETIVOS */}
              <div className="my-6 space-y-4">
                <h3 className="text-xs font-mono font-bold text-blue-900 uppercase tracking-widest border-b-2 border-blue-900 pb-1 mb-3 flex items-center gap-1">
                  <span className="bg-blue-900 text-white px-1.5 py-0.5 rounded-xs text-[10px]">III</span>
                  <span>Competências e Objetivos de Aprendizagem</span>
                </h3>
                
                <div className="space-y-3.5 text-xs">
                  {planState.competencias && planState.competencias.length > 0 && (
                    <div>
                      <h4 className="font-sans font-extrabold text-blue-950 uppercase text-[10px] tracking-wider mb-1.5">Competências Desenvolvidas</h4>
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 list-disc list-inside text-slate-700">
                        {planState.competencias.map((comp, i) => (
                          <li key={i} className="leading-relaxed text-justify">{comp}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div>
                    <h4 className="font-sans font-extrabold text-blue-950 uppercase text-[10px] tracking-wider mb-1">Objetivo Geral</h4>
                    <p className="text-slate-700 text-justify leading-relaxed bg-slate-50/40 p-3 rounded-lg border border-slate-200/50">{planState.objetivoGeral}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-sans font-extrabold text-blue-950 uppercase text-[10px] tracking-wider mb-1.5">Objetivos Específicos</h4>
                    <ul className="list-disc list-inside space-y-1 pl-1 text-slate-700 text-justify">
                      {planState.objetivosEspecificos.map((obj, i) => (
                        <li key={i} className="leading-relaxed">{obj}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* SECTION IV: ENCAMINHAMENTO METODOLÓGICO */}
              <div className="my-6">
                <h3 className="text-xs font-mono font-bold text-blue-900 uppercase tracking-widest border-b-2 border-blue-900 pb-1 mb-3 flex items-center gap-1">
                  <span className="bg-blue-900 text-white px-1.5 py-0.5 rounded-xs text-[10px]">IV</span>
                  <span>Encaminhamento Metodológico</span>
                </h3>
                <div className="space-y-3 text-xs text-slate-700 text-justify">
                  <div>
                    <h4 className="font-sans font-extrabold text-blue-950 uppercase text-[10px] tracking-wider mb-1">Estratégia e Recursos Didáticos</h4>
                    <p className="leading-relaxed whitespace-pre-line bg-slate-50/40 p-3 rounded-lg border border-slate-200/50">{planState.metodologia}</p>
                  </div>
                  {planState.atividadesDiscentes && (
                    <div>
                      <h4 className="font-sans font-extrabold text-blue-950 uppercase text-[10px] tracking-wider mb-1">Atividades Dirigidas e Práticas (Discentes)</h4>
                      <p className="leading-relaxed whitespace-pre-line bg-slate-50/40 p-3 rounded-lg border border-slate-200/50">{planState.atividadesDiscentes}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* SECTION V: ADS */}
              <div className="my-6">
                <h3 className="text-xs font-mono font-bold text-blue-900 uppercase tracking-widest border-b-2 border-blue-900 pb-1 mb-3 flex items-center gap-1">
                  <span className="bg-blue-900 text-white px-1.5 py-0.5 rounded-xs text-[10px]">V</span>
                  <span>Atividade Discente Supervisionada — ADS</span>
                </h3>
                <div className="text-xs bg-slate-50 border border-slate-200 p-4 rounded-lg space-y-3 text-justify">
                  <div className="flex justify-between items-center border-b border-slate-200 pb-1.5">
                    <span className="font-sans font-bold text-slate-800 text-[11px]">Planejamento de Atividades de ADS</span>
                    <span className="font-mono text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-md">Carga Horária de ADS: {planState.chAds}h</span>
                  </div>
                  {planState.chAds > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <strong className="text-blue-900 text-[10px] uppercase block tracking-wider">ADS - 1º Bimestre</strong>
                        <p className="text-slate-600 leading-relaxed text-[11px]">{planState.atividadesAds?.bimestre1 || "Atividades dirigidas supervisionadas."}</p>
                      </div>
                      <div className="space-y-1 border-t md:border-t-0 md:border-l border-slate-200 pt-3 md:pt-0 md:pl-4">
                        <strong className="text-blue-900 text-[10px] uppercase block tracking-wider">ADS - 2º Bimestre</strong>
                        <p className="text-slate-600 leading-relaxed text-[11px]">{planState.atividadesAds?.bimestre2 || "Atividades dirigidas supervisionadas."}</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-slate-500 text-center italic text-[11px] py-1">
                      ADS não prevista no PPC oficial para esta disciplina (Carga horária: 0h).
                    </p>
                  )}
                </div>
              </div>

              {/* SECTION VI: PROCEDIMENTOS DE AVALIAÇÃO */}
              {planState.procedimentosAvaliacao && (
                <div className="my-6">
                  <h3 className="text-xs font-mono font-bold text-blue-900 uppercase tracking-widest border-b-2 border-blue-900 pb-1 mb-3 flex items-center gap-1">
                    <span className="bg-blue-900 text-white px-1.5 py-0.5 rounded-xs text-[10px]">VI</span>
                    <span>Procedimentos de Avaliação</span>
                  </h3>
                  <p className="text-xs text-slate-700 text-justify leading-relaxed bg-slate-50/40 p-3 rounded-lg border border-slate-200/50 whitespace-pre-line">
                    {planState.procedimentosAvaliacao}
                  </p>
                </div>
              )}

              {/* SECTION VII: SISTEMA DE AVALIAÇÃO DE DESEMPENHO */}
              <div className="my-6">
                <h3 className="text-xs font-mono font-bold text-blue-900 uppercase tracking-widest border-b-2 border-blue-900 pb-1 mb-3 flex items-center gap-1">
                  <span className="bg-blue-900 text-white px-1.5 py-0.5 rounded-xs text-[10px]">VII</span>
                  <span>Sistema de Avaliação de Desempenho</span>
                </h3>
                
                <div className="border border-slate-300 rounded-lg overflow-hidden text-xs">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-blue-900 text-white font-mono text-[9px] uppercase tracking-wider">
                        <th className="py-2.5 px-4 font-semibold text-center border-r border-blue-800 w-28">Bimestre</th>
                        <th className="py-2.5 px-4 font-semibold text-left border-r border-blue-800">Descrição Detalhada do Instrumento de Avaliação</th>
                        <th className="py-2.5 px-4 font-semibold text-center w-40">Critério de Peso</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-300">
                      <tr className="hover:bg-slate-50/30 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-center border-r border-slate-300 text-slate-800 bg-slate-50/20">1º Bimestre</td>
                        <td className="py-3.5 px-4 text-slate-700 text-justify leading-relaxed">{planState.atividadesAvaliativas.bimestre1.descricao}</td>
                        <td className="py-3.5 px-4 text-center font-mono font-bold text-blue-900 bg-slate-50/10">{planState.atividadesAvaliativas.bimestre1.peso}</td>
                      </tr>
                      <tr className="hover:bg-slate-50/30 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-center border-r border-slate-300 text-slate-800 bg-slate-50/20">2º Bimestre</td>
                        <td className="py-3.5 px-4 text-slate-700 text-justify leading-relaxed">{planState.atividadesAvaliativas.bimestre2.descricao}</td>
                        <td className="py-3.5 px-4 text-center font-mono font-bold text-blue-900 bg-slate-50/10">{planState.atividadesAvaliativas.bimestre2.peso}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* SECTION VIII: CRONOGRAMA DE ATIVIDADES */}
              <div className="my-6">
                <div className="flex items-center justify-between border-b-2 border-blue-900 pb-1 mb-3 no-print">
                  <h3 className="text-xs font-mono font-bold text-blue-900 uppercase tracking-widest flex items-center gap-1">
                    <span className="bg-blue-900 text-white px-1.5 py-0.5 rounded-xs text-[10px]">VIII</span>
                    <span>Cronograma de Aulas Semanal (20 Semanas)</span>
                  </h3>
                  {isEditMode && (
                    <button
                      onClick={handleAddWeek}
                      className="flex items-center gap-1 text-[10px] font-bold bg-blue-900 text-amber-400 px-2.5 py-1 rounded-md uppercase tracking-wider hover:bg-blue-950 cursor-pointer shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Adicionar Semana</span>
                    </button>
                  )}
                </div>
                
                {/* Printable header counterpart */}
                <h3 className="text-xs font-mono font-bold text-blue-900 uppercase tracking-widest border-b border-slate-100 pb-1 mb-3 print-only hidden">
                  08. Cronograma de Aulas Semanal (20 Semanas)
                </h3>

                <div className="border border-slate-300 rounded-lg overflow-hidden text-xs">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-blue-900 text-white font-mono text-[9px] uppercase tracking-wider">
                        <th className="py-2.5 px-3 font-semibold text-center border-r border-blue-800 w-20">Semana</th>
                        <th className="py-2.5 px-4 font-semibold text-left border-r border-blue-800">Conteúdo Programático Proposto</th>
                        <th className="py-2.5 px-4 font-semibold text-left w-1/3">Estratégia Metodológica e Atividade Prática</th>
                        {isEditMode && <th className="py-2.5 px-2 text-center w-12 no-print">Excluir</th>}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-300">
                      {planState.cronograma.map((w, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/30 transition-colors">
                          <td className="py-3 px-3 font-mono font-bold text-center border-r border-slate-300 text-slate-500 bg-slate-50/10">
                            Semana {w.semana}
                          </td>
                          <td className="py-2.5 px-4 text-slate-700 leading-relaxed">
                            {isEditMode ? (
                              <textarea
                                rows={2}
                                value={w.conteudo}
                                onChange={(e) => handleUpdateCronogramaWeek(idx, "conteudo", e.target.value)}
                                className="w-full border border-slate-200 rounded-md p-1 bg-white text-[11px]"
                              />
                            ) : (
                              w.conteudo || <span className="text-slate-400 italic">A definir</span>
                            )}
                          </td>
                          <td className="py-2.5 px-4 text-slate-600 leading-relaxed border-r border-slate-300">
                            {isEditMode ? (
                              <textarea
                                rows={2}
                                value={w.atividades}
                                onChange={(e) => handleUpdateCronogramaWeek(idx, "atividades", e.target.value)}
                                className="w-full border border-slate-200 rounded-md p-1 bg-white text-[11px]"
                              />
                            ) : (
                              w.atividades || <span className="text-slate-400 italic">A definir</span>
                            )}
                          </td>
                          {isEditMode && (
                            <td className="py-2.5 px-2 text-center no-print">
                              <button
                                onClick={() => handleRemoveWeek(idx)}
                                className="text-rose-500 hover:text-rose-700 p-1 rounded-md hover:bg-rose-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* SECTION IX: REFERENCIAS */}
              <div className="my-6">
                <h3 className="text-xs font-mono font-bold text-blue-900 uppercase tracking-widest border-b-2 border-blue-900 pb-1 mb-3 flex items-center gap-1">
                  <span className="bg-blue-900 text-white px-1.5 py-0.5 rounded-xs text-[10px]">IX</span>
                  <span>Referências Bibliográficas</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-sans font-extrabold text-blue-950 uppercase text-[10px] tracking-wider mb-2">Referências Básicas</h4>
                    <ul className="list-decimal list-inside space-y-1.5 text-xs text-slate-700 text-justify">
                      {planState.referenciasBasicas.map((ref, i) => (
                        <li key={i} className="leading-relaxed">{ref}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-sans font-extrabold text-blue-950 uppercase text-[10px] tracking-wider mb-2">Referências Complementares</h4>
                    <ul className="list-decimal list-inside space-y-1.5 text-xs text-slate-700 text-justify">
                      {planState.referenciasComplementares.map((ref, i) => (
                        <li key={i} className="leading-relaxed">{ref}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* SECTION X: SUGESTÕES DE LEITURA */}
              {planState.sugestoesLeitura && (
                <div className="my-6">
                  <h3 className="text-xs font-mono font-bold text-blue-900 uppercase tracking-widest border-b-2 border-blue-900 pb-1 mb-3 flex items-center gap-1">
                    <span className="bg-blue-900 text-white px-1.5 py-0.5 rounded-xs text-[10px]">X</span>
                    <span>Sugestões de Leitura Complementar</span>
                  </h3>
                  <p className="text-xs text-slate-700 text-justify leading-relaxed bg-slate-50/40 p-3 rounded-lg border border-slate-200/50 whitespace-pre-line">
                    {planState.sugestoesLeitura}
                  </p>
                </div>
              )}

              {/* SIGNATURE SECTION */}
              <div className="mt-14 pt-8 border-t border-slate-300 grid grid-cols-2 gap-8 text-center text-xs text-slate-600">
                <div className="space-y-1">
                  <div className="mx-auto w-3/4 border-b border-slate-400 h-6"></div>
                  <strong className="text-slate-800">{planState.professor}</strong>
                  <p className="text-[10px] text-slate-400 uppercase font-mono tracking-wider">Professor(a) Responsável</p>
                </div>
                <div className="space-y-1">
                  <div className="mx-auto w-3/4 border-b border-slate-400 h-6"></div>
                  <strong className="text-slate-800">Coordenador de Publicidade e Propaganda</strong>
                  <p className="text-[10px] text-slate-400 uppercase font-mono tracking-wider">Homologação da Coordenação</p>
                </div>
              </div>

            </div>
          </div>

        </div>
      )}

    </div>
  );
}
