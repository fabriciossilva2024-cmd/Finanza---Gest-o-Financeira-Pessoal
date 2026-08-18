import { GoogleGenAI } from '@google/genai';

// Initialize Gemini SDK with User-Agent header
export const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

const FALLBACK_INSIGHTS = [
  '💡 **Dica de Finança**: Você está mantendo um bom controle dos seus orçamentos este mês. Continue acompanhando seus gastos fixos!',
  '📊 **Alerta Inteligente**: Verifique a categoria com maior despesa para identificar pequenas reduções sem comprometer seu estilo de vida.',
];

const FALLBACK_INSIGHTS_ERROR = [
  '💡 Continue monitorando suas receitas e despesas semanalmente para não estourar o orçamento.',
  '🎯 Priorize a transferência para sua Reserva de Emergência logo após receber sua principal receita.',
];

const ASSISTANT_SYSTEM = (ctx: any) => `
Você é o Finanza AI, um assistente de inteligência financeira pessoal especialista, amigável, direto e altamente analítico.
Você tem acesso ao resumo financeiro atual do usuário:
- Saldo atual: R$ ${ctx?.balance?.toFixed(2) || "0.00"}
- Total Receitas no Mês: R$ ${ctx?.totalIncome?.toFixed(2) || "0.00"}
- Total Despesas no Mês: R$ ${ctx?.totalExpense?.toFixed(2) || "0.00"}
- Economia do Mês: R$ ${ctx?.savings?.toFixed(2) || "0.00"}
- Taxa de Economia: ${ctx?.savingsRate?.toFixed(1) || "0"}%
- Detalhes de Despesas por Categoria: ${JSON.stringify(ctx?.categoryExpenses || {})}
- Metas Financeiras: ${JSON.stringify(ctx?.goals || [])}
- Orçamentos/Limites de Categoria: ${JSON.stringify(ctx?.budgets || [])}

Diretrizes de resposta:
1. Responda em português do Brasil de forma clara, motivadora e estruturada em tópicos quando apropriado.
2. Use os dados exatos do usuário fornecidos no contexto para fazer cálculos e responder com precisão.
3. Dê conselhos práticos de economia e gestão de orçamentos se solicitado.
4. Mantenha as respostas concisas e fáceis de ler no celular/desktop.
`;

const INSIGHTS_SYSTEM = (ctx: any) => `
Você é o Finanza AI. Analise os dados do usuário e gere 3 observações/insights estratégicos e curtos (1 a 2 frases cada) com emojis no início de cada linha em formato Markdown.
Dados:
- Receitas: R$ ${ctx?.totalIncome?.toFixed(2) || "0.00"}
- Despesas: R$ ${ctx?.totalExpense?.toFixed(2) || "0.00"}
- Categoria de maior gasto: ${ctx?.topExpenseCategory || "N/A"}
- Metas ativas: ${ctx?.goals?.length || 0}
- Orçamentos excedidos: ${ctx?.overBudgetCount || 0}
`;

// AI Financial Assistant handler (compatible with Express & Vercel)
export async function handleAssistant(req: any, res: any) {
  try {
    const { question, financialContext } = req.body || {};

    if (!question) {
      return res.status(400).json({ error: 'Pergunta é obrigatória.' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        error: 'Chave da API do Gemini não configurada no servidor.',
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-flash-latest',
      contents: question,
      config: {
        systemInstruction: ASSISTANT_SYSTEM(financialContext),
        temperature: 0.7,
      },
    });

    const answer =
      response.text || 'Desculpe, não consegui analisar os dados no momento.';
    return res.json({ answer });
  } catch (error: any) {
    console.error('Erro na API do Assistente Financeiro:', error?.message);
    return res.status(500).json({
      error: 'Ocorreu um erro ao processar sua solicitação com o assistente de IA.',
    });
  }
}

// Auto-Analysis Insights handler (compatible with Express & Vercel)
export async function handleInsights(req: any, res: any) {
  try {
    const { financialContext } = req.body || {};

    if (!process.env.GEMINI_API_KEY) {
      return res.status(200).json({ insights: FALLBACK_INSIGHTS });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-flash-latest',
      contents: 'Gere 3 insights financeiros inteligentes e curtos para o meu painel.',
      config: {
        systemInstruction: INSIGHTS_SYSTEM(financialContext),
        temperature: 0.7,
      },
    });

    const rawText = response.text || '';
    const insights = rawText
      .split('\n')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    return res.json({ insights: insights.length > 0 ? insights : [rawText] });
  } catch (error: any) {
    console.error('Erro ao gerar insights:', error);
    return res.json({ insights: FALLBACK_INSIGHTS_ERROR });
  }
}
