import json
from collections import defaultdict

def load_songs(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        songs = json.load(f)
    return songs

def find_and_merge_duplicates(songs):
    merged_songs = {}
    for song in songs:
        key = (song['title'], song['singer'])
        if key in merged_songs:
            # Add new numbers to the existing list if not already present
            existing_numbers = merged_songs[key]['number']
            new_numbers = song['number'].split(',')
            merged_songs[key]['number'] = list(set(existing_numbers + new_numbers))
        else:
            merged_songs[key] = {
                'number': song['number'].split(','),
                'title': song['title'],
                'singer': song['singer'],
                'lyricist': song['lyricist'],
                'composer': song['composer'],
                'service': song['service'],
                'country': "KOR"
            }

    # Combine the numbers into a single string
    for key in merged_songs:
        merged_songs[key]['number'] = ','.join(sorted(set(merged_songs[key]['number'])))

    return list(merged_songs.values())

def save_songs(file_path, songs):
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(songs, f, ensure_ascii=False, indent=4)

if __name__ == "__main__":
    songs = load_songs('korean_songs.json')
    merged_songs = find_and_merge_duplicates(songs)
    save_songs('korean_songs_merged.json', merged_songs)
    print(f"Merged songs saved to 'korean_merged.json'.")
