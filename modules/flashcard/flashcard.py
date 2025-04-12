from flask import jsonify, request
import json
import os
from datetime import datetime, timedelta

DATA_FILE = os.path.join(os.path.dirname(__file__), "db_flashcards.json")

def load_data():
    default_data = {
        "cards": [],
        "categories": [],
        "statistics": {"total_study_sessions": 0, "cards_learned": 0}
    }
    if not os.path.exists(DATA_FILE):
        save_data(default_data)
        print(f"Created new {DATA_FILE} with default data")
        return default_data
    try:
        with open(DATA_FILE, 'r') as f:
            data = json.load(f)
            if not isinstance(data, dict):
                print(f"Error: {DATA_FILE} contains invalid data (not a dict), resetting to default")
                save_data(default_data)
                return default_data
            # Ensure all required keys exist
            for key in default_data:
                if key not in data:
                    data[key] = default_data[key]
            return data
    except (json.JSONDecodeError, FileNotFoundError) as e:
        print(f"Error loading {DATA_FILE}: {e}, resetting to default")
        save_data(default_data)
        return default_data

def save_data(data):
    with open(DATA_FILE, 'w') as f:
        json.dump(data, f, indent=2)

def register():
    def handle_post(request):
        data = load_data()
        action = request.form.get('action')

        if action == 'create':
            front = request.form.get('front', '').strip()
            back = request.form.get('back', '').strip()
            category = request.form.get('category', '').strip()
            tags = [tag.strip() for tag in request.form.get('tags', '').split(',') if tag.strip()]

            if not front or not back or not category:
                return jsonify({'error': 'Front, back, and category are required'}), 400

            if not isinstance(data, dict):
                print(f"Critical error: data is not a dict, it’s {type(data)}")
                return jsonify({'error': 'Internal server error: invalid data structure'}), 500

            if 'categories' not in data or not isinstance(data['categories'], list):
                print(f"Fixing missing or invalid 'categories' in data")
                data['categories'] = []
            if category and category not in data['categories']:
                data['categories'].append(category)

            if 'cards' not in data or not isinstance(data['cards'], list):
                print(f"Fixing missing or invalid 'cards' in data")
                data['cards'] = []

            card = {
                'id': len(data['cards']) + 1,
                'front': front,
                'back': back,
                'category': category,
                'tags': tags,
                'due_date': datetime.now().isoformat(),
                'interval': 1,
                'ease': 2.5
            }
            data['cards'].append(card)
            save_data(data)
            return jsonify({'message': 'Flashcard created'})

        elif action == 'get_due_cards':
            # Return all cards instead of just due ones
            return jsonify({
                'cards': data.get('cards', []),
                'categories': data.get('categories', []),
                'statistics': data.get('statistics', {})
            })

        elif action == 'review':
            card_id = int(request.form.get('card_id'))
            score = int(request.form.get('score'))
            for card in data.get('cards', []):
                if card['id'] == card_id:
                    if score >= 3:
                        card['ease'] = max(1.3, card['ease'] + 0.1 - (5 - score) * 0.08)
                        card['interval'] *= card['ease']
                        if score == 5 and card['interval'] > 30:
                            data['statistics']['cards_learned'] = data['statistics'].get('cards_learned', 0) + 1
                    else:
                        card['interval'] = 1
                        card['ease'] = max(1.3, card['ease'] - 0.2)
                    card['due_date'] = (datetime.now() + timedelta(days=card['interval'])).isoformat()
                    data['statistics']['total_study_sessions'] = data['statistics'].get('total_study_sessions', 0) + 1
                    break
            save_data(data)
            return jsonify({'message': 'Review saved'})

        elif action == 'export':
            return jsonify(data)

        elif action == 'import':
            file = request.files.get('file')
            if file:
                imported_data = json.load(file)
                if not isinstance(imported_data, dict):
                    return jsonify({'error': 'Imported file must be a JSON object'}), 400
                save_data(imported_data)
                return jsonify({'message': 'Imported successfully'})
            return jsonify({'error': 'No file provided'}), 400

        return jsonify({'error': 'Invalid action'}), 400

    return {
        'title': 'Flashcard Maker',
        'description': 'Make flashcards with JS',
        'view': lambda req: None,
        'handle_post': handle_post
    }