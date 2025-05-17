from flask import Flask, request, jsonify, render_template, send_from_directory
from PIL import Image, ImageDraw, ImageFont
import os
import uuid

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'static/uploads'
app.config['TEMPLATES_FOLDER'] = 'static/templates'
app.config['FONTS_FOLDER'] = 'static/fonts'
app.config['ALLOWED_EXTENSIONS'] = {'png', 'jpg', 'jpeg'}


def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']


def get_font(size):
    try:
        # Пробуем загрузить Impact, если есть
        impact_path = os.path.join(app.config['FONTS_FOLDER'], 'Impact.ttf')
        if os.path.exists(impact_path):
            return ImageFont.truetype(impact_path, size)

        # Пробуем другие стандартные шрифты
        try:
            return ImageFont.truetype("arial.ttf", size)
        except:
            return ImageFont.truetype("LiberationSans-Regular.ttf", size)
    except:
        # Если ничего не найдено, используем стандартный шрифт
        return ImageFont.load_default(size)


@app.route('/')
def index():
    templates = [f for f in os.listdir(app.config['TEMPLATES_FOLDER']) if allowed_file(f)]
    return render_template('index.html', templates=templates)


@app.route('/generate', methods=['POST'])
def generate_meme():
    try:
        data = request.get_json()
        template = data['template']
        texts = data['texts']

        # Открываем изображение шаблона
        template_path = os.path.join(app.config['TEMPLATES_FOLDER'], template)
        if not os.path.exists(template_path):
            return jsonify({'success': False, 'error': 'Template not found'})

        img = Image.open(template_path).convert('RGBA')
        draw = ImageDraw.Draw(img)

        # Добавляем текст
        for text in texts:
            try:
                font = get_font(text['size'])
                draw.text(
                    (text['x'], text['y']),
                    text['content'],
                    font=font,
                    fill=text['color'],
                    stroke_width=2,
                    stroke_fill='white'
                )
            except Exception as e:
                print(f"Error adding text: {e}")
                continue

        # Сохраняем результат
        output_filename = f"meme_{uuid.uuid4().hex}.png"
        output_path = os.path.join(app.config['UPLOAD_FOLDER'], output_filename)

        # Создаем папку, если не существует
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        img.save(output_path)

        return jsonify({
            'success': True,
            'url': f'/static/uploads/{output_filename}'
        })

    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        })


if __name__ == '__main__':
    # Создаем все необходимые папки
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    os.makedirs(app.config['TEMPLATES_FOLDER'], exist_ok=True)
    os.makedirs(app.config['FONTS_FOLDER'], exist_ok=True)

    app.run(debug=True)