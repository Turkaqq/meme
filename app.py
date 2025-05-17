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


@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'success': False, 'error': 'No file part'})

    file = request.files['file']
    if file.filename == '':
        return jsonify({'success': False, 'error': 'No selected file'})

    if file and allowed_file(file.filename):
        filename = f"user_upload_{uuid.uuid4().hex}.{file.filename.rsplit('.', 1)[1].lower()}"
        file.save(os.path.join(app.config['TEMPLATES_FOLDER'], filename))
        return jsonify({'success': True, 'filename': filename})

    return jsonify({'success': False, 'error': 'Invalid file type'})


@app.route('/generate', methods=['POST'])
def generate_meme():
    try:
        # Get data
        template = request.form['template']
        texts = request.form.getlist('texts[]')
        positions = request.form.getlist('positions[]')
        colors = request.form.getlist('colors[]')
        sizes = request.form.getlist('sizes[]')
        overlays = request.files.getlist('overlays[]')

        # Open template
        img = Image.open(os.path.join(app.config['TEMPLATES_FOLDER'], template)).convert('RGBA')
        draw = ImageDraw.Draw(img)

        # Add texts
        font_path = "static/fonts/Impact.ttf"
        for i, text in enumerate(texts):
            if not text.strip():
                continue

            try:
                font = ImageFont.truetype(font_path, int(sizes[i]))
            except:
                font = ImageFont.load_default()

            x, y = map(int, positions[i].split(','))
            draw.text((x, y), text, font=font, fill=colors[i], stroke_width=2, stroke_fill='black')

        # Add overlays
        for overlay in overlays:
            if overlay and allowed_file(overlay.filename):
                overlay_img = Image.open(overlay).convert('RGBA')
                overlay_img = overlay_img.resize((200, 200))  # Resize overlay
                img.paste(overlay_img, (50, 50), overlay_img)  # Position

        # Save result
        output_filename = f"meme_{uuid.uuid4().hex}.png"
        output_path = os.path.join(app.config['UPLOAD_FOLDER'], output_filename)
        img.save(output_path)

        return jsonify({
            'success': True,
            'url': f'/static/uploads/{output_filename}'
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})


if __name__ == '__main__':
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    os.makedirs(app.config['TEMPLATES_FOLDER'], exist_ok=True)
    app.run(debug=True)