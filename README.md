# NEXORA AI — Turn Documents Into Knowledge.

> **"Understand. Analyze. Ask. Discover."**
> 
> *Nexora AI is an AI-powered intelligent document analysis and question-answering platform that transforms documents into knowledge, insights, visual connections, and actionable information.*

---

## 🌟 Executive Overview

**Nexora AI** is a production-grade enterprise document intelligence and knowledge visualization SaaS platform. Rather than acting as a simple file viewer or basic chat interface, Nexora AI processes and indexes unstructured documents across formats, converts them into graphical knowledge topologies, grounds conversational Q&A against exact page and section citations with zero hallucination, and prepares interactive educational study kits.

---

## 🚀 Key Features

### 1. Universal Multi-Format Ingestion & Neural OCR
- **Documents**: PDF, DOCX, DOC, TXT, RTF, ODT, Markdown
- **Spreadsheets**: XLS, XLSX, CSV (row-column relationship extraction)
- **Presentations**: PPT, PPTX
- **Images & Scans**: JPG, JPEG, PNG, WEBP, TIFF (with Tesseract.js neural OCR)
- **Live Progress UI**: Real-time 8-stage processing feedback (Uploading → Reading → OCR/Extraction → Structure Detection → Concept Analysis → Knowledge Graph → Insights → Complete).

### 2. Deep AI Document Analysis & Summaries
- **Executive Summaries**: High-level executive briefings, simple summaries, and detailed chapter-by-chapter breakdowns.
- **Structural Entities**: Automatic detection of Key Points, Core Concepts, Definitions, Facts, Metrics, Numbers, Dates, and Action Items.
- **Domain Adaptation**: Distinct heuristic and LLM flows for Academic documents (chapters, formulas, exam topics) and Business documents (KPIs, decisions, risks, recommendations).

### 3. "Explain Simply" Mode
- **5 Simplicity Levels**: Very Simple (10-Year-Old Level), Student Friendly, Normal, Detailed, and Expert.
- **3 Languages**: English, Hindi (हिंदी), and Hinglish (Conversational Romanized Hindi).

### 4. Grounded RAG Chat & Anti-Hallucination Guardrails
- **Zero-Hallucination Rule**: If facts cannot be supported by document chunks, Nexora AI explicitly states: *"I couldn't find this information in the uploaded document."*
- **Clickable Citations**: Every factual statement is attributed with Document Name, Page Number, Section Title, and exact text snippet.

### 5. 9 Interactive Visual Knowledge Topologies
Convert any document into 9 distinct visual structures:
1. **Mind Map** (Radial hierarchical knowledge tree)
2. **Concept Map** (Node-to-node relational web)
3. **Tree Diagram** (Vertical top-down ontology)
4. **Flowchart** (Logical sequence flow)
5. **Process Diagram** (Operational step-by-step pipeline)
6. **Timeline** (Chronological order of dates and milestones)
7. **Comparison Diagram** (Side-by-side comparative mapping)
8. **Chapter Map** (Syllabus and unit breakdown)
9. **Knowledge Graph** (Interconnected concept cluster)
- **Interactive Controls**: Zoom in/out, fit-view, pan, drag nodes, search concepts, highlight branches, and inspect node details.
- **Node Detail Slide-Over**: Detailed concept explanations, examples, source citations (page & section), and one-click **"Ask AI About This"** query launcher.
- **Transparent Inferences**: AI-inferred relationships are explicitly badged with `AI Inferred`.

### 6. AI Study Mode
- **3D Flip Flashcards**: Interactive flip card animation with concept front and grounded explanation back.
- **Graded MCQ Quiz**: Interactive quiz mode with instant scoring, confetti celebration on mastery, and detailed explanations.
- **Short & Long Questions**: Examination questions with model answers and evaluation rubrics.
- **Quick Revision Sheet**: High-yield one-page cheat sheet for exam and interview preparation.

### 7. Multi-Document Cross Comparison
- Upload two or more documents to identify overlapping concepts, distinct focal points, missing information, and contradictory findings.

### 8. Enterprise Multi-Format Export
- Export analyses, chat logs, mind maps, and study materials into **PDF, Word (.docx), Excel (.xlsx), CSV, Markdown (.md), and JSON**.

### 9. Secure Role-Based Administration System
- **RBAC**: `SUPER_ADMIN`, `ADMIN`, and `USER` roles.
- **Database-Level Isolation**: User A can NEVER view User B's documents or history.
- **Admin Portal**: Dedicated portal at `/admin/login` with system KPIs, document distribution charts, user management (suspend/activate/delete), AI usage tracking, token estimators, and activity audit logs.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS, Lucide React, Canvas-Confetti, jsPDF |
| **Backend** | Node.js, Express.js, Multer, Helmet, CORS, Express-Rate-Limit, JSON Web Tokens (JWT), Bcrypt.js |
| **Database** | MongoDB & Mongoose (with automated dual-mode: connects to external MongoDB URI or built-in persistent storage) |
| **AI Providers** | Google Gemini (`@google/genai`), OpenAI (`openai`), and Built-in Heuristic Semantic Core (Zero-Key offline mode) |
| **Document Parsing** | `pdf-parse`, `mammoth` (DOCX), `xlsx` (Excel), `papaparse` (CSV), `tesseract.js` (OCR) |
| **Document Export** | `pdfkit` (PDFs), `docx` (Word documents), `xlsx` (Excel spreadsheets) |

---

## 📁 Project Structure

```
nexora-ai/
├── package.json                   # Root monorepo orchestration scripts
├── sample_ai_paper.txt            # Ready-to-use sample document for instant testing
├── README.md                      # Comprehensive documentation
│
├── server/                        # Backend REST API Service
│   ├── .env                       # Active server environment variables
│   ├── .env.example               # Safe environment variable template
│   ├── package.json               # Backend dependencies
│   ├── data/                      # Local database persistence store
│   ├── uploads/                   # Secure temporary upload directory
│   ├── exports/                   # Generated reports and export artifacts
│   └── src/
│       ├── index.js               # Express application entrypoint
│       ├── config/
│       │   └── db.js              # Dual-mode database manager & seeder
│       ├── models/                # User, Document, Analysis, Chat, MindMap, Study, Export, Logs
│       ├── middleware/            # Auth JWT, RBAC permissions, Multer uploads, Activity logging
│       ├── services/              # Document processor, AI provider, RAG engine, Mind map generator, Exports
│       ├── controllers/           # Auth, Documents, Analysis, Chat, Mindmaps, Study, Admin
│       └── routes/                # REST API route declarations
│
└── client/                        # Modern React Frontend Application
    ├── package.json               # Frontend dependencies
    ├── vite.config.js             # Vite configuration with backend proxy
    ├── tailwind.config.js         # Tailwind theme & glassmorphic styling
    ├── index.html                 # App shell with Nexora AI metadata
    └── src/
        ├── main.jsx               # React DOM root with Context providers
        ├── App.jsx                # Main application orchestrator
        ├── index.css              # Global styles, scrollbars, 3D flip card utilities
        ├── context/
        │   ├── AuthContext.jsx    # User & admin session management
        │   └── ThemeContext.jsx   # Dark / Light mode switcher
        ├── services/
        │   └── api.js             # Unified REST client with JWT authorization
        └── components/
            ├── brand/             # NexoraLogo, IntroAnimation (2-4s animated splash)
            ├── landing/           # LandingPage with hero interactive flow diagram
            ├── auth/              # AuthModal (Email/Phone), AdminLoginPage
            ├── dashboard/         # UserDashboard, Navbar with quick actions
            ├── upload/            # UploadModal with 8-stage animated progress
            ├── analysis/          # DocumentAnalysisView & Explain Simply
            ├── chat/              # DocumentChatView with grounded citations
            ├── mindmap/           # InteractiveMindMap (9 visual topologies)
            ├── study/             # StudyModeView (Flashcards, MCQs, Revision)
            ├── compare/           # DocumentComparisonView
            ├── history/           # HistoryView (User archives)
            ├── profile/           # ProfileSettingsView
            ├── export/            # ExportModal (PDF, DOCX, XLSX, CSV, JSON)
            └── admin/             # AdminDashboard (KPIs, Users, Audit logs)
```

---

## ⚙️ Installation & Setup

### Prerequisites
- Node.js 18+ and npm installed

### Quick Start (Local Development)

1. **Clone or Navigate to the project directory:**
   ```bash
   cd C:\Users\mdsha\.gemini\antigravity\scratch\nexora-ai
   ```

2. **Install all dependencies (Root, Server, and Client):**
   ```bash
   # From root directory:
   cd server && npm install
   cd ../client && npm install
   ```

3. **Configure Environment Variables (Optional):**
   Copy `.env.example` in `server/` to `.env`:
   ```bash
   cp server/.env.example server/.env
   ```
   > **Note**: Nexora AI includes an intelligent built-in semantic engine and persistent embedded database. You can run the application **immediately without entering any API keys**! If you provide `GEMINI_API_KEY` or `OPENAI_API_KEY`, it will automatically unlock full generative model capabilities.

4. **Start Backend Server:**
   ```bash
   cd server
   npm start
   # Server runs on http://localhost:5000
   ```

5. **Start Frontend Client:**
   ```bash
   cd client
   npm run dev
   # Client runs on http://localhost:3000
   ```

6. Open your browser and navigate to `http://localhost:3000`.

---

## 🔐 Credentials & Admin Access

### Super Admin Default Login
- **URL**: `http://localhost:3000` (click "Admin Portal" in footer or go to `/admin/login`)
- **Email**: `mdshadalam848@gmail.com`
- **Password**: `Nexor@Ai`
- **Role**: `SUPER_ADMIN`

### New User Registration
- Open the landing page at `http://localhost:3000`
- Click **"Get Started"**
- Register using any Name, Email or Phone, and Password.

---

## ☁️ Deployment Guide

### Deploying to Replit
1. Create a new Node.js Repl.
2. Clone or upload the `nexora-ai` repository files.
3. In Repl Secret Manager, set:
   - `JWT_SECRET`: Any random 32-character string
   - `PORT`: `5000`
   - `GEMINI_API_KEY` (Optional): Your Gemini API key
4. Run:
   ```bash
   cd server && npm install && npm start &
   cd client && npm install && npm run build && npx serve -s dist -l 3000
   ```

### Deploying with Docker
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY . .
RUN cd server && npm install
RUN cd client && npm install && npm run build
EXPOSE 5000
CMD ["node", "server/src/index.js"]
```

---

## 🛡️ Anti-Hallucination Philosophy
Nexora AI is built on the principle that document intelligence must be factual. When querying documents:
1. Only retrieved semantic chunks are provided as context.
2. If the user's inquiry cannot be verified in the excerpts, the system explicitly reports that the information was not found.
3. Every generated statement provides exact page number and section citations.
4. Any relational connection in a mind map that is inferred by AI rather than explicitly stated in the document is badged as `AI Inferred`.

---

## 📄 License
Nexora AI is licensed under the MIT License.
