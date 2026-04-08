import base64
from io import BytesIO
from pathlib import Path

import numpy as np
from PIL import Image, ImageOps
from tensorflow.keras.models import load_model

CLASS_NAMES = ['feliz', 'triste', 'neutro']
IMAGE_SIZE = (28, 28)


def decode_base64_image(image_data: str) -> Image.Image:
    if ',' in image_data:
        image_data = image_data.split(',', 1)[1]
    raw = base64.b64decode(image_data)
    image = Image.open(BytesIO(raw)).convert('L')
    return image


def preprocess_image_for_model(image: Image.Image) -> np.ndarray:
    image = ImageOps.invert(image.convert('L'))
    arr = np.array(image).astype('float32')

    # Mesmo pipeline do treino: recorte por conteudo e centralizacao.
    mask = arr > 20
    if np.any(mask):
        ys, xs = np.where(mask)
        arr = arr[ys.min():ys.max() + 1, xs.min():xs.max() + 1]

    h, w = arr.shape
    side = max(h, w) + 8
    canvas = np.zeros((side, side), dtype='float32')
    y0 = (side - h) // 2
    x0 = (side - w) // 2
    canvas[y0:y0 + h, x0:x0 + w] = arr

    normalized = Image.fromarray(np.clip(canvas, 0, 255).astype('uint8'))
    normalized = normalized.resize(IMAGE_SIZE, Image.Resampling.LANCZOS)
    out = np.array(normalized).astype('float32') / 255.0
    return out.reshape(IMAGE_SIZE[0], IMAGE_SIZE[1], 1)


def preprocess_pil_image(image: Image.Image) -> np.ndarray:
    arr = preprocess_image_for_model(image)
    return arr.reshape(1, IMAGE_SIZE[0], IMAGE_SIZE[1], 1)


def predict_image(image_data: str, model_path: Path) -> dict:
    model_path = Path(model_path)
    if not model_path.exists():
        raise FileNotFoundError(str(model_path))

    model = load_model(model_path)
    image = decode_base64_image(image_data)
    x = preprocess_pil_image(image)
    probabilities = model.predict(x, verbose=0)[0]
    winner = int(np.argmax(probabilities))

    class_probabilities = {
        CLASS_NAMES[i]: round(float(probabilities[i]) * 100, 2)
        for i in range(len(CLASS_NAMES))
    }

    return {
        'emotion': CLASS_NAMES[winner],
        'confidence': round(float(probabilities[winner]) * 100, 2),
        'probabilities': class_probabilities,
    }
