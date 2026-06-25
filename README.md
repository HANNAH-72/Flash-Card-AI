# Smart Flashcard Generator

## Selected Assignment Option

### Option A: Smart Flashcard Generator

This project is a web-based application that converts study notes into AI-generated flashcards using Natural Language Processing (NLP) techniques. The application helps students review important concepts efficiently and track their learning progress through an interactive flashcard interface.

---

## Technology Stack Used

### Frontend
- React.js
- Vite
- JavaScript (ES6+)
- HTML5
- CSS3

### Backend
- Node.js
- Express.js

### Database
- MongoDB

### Authentication
- JWT (JSON Web Token)
- bcrypt

### AI/ML & NLP
- Python
- NLTK
- Sentence Transformers
- Scikit-learn

---

## Local Setup Instructions

### Prerequisites

Make sure the following are installed:

- Node.js (v18+)
- npm
- Python 3.10+
- MongoDB
- Git

### Clone the Repository

```bash
git clone https://github.com/your-username/smart-flashcard-generator.git
cd smart-flashcard-generator
```

### Install Frontend Dependencies

```bash
npm install
```

### Install Backend Dependencies

```bash
cd server
npm install
```

### Install Python Dependencies

```bash
pip install -r requirements.txt
```

### Configure Environment Variables

Create a `.env` file inside the backend directory:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

### Start the Backend Server

```bash
npm run server
```

### Start the Frontend Application

```bash
npm run dev
```

The application will be available at:

```text
http://localhost:5173
```

---

## Brief Explanation of the AI/ML Implementation

The Smart Flashcard Generator uses Natural Language Processing (NLP) techniques to automatically transform study notes into flashcards.

### How It Works

1. Users enter or upload study notes.
2. The NLP module preprocesses the text using:
   - Tokenization
   - Stop-word removal
   - Sentence segmentation
3. Important concepts and keywords are extracted.
4. The system generates question-answer flashcards automatically.
5. Flashcards are stored and displayed for review.
6. User progress is tracked to improve learning outcomes.

### NLP Techniques Used

- Text Preprocessing
- Keyword Extraction
- Sentence Similarity Analysis
- Named Entity Recognition (NER)
- Automatic Question Generation

### Example

**Input Notes**

```text
Photosynthesis is the process by which plants convert sunlight into chemical energy.
```

**Generated Flashcard**

**Question:** What is photosynthesis?

**Answer:** Photosynthesis is the process by which plants convert sunlight into chemical energy.

### Benefits

- Reduces manual flashcard creation effort.
- Helps students focus on important concepts.
- Improves learning and revision efficiency.
- Provides a personalized study experience.

---

## Features

- User Registration and Login
- AI-Powered Flashcard Generation
- Flashcard Review Mode
- Learning Progress Tracking
- Responsive User Interface
- Secure Authentication

---

## Project Structure

```text
smart-flashcard-generator/
│
├── client/
│   ├── src/
│   ├── public/
│
├── server/
│   ├── routes/
│   ├── controllers/
│   ├── models/
│
├── ml/
│   ├── flashcard_generator.py
│   └── preprocessing.py
│
├── .env
├── package.json
└── README.md
```

---

## Submission Links

### Live Application
Add your deployed application link here.

### GitHub Repository
Add your GitHub repository link here.

---

## Author

Developed as part of the AI/ML Assignment Submission – Option A: Smart Flashcard Generator.