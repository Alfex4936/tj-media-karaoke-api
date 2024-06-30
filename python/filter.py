import json
import unicodedata
from langdetect import detect
from langdetect.lang_detect_exception import LangDetectException

# Load the French dictionary into a set of words for quick lookup
def load_french_words(file_path):
    french_words = set()
    with open(file_path, 'r', encoding='utf-8') as f:
        for line in f:
            entry = json.loads(line)
            french_words.add(unicodedata.normalize('NFKD', entry['word'].lower()))
            # Adding plural forms and other forms if available in the entry
            if 'forms' in entry:
                for form in entry['forms']:
                    french_words.add(unicodedata.normalize('NFKD', form['form'].lower()))
    return french_words

# Normalize and tokenize text
def normalize_and_tokenize(text):
    text = unicodedata.normalize('NFKD', text).encode('ascii', 'ignore').decode('utf-8')
    return text.lower().replace("'", " ").split()

# Check if the text contains any French words
def contains_french_words(text, french_words):
    words = normalize_and_tokenize(text)
    return any(word in french_words for word in words)

# Check if a song contains French words
def is_french_song(song, french_words):
    fields_to_check = ['title', 'singer']
    # combined_text = ' '.join(song.get(field, "") for field in fields_to_check)
    try:
        if detect(song.get("title", "")) == 'en':
            return True
    except LangDetectException:
        return False
    
    # for field in fields_to_check:
        # if contains_french_words(song.get(field, ""), french_words):
        #     return True
    return False

# Filter in French songs from the list of songs
def filter_french_songs(songs, french_words):
    french_songs = [song for song in songs if is_french_song(song, french_words)]
    return french_songs

# Load songs from eng_songs.json
def load_songs(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        songs = json.load(f)
    return songs


if __name__ == "__main__":
    # Load the French words from the dictionary
    french_words = load_french_words('dict/dictionary-French.json')

    # Load English songs from the JSON file
    eng_songs = load_songs('eng_songs.json')

    # Filter in French songs
    french_songs = filter_french_songs(eng_songs, french_words)
    
    print("done")

    # Save the non-French songs to a new JSON file
    with open('french_songs.json', 'w', encoding='utf-8') as f:
        json.dump(french_songs, f, ensure_ascii=False, indent=4)

    print(f"Filtered {len(eng_songs) - len(french_songs)} French songs out of {len(eng_songs)} total songs.")
    print(f"Saved {len(french_songs)} non-French songs to 'non_french_songs.json'.")
