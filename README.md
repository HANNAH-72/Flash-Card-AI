# FlashMind AI – Smart Flashcard Generator

---

## Selected Assignment Option
**Option 1: AI-Powered Study Assistant / Smart Flashcard Generator**

An interactive educational platform leveraging local Natural Language Processing (NLP) models to automatically generate study flashcards from unstructured text or uploaded PDF documents. Features include a Spaced Repetition System (SRS) algorithm to optimize student recall and custom data visualization dashboards tracking study progress.

---

## Key Features

- **AI Flashcard Generation**: Instantly parses study notes or uploads PDFs to extract keyphrase concepts and generate structured Question-and-Answer cards.
- **Local NLP Execution**: Runs SpaCy, NLTK, and local HuggingFace Flan-T5 pipelines entirely on the backend server.
- **Spaced Repetition System (SRS)**: Auto-computes memory review schedules based on user ratings (Easy: 5 days, Medium: 2 days, Hard: 1 day).
- **Glassmorphic SaaS Analytics**: Tracking dashboard charts (weekly progress, accuracy percentage, study streaks, category performances).
- **Secure Authentication**: JWT-based stateless authorization, Bcrypt password hashing, and role-ready routes protection.
- **Responsive Theme Controls**: Full support for Dark Mode/Light Mode toggle.

---

## Technology Stack

### Frontend
- **React.js** (Vite scaffolding)
- **Tailwind CSS v4** (Modern compiler)
- **React Router Dom** (Single-page app client routing)
- **Recharts** (Visual dashboard charts rendering)
- **Axios** (JWT header injection request client)
- **Lucide Icons** (Dashboard icons library)

### Backend
- **FastAPI** (Python high-performance REST APIs)
- **SQLAlchemy ORM** (Database schema management)
- **PyJWT & Bcrypt** (Token cryptography and password hashing)
- **PyPDF** (In-memory PDF text extraction)

### Database
- **PostgreSQL** (Production database, e.g., Neon PG)
- **SQLite** (Automated zero-config local development fallback)

### AI/NLP Engine
- **SpaCy** (`en_core_web_sm` model for tokenization and dependency parsing)
- **NLTK** (Stopword filters and sentence boundaries checking)
- **HuggingFace Transformers** (`google/flan-t5-small` text generation pipeline)

---

## System Architecture

```mermaid
graph TD
    A[Raw Notes / Uploaded PDF Text] --> B[SpaCy Text Preprocessing]
    B --> C[Sentence Tokenization & Stopword Removal]
    C --> D[Keyword Extraction - KeyBERT / Noun Chunks]
    D --> E[Neural Generation - Flan-T5 Q&A / Syntactic Rule Parser]
    E --> F[Difficulty Classification - Readability & Complexity Score]
    F --> G[Save Flashcards to Database]
```

### Hybrid NLP Pipeline Strategy
To ensure the application starts up instantly and remains highly responsive even on host servers without dedicated GPUs or high RAM, FlashMind AI employs a **Hybrid NLP Generation Pipeline**:
1. **Neural Model Mode**: Loads HuggingFace's `google/flan-t5-small` text-generation pipeline to query context-driven questions and answers, alongside `KeyBERT` keyword analysis.
2. **Rule-Based Fallback Mode**: Instantly activated if transformers fail to load or are omitted. Utilizes SpaCy syntactic dependencies parsing to identify definitions (copula verbs like "is/are"), passive clauses, and active objects to formulate accurate QA pairs.

---

## Directory Structure

```
flashmind-ai/
├── backend/
│   ├── app/
│   │   ├── routers/             # API Router files (auth, flashcards, reviews, analytics, profile)
│   │   ├── config.py            # Environment configurations (JWT secrets, database paths)
│   │   ├── database.py          # SQLAlchemy Session mapping
│   │   ├── models.py            # SQLAlchemy table definitions
│   │   ├── schemas.py           # Pydantic data schemas
│   │   ├── auth.py              # Cryptography and get_current_user dependencies
│   │   └── nlp.py               # SpaCy & Flan-T5 pipeline handlers
│   ├── requirements.txt         # Backend Python packages
│   ├── seed.py                  # Seed script populating sample dashboard data
│   └── run.py                   # Dev server uvicorn trigger script
├── frontend/
│   ├── src/
│   │   ├── assets/              # Logos and media resources
│   │   ├── components/          # Reusable navbar, sidebar, flashcards, upload handlers
│   │   ├── context/             # AuthContext, ThemeContext, and ToastContext providers
│   │   ├── pages/               # Page routes (Home, Login, Dashboard, Analytics, etc.)
│   │   ├── services/            # Axios API config client
│   │   ├── App.jsx              # Main routing hub
│   │   └── index.css            # Tailwind import stylesheet
│   ├── package.json             # Frontend NPM packages
│   └── vite.config.js           # Vite server definitions
├── render.yaml                  # Render service blueprint
├── .env.example                 # Env variables blueprint
└── README.md                    # System guidelines
```

---

## Local Setup Instructions

### Prerequisites
- **Node.js** (v18 or higher)
- **Python** (v3.10 or higher)

### 1. Backend Setup
1. Open a terminal and navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a Python virtual environment:
   ```bash
   python -m venv venv
   # On Windows (PowerShell):
   .\venv\Scripts\Activate.ps1
   # On macOS/Linux:
   source venv/bin/activate
   ```
3. Install the dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Download the required NLP modules (SpaCy & NLTK):
   ```bash
   python -c "import spacy; spacy.cli.download('en_core_web_sm'); import nltk; nltk.download('stopwords'); nltk.download('punkt')"
   ```
5. Configure environment variables in `.env` file. Create a `.env` file in the `backend` directory (copied from the root `.env` template) and set your cloud-based Neon PostgreSQL `DATABASE_URL`:
    ```bash
    # Example format:
    DATABASE_URL=postgresql://USER:PASSWORD@ep-hostname.us-east-2.aws.neon.tech/neondb?sslmode=require
    JWT_SECRET=super-secret-flashmind-key-123456789
    ```
 6. Launch the development backend server:
    ```bash
    python run.py
    ```
    The backend API will be available at `http://127.0.0.1:8000`. You can inspect interactive Swagger API documentation at `http://127.0.0.1:8000/docs`.

### 2. Frontend Setup
1. Open a new terminal session and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install npm packages (ignoring older peer constraints if necessary):
   ```bash
   npm install --legacy-peer-deps
   ```
3. Run the frontend local development server:
   ```bash
   npm run dev
   ```
   The React web app will open at `http://localhost:5173`.

---

## Database Seeding & Demo Account
To inspect the SaaS dashboard charts and spaced repetition states instantly, click the "Use Demo Account" button on the login screen or log in manually with the following credentials:
- **Email**: `student@flashmind.ai`
- **Password**: `FlashMind@2026`

---

## Repository Size Compliance
The repository has been optimized to ensure it remains clean and lightweight (under 25 MB):
- **Frontend**: ~334.4 KB
- **Backend**: ~74.2 KB
- **Assets**: ~817.5 KB (Compressed SVG icons and brand assets)
- **Configuration Files**: ~13.1 KB
- **Total Repository size**: ~1.21 MB (excluding `node_modules`, `venv`, and NLP model files, which are excluded dynamically via `.gitignore`).

---

## API Documentation Reference

### Authentication & Profile
- `POST /api/auth/register` - Create user profile.
- `POST /api/auth/login` - Validate credentials and return JWT bearer token. Accepts `username` (email) and `password` as form-urlencoded data.
- `POST /api/auth/forgot-password` - Generate a secure password reset token (generates reset links printed to logs).
- `POST /api/auth/reset-password` - Process password reset using the token.
- `GET /api/auth/profile` - Fetch profile of the logged-in user.
- `PUT /api/profile` - Modify name, email address, or update account password.
- `DELETE /api/profile` - Permanently remove the user profile and all related cards.

### Flashcard Management
- `POST /api/flashcards/generate` - Parse raw notes text and generate cards.
- `POST /api/flashcards/generate/pdf` - Extract text from uploaded PDF and generate cards.
- `POST /api/flashcards` - Manually create a flashcard.
- `GET /api/flashcards` - Search, filter by subject or difficulty, list all cards. Returns `items`, `total`, and a list of `subjects`.
- `GET /api/flashcards/{id}` - Details of a card.
- `PUT /api/flashcards/{id}` - Update a card (change content, difficulty, favorite status).
- `DELETE /api/flashcards/{id}` - Delete a card.

### Reviews & SRS
- `POST /api/reviews` - Log a flashcard review difficulty rating (Easy/Medium/Hard) and update study date schedules.
- `GET /api/reviews` - Fetch history logs of all submitted reviews.
- `POST /api/reviews/session` - Log a completed study session summary (total reviewed, accuracy rate).

### Analytics & Profile
- `GET /api/analytics` - Return statistical summaries, weekly review counts, and categorical distributions for chart rendering.

---

## Production Deployment Instructions (How to Create Live Deployment Links)

Follow these step-by-step instructions to deploy both components live and obtain accessible URLs:

### Phase 1: Deploying the Database (Neon PostgreSQL)
1. Sign up for a free PostgreSQL instance at [Neon.tech](https://neon.tech).
2. Create a new database project. Once provisioned, copy the **Connection String** from the Neon dashboard (e.g., `postgresql://user:password@ep-hostname.us-east-2.aws.neon.tech/neondb?sslmode=require`).
3. This database will host user profiles, study flashcards, and review stats in production.

### Phase 2: Deploying the Backend (Render.com)
1. Sign up/log in at [Render.com](https://render.com).
2. Click **New +** at the top right of the dashboard and select **Blueprint**.
3. Connect your GitHub repository containing the project files.
4. Render will read the `render.yaml` file from the root directory and set up the Python environment, download NLP dependencies (SpaCy `en_core_web_sm` and NLTK packages), and trigger the startup command (`uvicorn backend.app.main:app`).
5. Render will ask for the following environment variables:
   - `DATABASE_URL`: Paste the PostgreSQL connection string you copied from Neon.tech in Phase 1.
   - `JWT_SECRET`: Enter a secure random string (e.g., `super-secret-key-xyz`) to sign session tokens.
6. Click **Deploy**. When the build completes successfully, Render will provide a live service URL at the top left of the console (e.g., `https://flashmind-ai-backend.onrender.com`). **Copy this URL.**

### Phase 3: Deploying the Frontend (Vercel)
1. Sign up/log in at [Vercel.com](https://vercel.com).
2. Click **Add New** and choose **Project**, then connect your GitHub repository.
3. Configure the Vercel project deployment options:
   - Set **Root Directory** to `frontend`.
   - Vercel will automatically detect Vite and set the build command to `npm run build` and output directory to `dist`.
4. Expand the **Environment Variables** section and add:
   - Key: `VITE_API_URL`
   - Value: Paste the live Render backend URL from Phase 2 (e.g., `https://flashmind-ai-backend.onrender.com`). Make sure there is no trailing slash.
5. Click **Deploy**.
6. Vercel will build the React bundle and deploy the static site. Once complete, it will provide a live public URL (e.g., `https://flashmind-ai.vercel.app`) which serves as your final application link.
