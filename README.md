# SeravaAI — Your Supportive Guardian 🛡️🤖

**An AI-powered wellness and safety platform for proactive stress detection, secure evidence management, and empathetic support.**

---
 
## 📖 About SeravaAI
 
SeravaAI is a comprehensive, full-stack wellness and safety platform built to act as a **24/7 supportive guardian** for its users. In a fast-paced, high-stress world, people often lack tools that help them understand their own emotional patterns, document critical situations safely, or access immediate help when it matters most.
 
SeravaAI bridges that gap — combining cutting-edge **AI emotion intelligence**, **secure evidence vaulting**, and an **empathetic AI chatbot** into one cohesive platform.
 
> 🌐 **Try it live:** [https://serava-ai-lac-theta.vercel.app/](https://serava-ai-lac-theta.vercel.app/)
 

---

## ❗ Problems We Solve
 
| Problem | How SeravaAI Helps |
|---|---|
| 😶 No awareness of personal stress patterns | Real-time stress tracking with 7-day & 30-day analytics |
| 📁 No safe place to store critical documentation | Encrypted Evidence Vault via Cloudinary + MongoDB |
| 💬 No accessible mental health support | 24/7 empathetic AI chatbot with emergency escalation |
| ⚖️ No easy access to legal guidance in distress | Automatic Indian Kanoon legal research for high-risk situations |
| 🚨 Slow emergency response access | One-tap "Need Help?" emergency overlay from anywhere in the app |

---

## 🚀 Core Features
 
### 📊 Stress Detection Dashboard
Track your emotional wellbeing with precision and clarity.
- **Real-time Analytics** — Interactive 30-day and 7-day stress trend visualizations
- **Mood Logging** — Deep-dive into daily emotional patterns and dominant moods
- **Visual Insights** — Compact cards displaying stress averages, mood streaks, and distribution
- **Historical Tracking** — Full log of all check-in sessions for long-term pattern detection
### 🔐 Evidence Vault
A secure, organized space for documenting critical situations.
- **Structured Storage** — Organized handling of documents, photos, and media
- **Privacy-First** — Encrypted uploads stored via Cloudinary with MongoDB metadata
- **Quick Retrieval** — Fast, organized access to previously uploaded evidence
- **Tamper-Proof Logging** — Each entry is timestamped and stored securely
### 💬 Empathetic AI Chatbot
An always-available AI companion that understands context and responds with care.
- **Context-Aware Responses** — Powered by a multi-model AI backend for nuanced conversation
- **Emergency Integration** — Instant access to emergency resources directly from the chat
- **Legal Guidance** — Surfaces relevant Indian legal provisions for high-risk scenarios (via Indian Kanoon API)
- **Crisis Detection** — Intelligent risk classification from `low` to `critical` distress levels
### 🆘 Smart Emergency System
Because seconds matter in a crisis.
- **One-Tap Overlay** — "Need Help?" button accessible from any screen
- **Voice-to-Text** — Streamlined reporting for faster interaction during emergencies
- **Guided Response** — Step-by-step support and resource navigation during distress
### 📝 Stealth Notes — Secret Note-Making
A discreet, secret-key protected note-making space designed for users who need privacy at all times.
- **Secret Key Protection** — Notes are locked behind a user-defined secret key, completely separate from the main login
- **Stealth Mode Entry** — Every time a user with a secret key visits the site, they land directly on the Notes page — not the dashboard — keeping the feature hidden in plain sight
- **Instant Disguise** — To any onlooker, the app appears to be just a note-taking tool, concealing the true nature of SeravaAI
- **Persistent & Private** — Notes are encrypted and tied strictly to the secret key; only the keyholder can access them
- **Opt-In Feature** — Users without a secret key skip this entirely and go straight to the dashboard
### 🤖 AI Service — Multi-Layer Emotional Intelligence
A production-grade FastAPI microservice powering the intelligence behind SeravaAI.
- **HF Emotion Detection** — High-precision emotion extraction using Hugging Face transformer models
- **Gemini Fallback** — Seamless failover to Google Gemini for zero service interruption
- **Triple-Layer Failover** — Dynamically switches across 5 AI models and 3 API keys to guarantee uptime
- **3-Layered Agentic AI System** — Orchestrated workflows for highly valuable, accurate, and context-aware responses
- **Periodic Emotion Validation** — Systemic validation of emotional states to ensure analysis consistency and accuracy
- **Low Hallucination** — Multi-pass LangGraph workflows ground responses in verified legal text
- **Jargon-Free Legal Advice** — Complex Indian law translated into plain, actionable guidance


---


## 🛠️ Tech Stack
 
### Frontend & Full-Stack Framework
| Technology | Purpose |
|---|---|
| **Next.js 15** (App Router) | Core framework — SSR, routing, API routes |
| **TypeScript** | Type-safe development across the codebase |
| **Tailwind CSS** | Utility-first styling |
| **React Hook Form + Zod** | Form handling and schema validation |
 
### Backend & AI Services
| Technology | Purpose |
|---|---|
| **Next.js Server Actions** | Seamless server-client data mutations |
| **FastAPI (Python)** | Dedicated AI microservice for emotion analysis |
| **LangGraph** | Multi-step AI workflow orchestration |
| **Hugging Face Models** | Core emotion detection transformers |
| **Google Gemini** | Fallback LLM for AI responses |
 
### Database & Storage
| Technology | Purpose |
|---|---|
| **MongoDB** (Mongoose) | Primary database for users, moods, evidence metadata |
| **Cloudinary** | Secure media and file storage |
| **Firebase** | Authentication |
 
### Infrastructure & Communication
| Technology | Purpose |
|---|---|
| **Vercel** | Frontend deployment & hosting |
| **Google Cloud** | Cloud infrastructure and deployment |
| **Docker** | Containerization of AI service |
| **Twilio** | SMS/communication integrations |
| **Indian Kanoon API** | Real-time Indian legal case and statute retrieval |
 

---

## 🔄 User Flow
 
```
┌─────────────────────────────────────────────────┐
│                  Visit SeravaAI                  │
└─────────────────────────────────────────────────┘
                        │
          ┌─────────────┴─────────────┐
          ▼                           ▼
   🆕 New User                 🔁 Returning User
   (No Account)                (Already Logged In)
          │                           │
          ▼                           │
  1. Sign Up                          │
     (Name, email, password)          │
          │                   ┌───────┴────────┐
          ▼                   ▼                ▼
  2. Profile Setup    🔑 Has Secret Key   ❌ No Secret Key
     (Preferences,           │                │
      emergency              ▼                ▼
      contacts)      📝 Stealth Notes   📊 Dashboard
          │              Page           (Main App)
          │          (App disguised         │
          │          as note-taking)        │
          │                                 │
          └──────────────┬──────────────────┘
                         ▼
              3. 📝 Daily Mood Check-in
                 (Log stress level, dominant
                  emotion, journal notes)
                         │
                         ▼
              4. 📊 Dashboard Review
                 (Trends, mood history,
                  analytics & insights)
                         │
          ┌──────────────┼──────────────┬──────────────┐
          ▼              ▼              ▼              ▼
   💬 Chat with    📁 Evidence    🆘 Emergency   📊 Stress
   AI Companion       Vault          Overlay      Tracker
   (Support &      (Upload docs,  ("Need Help?"  (Log moods,
   legal guidance)  media safely)  resources)    view trends)
```
![System Architecture](./public/assi_architecture.png)

![User Interaction Sequence](./public/user_interaction_sequence.png)

---

## 📂 Folder Structure
 
```
SeravaAI/
│
├── app/                        # Next.js App Router
│   ├── (auth)/                 # Authentication pages (login, signup)
│   ├── (dashboard)/            # Protected dashboard pages
│   │   ├── stress/             # Stress tracking & analytics
│   │   ├── vault/              # Evidence vault
│   │   └── chat/               # AI chatbot interface
│   ├── api/                    # Next.js API route handlers
│   └── layout.tsx              # Root layout
│
├── components/                 # Reusable UI Components
│   ├── ui/                     # Base design system components
│   ├── dashboard/              # Dashboard-specific components
│   ├── chat/                   # Chatbot UI components
│   └── vault/                  # Evidence vault components
│
├── lib/                        # Utilities & Configuration
│   ├── db.ts                   # MongoDB connection
│   ├── cloudinary.ts           # Cloudinary config
│   └── utils.ts                # Shared helper functions
│
├── models/                     # Mongoose Schemas
│   ├── User.ts                 # User model
│   ├── MoodLog.ts              # Mood/stress entry model
│   └── Evidence.ts             # Evidence vault model
│
├── public/                     # Static assets (images, icons)
├── scripts/                    # Utility/seeding scripts
│
├── Ai-Services/                # 🤖 AI Microservice (FastAPI)
│   ├── app/
│   │   ├── models/           # Pydantic request/response models
│   │   ├── routes/           # FastAPI endpoints (/analyze-chat, etc.)
│   │   ├── services/         # LangGraph workflow logic
│   │   ├── utils/            # API wrappers & helpers
│   │   └── main.py           # Application entry point
│   ├── final_verification.py # End-to-end test suite
│   ├── test_kanoon.py        # Indian Kanoon API tests
│   ├── model_report.txt      # AI performance reports
│   ├── render.yaml           # Render deployment config
│   └── requirements.txt      # Python dependencies
│
├── Dockerfile                  # Production container config
├── next.config.ts              # Next.js configuration
├── tsconfig.json               # TypeScript configuration
└── package.json                # Dependencies & scripts
```


---

## 🤝 Contributors

We are a passionate team of developers dedicated to building impactful AI solutions:

- **Abhinav Sharma** - Full Stack Developer
- **Aryan Singh** - Full Stack Developer
- **Sumit Sharma** - Full Stack Developer
- **Shreeyansh Asati** - AI/ML Engineer 

---

## 📄 License
This project is licensed under the **MIT License**.

---

## ✨ Support Us
If you find this project helpful, please consider giving it a ⭐ on GitHub! It helps us continue improving SeravaAI for everyone.

---
*Built with ❤️ for a safer, more aware future.*
