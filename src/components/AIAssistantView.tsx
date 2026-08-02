import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, Sparkles, User, RefreshCw, HelpCircle } from 'lucide-react';
import { useFinancial } from '../context/FinancialContext';

export const AIAssistantView: React.FC = () => {
  const {
    aiMessages,
    isAiLoading,
    askAiAssistant,
    totalIncomeMonth,
    totalExpenseMonth,
    topExpenseCategory,
  } = useFinancial();

  const [inputQuestion, setInputQuestion] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [aiMessages, isAiLoading]);

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputQuestion.trim() || isAiLoading) return;
    askAiAssistant(inputQuestion.trim());
    setInputQuestion('');
  };

  const handleQuickAsk = (question: string) => {
    if (isAiLoading) return;
    askAiAssistant(question);
  };

  const suggestedQuestions = [
    'Quanto gastei este mês e qual foi o maior custo?',
    'Quanto posso economizar com base no meu saldo atual?',
    'Qual categoria de despesa tem mais impacto?',
    'Quanto falta para atingir minha meta de Reserva de Emergência?',
    'Como organizar meus orçamentos para o próximo mês?',
  ];

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      {/* Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-teal-600 via-emerald-600 to-indigo-600 text-white shadow-lg flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2 rounded-xl bg-white/20">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold">
              Assistente Financeiro com IA
            </h1>
          </div>
          <p className="text-xs text-teal-100">
            Tire dúvidas em tempo real sobre seu dinheiro, receba dicas de economia e análise inteligente de orçamentos.
          </p>
        </div>
      </div>

      {/* Suggested Questions Pills */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2">
        <p className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
          <HelpCircle className="w-4 h-4 text-emerald-500" /> Perguntas Rápidas:
        </p>
        <div className="flex flex-wrap gap-2">
          {suggestedQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleQuickAsk(q)}
              disabled={isAiLoading}
              className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-slate-700 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-300 text-xs font-semibold border border-slate-200/60 dark:border-slate-700/60 transition-colors text-left"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Messages Container */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm min-h-[420px] max-h-[550px] flex flex-col justify-between">
        <div className="overflow-y-auto space-y-4 pr-2">
          {aiMessages.map((msg) => {
            const isUser = msg.sender === 'user';

            return (
              <div
                key={msg.id}
                className={`flex items-start gap-3 ${
                  isUser ? 'flex-row-reverse' : 'flex-row'
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 text-white font-bold text-xs shadow-md ${
                    isUser
                      ? 'bg-emerald-600'
                      : 'bg-gradient-to-tr from-teal-500 to-indigo-600'
                  }`}
                >
                  {isUser ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                </div>

                <div
                  className={`max-w-[80%] p-4 rounded-2xl text-xs leading-relaxed space-y-1 ${
                    isUser
                      ? 'bg-emerald-600 text-white rounded-tr-none font-medium'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-none border border-slate-200/60 dark:border-slate-700/50'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                  <p
                    className={`text-[10px] text-right mt-1 ${
                      isUser ? 'text-emerald-200' : 'text-slate-400'
                    }`}
                  >
                    {msg.timestamp}
                  </p>
                </div>
              </div>
            );
          })}

          {isAiLoading && (
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-teal-500 to-indigo-600 flex items-center justify-center text-white shrink-0">
                <Bot className="w-5 h-5 animate-pulse" />
              </div>
              <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 text-xs flex items-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin text-emerald-500" />
                <span>O Finanza AI está analisando seus dados financeiros...</span>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSend} className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex gap-2">
          <input
            type="text"
            placeholder="Digite sua dúvida financeira (Ex: Quanto posso gastar no final de semana?)"
            value={inputQuestion}
            onChange={(e) => setInputQuestion(e.target.value)}
            disabled={isAiLoading}
            className="flex-1 p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white"
          />
          <button
            type="submit"
            disabled={!inputQuestion.trim() || isAiLoading}
            className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-md"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Enviar</span>
          </button>
        </form>
      </div>
    </div>
  );
};
