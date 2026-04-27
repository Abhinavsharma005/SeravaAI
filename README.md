# SeravaAI — Your Supportive Guardian 🛡️🤖

**Live Demo**: [serava-ai-lac-theta.vercel.app](https://serava-ai-lac-theta.vercel.app/)

SeravaAI is a comprehensive wellness and safety platform designed to empower users through proactive stress detection, secure evidence management, and empathetic AI support.

---

## 🌟 The Problem We Solve
In an increasingly digital and fast-paced world, individuals often lack:
1. **Emotional Awareness**: Difficulty in tracking and understanding stress patterns.
2. **Secure Documentation**: No centralized, tamper-proof way to gather evidence during critical situations.
3. **Immediate Support**: Lack of accessible, non-judgmental guidance during emotional or physical distress.

**SeravaAI** bridges these gaps by combining advanced emotion tracking with a secure safety net, providing a "Supportive Guardian" always at your side.

---

## 🚀 Core Features

### 📊 Stress Detection Dashboard
- **Real-time Analytics**: Interactive 30-day and 7-day stress trends.
- **Mood Tracking**: Deep dives into emotional logs and dominant mood patterns.
- **Visual Insights**: Compact, information-dense cards showing averages and streaks.

### 🔐 Evidence Vault
- **Secure Handling**: Organized storage for critical documentation and media.
- **Privacy First**: Secure uploads and encrypted storage via Cloudinary and MongoDB.

### 💬 Empathetic Chatbot
- **24/7 AI Companion**: Context-aware support powered by advanced language models.
- **Emergency Integration**: Fast access to emergency resources directly from the chat interface.

### 🆘 Smart Emergency System
- **Need Help?**: Instant overlay for critical situations.
- **Voice-to-Text Integrations**: Streamlined reporting and interaction.

---

## 🤖 AI Service (FastAPI Microservice)
Our backend is powered by a production-grade AI microservice designed for high resilience and specialized intelligence.

### 🌈 Multi-Layer Emotional Intelligence
- **HF Emotion Detection**: High-precision core emotion extraction using Hugging Face models.
- **Gemini Fallback**: Seamless fallback to Google Gemini to ensure zero service interruption.
- **Risk Assessment**: Intelligent classification of distress levels from `low` to `critical`.

### ⚖️ Smart Legal Support (Indian Kanoon)
- **Automatic Research**: Real-time retrieval of Indian Central Acts and Rules (e.g., IPC sections) for high-risk situations.
- **Jargon-Free Explanations**: Complex legal data translated into actionable, empathetic advice.

### 🛡️ Production-Grade Resilience
- **Triple-Layer Failover**: Dynamically switches between 5 AI models and 3 API keys during outages.
- **Low Hallucination**: Uses a multi-pass LangGraph workflow to ground AI responses in verified legal text.

### 📂 AI Service Repository Structure
```text
.
├── app/                  # Core FastAPI application logic
│   ├── models/           # Pydantic models for request/response
│   ├── routes/           # API endpoints (e.g., /analyze-chat)
│   ├── services/         # Business logic & LangGraph workflows
│   ├── utils/            # Helper functions & external API wrappers
│   └── main.py           # Application entry point
├── final_verification.py # Automated E2E testing script
├── model_report.txt      # AI performance & accuracy reports
├── render.yaml           # Deployment configuration for Render
├── requirements.txt      # Python dependencies
└── test_kanoon.py        # Indian Kanoon API verification script
```

---

## 🛠️ Tech Stack

- **Frontend**: [Next.js 16](https://nextjs.org/) (App Router), [TypeScript](https://www.typescriptlang.org/), [Tailwind CSS](https://tailwindcss.com/)
- **Backend/API**: Next.js Server Actions & API Routes, [FastAPI](https://fastapi.tiangolo.com/) (AI Services)
- **Database**: [MongoDB](https://www.mongodb.com/) (Mongoose)
- **Auth & Storage**: [Firebase](https://firebase.google.com/), [Cloudinary](https://cloudinary.com/)
- **Communication**: [Twilio](https://www.twilio.com/)
- **State Management**: [React Hook Form](https://react-hook-form.com/), [Zod](https://zod.dev/)

---

## 🔄 User Flow

1. **Onboarding**: Users sign up and configure their profile.
2. **Daily Check-ins**: Log moods and stress levels via the interactive dashboard.
3. **Active Support**: Engage with the AI Chatbot for emotional guidance or crisis management.
4. **Evidence Gathering**: Securely store media or documents in the Evidence Vault during stressful encounters.
5. **Emergency Response**: Use the "Need Help?" toggle for immediate assistance.

---

## 📂 Folder Structure

```text
├── app/               # Next.js App Router (Pages, Layouts, API)
├── components/        # Reusable UI Components
├── lib/               # Utility functions, DB connection
├── models/            # Mongoose Schemas (User, Evidence, Stress)
├── public/            # Static assets
└── Dockerfile         # Production container configuration
```

---

## 🤝 Contributors

We are a passionate team of developers dedicated to building impactful AI solutions:

- **Abhinav Sharma** - Full Stack Developer
- **Aryan Singh** - Full Stack Developer
- **Sumit Sharma** - Full Stack Developer
- **Shreeyansh Asati** - FastAPI & AI Integration

---

## 📄 License
This project is licensed under the **MIT License**.

---

## ✨ Support Us
If you find this project helpful, please consider giving it a ⭐ on GitHub! It helps us continue improving SeravaAI for everyone.

---
*Built with ❤️ for a safer, more aware future.*
