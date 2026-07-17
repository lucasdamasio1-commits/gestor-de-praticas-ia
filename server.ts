import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Middleware for JSON parsing
app.use(express.json());

// Lazy-loaded GoogleGenAI client to avoid crash on startup if GEMINI_API_KEY is not set
let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("A chave GEMINI_API_KEY não foi configurada. Configure a chave nas configurações.");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// API endpoint for Gemini-powered actions
app.post("/api/gemini/generate", async (req, res) => {
  const { action, activityName, currentDescription, campaignDetails, category } = req.body;

  try {
    const ai = getAiClient();
    
    let prompt = "";
    let systemInstruction = "Você é um assessor acadêmico especialista no curso de Publicidade e Propaganda do UniBrasil. Responda em português formal e profissional, utilizando jargões de publicidade apropriados no Brasil (Criação, Redação, Mídia, Planejamento, Atendimento). Retorne estritamente um formato JSON estruturado.";

    if (action === "generateDescription") {
      prompt = `Crie uma descrição acadêmica e detalhada para a seguinte atividade do curso de Publicidade e Propaganda:
Atividade: "${activityName}"
Categoria: "${category || ''}"
Descrição Atual (se houver): "${currentDescription || ''}"

Seu objetivo é retornar um objeto JSON com:
- "descricao": Uma descrição formal, acadêmica e motivadora com cerca de 3 a 4 sentenças.
- "objetivos": Um array contendo 3 a 4 objetivos específicos da prática de publicidade no padrão UniBrasil.
- "competencias": Um array de 4 a 5 competências profissionais desenvolvidas com essa prática (ex: redação publicitária, planejamento de mídia, análise de métricas, direção de arte).
- "entregaveisSugeridos": Um array de 3 entregáveis práticos e profissionais que os alunos costumam entregar para validação.

Retorne APENAS o JSON no formato:
{
  "descricao": "string",
  "objetivos": ["string", "string"],
  "competencias": ["string", "string"],
  "entregaveisSugeridos": ["string", "string"]
}`;
    } else if (action === "suggestCampaign") {
      prompt = `Gere 3 ideias criativas de campanhas e projetos práticos que podem ser desenvolvidos na Agência Experimental ou Projeto Integrador para a atividade: "${activityName}".
Contexto de Publicidade e Propaganda na UniBrasil.

Seu objetivo é retornar um objeto JSON contendo um array de 3 objetos em "campanhas". Cada campanha deve conter:
- "titulo": Um nome criativo para o projeto/campanha.
- "cliente": Tipo de cliente fictício ou real (ex: ONG de Curitiba, microempresa local, campanha de conscientização interna, marca de vestuário sustentável).
- "desafio": O problema de comunicação a ser resolvido.
- "pecasSugeridas": Um array de 3 a 4 peças de publicidade que serão criadas (ex: postagem patrocinada para Instagram, spot de rádio, cartaz de guerrilha, roteiro de filme 30s).

Retorne APENAS o JSON no formato:
{
  "campanhas": [
    {
      "titulo": "string",
      "cliente": "string",
      "desafio": "string",
      "pecasSugeridas": ["string", "string"]
    }
  ]
}`;
    } else {
      return res.status(400).json({ error: "Ação não suportada" });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        temperature: 0.7,
      },
    });

    const responseText = response.text || "{}";
    const cleanedText = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
    const data = JSON.parse(cleanedText);
    
    return res.json({ success: true, data });
  } catch (error: any) {
    console.error("Erro no proxy Gemini:", error);
    
    // Fallback inteligente para quando o Gemini ou a API key falhar
    console.log("Acionando fallback inteligente...");
    const fallbackData = getFallbackData(action, activityName, category);
    return res.json({ success: false, data: fallbackData, isFallback: true, error: error.message });
  }
});

// Fallback intelligence to ensure robust application operation without API key
function getFallbackData(action: string, activityName: string, category: string) {
  if (action === "generateDescription") {
    return {
      descricao: `A atividade de ${activityName} no UniBrasil foca no desenvolvimento prático de competências cruciais de Publicidade e Propaganda. Os alunos são colocados à frente de desafios reais do mercado de comunicação, trabalhando em equipes multidisciplinares para simular o cotidiano de agências de publicidade e departamentos de marketing modernos.`,
      objetivos: [
        "Estimular o raciocínio estratégico e a criatividade em campanhas de comunicação.",
        "Proporcionar a vivência de rotinas profissionais em agências e produtoras.",
        "Desenvolver capacidades de pitch de venda de campanhas e atendimento ao cliente."
      ],
      competencias: [
        "Planejamento Estratégico de Comunicação",
        "Redação Publicitária e Direção de Arte",
        "Gestão de Mídias Sociais e Métricas Digitais",
        "Trabalho em Equipe e Atendimento"
      ],
      entregaveisSugeridos: [
        "Portfólio de Campanha Integrada",
        "Apresentação Executiva (Pitch)",
        "Relatório Analítico de Resultados"
      ]
    };
  } else if (action === "suggestCampaign") {
    return {
      campanhas: [
        {
          titulo: "Curitiba Sustentável",
          cliente: "ONG de Proteção Ambiental Local",
          desafio: "Engajar os jovens curitibanos no descarte correto de lixo eletrônico.",
          pecasSugeridas: [
            "Filtro interativo no Instagram",
            "Série de vídeos curtos para TikTok",
            "Pôsteres de lambe-lambe com QR Code espalhados pela cidade"
          ]
        },
        {
          titulo: "Sabor da Vizinhança",
          cliente: "Micro-panificadora artesanal de Curitiba",
          desafio: "Aumentar as vendas locais competindo com grandes redes de supermercados.",
          pecasSugeridas: [
            "Campanha de marketing de guerrilha na praça local",
            "Anúncios geolocalizados no Instagram",
            "Programa de indicação digital em landing page"
          ]
        },
        {
          titulo: "Conexão UniBrasil",
          cliente: "Coletivo de Cultura e Arte do Campus",
          desafio: "Atrair estudantes de outros cursos para as oficinas de teatro e música do UniBrasil.",
          pecasSugeridas: [
            "Spot de rádio interna",
            "Vídeo-teaser cinematográfico",
            "Cartazes lambe-lambe nos corredores acadêmicos"
          ]
        }
      ]
    };
  }
  return {};
}

// Vite static assets and dev mode handling
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    // For Express 4, app.get('*') handles all SPA routes
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[UniBrasil PP App] Servidor rodando em http://localhost:${PORT}`);
  });
}

startServer();
