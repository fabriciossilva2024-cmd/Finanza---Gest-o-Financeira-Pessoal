# Finanza PRO — Status do Projeto

## Stack
- React 19 + Vite 6 + TypeScript
- Tailwind CSS v4
- Supabase (PostgreSQL + Auth + RLS)
- Express server (server.ts)
- Google Gemini AI (assistente financeiro)
- Deploy: Vercel (auto-deploy do branch main)

## Estrutura Principal
```
src/
├── App.tsx                          # Router principal por tabs
├── components/
│   ├── AuthScreen.tsx               # Tela de login/convidado
│   ├── AuthForm.tsx                 # Formulário só login (signup removido)
│   ├── AuthModal.tsx                # Modal de login (aberto do header)
│   ├── Header.tsx                   # Header responsivo com menu do usuário
│   ├── Sidebar.tsx                  # Navegação lateral + bottom bar mobile
│   ├── DashboardView.tsx            # Dashboard com KPIs, gráficos, lançamentos recentes
│   ├── IncomeView.tsx               # CRUD receitas + relatório de impressão
│   ├── ExpenseView.tsx              # CRUD despesas + relatório de impressão
│   ├── GoalsView.tsx                # Metas financeiras
│   ├── BudgetView.tsx               # Orçamentos por categoria
│   ├── ReportsView.tsx              # Relatório geral com impressão
│   ├── AIAssistantView.tsx          # Chat com Gemini AI
│   ├── ProfileView.tsx              # Perfil, upload de avatar, senha
│   └── NotificationsDrawer.tsx      # Drawer de notificações
├── context/FinancialContext.tsx      # State management central (1044 linhas)
├── lib/supabase.ts                  # Cliente Supabase + mappers DB→App
├── types.ts                         # Interfaces TypeScript
├── utils/formatters.ts              # formatCurrency, formatDateBR, etc.
├── index.css                        # Tailwind + print styles
└── server/ai.ts                     # Handlers dos endpoints de IA
server.ts                            # Express server (CORS, rate limit, auth)
supabase/migrations/                 # SQL schema + RLS policies
```

## Funcionalidades Implementadas

### Core
- Login com e-mail/senha via Supabase Auth
- Modo convidado (signInAnonymously)
- Sincronização entre dispositivos via Supabase
- Dark mode toggle
- Responsivo (mobile + desktop)
- Upload de foto de perfil (canvas crop → base64)

### Abas
- **Dashboard**: KPIs, gráfico receitas vs despesas, lançamentos recentes, quick add
- **Receitas**: CRUD completo, filtros por tipo/busca, relatório de impressão
- **Despesas**: CRUD completo, filtros por categoria/tipo/busca, relatório de impressão
- **Metas**: CRUD com depósito progressivo
- **Orçamento**: Limite mensal por categoria com alertas
- **Relatórios**: Análise geral com impressão (semanal/mensal/anual)
- **Assistente IA**: Chat com Gemini AI usando dados financeiros do usuário
- **Perfil**: Edição, avatar, troca de senha, recuperação de senha

### Segurança (implementada nesta sessão)
- JWT auth nos endpoints `/api/ai/*`
- Rate limiting: 10 req/min por IP nos endpoints de IA
- CORS restrito ao domínio Vercel
- Erros genéricos (error.message não exposta)
- Todas as queries UPDATE/DELETE filtram por user_id
- RLS policies em todas as tabelas (auth.uid() = user_id)
- Índices em user_id para performance
- nanoid vulnerability corrigida (npm audit fix)
- Migration SQL versionada em `supabase/migrations/`

## Variáveis de Ambiente

### .env (local — NÃO versionado)
```
VITE_SUPABASE_URL=https://zmafisafltfvhgjadtdg.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...
GEMINI_API_KEY=AQ.Ab8RN...
```

### Vercel (Settings > Environment Variables > Production)
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `GEMINI_API_KEY`

## Comandos
- `npm run dev` — servidor local (porta 3000, via tsx server.ts)
- `npm run build` — build de produção
- `npm run lint` — typecheck (tsc --noEmit)
- `npm run clean` — limpa dist/

## Tela de Loading
- Logo Finanza + nome "Finanza PRO" + spinner verde girando
- Mensagem de erro aparece abaixo se falhar a conexão

## Histórico de Commits Importantes
- `d0e5f9d` — fix: correções de segurança CRÍTICAS e ALTAS
- `ca6e962` — fix: spinner maior e sem texto na tela de loading
- `63cf9c8` — feat: tela de loading com spinner, nome do sistema e logo
- `513bfa3` — feat: relatório de impressão na aba de Despesas
- `c7d7267` — feat: relatório de impressão na aba de Receitas
- `1f0a63e` — fix: removido versão [B3]/[B4] dos títulos
- `5e94860` — feat: melhorias gerais na aplicação
- `de2978d` — fix: expor isSupabaseConfigured no contexto
- `02dbd9a` — feat: login com e-mail e senha
- `366dc72` — feat: deploy na Vercel
- `504fee7` — feat: integração com Supabase

## Próximos Passos Possíveis
- [ ] Autenticação com e-mail confirmado (loginWithEmail já trata)
- [ ] Relatório de impressão para Metas e Orçamentos
- [ ] Exportar dados como CSV/PDF
- [ ] Notificações push
- [ ] Modo offline com sync
- [ ] Testes unitários
- [ ] CSP/HSTS headers de segurança
- [ ] Input maxLength nos formulários
- [ ] Senha com política de força (maiuscula, número, especial)
