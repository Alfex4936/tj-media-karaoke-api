# Import model
from langdetect import detect
from langdetect.lang_detect_exception import LangDetectException

texts = [
    "Plaisir d'amour(사랑의 기쁨)",
    'Aranjuez mon amour',     
    'Lil Nas X'
]
# Classify texts
for i, text in enumerate(texts):
    pred = detect(text)
    print(f'Prediction for text {i}: {pred}')