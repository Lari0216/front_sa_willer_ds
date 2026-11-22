# Gestão Financeira — Front-end

Front-end em **React 19 + Vite 8** de um sistema de gestão financeira: login/cadastro, dashboard com gráficos, cadastro/edição/exclusão de transações e extrato com busca, filtros, ordenação, paginação e exportação CSV.

## Como rodar

```bash
npm install
npm run dev        # http://localhost:5173
```

| Script | O que faz |
|---|---|
| `npm run dev` | Servidor de desenvolvimento com recarregamento automático |
| `npm run build` | Build de produção otimizado na pasta `dist/` |
| `npm run preview` | Serve o `dist/` localmente para testar o build (http://localhost:4173) |
| `npm run lint` | Verifica o código com ESLint |
| `npm run deploy:vercel` / `deploy:netlify` / `deploy:s3` | Publicação (ver seção Deploy) |

## Precisa do back-end?

**Não.** Existe um **modo demonstração (mock)** que simula a API no próprio navegador:

- **Conta de demonstração já cadastrada**, com ~700 transações de 24 meses para apresentar os gráficos:

  | Nome | E-mail | Senha |
  |---|---|---|
  | Nicole da Silva | `nicole@email.com` | `123467` |

  A tela de login mostra esses dados e tem o botão "Preencher automaticamente". Para trocar o e-mail ou a senha, edite `src/services/mock/contaDemo.js`.
- **Só entra quem está cadastrado.** O login confere e-mail e senha. Quem não tem conta usa **CADASTRAR**, e a conta nova começa **zerada**: os valores são lançados pelo botão **"Nova transação"**.
- Cada usuário vê só os próprios dados. Eles ficam no `localStorage` do navegador, separados por e-mail: continuam lá ao sair e entrar de novo, mas não passam para outro navegador ou computador. Com o back-end real, ficam no banco de dados (lá, a Nicole precisa ser cadastrada no banco).


| Variável | Valor | Efeito |
|---|---|---|
| `VITE_USE_MOCK` | `true` | Usa a API simulada (contas e transações salvas no navegador). |
| `VITE_USE_MOCK` | `false` | Consome a API real em `VITE_API_URL`. |
| `VITE_API_URL` | `http://localhost:3000` | URL base do back-end (sem `/` no final). |
| `VITE_REQUEST_TIMEOUT` | `15000` | Tempo máximo de espera (ms) antes de mostrar erro. |

Os valores ficam em `.env.development` (usado no `npm run dev`) e `.env.production` (usado no `npm run build`). Para configurações só suas, crie um `.env.local` (não vai para o Git), copiando o `.env.example`.

> Dica: com o mock ligado, adicione `?simularErro` na URL (ex.: `/dashboard?simularErro`) para forçar uma falha e ver o modal de erro.

## Contrato esperado da API

Todas as rotas (exceto login/cadastro) recebem o cabeçalho `Authorization: Bearer <accessToken>`. Uma resposta **401** encerra a sessão e leva o usuário de volta ao login. Mensagens de erro do back são exibidas se vierem como `{ "erro": "..." }` (ou `error` / `message`).

| Método e rota | Envia | Retorna |
|---|---|---|
| `POST /login` | `{ email, senha }` | `{ accessToken, refreshToken, usuario?: { nome, email } }` |
| `POST /usuarios` | `{ nome, email, senha }` | qualquer JSON (201) |
| `GET /dashboard?periodo=3m\|6m\|12m` | — | ver abaixo |
| `GET /transacoes?limite=6` (`limite` é opcional) | — | lista de transações (ou `{ dados: [...] }`) |
| `POST /transacoes` | `{ descricao, valor, tipo, categoria, data, status }` | a transação criada (com `id`) |
| `PUT /transacoes/:id` | `{ descricao, valor, tipo, categoria, data, status }` | a transação atualizada |
| `DELETE /transacoes/:id` | — | `204` (sem corpo) |

```jsonc
// GET /dashboard?periodo=6m
{
  "resumo": { "saldoAtual": 51942.11, "receitas": 55330.45, "despesas": 49593.6,
              "receitasAnterior": 66580.2, "despesasAnterior": 45660.1 },   // "Anterior" = período anterior de mesmo tamanho
  "mensal": [ { "mes": "2026-06", "receitas": 9179.5, "despesas": 8172.23, "saldo": 45210.0 } ], // saldo no fim do mês
  "categorias": [ { "categoria": "Alimentação", "valor": 14600.0 } ]          // só despesas, no período
}

// GET /transacoes
[ { "id": 1, "data": "2026-11-22", "descricao": "Supermercado", "categoria": "Alimentação",
    "tipo": "despesa", "valor": 153.45, "status": "concluida" } ]   // tipo: receita|despesa · status: concluida|pendente
```

Campos ausentes são tolerados (os serviços em `src/services/` normalizam a resposta). Se o back usar outro formato, basta ajustar a função `normalize` do serviço correspondente.

## Estrutura

```
src/
├── App.jsx                  # rotas + providers (toasts, autenticação) + lazy loading
├── config.js                # leitura das variáveis de ambiente
├── pages/                   # LoginPage, DashboardPage, TransacoesPage, NotFoundPage
├── components/
│   ├── dashboard/           # KpiCard, ChartCard, MonthlyChart, CategoryChart, BalanceChart, ChartTooltip
│   ├── table/               # DataTable (ordenação + paginação), Pagination, células e colunas
│   ├── transacoes/          # TransacaoFormModal (cadastro/edição)
│   ├── filters/             # SearchInput, SelectFilter, DateRangeFilter, SegmentedControl
│   ├── feedback/            # ToastProvider, Modal, ErrorModal, ConfirmModal, Spinner, Skeleton, PageLoader, EmptyState, ErrorBoundary
│   ├── layout/              # AppLayout, Sidebar, Topbar, ProtectedRoute
│   └── ui/                  # Button, Icon, Logo
├── context/                 # AuthProvider + objetos de contexto
├── hooks/                   # useApi, useAuth, useToast, useDebouncedValue
├── services/                # http (fetch + token + timeout + erros), auth, dashboard, transações, mock/
├── utils/                   # formatação (R$, datas), CSV, categorias
└── styles/                  # CSS por área (tokens em index.css)
```

A pasta `frontsa/` é a versão antiga em HTML puro, mantida só como referência (não entra no build).

## O que foi feito em cada etapa

### 1. Criação do dashboard
- Layout com menu lateral, barra superior e rotas protegidas (`/dashboard`, `/transacoes`). Quem não está logado é levado ao `/login` e volta para a página de origem depois de entrar.
- 4 indicadores (KPIs): saldo atual, receitas, despesas (com variação % sobre o período anterior) e taxa de economia.

### 2. Consumo do dashboard e gráficos
- `services/http.js`: wrapper de `fetch` com token Bearer, timeout, cancelamento e mensagens de erro em português.
- `hooks/useApi.js`: controla carregando/erro/dados, cancela requisições antigas ao trocar o período e mantém os dados antigos na tela enquanto recarrega.
- Gráficos com **Recharts**: receitas x despesas por mês (colunas agrupadas), despesas por categoria (barras horizontais ordenadas, mais fáceis de comparar que pizza) e evolução do saldo (área). Todos têm tooltip, legenda e o botão **"Ver tabela"**, que mostra os mesmos dados em tabela (acessibilidade). As cores azul e laranja são seguras para daltônicos.

### 3. Tabelas, busca e filtros
- `DataTable` genérico: colunas configuráveis, ordenação por clique no cabeçalho (com `aria-sort`), paginação com reticências, escolha de itens por página, skeleton de carregamento e estado vazio. No celular, cada linha vira um card.
- **Cadastro, edição e exclusão de transações**: formulário em modal com validação (valor aceita `1.234,56`), categorias de acordo com o tipo e confirmação antes de excluir. O dashboard e os gráficos são atualizados logo após salvar.
- Busca com debounce (300 ms) que ignora acentos ("alimentacao" encontra "Alimentação"), filtros de tipo, categoria (dependente do tipo), status e período, botão "Limpar filtros", totais do resultado filtrado e exportação **CSV** (abre direto no Excel).

### 4. Feedbacks (toasts, loaders e modais de erro)
- **Toasts** (`useToast()`): sucesso, erro, aviso e informação; somem sozinhos (pausam com o mouse em cima) e são anunciados por leitores de tela.
- **Loaders**: spinner em botões, skeletons em KPIs, gráficos e tabelas, e loader de página durante o lazy loading.
- **Modais de erro** com "Tentar novamente", baseados no `<dialog>` nativo (prende o foco e fecha com Esc). Depois de fechado, a página mostra um estado de erro com botão de recarregar.
- `ErrorBoundary` evita tela branca se algum componente quebrar, e a página 404 cobre rotas inexistentes.
- Sessão expirada (401) encerra a sessão, avisa com um toast e redireciona ao login.

### 5. Otimização, memoização e responsividade
- **Code splitting**: cada página é carregada sob demanda (`React.lazy`). O Recharts (~124 kB gzip) fica em um arquivo separado, baixado só ao abrir o dashboard, então o login carrega bem mais leve.
- **Chunks de vendor** (`react-vendor`, `charts`) ficam em cache no navegador entre deploys.
- **Memoização**: `React.memo` em linhas da tabela, KPIs, gráficos, sidebar, topbar e filtros; `useMemo` em filtragem, ordenação, totais e índice de busca pré-normalizado; `useCallback` nos handlers e fetchers. O valor do contexto de toasts é estável, então disparar um toast não re-renderiza as páginas.
- **React Compiler** (já vinha no projeto) memoiza automaticamente o restante no build.
- **Debounce** na busca e cancelamento de requisições obsoletas (`AbortController`).
- **Responsivo**: menu vira gaveta abaixo de 1024 px, grids de 4 → 2 → 1 colunas, tabela vira cards abaixo de 640 px e os toasts vão para baixo no celular. Testado em 390 px, 1024 px e 1440 px sem rolagem horizontal.

### 6. Build de produção e deploy
- `npm run build` gera o `dist/` minificado. O `index.html` só pré-carrega o necessário para o login.
- Configurações prontas: `vercel.json`, `netlify.toml` e `scripts/deploy-s3.sh`. Todas redirecionam qualquer rota para o `index.html` (necessário em SPA para o F5 em `/dashboard` funcionar) e aplicam cache longo nos arquivos com hash.

## Deploy

> Enquanto o back-end não estiver publicado na internet, o deploy roda em **modo demonstração** (`.env.production` vem com `VITE_USE_MOCK=true`). Um site publicado não consegue acessar `localhost:3000`. Quando a API estiver no ar, defina `VITE_USE_MOCK=false` e `VITE_API_URL=https://sua-api.com` no painel da hospedagem e faça um novo deploy. O back precisa liberar **CORS** para o domínio do front.

### Vercel (recomendado)
1. Suba o projeto para o GitHub.
2. Em [vercel.com](https://vercel.com) → **Add New → Project** → importe o repositório. O `vercel.json` já define build (`npm run build`) e saída (`dist`).
3. (Opcional) Em **Settings → Environment Variables**, defina `VITE_USE_MOCK` e `VITE_API_URL`.
4. Cada `git push` gera um deploy novo automaticamente.

Pela linha de comando: `npm i -g vercel`, depois `vercel` (primeira vez) e `npm run deploy:vercel`.

### Netlify
1. Em [app.netlify.com](https://app.netlify.com) → **Add new site → Import an existing project** → escolha o repositório. O `netlify.toml` já configura tudo.
2. Variáveis em **Site configuration → Environment variables**.

Pela linha de comando: `npm i -g netlify-cli`, depois `netlify login`, `netlify init` e `npm run build && npm run deploy:netlify`.

### AWS S3 (+ CloudFront)
1. Crie um bucket com **Static website hosting** ativado (documento de índice **e** de erro: `index.html`) ou, melhor, sirva via CloudFront com páginas de erro 403/404 → `/index.html` (código 200).
2. Com o AWS CLI configurado (`aws configure`):
   ```bash
   S3_BUCKET=nome-do-bucket npm run deploy:s3
   # com CloudFront:
   S3_BUCKET=nome-do-bucket CLOUDFRONT_ID=E123ABC npm run deploy:s3
   ```

## Testar o build localmente

```bash
npm run build
npm run preview    # http://localhost:4173
```
