from flask import Flask, render_template, request, send_from_directory
from PIL import Image, ImageDraw, ImageFont
import os

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['MEME_TEMPLATES'] = 'static/templates'

# Создаем папки, если их нет
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)


def create_meme(image_path, top_text, bottom_text, output_path):
    """Генерация мема с текстом"""
    img = Image.open(image_path)
    draw = ImageDraw.Draw(img)

    # Настройки шрифта (можно заменить на свой .ttf)
    font_size = int(img.height / 10)
    font = ImageFont.truetype("arial.ttf", font_size)

    # Рисуем верхний текст
    text_width = draw.textlength(top_text, font=font)
    draw.text(((img.width - text_width) / 2, 10), top_text, font=font, fill="white", stroke_width=2,
              stroke_fill="black")

    # Рисуем нижний текст
    text_width = draw.textlength(bottom_text, font=font)
    draw.text(((img.width - text_width) / 2, img.height - font_size - 10), bottom_text, font=font, fill="white",
              stroke_width=2, stroke_fill="black")

    img.save(output_path)


@app.route('/', methods=['GET', 'POST'])
def index():
    if request.method == 'POST':
        # Обработка загруженного файла
        image = request.files['image']
        top_text = request.form['top_text']
        bottom_text = request.form['bottom_text']

        if image:
            image_path = os.path.join(app.config['UPLOAD_FOLDER'], image.filename)
            image.save(image_path)
        else:
            # Используем шаблон, если файл не загружен
            template = request.form.get('template', 'default.png')
            image_path = os.path.join(app.config['MEME_TEMPLATES'], template)

        # Генерируем мем
        output_path = os.path.join(app.config['UPLOAD_FOLDER'], 'meme_' + os.path.basename(image_path))
        create_meme(image_path, top_text, bottom_text, output_path)

        return render_template('result.html', meme_url=output_path)

    return render_template('index.html')


@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)


if __name__ == '__main__':
    app.run(debug=True)