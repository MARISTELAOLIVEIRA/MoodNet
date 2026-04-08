from flask import Flask, jsonify, render_template, request, send_from_directory
from pathlib import Path

from model_utils import predict_image

app = Flask(__name__)
app.config['MODEL_PATH'] = Path('model') / 'moodnet_stage_a.keras'


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/media/<path:filename>')
def media(filename):
    return send_from_directory('media', filename)


@app.route('/predict', methods=['POST'])
def predict():
    data = request.get_json(silent=True) or {}
    image_data = data.get('image')

    if not image_data:
        return jsonify({'ok': False, 'error': 'Nenhuma imagem foi enviada.'}), 400

    try:
        result = predict_image(image_data, app.config['MODEL_PATH'])
        return jsonify({'ok': True, **result})
    except FileNotFoundError:
        return jsonify({
            'ok': False,
            'error': (
                'Modelo não encontrado. Gere os dados de exemplo com '
                '`python create_demo_dataset.py`, treine com '
                '`python train_model.py` e tente novamente.'
            )
        }), 500
    except Exception as exc:
        return jsonify({'ok': False, 'error': f'Erro ao analisar a imagem: {exc}'}), 500


if __name__ == '__main__':
    app.run(debug=True)
