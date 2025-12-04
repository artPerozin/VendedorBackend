# 🤖 Vendedor IA - Sistema de Atendimento Inteligente

Sistema de vendas automatizado com Inteligência Artificial integrado ao WhatsApp (Evolution API) e CRM Agendor, utilizando RAG (Retrieval-Augmented Generation) com Google Gemini para atendimento consultivo especializado.

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Características Principais](#características-principais)
- [Arquitetura](#arquitetura)
- [Tecnologias Utilizadas](#tecnologias-utilizadas)
- [Pré-requisitos](#pré-requisitos)
- [Instalação](#instalação)
- [Configuração](#configuração)
- [Uso](#uso)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [API Endpoints](#api-endpoints)
- [Treinamento da IA](#treinamento-da-ia)
- [Prospecção Automatizada](#prospecção-automatizada)
- [Testes](#testes)
- [Docker](#docker)
- [Contribuindo](#contribuindo)
- [Licença](#licença)

## 🎯 Visão Geral

O **Vendedor IA** é uma assistente virtual chamada **Julia**, consultora da Evolução Compressores, que realiza:

- ✅ Atendimento automatizado via WhatsApp
- ✅ Qualificação inteligente de leads
- ✅ Coleta de dados essenciais do cliente
- ✅ Integração automática com CRM Agendor
- ✅ Sistema RAG para respostas contextualizadas
- ✅ Transferência inteligente para vendedores humanos
- ✅ Campanhas de prospecção agendadas

## 🚀 Características Principais

### Atendimento Inteligente
- **RAG (Retrieval-Augmented Generation)**: Busca vetorial em base de conhecimento
- **Reescrita de Queries**: Contextualização automática do histórico
- **Detecção de Intenção**: Identifica quando necessita intervenção humana
- **Histórico Persistente**: Mantém contexto de conversas anteriores

### Integração com CRM
- **Agendor CRM**: Criação automática de contatos e tarefas
- **Qualificação de Leads**: Coleta CNPJ, modelo, localização e necessidades
- **Task Assignment**: Atribuição automática para vendedores

### Automação de Prospecção
- **Campanhas Agendadas**: Envio automatizado em horários configurados
- **Mensagens Personalizadas**: Templates dinâmicos
- **Controle de Frequência**: Evita spam e respeita horários

### Base de Conhecimento (BOK)
- **Processamento Multi-formato**: PDF, DOCX, PPTX, XLSX, Imagens
- **Chunking Inteligente**: Divisão otimizada de documentos
- **Embeddings Vetoriais**: pgvector para busca semântica
- **Deduplicação**: Remoção automática de chunks similares

## 🏗️ Arquitetura

```
┌─────────────┐
│  WhatsApp   │
│  (Cliente)  │
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│ Evolution API   │
│   (Webhook)     │
└──────┬──────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│          Vendedor IA (Express)          │
│                                         │
│  ┌─────────────┐      ┌──────────────┐ │
│  │   Webhook   │      │  RAG Engine  │ │
│  │ Transformer │─────▶│   (Gemini)   │ │
│  └─────────────┘      └──────────────┘ │
│                              │          │
│                              ▼          │
│  ┌─────────────────────────────────┐   │
│  │     PostgreSQL + pgvector       │   │
│  │  (Embeddings, Chunks, History)  │   │
│  └─────────────────────────────────┘   │
└──────────┬──────────────────────────────┘
           │
           ▼
    ┌─────────────┐
    │ Agendor CRM │
    │  (Tarefas)  │
    └─────────────┘
```

### Fluxo de Conversação

```
1. Cliente envia mensagem → WhatsApp
2. Evolution API → POST /api/conversation/messages-upsert
3. WebhookTransformer → valida e transforma payload
4. AskQuestion UseCase:
   ├─ FindOrCreateContact
   ├─ RetrieveHistory
   ├─ QueryRewrite (contexto histórico)
   ├─ EmbeddingService (vetorização)
   ├─ SearchSimilarChunks (RAG)
   ├─ PromptBuilder (contexto + pergunta)
   ├─ GeminiChatService (resposta)
   └─ Detecta [NECESSITA_INTERVENCAO]?
       ├─ SIM → CreateTask + SetIntervencao
       └─ NÃO → Continua conversa
5. SendWhatsappMessage → Evolution API
6. Resposta → Cliente
```

## 🛠️ Tecnologias Utilizadas

### Backend
- **Node.js** + **TypeScript**
- **Express.js** - Framework HTTP
- **PostgreSQL** - Banco de dados relacional
- **pgvector** - Extensão para embeddings vetoriais

### IA e Machine Learning
- **Google Gemini 2.0 Flash** - LLM para conversação
- **text-embedding-004** - Modelo de embeddings (768 dim)
- **Cosine Similarity** - Busca vetorial

### Integrações
- **Evolution API** - WhatsApp Business API
- **Agendor CRM** - Gestão de leads e vendas
- **Mammoth** - Extração de DOCX
- **PDF-Parse** - Extração de PDF
- **ExcelJS** - Processamento de planilhas
- **PPTX2JSON** - Conversão de apresentações

### DevOps
- **Docker** + **Docker Compose**
- **node-cron** - Agendamento de tarefas
- **Jest** - Testes unitários

## 📦 Pré-requisitos

- **Node.js** >= 20.x
- **PostgreSQL** >= 14 com extensão **pgvector**
- **Docker** e **Docker Compose** (opcional)
- **Evolution API** (WhatsApp)
- **Conta Agendor** (CRM)
- **Google Gemini API Key**

## 🔧 Instalação

### 1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/vendedor-ia.git
cd vendedor-ia
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as variáveis de ambiente

```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas credenciais (veja seção [Configuração](#configuração)).

### 4. Inicie o banco de dados (Docker)

```bash
docker-compose up -d
```

### 5. Execute as migrations

```bash
npm run main
```

As migrations serão executadas automaticamente na inicialização.

## ⚙️ Configuração

### Variáveis de Ambiente

Edite o arquivo `.env`:

```bash
# Database
DB_HOST=localhost
DB_PORT=5432
DB_DATABASE=vendedor_ia
DB_USERNAME=postgres
DB_PASSWORD=senha_segura

# Google Gemini
GEMINI_API_KEY=sua_api_key_aqui
GEMINI_MODEL=gemini-2.0-flash
GEMINI_MODEL_FAST=gemini-1.5-flash
GEMINI_EMBEDDING_MODEL=text-embedding-004

# Evolution API (WhatsApp)
EVOLUTION_API_URL=https://sua-evolution-api.com
EVOLUTION_API_KEY=sua_api_key
EVOLUTION_INSTANCE=nome_da_instancia

# Agendor CRM
AGENDOR_API_KEY=sua_api_key_agendor
AGENDOR_API_URL=https://api.agendor.com.br/v3
AGENDOR_OWNER_ID=12345
AGENDOR_RESPONSABLE_OWNER_ID=67890
AGENDOR_TASK_TYPE=call

# Prospecção
PROSPECT_SCHEDULE=09:00-12:00,14:00-18:00

# RAG (Base de Conhecimento)
BOK_PATH=./BOK
ENABLE_SUMMARIZATION=true
SIMILARITY_THRESHOLD=0.95
BATCH_SIZE=100

# Servidor
PORT=8000
```

### Configuração do Webhook (Evolution API)

Configure o webhook para apontar para:

```
POST https://seu-dominio.com/api/conversation/messages-upsert
```

## 🚀 Uso

### Iniciar o servidor

```bash
npm run main
```

O servidor estará disponível em `http://localhost:8000`.

### Endpoints disponíveis

```
✅ GET  /api/                              - Health check
✅ POST /api/conversation/messages-upsert  - Webhook Evolution API
```

## 📂 Estrutura do Projeto

```
vendedor-ia/
├── source/
│   ├── domain/
│   │   ├── DTO/                    # Data Transfer Objects
│   │   ├── Entity/                 # Entidades do domínio
│   │   │   ├── Chunk.ts
│   │   │   ├── Contact.ts
│   │   │   ├── Document.ts
│   │   │   ├── Message.ts
│   │   │   └── User.ts
│   │   ├── Enums/
│   │   │   └── SystemPrompts.ts    # Prompt da IA
│   │   ├── Interfaces/             # Contratos de repositórios
│   │   └── Services/
│   │       ├── Agendor/            # Integração CRM
│   │       ├── Contact/
│   │       ├── Conversation/
│   │       ├── Evolution/          # Integração WhatsApp
│   │       ├── Helpers/
│   │       ├── Message/
│   │       └── RAG/                # Sistema RAG
│   │           ├── DocumentProcessor.ts
│   │           ├── EmbeddingService.ts
│   │           ├── GeminiChatService.ts
│   │           ├── PromptBuilderService.ts
│   │           ├── QueryRewriteService.ts
│   │           └── SearchSimilarChunks.ts
│   ├── infra/
│   │   ├── controller/             # Controladores HTTP
│   │   ├── database/               # Conexão e configuração
│   │   ├── http/
│   │   │   ├── Middleware/
│   │   │   │   ├── Auth.ts
│   │   │   │   ├── ErrorHandler.ts
│   │   │   │   └── WebhookTransformerMiddleware.ts
│   │   │   └── Routes/
│   │   ├── migrations/             # Migrations SQL
│   │   └── repository/
│   │       ├── database/           # Repositórios PostgreSQL
│   │       └── memory/             # Repositórios em memória (testes)
│   ├── scripts/
│   │   ├── scheduler.ts            # Cron de prospecção
│   │   ├── startProspectCampaign.ts
│   │   └── trainBotOptimized.ts    # Treinamento RAG
│   ├── shared/
│   │   ├── error/                  # Sistema de erros
│   │   ├── helper/
│   │   ├── response/               # Builders de resposta
│   │   └── validator/              # Validações
│   ├── useCases/
│   │   └── askQuestion/            # Caso de uso principal
│   └── main.ts                     # Entry point
├── test/                           # Testes unitários
├── BOK/                            # Base de Conhecimento (docs)
├── docker-compose.yml
├── Dockerfile
├── package.json
├── tsconfig.json
└── .env
```

## 📡 API Endpoints

### POST /api/conversation/messages-upsert

Webhook para receber mensagens do WhatsApp via Evolution API.

**Headers:**
```
Content-Type: application/json
```

**Body (Example):**
```json
{
  "event": "messages.upsert",
  "data": {
    "key": {
      "remoteJid": "5511999999999@s.whatsapp.net",
      "fromMe": false,
      "senderPn": "5511999999999"
    },
    "pushName": "João Silva",
    "message": {
      "conversation": "Olá, gostaria de um orçamento"
    }
  }
}
```

**Response (Success):**
```json
{
  "success": true,
  "data": {
    "answer": "Olá! Sou Julia, assistente de vendas da Evolução Compressores...",
    "contactId": "uuid-do-contato"
  }
}
```

## 🎓 Treinamento da IA

### Preparar a Base de Conhecimento

1. Crie a pasta `BOK/` na raiz do projeto
2. Organize seus documentos em subpastas (opcional):

```
BOK/
├── produtos/
│   ├── compressores.pdf
│   └── pecas.docx
├── servicos/
│   ├── manutencao.pdf
│   └── locacao.xlsx
└── tecnico/
    ├── manual.pdf
    └── especificacoes.pptx
```

### Executar o Treinamento

```bash
npm run generate:embeddings
```

**O que acontece:**
1. Lê todos os arquivos da pasta `BOK/`
2. Extrai texto (PDF, DOCX, PPTX, XLSX, imagens)
3. Sumariza documentos (opcional)
4. Divide em chunks de 400 palavras (overlap de 50)
5. Gera embeddings (768 dimensões)
6. Remove chunks duplicados (similaridade > 95%)
7. Salva no PostgreSQL com índice vetorial

**Saída esperada:**
```
🚀 Iniciando treinamento da IA (modo otimizado)...

📄 Processando documento: compressores.pdf
   ✅ 15 chunks únicos gerados

📄 Processando documento: manutencao.pdf
   ✅ 23 chunks únicos gerados

💾 Salvando no banco de dados...
   ✅ 2 documentos salvos
   ✅ 38 chunks salvos

🎉 Treinamento concluído com sucesso!
```

## 📅 Prospecção Automatizada

### Configurar Campanha

1. Configure os horários no `.env`:

```bash
PROSPECT_SCHEDULE=09:00-12:00,14:00-18:00
```

2. Execute o scheduler:

```bash
npm run prospect:run
```

### Como Funciona

- **Cron**: Executa a cada minuto
- **Horário**: Valida se está dentro do `PROSPECT_SCHEDULE`
- **Busca Contatos**: Obtém leads do Agendor (por `AGENDOR_OWNER_ID`)
- **Envia Mensagens**: Templates do `GetFirstMessagesService`
- **Registra Histórico**: Salva no banco para contexto futuro

### Exemplo de Mensagem

```
Olá, tudo bem? Aqui é a Julia da Evolução Compressores.
Vi que já conversamos anteriormente e nosso vendedor gostaria 
de te visitar nos próximos dias.

Gostaríamos de agendar uma visita rápida para falar sobre 
soluções em ar comprimido — incluindo geração, tratamento, 
eficiência energética, locações, serviços, planos de manutenção, 
monitoramento e tubulações.

Você teria um horário disponível para recebê-lo?
```

## 🧪 Testes

### Executar todos os testes

```bash
npm test
```

### Estrutura de Testes

```
test/
├── domain/
│   └── Services/
│       └── RAG/
│           ├── EmbeddingService.test.ts
│           └── SearchSimilarChunks.test.ts
└── useCases/
    └── askQuestion/
        └── AskQuestion.test.ts
```

### Exemplo de Teste

```typescript
describe("AskQuestion", () => {
  it("deve retornar resposta da IA para uma pergunta simples", async () => {
    const input: AskQuestionInput = {
      question: "Quais compressores vocês vendem?",
      phoneNumber: "5511999999999",
      pushName: "Teste"
    };
    
    const output = await askQuestion.execute(input);
    
    expect(output.answer).toBeTruthy();
    expect(output.contactId).toBeTruthy();
  });
});
```

## 🐳 Docker

### Iniciar com Docker Compose

```bash
docker-compose up -d
```

**Serviços:**
- **postgres**: PostgreSQL 14 + pgvector
- **app** (opcional): Aplicação Node.js

### Dockerfile

```dockerfile
FROM node:24.8-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 8000
CMD ["npm", "run", "main"]
```

### Build Manual

```bash
docker build -t vendedor-ia .
docker run -p 8000:8000 --env-file .env vendedor-ia
```

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Adiciona MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

### Padrões de Código

- **Clean Architecture**: Separação em camadas (Domain, Infra, UseCases)
- **SOLID**: Princípios de design orientado a objetos
- **TypeScript**: Tipagem estrita
- **Repository Pattern**: Abstração de persistência
- **Dependency Injection**: Inversão de controle

## 📞 Suporte

Para dúvidas ou sugestões:

- **Email**: perozin.arthur@gmail.com

---

**Desenvolvido com ❤️ para automação de vendas inteligente**