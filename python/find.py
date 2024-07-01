import json



# Load songs from eng_songs.json
def load_songs(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        songs = json.load(f)
    return songs

# Parse the JSON data
songs = load_songs('search_bleve/songs.json')

# Filter and print songs with more than one number
for song in songs:
    numbers = song["number"].split(',')
    if len(numbers) > 1:
        print(f"Title: {song['title']}")
        print(f"Singer: {song['singer']}")
        print(f"Numbers: {song['number']}")
        print()
