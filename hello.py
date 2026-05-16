from flask import Flask, render_template, request, jsonify
import json, os

app = Flask(__name__)

@app.route('/')
def game():
    return render_template('index.html')

@app.route('/save_score', methods=['POST'])
def save_score():
    data = request.get_json()
    username = data['username']
    score = data['score']

    if os.path.exists('users.json'):
        with open('users.json', 'r') as f:
            users = json.load(f)
    else:
        users = {}

    if username in users:
        users[username] = max(users[username], score)
    else:
        users[username] = score

    with open('users.json', 'w') as f:
        json.dump(users, f)

    return jsonify({"message": "Score saved!"})

if __name__ == '__main__':
    app.run(debug=True)
