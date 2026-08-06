# DOCMIND AI
**Transform Documents Into Knowledge.**

DOCMIND AI is an enterprise-grade Intelligent Document Processing Platform designed to automate the manual reading, sorting, validating, and extracting of information from documents using state-of-the-art AI.

## 🚀 Features

- **Multi-format Support**: Process PDFs, Images, DOCX, CSV, Excel, and more.
- **Smart AI Extraction**: Identify and extract entities (Names, Emails, Orgs, Invoices, Amounts, etc.).
- **NVIDIA AI Integration**: Cutting edge LLM models via NVIDIA API for classification, summarization, and chat.
- **Semantic Search**: Natural language search across your entire document repository.
- **Bulk Processing**: Upload ZIPs or folders and batch process them.
- **Pixel-perfect UI**: A premium, retro-inspired minimal pixel aesthetic.
- **Enterprise Security**: JWT Auth, RBAC, encrypted storage, and rate-limiting.

## 🏗️ Architecture

The application is built using a modern decoupled architecture:

- **Frontend**: React, Vite, TypeScript, TailwindCSS, Framer Motion, TanStack Query.
- **Backend**: Node.js, Express, TypeScript, Prisma ORM.
- **Database**: Supabase PostgreSQL.
- **Storage**: Supabase Storage for document persistence.
- **AI Engine**: NVIDIA AI API (OpenAI compatible endpoint).

## 📂 Folder Structure

```
.
├── frontend/             # React Vite Application
│   ├── src/
│   │   ├── components/   # Reusable Pixel UI components
│   │   ├── layouts/      # Dashboard and Page layouts
│   │   ├── pages/        # Main application views
│   │   ├── services/     # API integration
│   │   └── ...
├── backend/              # Node.js Express Server
│   ├── prisma/           # Database schema and migrations
│   ├── src/
│   │   ├── controllers/  # Request handlers
│   │   ├── routes/       # API routes
│   │   ├── services/     # Business logic & AI/Storage integrations
│   │   └── ...
└── README.md
```

## 🛠️ Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone <repo-url>
   cd docmind-ai
   ```

2. **Setup Backend:**
   ```bash
   cd backend
   npm install
   ```
   *Edit the `.env` file in the backend directory to include your Supabase DB password and NVIDIA API Key.*
   ```bash
   npx prisma generate
   npx prisma db push
   npm run dev
   ```

3. **Setup Frontend:**
   ```bash
   cd ../frontend
   npm install
   npm run dev
   ```

## 🔐 Environment Variables

### Backend `.env`
```env
PORT=5000
NODE_ENV=development
JWT_SECRET=super_secret_jwt_key
DATABASE_URL="postgres://postgres.[PROJECT_ID]:[PASSWORD]@aws-0-ap-south-1.pooler.supabase.com:6543/postgres"
SUPABASE_URL="https://[PROJECT_ID].supabase.co"
SUPABASE_PUBLISHABLE_KEY="..."
SUPABASE_SECRET_KEY="..."
NVIDIA_API_KEY="..."
```

## 📄 License
MIT License.

# DOCMIND-AI
