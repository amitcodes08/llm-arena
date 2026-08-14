# ⚔️ LLM Arena

<p align="center">
  <strong>An open-source, side-by-side LLM evaluation and benchmarking battleground.</strong><br>
  Prompt multiple AI models simultaneously, compare real-time streaming answers, inspect live telemetry, and vote for the best response to build community-driven model rankings.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js" alt="Next.js 16" />
  <img src="https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript-5.0-3178c6?style=for-the-badge&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8?style=for-the-badge&logo=tailwindcss" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Prisma-ORM_v7-2d3748?style=for-the-badge&logo=prisma" alt="Prisma ORM" />
  <img src="https://img.shields.io/badge/PostgreSQL-Database-4169e1?style=for-the-badge&logo=postgresql" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Clerk-Auth-6c47ff?style=for-the-badge&logo=clerk" alt="Clerk" />
  <img src="https://img.shields.io/badge/Arcjet-Security-00d084?style=for-the-badge" alt="Arcjet" />
</p>

---

## 📖 Overview

**LLM Arena** lets you send a single prompt to up to three AI models simultaneously and watch their answers stream side-by-side in real time. Transparent, per-call metrics (Time to First Token, tokens per second, and total latency) combined with community voting build an honest, data-driven leaderboard of which models truly deliver the best results.

---

## ✨ Features

- **⚡ Side-by-Side Multi-Model Streaming**
  - Stream responses from 1 to 3 models simultaneously over parallel HTTP SSE connections.
  - Full GitHub-flavored Markdown rendering with code syntax highlighting and copy-to-clipboard support.
  - Auto-scrolling and independent per-column streaming controls.

- **⏱️ Real-Time Telemetry & Instrumentation**
  - Live instrument strip for each model response showing:
    - **TTFT (Time to First Token)** in milliseconds.
    - **Generation Speed** in tokens per second (`tok/s`).
    - **Total Tokens** and total elapsed duration.
    - **Cost Breakdown** (transparently tracked per model run).

- **🏆 Community & Personal Leaderboards**
  - Global rankings computed from community votes and head-to-head win rates.
  - Toggle between **Everyone** (global aggregate) and **Just Me** (personal vote history and preferences).
  - Detailed breakdown of matches, wins, win percentage, and average response latency.

- **📚 Dynamic Model Catalog**
  - Auto-discovery and live filtering of models via the OpenRouter catalog (Meta Llama 3, DeepSeek, Google Gemma, Mistral, Qwen, etc.).
  - Searchable by name, provider, parameter count, and context window size.
  - Interactive model selector modal with quick-pick slots.

- **🛡️ Production-Grade Security & Guardrails**
  - Integrated **Arcjet** rate limiting, bot protection, and prompt injection defense.
  - Fail-fast environment variable validation at boot time using Zod schemas.

- **🔐 Authentication & Multi-Turn Threads**
  - Seamless authentication and session management with **Clerk**.
  - Persistent multi-turn conversations and thread history stored in PostgreSQL via **Prisma ORM**.

- **📊 Observability & Analytics**
  - Integrated **PostHog** telemetry (client & server) capturing model latencies, token consumption, and voting engagement.

- **🎨 Modern Warm-Dark Aesthetic**
  - Custom coffee and rust palette designed for high contrast and visual polish.
  - Accessible focus states, keyboard navigation, and responsive layouts across mobile, tablet, and desktop.

---

## 🛠️ Tech Stack

| Layer                        | Technology                                                                                                    |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------- |
| **Framework**                | [Next.js 16](https://nextjs.org/) (App Router, Server Components & Server Actions)                            |
| **Language & Runtime**       | [TypeScript 5](https://www.typescriptlang.org/) (Strict mode, pure functional architecture)                   |
| **Styling**                  | [Tailwind CSS v4](https://tailwindcss.com/) + Custom CSS Design System                                        |
| **AI SDK & Streaming**       | [Vercel AI SDK](https://sdk.vercel.ai/) & [@openrouter/ai-sdk-provider](https://openrouter.ai/)               |
| **Database & ORM**           | [Prisma ORM v7](https://www.prisma.io/) with `@prisma/adapter-pg` & [PostgreSQL](https://www.postgresql.org/) |
| **Authentication**           | [Clerk](https://clerk.com/) (`@clerk/nextjs`)                                                                 |
| **Security & Rate Limiting** | [Arcjet](https://arcjet.com/) (`@arcjet/next`, `@arcjet/guard`)                                               |
| **Analytics & Telemetry**    | [PostHog](https://posthog.com/) (`posthog-js`, `posthog-node`)                                                |
| **Markdown Processing**      | `react-markdown` + `remark-gfm`                                                                               |
| **Icons**                    | [Lucide React](https://lucide.dev/)                                                                           |
| **Code Quality**             | ESLint 9, Prettier with Tailwind Plugin, Husky, Lint-Staged                                                   |

---

## 🗄️ Database Architecture

The data layer is modeled in Prisma ORM with strict referential integrity and user isolation:

```mermaid
erDiagram
    USER ||--o{ THREAD : owns
    USER ||--o{ VOTE : casts
    THREAD ||--|{ TURN : contains
    THREAD ||--o{ VOTE : receives
    TURN ||--|{ MODEL_RESPONSE : generates
    TURN ||--o{ VOTE : decides
    MODEL_RESPONSE ||--o{ VOTE : "wins"

    USER {
        string id PK "Clerk User ID"
        string email
        string name
        datetime createdAt
        datetime updatedAt
    }

    THREAD {
        string id PK
        string userId FK
        string title
        datetime createdAt
        datetime updatedAt
    }

    TURN {
        string id PK
        string threadId FK
        string prompt
        int turnNumber
        datetime createdAt
    }

    MODEL_RESPONSE {
        string id PK
        string turnId FK
        string modelId
        string content
        int timeToFirstTokenMs
        float tokensPerSecond
        int totalTokens
        enum status
        string errorMessage
        datetime createdAt
    }

    VOTE {
        string id PK
        string userId FK
        string threadId FK
        string turnId FK
        string winnerModelResponseId FK
        datetime createdAt
    }
```

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed on your machine:

- **Node.js** 20.x or higher
- **npm**, **pnpm**, or **yarn**
- **PostgreSQL** database instance (local or hosted e.g. Neon, Supabase, Prisma Postgres)

You will also need API keys from:

- [OpenRouter](https://openrouter.ai/)
- [Clerk](https://clerk.com/)
- [Arcjet](https://arcjet.com/)
- [PostHog](https://posthog.com/) (optional for local dev)

---

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/llmarena.git
cd llmarena
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env.local` file by copying `.env.example`:

```bash
cp .env.example .env.local
```

Fill in your secrets:

```env
# OpenRouter API Key
OPENROUTER_API_KEY="sk-or-v1-..."

# PostgreSQL Database Connection
DATABASE_URL="postgresql://user:password@localhost:5432/llmarena?schema=public"

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."

# Arcjet Security Key
ARCJET_KEY="ajkey_..."

# PostHog Analytics (Optional)
NEXT_PUBLIC_POSTHOG_KEY="phc_..."
NEXT_PUBLIC_POSTHOG_HOST="https://us.i.posthog.com"
```

### 4. Setup Database Schema

Push the Prisma schema to your database and generate the Prisma Client:

```bash
npx prisma db push
npx prisma generate
```

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to start comparing models!

---

## 📜 Available Scripts

| Command                | Description                                                     |
| ---------------------- | --------------------------------------------------------------- |
| `npm run dev`          | Start the local Next.js development server with hot-reloading   |
| `npm run build`        | Generate Prisma client and create an optimized production build |
| `npm run start`        | Start the production Next.js server                             |
| `npm run typecheck`    | Run TypeScript compiler type checking without emitting files    |
| `npm run lint`         | Run ESLint across the codebase                                  |
| `npm run format`       | Auto-format all code and sort Tailwind classes with Prettier    |
| `npm run format:check` | Verify code formatting compliance                               |

---

## 📁 Project Structure

```text
llmarena/
├── app/                      # Next.js App Router root
│   ├── (shell)/              # Primary application layout group
│   │   ├── leaderboard/      # Standings & ranking pages
│   │   ├── models/           # Model catalog browser
│   │   ├── t/[id]/           # Multi-turn conversation thread routes
│   │   ├── layout.tsx        # Persistent shell & navigation layout
│   │   └── page.tsx          # Main arena home view
│   ├── api/
│   │   └── chat/             # Parallel streaming chat SSE route handler
│   ├── env.ts                # Fail-fast validated environment schema
│   ├── globals.css           # Global tokens & Tailwind v4 CSS layer
│   └── layout.tsx            # Clerk, PostHog, and Root theme provider
├── features/                 # Modular feature domains
│   ├── arena/                # Side-by-side arena viewer & streaming state
│   ├── chat/                 # Stream orchestration, schemas, & Arcjet guards
│   ├── home/                 # Arena landing view
│   ├── leaderboard/          # Win-rate statistics & standings calculation
│   ├── models/               # Model selector modal & catalog views
│   ├── shell/                # Navigation, sidebar, & responsive app frame
│   ├── theme/                # Theme toggles & color definitions
│   └── voting/               # Vote dispatch actions & ballot management
├── infrastructure/           # Data & service adapters
│   ├── current-user.ts       # Clerk-to-Prisma user resolution
│   ├── database.ts           # Prisma database client singleton
│   ├── fetch-model-catalog.ts# OpenRouter catalog fetcher & caching
│   └── model-catalog.ts      # Default model selections & helpers
├── prisma/
│   └── schema.prisma         # Prisma data schema & relations
└── docs/
    └── coding-standards.md   # Architectural principles & style guidelines
```

---

## 🛡️ Security & Performance

- **Parallel Streaming Isolation:** Each model streams through its own isolated connection. If one model fails, the other columns continue streaming without interruption.
- **Fail-Closed Model Verification:** Only free-tier models verified against the live catalog can be invoked, preventing malicious or accidental billing on unauthorized models.
- **Vote Integrity:** Turn ownership verification guarantees that users can only vote on responses generated within their own authenticated sessions.
- **Arcjet Bot & Rate Defense:** Shielded endpoints protect against denial-of-wallet and automated prompt spam.

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository.
2. Create a descriptive feature branch: `git checkout -b feature/amazing-feature`.
3. Ensure formatting and type checks pass:
   ```bash
   npm run typecheck
   npm run lint
   npm run format
   ```
4. Commit your changes: `git commit -m "feat: add amazing feature"`.
5. Push to your branch and open a Pull Request.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
