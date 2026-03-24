# 🚀 Skilio: The Next-Generation Career Engine

<p align="center">
  <img src="https://img.shields.io/badge/version-0.1.0-blue.svg" alt="Version">
  <img src="https://img.shields.io/badge/status-active-brightgreen.svg" alt="Status">
  <img src="https://img.shields.io/badge/license-MIT-orange.svg" alt="License">
</p>

**Skilio** is a premium, AI-driven professional ecosystem designed to bridge the chasm between raw talent and industry-leading performance. It's more than just an interview tool; it's a context-aware simulation engine that uses real-time AI to transform how candidates prepare for their dream roles.

---

## 💎 Premium Experience (Sovereign Vault Design)

Skilio features a bespoke, high-end "Sovereign Vault" design system. Experience luxury interview prep with:
- **Glassmorphic Components**: Sleek, translucent layers with subtle blur effects.
- **Dynamic Themes**: Seamless transitions between **Midnight Lab (Dark)**, **Ivory Editorial (Light)**, and **Carbon Terminal**.
- **Micro-Animations**: Fluid interactions powered by Framer Motion.
- **Modern Typography**: Precision-crafted hierarchy using high-end Google Fonts.

---

## 🌟 Key Features

### 🎙️ Intelligent Studio Interviews
Experience authentic technical and behavioral simulations. Our AI doesn't just ask questions—it listens, adapts, and probes deeper based on your responses, creating a truly unique interview path every time.

### 📊 Performance Intelligence (PPS)
Track your **Peak Performance Score (PPS)** on a professional-grade analytics dashboard.
- **Visual Heatmaps**: Identify strengths and blind spots.
- **Trend Analysis**: Monitor your improvement over time with Recharts.
- **Topic-Specific Metrics**: Granular data on technical accuracy, communication, and problem-solving.

### 📄 AI Resume Auditor
Upload your resume (PDF/DOCX) for a deep-tissue diagnostic.
- **Contextual Awareness**: The AI understands your history and tailors interview questions accordingly.
- **Score-Based Assessment**: Get a real-world score of how your resume stacks up against industry benchmarks.

### 💻 Integrated Monaco Code Nexus
A high-performance coding environment directly in your browser.
- **Multi-Language Support**: Python, JavaScript, Java, C++, and more.
- **AI Solution Assessment**: Real-time feedback on code efficiency, readability, and edge-case handling.

### ⚡ Professional Subscriptions
Powered by Razorpay, Skilio offers tiered access for scaling your preparation journey with premium features and unlimited simulations.

---

## 🛠️ The Architectural Core

### Frontend: The Interface
- **Modern Core**: React 18 & Vite
- **Styling**: Tailwind CSS with custom thematic extensions
- **State**: Lightweight & lightning-fast with Zustand
- **Graphics**: Beautiful data visualizations with Recharts
- **Icons**: Crisp, vectorized Lucide React icons

### Backend: The Engine
- **Platform**: Node.js & Express.js
- **Persistence**: Supabase (PostgreSQL) with advanced RLS
- **Authentication**: Clerk (Enterprise-grade security)
- **Real-time**: High-throughput WebSockets (WS)
- **Logistics**: Winston-driven audit logging & multi-layer security (Helmet, HPP, Rate Limiting)
- **Payment Link**: Razorpay Integration

---

## 🚦 Installation & Orchestration

### 1. Prerequisites
Ensure you have the following ready:
- **Node.js**: v18 or newer
- **Clerk**: API keys for identity management
- **Supabase**: URL and Service Role keys
- **NVIDIA NIM / OpenAI**: API keys for the AI core

### 2. Environment Matrix

Create `.env` files in the root (Frontend) and `backend/` directory:

| Variable | Scope | Description |
| :--- | :--- | :--- |
| `VITE_API_URL` | Frontend | Base URL for Express backend |
| `VITE_CLERK_PUBLISHABLE_KEY` | Frontend | Clerk identification |
| `CLERK_SECRET_KEY` | Backend | Clerk backend authorization |
| `SUPABASE_URL` | Backend | Database endpoint |
| `SUPABASE_SERVICE_ROLE_KEY` | Backend | Administrative database access |
| `RAZORPAY_KEY_ID` | Backend | Payment gateway integration |

### 3. Launch Sequence

```bash
# 1. Install Workspace Dependencies
npm install

# 2. Install Engine Dependencies
cd backend && npm install

# 3. Fire up the Development Servers (Two Terminals)
# Terminal A (Frontend)
npm run dev

# Terminal B (Backend)
cd backend && npm run dev
```

---

## 🛡️ Security & Integrity

Skilio is architected with obsessive attention to security:
- **IDOR Prevention**: Every API call verifies ownership via Clerk JWTs.
- **Layered Defense**: Helmet.js for header security and Express Rate Limit for DDoS mitigation.
- **Sanitized Flow**: Input validation and HTML sanitization for AI processing.
- **Audit Trails**: Detailed logging with rotation for performance monitoring.

---

## 📄 License & Vision
Distributed under the **MIT License**. Join us in building the future of career intelligence.

<p align="center">
  Built with ❤️ for the ambitious.
</p>
