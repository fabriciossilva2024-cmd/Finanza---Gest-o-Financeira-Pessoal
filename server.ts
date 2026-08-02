import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// Initialize Gemini SDK with User-Agent header
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

// AI Financial Assistant Endpoint
app.post("/api/ai/assistant", async (req, res) => {
  try {
    const { question, financialContext } = req.body;

    if (!question) {
      return res.status(400).json({ error: "Pergunta é obrigatória." });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        error: "Chave da API do Gemini não configurada no servidor.",
      });
    }

    const systemInstruction = `
Você é o Finanza AI, um assistente de inteligência financeira pessoal especialista, amigável, direto e altamente analítico.
Você tem acesso ao resumo financeiro atual do usuário:
- Saldo atual: R$ ${financialContext?.balance?.toFixed(2) || "0.00"}
- Total Receitas no Mês: R$ ${financialContext?.totalIncome?.toFixed(2) || "0.00"}
- Total Despesas no Mês: R$ ${financialContext?.totalExpense?.toFixed(2) || "0.00"}
- Economia do Mês: R$ ${financialContext?.savings?.toFixed(2) || "0.00"}
- Taxa de Economia: ${financialContext?.savingsRate?.toFixed(1) || "0"}%
- Detalhes de Despesas por Categoria: ${JSON.stringify(financialContext?.categoryExpenses || {})}
- Metas Financeiras: ${JSON.stringify(financialContext?.goals || [])}
- Orçamentos/Limites de Categoria: ${JSON.stringify(financialContext?.budgets || [])}

Diretrizes de resposta:
1. Responda em português do Brasil de forma clara, motivadora e estruturada em tópicos quando apropriado.
2. Use os dados exatos do usuário fornecidos no contexto para fazer cálculos e responder com precisão.
3. Dê conselhos práticos de economia e gestão de orçamentos se solicitado.
4. Mantenha as respostas concisas e fáceis de ler no celular/desktop.
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: question,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const answer = response.text || "Desculpe, não consegui analisar os dados no momento.";
    return res.json({ answer });
  } catch (error: any) {
    console.error("Erro na API do Assistente Financeiro:", error);
    return res.status(500).json({
      error: "Ocorreu um erro ao processar sua solicitação com o assistente de IA.",
      details: error.message,
    });
  }
});

// Auto-Analysis Insights Endpoint
app.post("/api/ai/insights", async (req, res) => {
  try {
    const { financialContext } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      return res.status(200).json({
        insights: [
          "💡 **Dica de Finança**: Você está mantendo um bom controle dos seus orçamentos este mês. Continue acompanhando seus gastos fixos!",
          "📊 **Alerta Inteligente**: Verifique a categoria com maior despesa para identificar pequenas reduções sem comprometer seu estilo de vida."
        ]
      });
    }

    const systemInstruction = `
Você é o Finanza AI. Analise os dados do usuário e gere 3 observações/insights estratégicos e curtos (1 a 2 frases cada) com emojis no início de cada linha em formato Markdown.
Dados:
- Receitas: R$ ${financialContext?.totalIncome?.toFixed(2) || "0.00"}
- Despesas: R$ ${financialContext?.totalExpense?.toFixed(2) || "0.00"}
- Categoria de maior gasto: ${financialContext?.topExpenseCategory || "N/A"}
- Metas ativas: ${financialContext?.goals?.length || 0}
- Orçamentos excedidos: ${financialContext?.overBudgetCount || 0}
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "Gere 3 insights financeiros inteligentes e curtos para o meu painel.",
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const rawText = response.text || "";
    const insights = rawText
      .split("\n")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    return res.json({ insights: insights.length > 0 ? insights : [rawText] });
  } catch (error: any) {
    console.error("Erro ao gerar insights:", error);
    return res.json({
      insights: [
        "💡 Continue monitorando suas receitas e despesas semanalmente para não estourar o orçamento.",
        "🎯 Priorize a transferência para sua Reserva de Emergência logo após receber sua principal receita."
      ]
    });
  }
});

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
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
