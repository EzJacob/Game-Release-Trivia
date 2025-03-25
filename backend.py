from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import sqlite3
import random
import ast
import os


app = Flask(__name__)

# Enable CORS for all routes
CORS(app)

def get_db_connection():
    conn = sqlite3.connect('db/games.db')
    conn.row_factory = sqlite3.Row  # Enables column access by name
    return conn

# Initialize database
with get_db_connection() as conn:
    conn.execute('''CREATE TABLE IF NOT EXISTS games (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT UNIQUE NOT NULL,
                    release_date TEXT NOT NULL,
                    image_url TEXT NOT NULL)''')
    conn.commit()

def add_sample_data():
    sample_games = []
    with open("filtered_games.txt", 'r', encoding='utf-8') as file:
        sample_games = ast.literal_eval(file.read())  # Convert string back to list
    conn = get_db_connection()
    try:
        conn.executemany('INSERT INTO games (name, release_date, image_url) VALUES (?, ?, ?)', sample_games)
        conn.commit()
    except sqlite3.IntegrityError as e:
        print(f"Error inserting data: {e}")
    conn.close()

# Add sample data on startup
#add_sample_data()

# Serve index.html
@app.route('/')
def home():
    return send_file('templates/index.html')

@app.route('/styles.css')
def serve_css():
    return send_file('static/styles.css', mimetype='text/css')

@app.route('/script.js')
def serve_js():
    return send_file('static/script.js', mimetype='application/javascript')

@app.route('/games', methods=['GET'])
def get_two_random_games():
    conn = get_db_connection()
    games = conn.execute('SELECT name, image_url FROM games ORDER BY RANDOM() LIMIT 2').fetchmany(2)
    conn.close()
    
    if len(games) < 2:
        return jsonify({'error': 'Not enough games in database'}), 500
    
    return jsonify([dict(game) for game in games])

@app.route('/game-date', methods=['GET'])
def get_game_date():
    title = request.args.get('title')
    if not title:
        return jsonify({'error': 'Title parameter is required'}), 400
    
    conn = get_db_connection()
    game = conn.execute('SELECT release_date FROM games WHERE name = ?', (title,)).fetchone()
    conn.close()
    
    if game:
        return jsonify({'title': title, 'release_date': game['release_date']})
    else:
        return jsonify({'error': 'Game not found'}), 404


#@app.route('/print-db', methods=['GET'])
#def print_db():
    #conn = get_db_connection()
    #games = conn.execute('SELECT id, name, release_date, image_url FROM games').fetchall()
    #conn.close()

    #if games:
        #return jsonify([dict(game) for game in games])
    #else:
        #return jsonify({'error': 'No games found in the database'}), 404


# Serve the logo image from the same directory as app.py
@app.route('/logo.png', methods=['GET'])
def serve_logo():
    # Serve the 'logo.png' image directly
    return send_file('static/logo.png', mimetype='image/png')


if __name__ == '__main__':
    app.run(debug=True)
