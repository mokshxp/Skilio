# 🚀 Skilio: AI-Powered Interview Preparation Platform

**Skilio** is a premium, AI-driven career engine designed to bridge the gap between candidate potential and job market excellence. By combining real-time AI feedback with resume-specific context, Skilio provides an immersive environment for technical interview simulation, resume auditing, and deep-dive performance analytics.

---

## ✨ Core Capabilities

- **🎙️ Intelligent Interview Simulations**: Real-time, context-aware technical, behavioral, and coding interviews powered by Large Language Models.
- **📄 Automated Resume Auditing**: Multi-format support (PDF, DOCX) with structured data extraction and score-based feedback tailored to your experience.
- **🤖 AI Copilot (Chatbot)**: A dedicated AI assistant to help you with study plans, weak points, and general interview advice.
- **📊 Performance Intelligence**: Interactive analytics dashboard tracking your "Peak Performance Score" (PPS), interview readiness, and topic-specific strengths.
- **💻 Integrated Coding Environment**: Fully functional code editor (Monaco) with multi-language support and AI-driven solution assessment.
- **🎨 Premium UI/UX**: Three distinct themes — **Midnight Lab**, **Ivory Editorial**, and **Carbon Terminal** — for a personalized preparation atmosphere.

---

## 🛠️ The Technology Stack

| Layer          | Technology                                                                                                                                                             |
| :------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Frontend**   | React 18, Vite, Tailwind CSS, Framer Motion (Animations), Recharts (Data Viz), Lucide React (Icons)                                                                    |
| **Backend**    | Node.js / Express.js, WebSocket (Real-time events), Winston/Morgan (Logging)                                                                                           |
| **Auth**       | [Clerk](https://clerk.com/) (Managed Auth, JWT verification)                                                                                                           |
| **Database**   | [Supabase](https://supabase.com/) (Postgres, PostgreSQL)                                                                                                                |
| **AI Engine**  | [NVIDIA NIM](https://www.nvidia.com/en-us/ai/) / OpenAI (LLMs for generation and assessment)                                                                           |

---

## 🚦 Getting Started

### 1. Prerequisites
- Node.js (v18+)
- [Clerk Dashboard](https://dashboard.clerk.com/) account
- [Supabase Project](https://supabase.com/) account
- [NVIDIA API Key](https://build.nvidia.com/) or OpenAI API Key

### 2. Environment Configuration
Create a `.env` file in the root directory for the Frontend, and the `backend/` directory for the server:

**Frontend (.env in root):**
```bash
VITE_API_URL=http://localhost:8000
VITE_WS_URL=ws://localhost:8000
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
```

**Backend (.env in `backend/`):**
```bash
PORT=8000
CLERK_SECRET_KEY=sk_test_...
SUPABASE_URL=https://xyz.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sb_secret_...
NVIDIA_API_KEY=nvapi-...
```

### 3. Installation & Local Development

Install dependencies in both folders:
```bash
# From root
npm install

# In backend folder
cd backend && npm install
```

Start the application:
```bash
# In one terminal (starts Frontend)
npm run dev

# In another terminal (starts Backend server)
cd backend && npm run dev
```

---

## 🛡️ Security Architecture

Skilio is architected with a **Security-First** mindset:
1. **Abuse Protection**: Implementation of rate-limiting to prevent brute-force attacks and scraping.
2. **IDOR Prevention**: All API endpoints enforce strict ownership checks using authenticated Clerk User IDs.
3. **Data Sanitization**: Input validation and sanitization for AI processing.
4. **Logging**: Real-time audit logs of auth failures and API errors via Winston.

---

## 📄 License
Distributed under the MIT License.

---
<p align="center">
  Generated with ❤️ by <b>Skilio Dev Team</b>
</p>
