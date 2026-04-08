from pathlib import Path
import random

from PIL import Image, ImageDraw

IMAGE_SIZE = 64
TRAIN_IMAGES_PER_CLASS = 1200
VAL_IMAGES_PER_CLASS = 300
CLASSES = ['feliz', 'triste', 'neutro']
BASE_DIR = Path('data')
FACE_CONTOUR_PROB = 0.6


def jitter(value, amount):
    return value + random.randint(-amount, amount)


def draw_face(emotion: str) -> Image.Image:
    img = Image.new('L', (IMAGE_SIZE, IMAGE_SIZE), 255)
    draw = ImageDraw.Draw(img)

    # Olhos e boca sao o sinal principal; contorno e apenas contexto visual.
    if random.random() < FACE_CONTOUR_PROB:
        margin = random.randint(3, 8)
        draw.ellipse(
            (margin, margin, IMAGE_SIZE - margin, IMAGE_SIZE - margin),
            outline=0,
            width=random.randint(1, 2),
        )

    eye_y = random.randint(18, 24)
    left_eye_x = random.randint(16, 24)
    right_eye_x = random.randint(40, 48)

    if emotion == 'feliz':
        eye_r = random.randint(2, 3)
    elif emotion == 'triste':
        eye_r = random.randint(3, 4)
    else:
        eye_r = random.randint(2, 3)

    for x in (left_eye_x, right_eye_x):
        draw.ellipse((x - eye_r, eye_y - eye_r, x + eye_r, eye_y + eye_r), fill=0)

    mouth_left = jitter(14, 4)
    mouth_right = jitter(50, 4)
    mouth_y = random.randint(37, 45)
    mouth_width = random.randint(2, 5)

    if emotion == 'feliz':
        # Sorriso para cima
        draw.arc((mouth_left, mouth_y - 9, mouth_right, mouth_y + 8), start=12, end=168, fill=0, width=mouth_width)
    elif emotion == 'triste':
        # Boca para baixo
        draw.arc((mouth_left, mouth_y - 2, mouth_right, mouth_y + 18), start=192, end=348, fill=0, width=mouth_width)
    else:
        # Boca neutra (quase reta)
        if random.random() < 0.5:
            draw.line((mouth_left, mouth_y + 6, mouth_right, mouth_y + 6), fill=0, width=mouth_width)
        else:
            draw.arc((mouth_left, mouth_y + 1, mouth_right, mouth_y + 10), start=170, end=370, fill=0, width=max(2, mouth_width - 1))

    if random.random() < 0.45:
        img = img.rotate(random.uniform(-16, 16), fillcolor=255)

    return img


def save_split(split: str, total: int):
    for emotion in CLASSES:
        target = BASE_DIR / split / emotion
        target.mkdir(parents=True, exist_ok=True)
        for i in range(total):
            img = draw_face(emotion)
            img.save(target / f'{emotion}_{i:03d}.png')


def main():
    random.seed(42)
    save_split('train', TRAIN_IMAGES_PER_CLASS)
    save_split('val', VAL_IMAGES_PER_CLASS)
    print('Dataset de demonstracao criado (olhos e boca): data/train e data/val.')


if __name__ == '__main__':
    main()
