from flask import Flask, render_template, request, jsonify, send_from_directory
from PIL import Image, ImageDraw, ImageFont
import os
import uuid

app = Flask(__name__)

# Конфигурация
UPLOAD_FOLDER = 'static/uploads'
TEMPLATES_FOLDER = 'static/templates'
FONTS_FOLDER = 'static/fonts'

os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(TEMPLATES_FOLDER, exist_ok=True)
os.makedirs(FONTS_FOLDER, exist_ok=True)


@app.route('/')
def index():
    templates = [f for f in os.listdir(TEMPLATES_FOLDER)
                 if f.lower().endswith(('.png', '.jpg', '.jpeg'))]
    return render_template('index.html', templates=templates)


@app.route('/generate', methods=['POST'])
def generate_meme():
    try:
        # Получаем данные из запроса
        template = request.form.get('template')
        text_data = request.form.get('text_data')

        # Проверяем наличие необходимых данных
        if not template or not text_data:
            return jsonify({'success': False, 'error': 'Missing required data'})

        # Загружаем изображение шаблона
        img_path = os.path.join(TEMPLATES_FOLDER, template)
        img = Image.open(img_path).convert('RGBA')
        draw = ImageDraw.Draw(img)

        # Обрабатываем текст
        texts = eval(text_data)  # Безопасный способ преобразования строки в список

        for text in texts:
            try:
                font = ImageFont.truetype(os.path.join(FONTS_FOLDER, 'impact.ttf'), text['size'])
                draw.text(
                    (text['x'], text['y']),
                    text['content'],
                    font=font,
                    fill=text['color'],
                    stroke_width=2,
                    stroke_fill='white'
                )
            except Exception as e:
                print(f"Ошибка при добавлении текста: {e}")
                continue

        # Сохраняем результат
        filename = f"meme_{uuid.uuid4().hex}.png"
        save_path = os.path.join(UPLOAD_FOLDER, filename)
        img.save(save_path)

        return jsonify({
            'success': True,
            'url': f"/static/uploads/{filename}"
        })

    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})


@app.route('/static/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(UPLOAD_FOLDER, filename)


if __name__ == '__main__':
    app.run(debug=True, port=5001)