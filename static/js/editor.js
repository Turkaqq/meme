class MemeEditor {
    constructor() {
        this.container = document.getElementById('meme-container');
        this.templateSelect = document.getElementById('template-select');
        this.colorPicker = document.getElementById('text-color');
        this.sizeSlider = document.getElementById('text-size');
        this.generateBtn = document.getElementById('generate-btn');

        // Установка значений по умолчанию
        this.colorPicker.value = '#000000';
        this.sizeSlider.value = 32;

        this.textElements = [];

        this.initEvents();
        this.loadTemplate();
    }

    initEvents() {
        // Добавление текста по клику
        this.container.addEventListener('click', (e) => {
            if (e.target === this.container || e.target.classList.contains('meme-img')) {
                const rect = this.container.getBoundingClientRect();
                this.addText(
                    e.clientX - rect.left - 20,
                    e.clientY - rect.top - 10
                );
            }
        });

        // Генерация мема
        this.generateBtn.addEventListener('click', () => {
            const texts = [];
            document.querySelectorAll('.meme-text').forEach(el => {
                texts.push({
                    content: el.textContent,
                    x: parseInt(el.style.left),
                    y: parseInt(el.style.top),
                    color: el.style.color,
                    size: parseInt(el.style.fontSize)
                });
            });

            fetch('/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    template: this.templateSelect.value,
                    texts: texts
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    const result = document.createElement('div');
                    result.innerHTML = `
                        <img src="${data.url}" class="generated-meme">
                        <a href="${data.url}" download class="download-btn">Скачать</a>
                    `;
                    document.body.appendChild(result);
                }
            });
        });
    }

    addText(x, y) {
        const textEl = document.createElement('div');
        textEl.className = 'meme-text';
        textEl.contentEditable = true;
        textEl.style.position = 'absolute';
        textEl.style.left = `${x}px`;
        textEl.style.top = `${y}px`;
        textEl.style.color = this.colorPicker.value;
        textEl.style.fontSize = `${this.sizeSlider.value}px`;
        textEl.style.fontFamily = 'Impact, sans-serif';
        textEl.style.minWidth = '80px';
        textEl.style.minHeight = '40px';
        textEl.style.padding = '5px';
        textEl.style.outline = 'none';
        textEl.style.border = '2px dashed rgba(0,0,0,0.3)';
        textEl.style.cursor = 'move';

        // Делаем элемент перемещаемым
        this.makeDraggable(textEl);

        this.container.appendChild(textEl);
        textEl.focus();
    }

    makeDraggable(element) {
        let offsetX, offsetY;

        element.addEventListener('mousedown', (e) => {
            e.preventDefault();

            offsetX = e.clientX - element.getBoundingClientRect().left;
            offsetY = e.clientY - element.getBoundingClientRect().top;

            document.addEventListener('mousemove', moveElement);
            document.addEventListener('mouseup', stopDrag);
        });

        const moveElement = (e) => {
            element.style.left = `${e.clientX - offsetX - this.container.getBoundingClientRect().left}px`;
            element.style.top = `${e.clientY - offsetY - this.container.getBoundingClientRect().top}px`;
        };

        const stopDrag = () => {
            document.removeEventListener('mousemove', moveElement);
            document.removeEventListener('mouseup', stopDrag);
        };
    }

    loadTemplate() {
        this.container.innerHTML = `
            <img class="meme-img"
                 src="/static/templates/${this.templateSelect.value}"
                 style="max-width: 100%; max-height: 80vh;">
        `;
    }
}

document.addEventListener('DOMContentLoaded', () => new MemeEditor());