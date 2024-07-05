# jp.py
import sys
import cutlet

katsu = cutlet.Cutlet()
katsu.use_foreign_spelling = False

def romanize(text):
    return katsu.romaji(text)

if __name__ == "__main__":
    input_text = sys.argv[1]
    print(romanize(input_text))
