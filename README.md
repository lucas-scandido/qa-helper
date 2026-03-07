# QA Helper

Ferramenta interna para acelerar a criação de bugs no Azure DevOps utilizando IA (Claude). O analista de QA descreve o problema em poucas palavras e o sistema gera automaticamente título, descrição detalhada, passos de reprodução e severidade, criando o card diretamente no Azure DevOps.

---

## Sumário

- [Pré-requisitos](#pré-requisitos)
- [Instalação](#instalação)
- [Configuração de Variáveis de Ambiente](#configuração-de-variáveis-de-ambiente)
- [Executando o Projeto](#executando-o-projeto)
- [Estrutura de Pastas](#estrutura-de-pastas)
- [Regras de Negócio](#regras-de-negócio)
- [API Reference](#api-reference)

---

## Pré-requisitos

Antes de iniciar, certifique-se de ter instalado:

- **Node.js** v20 ou superior
- **npm** v10 ou superior
- Acesso ao **Azure DevOps** com permissão para criar work items
- Um **Personal Access Token (PAT)** do Azure DevOps com escopo `Work Items (Read & Write)`
- Acesso ao **LLM Gateway** (Anthropic / proxy interno) com token de autenticação

---

## Instalação

### 1. Clone o repositório

```bash
git clone <url-do-repositorio>
cd qa-helper
```

### 2. Instale as dependências da raiz

```bash
npm install
```

### 3. Instale as dependências do frontend

```bash
npm install --prefix frontend
```

### 4. Instale as dependências do backend

```bash
npm install --prefix backend
```

---

## Configuração de Variáveis de Ambiente

### Backend

Crie o arquivo `backend/.env` a partir do exemplo:

```bash
cp backend/.env.example backend/.env
```

Preencha as variáveis:

```env
# ─── SERVIDOR ───────────────────────────────
PORT=3000

# ─── AZURE DEVOPS ───────────────────────────
AZURE_ORGANIZATION=sua-organization       # Nome da organização no Azure DevOps
AZURE_PROJECT=seu-projeto                 # Nome do projeto no Azure DevOps
AZURE_PAT=seu-personal-access-token      # PAT com escopo Work Items Read & Write

# ─── ANTHROPIC / LLM GATEWAY ─────────────────
ANTHROPIC_BASE_URL=https://seu-gateway.exemplo.com   # URL base do gateway LLM
ANTHROPIC_AUTH_TOKEN=seu-token-de-autenticacao       # Token de autenticação
ANTHROPIC_MODEL=claude-sonnet-4-6                    # Modelo Claude a utilizar

# ─── FRONTEND (CORS) ────────────────────────
FRONTEND_URL=http://localhost:5173
```

> **Como gerar o PAT no Azure DevOps:**
> 1. Acesse `https://dev.azure.com/{sua-organization}`
> 2. Clique no ícone do usuário → **Personal Access Tokens**
> 3. Clique em **New Token**
> 4. Defina nome, expiração e selecione o escopo **Work Items → Read & Write**
> 5. Copie o token gerado (ele só é exibido uma vez)

### Frontend

Crie o arquivo `frontend/.env` a partir do exemplo:

```bash
cp frontend/.env.example frontend/.env
```

```env
VITE_API_URL=http://localhost:3000
```

---

## Executando o Projeto

### Desenvolvimento (frontend + backend simultaneamente)

Na raiz do projeto:

```bash
npm run dev
```

Isso inicia:
- **Backend** em `http://localhost:3000`
- **Frontend** em `http://localhost:5173`

### Somente o backend

```bash
npm run dev:backend
```

### Somente o frontend

```bash
npm run dev:frontend
```

### Build de produção (frontend)

```bash
npm run build
```

### Verificar se o backend está rodando

```
GET http://localhost:3000/health
```

Resposta esperada:
```json
{
  "status": "ok",
  "timestamp": "2025-01-01T00:00:00.000Z",
  "model": "claude-sonnet-4-6"
}
```

---

## Estrutura de Pastas

```
qa-helper/
├── package.json                  # Raiz do monorepo — scripts de dev/build e dependência concurrently
│
├── frontend/                     # Aplicação React (Vite + TypeScript)
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── index.html
│   └── src/
│       ├── main.tsx              # Entry point — monta React e providers
│       ├── App.tsx               # Componente raiz com ThemeProvider e roteamento
│       │
│       ├── routes/
│       │   └── index.tsx         # Definição das rotas da SPA (react-router-dom)
│       │
│       ├── pages/
│       │   └── Home.tsx          # Página inicial com cards de módulos e estatísticas
│       │
│       ├── modules/
│       │   └── bug-creation/     # Módulo principal — criação de bugs via IA
│       │       ├── BugCreation.tsx               # Orquestrador do fluxo de 3 steps
│       │       ├── BugCreation.module.css
│       │       └── components/
│       │           ├── BugStep1.tsx              # Step 1: busca de work item por ID
│       │           ├── BugStep2.tsx              # Step 2: descrição do bug pelo analista
│       │           ├── BugStep3.tsx              # Step 3: revisão e edição do conteúdo gerado
│       │           ├── BugStepIndicator.tsx      # Indicador visual de progresso dos steps
│       │           ├── BugConfirmationModal.tsx  # Modal de confirmação antes de criar o bug
│       │           ├── BugSuccessModal.tsx       # Modal de sucesso após criação com countdown
│       │           ├── ProductContextCard.tsx    # Card exibindo o contexto do produto identificado
│       │           ├── ProductRegistrationForm.tsx # Formulário para cadastrar novo produto
│       │           └── BugModal.module.css       # Estilos compartilhados entre os modais
│       │
│       ├── components/
│       │   ├── ErrorBoundary.tsx         # Captura erros React em produção
│       │   ├── layout/
│       │   │   ├── Sidebar.tsx           # Barra lateral de navegação
│       │   │   └── PageWrapper.tsx       # Wrapper de layout com sidebar e conteúdo
│       │   └── ui/
│       │       ├── BugIcon.tsx           # Ícone SVG de bug
│       │       ├── BugStatsCard.tsx      # Card com estatísticas de bugs criados por IA
│       │       ├── ErrorBox.tsx          # Componente de exibição de erros inline
│       │       ├── ModuleCard.tsx        # Card de módulo na home (ativo/bloqueado)
│       │       └── Spinner.tsx           # Indicador de carregamento
│       │
│       ├── hooks/
│       │   └── useTheme.ts               # Hook para acessar o contexto de tema
│       │
│       ├── lib/
│       │   └── api.ts                    # Cliente HTTP com timeout de 70s (necessário para LLM)
│       │
│       ├── store/
│       │   ├── ThemeContext.ts           # Contexto React para tema claro/escuro
│       │   └── ThemeProvider.tsx         # Provider que persiste tema no localStorage
│       │
│       ├── types/
│       │   └── index.ts                  # Interfaces TypeScript compartilhadas
│       │
│       └── styles/
│           └── global.css                # Variáveis CSS, reset, temas claro/escuro e utilitários
│
└── backend/                      # API Fastify (TypeScript)
    ├── package.json
    ├── tsconfig.json
    ├── .env
    ├── .env.example
    └── src/
        ├── server.ts             # Entry point — instancia Fastify, registra CORS e rotas
        │
        ├── config/
        │   └── env.ts            # Carrega e valida variáveis de ambiente com Zod
        │
        ├── routes/
        │   ├── bug.routes.ts     # Rotas /api/bugs (search, generate, create, stats)
        │   └── product.routes.ts # Rotas /api/products (list, create, update)
        │
        ├── controllers/
        │   ├── bug.controller.ts     # Lógica de negócio de bugs (orquestra services)
        │   └── product.controller.ts # Lógica de negócio de produtos
        │
        ├── services/
        │   ├── azure.service.ts  # Integração com Azure DevOps REST API
        │   └── ai.service.ts     # Integração com LLM Gateway (Claude) com retry
        │
        ├── schemas/
        │   ├── bug.schema.ts     # Schemas Zod para validação de entrada/saída de bugs
        │   └── product.schema.ts # Schemas Zod para validação de produtos
        │
        ├── prompts/
        │   └── bug.prompt.ts     # Construção dos prompts de sistema e usuário para a IA
        │
        └── products/
            ├── index.ts          # Registry em memória — carrega e persiste produtos em JSON
            └── asmob.json        # Dados do produto padrão pré-cadastrado (ASMOB)
```

---

## Regras de Negócio

### Fluxo de Criação de Bug

O processo segue um wizard de 3 steps linear e progressivo — cada step é liberado somente após o anterior ser concluído.

#### Step 1 — Buscar Item

O analista informa o **ID numérico** do work item no Azure DevOps (Story, Feature, etc.). O sistema:

- Valida se o ID é um número inteiro positivo
- Busca o work item via Azure DevOps REST API
- Identifica o **produto** pelo Area Path do work item (matching com os Area Paths cadastrados)
- Se o produto não estiver cadastrado, exibe o formulário de registro inline
- Exibe um card com o contexto identificado do produto

#### Step 2 — Descrever o Bug

Com o work item vinculado, o analista descreve o bug em **20 a 500 caracteres**. O sistema envia para a IA:

- Contexto completo do work item (title, state, description, acceptance criteria, etc.)
- Contexto do produto (tipo, módulos, ambientes, usuários)
- Ambiente de teste resolvido pelo estado do work item
- Descrição informada pelo analista

A IA retorna JSON estruturado com `title`, `description`, `expectedResult` e `severity`.

#### Step 3 — Revisar e Criar

O analista revisa o conteúdo gerado. Os campos **título**, **descrição** e **resultado esperado** são editáveis. **Severidade** e **identificação de etapa** são inferidos automaticamente e bloqueados para edição.

Ao clicar em "Criar Bug":
1. Modal de confirmação é exibido
2. Ao confirmar, uma nova aba é aberta em branco (contexto de clique direto — necessário para que o browser libere o popup)
3. A API cria o bug no Azure DevOps
4. A nova aba é navegada para a URL do bug criado
5. Modal de sucesso é exibido na página com countdown de 10 segundos

#### Modal de Sucesso

Após a criação, o analista pode:

| Ação | Resultado |
|---|---|
| **"Sim, vincular novo bug ao item #XXXXX"** | Mantém o work item vinculado, limpa a descrição, retorna ao Step 2 |
| **"Não, buscar outro item"** | Reseta o fluxo completo para o Step 1 |
| **Countdown chegar a zero (10s)** | Mesmo comportamento de "Não" |
| **ESC ou clicar fora do modal** | Mesmo comportamento de "Não" |

---

### Sistema de Contexto de Produto

Produtos são cadastrados com as seguintes informações:

- **Nome:** Identificador do produto (ex: `"ASMOB"`)
- **Tipo:** Descrição do tipo de aplicação (ex: `"Aplicação Web e Mobile"`)
- **Ambientes:** Lista de ambientes disponíveis (ex: `["Web", "Mobile (Android/iOS)"]`)
- **Usuários:** Perfis de usuários do sistema (ex: `["Promotores", "Lideranças"]`)
- **Módulos:** Mapa de módulos com nome, descrição e ambiente de cada um
- **Area Paths:** Lista de Area Paths do Azure DevOps que pertencem ao produto

A identificação automática ocorre por **matching de Area Path**: quando o work item possui um Area Path que contenha qualquer string cadastrada no produto, ele é identificado e seu contexto é injetado no prompt da IA.

Os produtos são persistidos em `backend/data/products-registry.json`. O produto **ASMOB** vem pré-cadastrado como padrão.

---

### Resolução Automática de Campos

O sistema resolve automaticamente dois campos com base no estado do work item:

#### Ambiente de Teste

| Estado do Work Item | Ambiente Resolvido |
|---|---|
| Development, Review | Dev |
| Quality Analysis | Stg |
| Validation, In Production | Prd |

#### Etapa de Identificação do Bug

| Estado do Work Item | Etapa |
|---|---|
| Development | Development |
| Review | Review |
| Quality Analysis | Quality Analysis |
| Validation | In Production *(override de negócio)* |
| In Production | In Production |

---

### Geração de Bug por IA

A IA recebe o contexto completo e retorna um JSON com:

- **Título** (máx. 120 caracteres): conciso, no padrão `[Módulo] - Descrição do problema`
- **Descrição**: narrativa iniciando com *"Durante os testes do item..."* com 3–7 passos de reprodução numerados
- **Resultado Esperado**: 1–3 itens descrevendo o comportamento esperado do sistema
- **Severidade**:
  - `1- Critical`: sistema inacessível, perda de dados, impacto financeiro direto
  - `2- High`: funcionalidade principal quebrada sem contorno
  - `3- Medium`: funcionalidade degradada com contorno disponível
  - `4- Low`: problema cosmético ou de baixo impacto

| Configuração | Valor |
|---|---|
| Modelo | Claude Sonnet 4.6 (configurável via `ANTHROPIC_MODEL`) |
| Máximo de tokens | 600 por resposta |
| Timeout | 60 segundos |
| Tentativas em caso de falha | 3, com backoff de 2s / 4s / 6s |
| Erros que disparam retry | Rede, respostas 5xx |
| Erros que falham imediatamente | Respostas 4xx, falha de validação Zod |

---

### Campos Criados no Azure DevOps

Ao criar um bug, os seguintes campos são preenchidos automaticamente:

| Campo | Valor |
|---|---|
| `System.Title` | Título gerado pela IA |
| `System.AreaPath` | Area Path do work item pai |
| `System.IterationPath` | Iteration Path do work item pai |
| `System.State` | Active |
| `Microsoft.VSTS.TCM.ReproSteps` | Descrição gerada pela IA (HTML) |
| `Custom.Standard_Bug_Expected_Result` | Resultado esperado gerado pela IA |
| `Custom.Standard_Bug_Severity` | Severidade selecionada |
| `Custom.Standard_Step_Identified` | Etapa resolvida pelo estado do work item |
| `Custom.Standard_AI_Accelerated` | `Yes` |
| `Custom.Standard_AI_Type_of_Assistance` | `Tests` |
| `Custom.Standard_AI_Stage_Used` | Resolvido pelo estado do work item |
| `Custom.Standard_AI_Tool` | `Other` |
| `Custom.Standard_AI_Tool_Other` | `Other` |

O bug é vinculado ao work item pai via relação hierárquica (`System.LinkTypes.Hierarchy-Reverse`).

---

## API Reference

### `GET /health`
Verifica se o servidor está online.

```json
{ "status": "ok", "timestamp": "...", "model": "claude-sonnet-4-6" }
```

---

### `GET /api/bugs/search/:id`
Busca um work item pelo ID.

**Resposta:**
```json
{
  "success": true,
  "data": {
    "id": 12345,
    "title": "...",
    "type": "User Story",
    "state": "Quality Analysis",
    "areaPath": "...",
    "product": { "nome": "ASMOB", "modulos": { } }
  }
}
```

---

### `POST /api/bugs/generate`
Gera o conteúdo do bug via IA.

**Body:**
```json
{
  "description": "Botão de salvar não responde após preencher o formulário",
  "workItemId": 12345
}
```

**Resposta:**
```json
{
  "success": true,
  "data": {
    "title": "[Módulo] - Botão salvar não responde",
    "description": "Durante os testes do item...",
    "expectedResult": "O sistema deve salvar os dados...",
    "severity": "2- High"
  }
}
```

---

### `POST /api/bugs/create`
Cria o bug no Azure DevOps.

**Body:**
```json
{
  "workItemId": 12345,
  "title": "...",
  "description": "...",
  "expectedResult": "...",
  "severity": "2- High",
  "stepIdentification": "Quality Analysis"
}
```

**Resposta:**
```json
{
  "success": true,
  "data": {
    "id": 99999,
    "url": "https://dev.azure.com/{org}/{project}/_workitems/edit/99999"
  }
}
```

---

### `GET /api/bugs/stats`
Retorna o total de bugs criados com IA no ano corrente. Resultado cacheado por 5 minutos.

```json
{ "success": true, "data": { "total": 42 } }
```

---

### `GET /api/products`
Lista todos os produtos cadastrados.

---

### `POST /api/products`
Cadastra um novo produto.

**Body:**
```json
{
  "nome": "MeuProduto",
  "tipo": "Aplicação Web",
  "ambiente": ["Web"],
  "usuarios": ["Analistas"],
  "areaPath": "meu-produto\\modulo",
  "modulos": {
    "Login": { "descricao": "Autenticação de usuários", "ambiente": "Web" }
  }
}
```

---

### `PUT /api/products/:nome`
Atualiza um produto existente (mescla Area Paths com os já existentes).
