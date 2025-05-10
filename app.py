from flask import Flask, render_template, request, send_from_directory, session
from PIL import Image, ImageDraw, ImageFont
import os
from datetime import datetime

app = Flask(__name__)
app.secret_key = 'your-secret-key-123'
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['MAX_CONTENT_LENGTH'] = 2 * 1024 * 1024  # 2MB

# Шрифты
FONTS = {
    'impact': 'static/fonts/Impact.ttf',
    'arial': 'static/fonts/Arial.ttf'
}


@app.route('/', methods=['GET', 'POST'])
def index():
    if request.method == 'POST':
        # Получаем данные формы
        top_text = request.form.get('top_text', '')
        bottom_text = request.form.get('bottom_text', '')
        font = request.form.get('font', 'impact')
        color = request.form.get('color', '#ffffff')

        # Обработка изображения
        if 'image' in request.files:
            file = request.files['image']
            if file.filename != '':
                filename = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
                file.save(filename)
                image_path = filename
        else:
            image_path = os.path.join('static', 'templates', 'default.jpg')

        # Генерация мема
        output_filename = f'meme_{datetime.now().strftime("%Y%m%d%H%M%S")}.jpg'
        output_path = os.path.join(app.config['UPLOAD_FOLDER'], output_filename)
        generate_meme(image_path, top_text, bottom_text, font, color, output_path)

        # Сохраняем в историю
        if 'history' not in session:
            session['history'] = []
        session['history'].insert(0, {
            'filename': output_filename,
            'date': datetime.now().strftime("%Y-%m-%d %H:%M")
        })

        return send_from_directory(app.config['UPLOAD_FOLDER'], output_filename, as_attachment=True)

    return render_template('index.html')


def generate_meme(image_path, top_text, bottom_text, font_name, color, output_path):
    img = Image.open(image_path)
    if img.mode == 'RGBA':
        img = img.convert('RGB')

    draw = ImageDraw.Draw(img)
    font_size = int(img.height / 8)

    try:
        font = ImageFont.truetype(FONTS[font_name], font_size)
    except:
        font = ImageFont.load_default()

    # Рисуем текст
    def draw_text(text, y):
        text_width = draw.textlength(text, font=font)
        draw.text(
            ((img.width - text_width) / 2, y),
            text,
            font=font,
            fill=color,
            stroke_width=3,
            stroke_fill='black'
        )

    draw_text(top_text, 10)
    draw_text(bottom_text, img.height - font_size - 20)

    img.save(output_path, quality=95)


@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)


if __name__ == '__main__':
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    app.run(debug=True)