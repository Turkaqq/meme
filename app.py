from flask import Flask, request, jsonify, render_template, send_from_directory
from PIL import Image, ImageDraw, ImageFont
import os
import uuid

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'static/uploads'
app.config['TEMPLATES_FOLDER'] = 'static/templates'
app.config['ALLOWED_EXTENSIONS'] = {'png', 'jpg', 'jpeg'}


def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']


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

        img = Image.open(os.path.join(app.config['TEMPLATES_FOLDER'], template))
        draw = ImageDraw.Draw(img)

        font_path = "static/fonts/Impact.ttf"
        for text in texts:
            font = ImageFont.truetype(font_path, text['size'])
            draw.text((text['x'], text['y']), text['content'], font=font, fill=text['color'])

        output_filename = f"meme_{uuid.uuid4().hex}.png"
        output_path = os.path.join(app.config['UPLOAD_FOLDER'], output_filename)
        img.save(output_path)

        return jsonify({'success': True, 'url': f'/static/uploads/{output_filename}'})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})


if __name__ == '__main__':
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    os.makedirs(app.config['TEMPLATES_FOLDER'], exist_ok=True)
    app.run(debug=True)