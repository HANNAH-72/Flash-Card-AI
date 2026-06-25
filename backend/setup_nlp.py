import spacy.cli
import nltk

def download_models():
    print("=== FlashMind AI NLP Setup ===")
    
    print("\n[1/2] Downloading SpaCy 'en_core_web_sm' model...")
    try:
        spacy.cli.download("en_core_web_sm")
        print("[OK] SpaCy model downloaded and linked.")
    except Exception as e:
        print(f"[Failed] Failed to download SpaCy model: {str(e)}")
        
    print("\n[2/2] Downloading NLTK resources ('stopwords', 'punkt')...")
    try:
        nltk.download("stopwords")
        nltk.download("punkt")
        print("[OK] NLTK resources downloaded successfully.")
    except Exception as e:
        print(f"[Failed] Failed to download NLTK resources: {str(e)}")
        
    print("\n=== Setup Complete ===")

if __name__ == "__main__":
    download_models()

