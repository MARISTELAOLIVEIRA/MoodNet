from pathlib import Path

import numpy as np
from PIL import Image, ImageOps
from tensorflow.keras import Sequential
from tensorflow.keras.layers import Conv2D, MaxPooling2D, Flatten, Dense, Dropout, Input
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.utils import to_categorical

CLASS_NAMES = ['feliz', 'triste', 'neutro']
IMAGE_SIZE = (28, 28)
BASE_DIR = Path('data')
MODEL_DIR = Path('model')
MODEL_PATH = MODEL_DIR / 'moodnet_stage_a.keras'


def preprocess_image_for_model(image: Image.Image) -> np.ndarray:
    image = ImageOps.invert(image.convert('L'))
    arr = np.array(image).astype('float32')

    # Recorta apenas o conteudo desenhado para focar em olhos/boca.
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


def load_split(split: str):
    xs, ys = [], []
    for idx, label in enumerate(CLASS_NAMES):
        folder = BASE_DIR / split / label
        for file in sorted(folder.glob('*.png')):
            image = Image.open(file)
            arr = preprocess_image_for_model(image)
            xs.append(arr)
            ys.append(idx)
    return np.array(xs), np.array(ys)


def build_model(input_shape: tuple, output_dim: int) -> Sequential:
    model = Sequential([
        Input(shape=input_shape),
        Conv2D(32, kernel_size=(3, 3), activation='relu'),
        MaxPooling2D(pool_size=(2, 2)),
        Conv2D(64, kernel_size=(3, 3), activation='relu'),
        MaxPooling2D(pool_size=(2, 2)),
        Flatten(),
        Dense(128, activation='relu'),
        Dropout(0.3),
        Dense(64, activation='relu'),
        Dropout(0.2),
        Dense(output_dim, activation='softmax')
    ])
    model.compile(
        optimizer=Adam(learning_rate=0.001),
        loss='categorical_crossentropy',
        metrics=['accuracy']
    )
    return model


def main():
    x_train, y_train = load_split('train')
    x_val, y_val = load_split('val')

    y_train = to_categorical(y_train, num_classes=len(CLASS_NAMES))
    y_val = to_categorical(y_val, num_classes=len(CLASS_NAMES))

    # Input shape para CNN: (28, 28, 1)
    input_shape = (IMAGE_SIZE[0], IMAGE_SIZE[1], 1)
    model = build_model(input_shape, len(CLASS_NAMES))
    
    history = model.fit(
        x_train,
        y_train,
        validation_data=(x_val, y_val),
        epochs=50,  # Aumentado de 18
        batch_size=32,
        verbose=1,
    )

    MODEL_DIR.mkdir(exist_ok=True)
    model.save(MODEL_PATH)
    loss, accuracy = model.evaluate(x_val, y_val, verbose=0)
    print(f'Modelo salvo em: {MODEL_PATH}')
    print(f'Acurácia de validação final: {accuracy * 100:.2f}%')
    print(f'Última loss de treino: {history.history["loss"][-1]:.4f}')


if __name__ == '__main__':
    main()
