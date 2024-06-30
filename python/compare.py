import json
import re

def load_json(file_path):
    with open(file_path, 'r', encoding='utf-8') as file:
        return json.load(file)

def normalize_name(name):
    # Remove spaces, special characters, and convert to lowercase for comparison
    return re.sub(r'\s+', '', name).lower()

def normalize_song(song):
    return {
        "numbers": set(song["number"].split(',')),
        "lyricist": normalize_name(song["lyricist"]),
        "composer": normalize_name(song["composer"]),
    }


def find_unique_songs(a_songs, b_songs):
    b_songs_normalized = []
    for song in b_songs:
        normalized_song = normalize_song(song)
        for number in normalized_song["numbers"]:
            b_songs_normalized.append((number, normalized_song["lyricist"], normalized_song["composer"]))

    unique_songs = []
    for song in a_songs:
        normalized_song = normalize_song(song)
        found = False
        for number in normalized_song["numbers"]:
            if (number, normalized_song["lyricist"], normalized_song["composer"]) in b_songs_normalized:
                found = True
                break
        if not found:
            unique_songs.append(song)

    return unique_songs

def main():
    a_songs = load_json("kor_songs.json")
    b_songs = load_json("korean_songs_merged.json")

    unique_songs = find_unique_songs(a_songs, b_songs)

    if unique_songs:
        print("Songs in A.json but not in B.json:")
        for song in unique_songs:
            print(json.dumps(song, ensure_ascii=False, indent=4))
        with open("compare.json", "w", encoding="utf-8") as f:
            json.dump(unique_songs, f, ensure_ascii=False, indent=4)
    else:
        print("No unique songs found.")

if __name__ == "__main__":
    main()
