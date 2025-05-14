from flask import Flask, request, send_from_directory
from PIL import Image, ImageDraw, ImageFont
import os

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'uploads'


@app.route('/generate', methods=['POST'])
def generate():
    # Получаем файл и текст с координатами
    file = request.files['image']
    text = request.form['text']
    x, y = int(request.form['x']), int(request.form['y'])

    # Генерация мема
    img = Image.open(file)
    draw = ImageDraw.Draw(img)
    font = ImageFont.truetype("static/fonts/Impact.ttf", 40)

    draw.text((x, y), text, font=font, fill="white", stroke_width=2, stroke_fill="black")

    output_path = os.path.join(app.config['UPLOAD_FOLDER'], 'meme.jpg')
    img.save(output_path)

    return send_from_directory(app.config['UPLOAD_FOLDER'], 'meme.jpg')


if __name__ == '__main__':
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    app.run(debug=True)