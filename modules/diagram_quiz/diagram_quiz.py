import os
from flask import jsonify, request
import json
from datetime import datetime
from PIL import Image, ImageDraw
import base64
import io

DATA_FILE = os.path.join(os.path.dirname(__file__), "db_diagram_quizzes.json")

def load_data():
    default_data = {
        "quizzes": [],
        "statistics": {"quizzes_taken": 0, "correct_answers": 0}
    }
    if not os.path.exists(DATA_FILE):
        save_data(default_data)
        return default_data
    try:
        with open(DATA_FILE, 'r') as f:
            return json.load(f)
    except (json.JSONDecodeError, FileNotFoundError):
        save_data(default_data)
        return default_data

def save_data(data):
    with open(DATA_FILE, 'w') as f:
        json.dump(data, f, indent=2)

def register():
    def handle_post(request):
        data = load_data()
        action = request.form.get('action')

        if action == 'create_quiz':
            title = request.form.get('title', '').strip()
            image_file = request.files.get('image')
            hidden_spots = json.loads(request.form.get('hidden_spots', '[]'))

            if not title or not image_file or not hidden_spots:
                return jsonify({'error': 'Title, image and hidden spots are required'}), 400

            # Save image
            image = Image.open(image_file)
            img_byte_arr = io.BytesIO()
            image.save(img_byte_arr, format='PNG')
            img_base64 = base64.b64encode(img_byte_arr.getvalue()).decode('utf-8')

            quiz = {
                'id': len(data['quizzes']) + 1,
                'title': title,
                'image': img_base64,
                'hidden_spots': hidden_spots,
                'created_at': datetime.now().isoformat()
            }
            data['quizzes'].append(quiz)
            save_data(data)
            return jsonify({'message': 'Quiz created', 'quiz_id': quiz['id']})

        elif action == 'get_quizzes':
            return jsonify({
                'quizzes': [{'id': q['id'], 'title': q['title']} for q in data.get('quizzes', [])],
                'statistics': data.get('statistics', {})
            })

        elif action == 'get_quiz':
            quiz_id = int(request.form.get('quiz_id'))
            quiz = next((q for q in data['quizzes'] if q['id'] == quiz_id), None)
            if not quiz:
                return jsonify({'error': 'Quiz not found'}), 404
            
            # Return image and hidden spots (without answers for student mode)
            response = {
                'id': quiz['id'],
                'title': quiz['title'],
                'image': quiz['image'],
                'hidden_spots': [{'x': s['x'], 'y': s['y'], 'width': s['width'], 'height': s['height']} 
                               for s in quiz['hidden_spots']]
            }
            return jsonify(response)

        elif action == 'check_answer':
            quiz_id = int(request.form.get('quiz_id'))
            spot_index = int(request.form.get('spot_index'))
            answer = request.form.get('answer', '').strip().lower()
            
            quiz = next((q for q in data['quizzes'] if q['id'] == quiz_id), None)
            if not quiz:
                return jsonify({'error': 'Quiz not found'}), 404
            
            if spot_index >= len(quiz['hidden_spots']):
                return jsonify({'error': 'Invalid spot index'}), 400
            
            correct_answer = quiz['hidden_spots'][spot_index]['answer'].lower()
            is_correct = answer == correct_answer
            
            if is_correct:
                data['statistics']['correct_answers'] = data['statistics'].get('correct_answers', 0) + 1
                save_data(data)
            
            return jsonify({
                'is_correct': is_correct,
                'correct_answer': quiz['hidden_spots'][spot_index]['answer']
            })

        elif action == 'reveal_all':
            quiz_id = int(request.form.get('quiz_id'))
            quiz = next((q for q in data['quizzes'] if q['id'] == quiz_id), None)
            if not quiz:
                return jsonify({'error': 'Quiz not found'}), 404
            
            data['statistics']['quizzes_taken'] = data['statistics'].get('quizzes_taken', 0) + 1
            save_data(data)
            
            return jsonify({
                'hidden_spots': quiz['hidden_spots']
            })

        return jsonify({'error': 'Invalid action'}), 400

    return {
        'title': 'Diagram Quiz',
        'description': 'Create and take diagram quizzes',
        'view': lambda req: None,
        'handle_post': handle_post
    }