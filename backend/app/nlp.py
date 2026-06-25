import os
import re
import logging
from typing import List, Dict, Tuple
from pypdf import PdfReader

# Setup logging
logger = logging.getLogger("flashmind.nlp")

# Lazy loading flags for ML components
SPACY_NLP = None
NLTK_DOWNLOADED = False
FLAN_T5_PIPELINE = None
KEYBERT_MODEL = None

def init_spacy_and_nltk():
    """Download and load spacy and nltk resources dynamically on demand."""
    global SPACY_NLP, NLTK_DOWNLOADED
    
    if SPACY_NLP is None:
        import spacy
        try:
            SPACY_NLP = spacy.load("en_core_web_sm")
            logger.info("Loaded SpaCy en_core_web_sm model.")
        except IOError:
            logger.info("SpaCy en_core_web_sm not found. Downloading...")
            spacy.cli.download("en_core_web_sm")
            SPACY_NLP = spacy.load("en_core_web_sm")
            logger.info("Downloaded and loaded SpaCy en_core_web_sm model.")

    if not NLTK_DOWNLOADED:
        import nltk
        try:
            nltk.data.find("corpora/stopwords")
            nltk.data.find("tokenizers/punkt")
        except LookupError:
            logger.info("NLTK stopwords/punkt not found. Downloading...")
            nltk.download("stopwords", quiet=True)
            nltk.download("punkt", quiet=True)
        NLTK_DOWNLOADED = True
        logger.info("NLTK resources checked and loaded.")


def extract_text_from_pdf(file_path: str) -> str:
    """Extract and combine text from all pages of a PDF file using pypdf."""
    try:
        reader = PdfReader(file_path)
        text = ""
        for page in reader.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"
        return text.strip()
    except Exception as e:
        logger.error(f"Error extracting text from PDF {file_path}: {str(e)}")
        raise ValueError(f"Failed to read PDF file: {str(e)}")


def clean_text(text: str) -> str:
    """Normalize whitespace and strip garbage characters from input text."""
    # Remove excessive newlines and tabs
    text = re.sub(r"\s+", " ", text)
    # Remove weird characters but keep punctuation
    text = re.sub(r"[^\w\s\.,;!\?\-\(\)]", "", text)
    return text.strip()


def extract_keywords_heuristic(text: str, top_n: int = 5) -> List[str]:
    """Heuristic keyword extraction using SpaCy POS tag filtering and NLTK stopwords."""
    init_spacy_and_nltk()
    from nltk.corpus import stopwords
    
    doc = SPACY_NLP(text)
    stop_words = set(stopwords.words("english"))
    
    # Extract noun phrases, adjectives, and proper nouns
    candidates = []
    for token in doc:
        if token.is_stop or token.is_punct or token.lower_ in stop_words:
            continue
        if token.pos_ in ["NOUN", "PROPN", "ADJ"]:
            candidates.append(token.text.lower())
            
    # Include noun chunks (multi-word terms)
    for chunk in doc.noun_chunks:
        chunk_clean = chunk.text.lower().strip()
        # Ensure it doesn't consist entirely of stopwords
        words = chunk_clean.split()
        filtered_words = [w for w in words if w not in stop_words and len(w) > 2]
        if len(filtered_words) > 0 and chunk_clean not in stop_words:
            candidates.append(" ".join(filtered_words))

    # Frequency analysis
    from collections import Counter
    counts = Counter(candidates)
    
    # Sort by frequency and length (prefer multi-word terms)
    sorted_keywords = sorted(
        counts.items(),
        key=lambda x: (x[1], len(x[0])),
        reverse=True
    )
    
    # Filter uniques and return top_n
    seen = set()
    result = []
    for keyword, _ in sorted_keywords:
        if keyword not in seen and len(keyword) > 3:
            seen.add(keyword)
            result.append(keyword.title())
            if len(result) >= top_n:
                break
    return result


def extract_keywords_keybert(text: str, top_n: int = 5) -> List[str]:
    """KeyBERT based keyword extraction (ML mode). Fallback to heuristic if keybert is not present."""
    global KEYBERT_MODEL
    try:
        from keybert import KeyBERT
        if KEYBERT_MODEL is None:
            KEYBERT_MODEL = KeyBERT()
        keywords = KEYBERT_MODEL.extract_keywords(
            text, 
            keyphrase_ngram_range=(1, 2), 
            stop_words="english", 
            top_n=top_n
        )
        return [kw[0].title() for kw in keywords]
    except ImportError:
        logger.debug("KeyBERT is not installed. Using SpaCy heuristic extraction.")
        return extract_keywords_heuristic(text, top_n)
    except Exception as e:
        logger.error(f"KeyBERT error: {str(e)}. Falling back to heuristic.")
        return extract_keywords_heuristic(text, top_n)


def generate_qa_syntactic(text: str) -> List[Tuple[str, str]]:
    """
    Parse text structure using SpaCy to generate flashcards based on definitions and clauses.
    This works locally, instantly, and with high precision.
    """
    init_spacy_and_nltk()
    doc = SPACY_NLP(text)
    qa_pairs = []
    
    # Process sentence by sentence
    for sent in doc.sents:
        sent_str = sent.text.strip()
        if len(sent_str.split()) < 6:
            continue  # Skip short phrases
            
        # 1. Definition patterns: "X is the Y that Z..." or "X refers to Y..."
        match_definition = re.search(
            r"^([A-Z][A-Za-z0-9\s\-]{2,30})\s+(is\s+defined\s+as|is\s+the|is\s+a|are\s+the|are\s+a|refers\s+to)\s+(.+)$",
            sent_str,
            re.IGNORECASE
        )
        if match_definition:
            subject = match_definition.group(1).strip()
            verb = match_definition.group(2).strip()
            definition = match_definition.group(3).strip()
            
            # Make sure definition starts with lowercase or uppercase appropriately
            if definition and definition[0].islower():
                definition = definition[0].upper() + definition[1:]
                
            q = f"What {verb} {subject.lower()}?"
            # Clean punctuation at end of question
            if not q.endswith("?"):
                q += "?"
            # Clean subject capitalization
            q = q.replace(f" {subject.lower()}?", f" {subject}?")
            
            # Clean answer
            ans = definition
            if not ans.endswith("."):
                ans += "."
                
            qa_pairs.append((q, ans))
            continue
            
        # 2. Passive voice patterns: "X is released / produced / created by Y"
        # We can detect this using SpaCy dependency tags (nsubjpass, auxpass)
        has_passive = False
        subj = ""
        agent = ""
        verb_text = ""
        prep_phrase = ""
        
        for token in sent:
            if token.dep_ == "nsubjpass":
                subj = token.text
            elif token.dep_ == "auxpass":
                has_passive = True
            elif token.dep_ == "agent":
                agent = " ".join([t.text for t in token.subtree])
            elif token.pos_ == "VERB" and token.dep_ == "ROOT":
                verb_text = token.text
                
        # Also capture prepositional phrases at the end (like "during photosynthesis")
        if has_passive and subj:
            # Reconstruct the sentence parts
            # Look for a simple question: "What is [verb] [prep phrase]?"
            prep_tokens = []
            start_prep = False
            for token in sent:
                if token.pos_ in ["ADP", "SCONJ"] and token.idx > sent.root.idx:
                    start_prep = True
                if start_prep:
                    prep_tokens.append(token.text)
            prep_phrase = " ".join(prep_tokens)
            
            if prep_phrase:
                q = f"What is {verb_text} {prep_phrase}?"
                ans = subj.capitalize() + "."
                qa_pairs.append((q, ans))
                continue
                
        # 3. Action/Fact patterns: "Chlorophyll absorbs red and blue light."
        # If sentence has a clear active ROOT verb and subject
        subj_active = ""
        dobj_active = ""
        verb_active = ""
        for token in sent:
            if token.dep_ == "nsubj" and token.pos_ in ["NOUN", "PROPN"]:
                subj_active = " ".join([t.text for t in token.subtree if t.dep_ in ["nsubj", "amod", "det", "compound"]])
            elif token.dep_ == "dobj":
                dobj_active = " ".join([t.text for t in token.subtree if t.idx >= token.idx])
            elif token.pos_ == "VERB" and token.dep_ == "ROOT":
                verb_active = token.text
                
        if subj_active and verb_active and dobj_active:
            # Construct: "What does [subj] [verb_base]?" -> [dobj]
            # Simple fallback: "What is the role/action of [subj]?" or "What {verb} {dobj}?"
            # Let's do: "What {verb} {dobj}?"
            q = f"What {verb_active} {dobj_active}?"
            # Clean punctuation
            if not q.endswith("?"):
                q = q.rstrip(".") + "?"
            ans = subj_active.capitalize() + "."
            qa_pairs.append((q, ans))

    return qa_pairs


def generate_qa_flan_t5(text: str) -> List[Tuple[str, str]]:
    """Generate Q&A pairs using local google/flan-t5-small transformer pipeline. Fallback if not available."""
    global FLAN_T5_PIPELINE
    try:
        from transformers import pipeline
        import torch
        
        if FLAN_T5_PIPELINE is None:
            logger.info("Initializing google/flan-t5-small pipeline...")
            device = 0 if torch.cuda.is_available() else -1
            FLAN_T5_PIPELINE = pipeline(
                "text2text-generation",
                model="google/flan-t5-small",
                device=device
            )
            logger.info("Loaded google/flan-t5-small model pipeline.")

        # Split text into sentences/paragraphs
        init_spacy_and_nltk()
        doc = SPACY_NLP(text)
        sentences = [sent.text.strip() for sent in doc.sents if len(sent.text.strip().split()) > 8]
        
        qa_pairs = []
        # Query Flan-T5 for each large sentence/paragraph
        for i, sent in enumerate(sentences[:10]):  # Limit to top 10 sentences for speed
            prompt = (
                f"Generate one clear trivia question and its short answer from the context.\n"
                f"Context: {sent}\n"
                f"Format: Question: <question> Answer: <answer>"
            )
            output = FLAN_T5_PIPELINE(prompt, max_length=64, num_return_sequences=1)
            generated_text = output[0]["generated_text"]
            
            # Parse output
            match = re.search(r"Question:\s*(.*?)\s*Answer:\s*(.*)", generated_text, re.IGNORECASE)
            if match:
                q = match.group(1).strip()
                a = match.group(2).strip()
                if q and a:
                    qa_pairs.append((q, a))
            else:
                # If structure isn't exactly matched, try splitting by "?"
                if "?" in generated_text:
                    parts = generated_text.split("?")
                    q = parts[0].strip() + "?"
                    a = "?".join(parts[1:]).strip()
                    # Remove any "Answer:" prefix
                    a = re.sub(r"^Answer:\s*", "", a, flags=re.IGNORECASE).strip()
                    if q and a:
                        qa_pairs.append((q, a))
                        
        if len(qa_pairs) == 0:
            raise ValueError("Flan-T5 generated no valid question-answer pairs.")
            
        return qa_pairs
        
    except ImportError:
        logger.debug("Transformers/Torch not installed. Using SpaCy syntactic generator.")
        return generate_qa_syntactic(text)
    except Exception as e:
        logger.error(f"Flan-T5 generation error: {str(e)}. Falling back to SpaCy syntactic generator.")
        return generate_qa_syntactic(text)


def classify_difficulty(question: str, answer: str) -> str:
    """Classify the difficulty of a flashcard based on word count and vocab complexity."""
    total_words = len(question.split()) + len(answer.split())
    # Standard classification
    if total_words < 12:
        return "Easy"
    elif total_words < 25:
        return "Medium"
    else:
        return "Hard"


def generate_flashcards_pipeline(notes: str) -> List[Dict[str, str]]:
    """
    Executes the full NLP flashcard generation pipeline:
    1. Preprocesses and cleans notes text.
    2. Generates Q&A pairs (using Flan-T5 with fallback to SpaCy syntax analysis).
    3. Classifies difficulty for each card.
    """
    cleaned = clean_text(notes)
    if not cleaned or len(cleaned.split()) < 5:
        return []
        
    # Generate Q&A pairs
    # In local testing, if Flan-T5 is not present, generate_qa_flan_t5 automatically
    # falls back to generate_qa_syntactic, ensuring rapid development.
    qa_pairs = generate_qa_flan_t5(cleaned)
    
    # If Flan-T5 or SpaCy returned nothing, run rule-based generator explicitly
    if not qa_pairs:
        qa_pairs = generate_qa_syntactic(cleaned)
        
    # Standard fallback if still no Q&A pairs (e.g., text is single line or bullet list)
    if not qa_pairs:
        # Just create a general question about the keywords
        keywords = extract_keywords_heuristic(cleaned, top_n=3)
        if keywords:
            q = f"What are the key concepts related to {', '.join(keywords[:-1])} and {keywords[-1]}?"
            a = cleaned if len(cleaned) < 150 else cleaned[:147] + "..."
            qa_pairs = [(q, a)]
            
    flashcards = []
    for q, a in qa_pairs:
        # Clean any leading/trailing weirdness
        q = q.strip()
        a = a.strip()
        if q and a:
            diff = classify_difficulty(q, a)
            flashcards.append({
                "question": q,
                "answer": a,
                "difficulty": diff
            })
            
    return flashcards
