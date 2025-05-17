class MemeEditor {
    constructor() {
        this.container = document.getElementById('meme-container');
        this.templateSelect = document.getElementById('template-select');
        this.colorPicker = document.getElementById('text-color');
        this.sizeSlider = document.getElementById('text-size');
        this.sizeValue = document.getElementById('text-size-value');
        this.overlayInput = document.getElementById('overlay-input');
        this.uploadInput = document.getElementById('template-upload');
        this.generateBtn = document.getElementById('generate-btn');
        this.clearBtn = document.getElementById('clear-btn');
        this.resultContainer = document.getElementById('meme-result');

        this.activeElement = null;
        this.elements = [];

        this.initEvents();
        this.loadTemplate();
    }

    initEvents() {
        this.templateSelect.addEventListener('change', () => this.loadTemplate());

        this.container.addEventListener('click', (e) => {
            if (e.target === this.container || e.target.classList.contains('meme-img')) {
                const rect = this.container.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                this.addText(x, y);
            }
        });

        this.colorPicker.addEventListener('input', () => this.updateStyle());
        this.sizeSlider.addEventListener('input', () => {
            this.sizeValue.textContent = `${this.sizeSlider.value}px`;
            this.updateStyle();
        });

        this.overlayInput.addEventListener('change', (e) => this.addOverlay(e));
        this.uploadInput.addEventListener('change', (e) => this.uploadTemplate(e));
        this.generateBtn.addEventListener('click', () => this.generateMeme());
        this.clearBtn.addEventListener('click', () => this.clearAll());
    }

    loadTemplate() {
        this.container.innerHTML = `<img class="meme-img" src="/static/templates/${this.templateSelect.value}">`;
        this.elements = [];
    }

    addText(x, y) {
        const textEl = document.createElement('div');
        textEl.className = 'meme-text active';
        textEl.contentEditable = true;
        textEl.textContent = "Введите текст";
        textEl.style.left = `${x}px`;
        textEl.style.top = `${y}px`;
        textEl.style.color = this.colorPicker.value;
        textEl.style.fontSize = `${this.sizeSlider.value}px`;
        textEl.style.fontFamily = 'Impact, sans-serif';
        textEl.style.textShadow = '2px 2px 4px #000';
        textEl.style.minWidth = '50px';
        textEl.style.minHeight = '30px';

        const deleteBtn = document.createElement('span');
        deleteBtn.className = 'delete-btn';
        deleteBtn.innerHTML = '×';
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            textEl.remove();
            this.elements = this.elements.filter(el => el.element !== textEl);
        });

        const resizeHandle = document.createElement('div');
        resizeHandle.className = 'resize-handle';

        textEl.appendChild(deleteBtn);
        textEl.appendChild(resizeHandle);
        this.makeDraggable(textEl);
        this.makeResizable(textEl);
        this.container.appendChild(textEl);
        textEl.focus();
        this.setActive(textEl);
    }

    makeResizable(element) {
        const resizeHandle = element.querySelector('.resize-handle');
        let startX, startY, startWidth, startHeight;

        resizeHandle.addEventListener('mousedown', function(e) {
            e.preventDefault();
            e.stopPropagation();

            startX = e.clientX;
            startY = e.clientY;
            startWidth = parseInt(document.defaultView.getComputedStyle(element).width, 10);
            startHeight = parseInt(document.defaultView.getComputedStyle(element).height, 10);

            function doResize(e) {
                element.style.width = (startWidth + e.clientX - startX) + 'px';
                element.style.height = (startHeight + e.clientY - startY) + 'px';
            }

            function stopResize() {
                window.removeEventListener('mousemove', doResize);
                window.removeEventListener('mouseup', stopResize);
            }

            window.addEventListener('mousemove', doResize);
            window.addEventListener('mouseup', stopResize);
        });
    }

    makeDraggable(element) {
        let offsetX, offsetY;

        element.addEventListener('mousedown', (e) => {
            if (e.target.classList.contains('delete-btn') ||
                e.target.classList.contains('resize-handle')) return;

            e.preventDefault();
            this.setActive(element);

            const rect = element.getBoundingClientRect();
            offsetX = e.clientX - rect.left;
            offsetY = e.clientY - rect.top;

            document.addEventListener('mousemove', moveElement);
            document.addEventListener('mouseup', stopDrag);
        });

        const moveElement = (e) => {
            const containerRect = this.container.getBoundingClientRect();
            let x = e.clientX - containerRect.left - offsetX;
            let y = e.clientY - containerRect.top - offsetY;

            x = Math.max(0, Math.min(x, containerRect.width - element.offsetWidth));
            y = Math.max(0, Math.min(y, containerRect.height - element.offsetHeight));

            element.style.left = `${x}px`;
            element.style.top = `${y}px`;
        };

        const stopDrag = () => {
            document.removeEventListener('mousemove', moveElement);
            document.removeEventListener('mouseup', stopDrag);
            this.saveElementData(element);
        };
    }

    setActive(element) {
        if (this.activeElement) {
            this.activeElement.classList.remove('active');
        }
        this.activeElement = element;
        element.classList.add('active');

        if (element.classList.contains('meme-text')) {
            this.colorPicker.value = element.style.color;
            this.sizeSlider.value = parseInt(element.style.fontSize);
            this.sizeValue.textContent = `${this.sizeSlider.value}px`;
        }
    }

    updateStyle() {
        if (!this.activeElement || !this.activeElement.classList.contains('meme-text')) return;

        this.activeElement.style.color = this.colorPicker.value;
        this.activeElement.style.fontSize = `${this.sizeSlider.value}px`;
        this.saveElementData(this.activeElement);
    }

    saveElementData(element) {
        const rect = element.getBoundingClientRect();
        const containerRect = this.container.getBoundingClientRect();

        const data = {
            element: element,
            type: element.classList.contains('meme-text') ? 'text' : 'overlay',
            x: Math.round(rect.left - containerRect.left),
            y: Math.round(rect.top - containerRect.top),
            width: rect.width,
            height: rect.height
        };

        if (data.type === 'text') {
            data.text = element.textContent.replace('×', '').trim();
            data.color = element.style.color;
            data.size = parseInt(element.style.fontSize);
        } else {
            data.src = element.querySelector('img').src;
        }

        const index = this.elements.findIndex(el => el.element === element);
        if (index >= 0) {
            this.elements[index] = data;
        } else {
            this.elements.push(data);
        }
    }

    addOverlay(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const overlay = document.createElement('div');
            overlay.className = 'meme-overlay active';

            const img = document.createElement('img');
            img.src = e.target.result;

            const deleteBtn = document.createElement('span');
            deleteBtn.className = 'delete-btn';
            deleteBtn.innerHTML = '×';
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                overlay.remove();
                this.elements = this.elements.filter(el => el.element !== overlay);
            });

            overlay.appendChild(img);
            overlay.appendChild(deleteBtn);
            overlay.style.left = '50px';
            overlay.style.top = '50px';

            this.makeDraggable(overlay);
            this.container.appendChild(overlay);
            this.setActive(overlay);
        };
        reader.readAsDataURL(file);
    }

    uploadTemplate(event) {
        const file = event.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        fetch('/upload', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const option = document.createElement('option');
                option.value = data.filename;
                option.textContent = 'Мой шаблон';
                this.templateSelect.appendChild(option);
                this.templateSelect.value = data.filename;
                this.loadTemplate();
            }
        });
    }

    clearAll() {
        this.container.querySelectorAll('.meme-text, .meme-overlay').forEach(el => el.remove());
        this.elements = [];
    }

    generateMeme() {
        this.container.querySelectorAll('.meme-text, .meme-overlay').forEach(el => this.saveElementData(el));

        const formData = new FormData();
        formData.append('template', this.templateSelect.value);

        this.elements
            .filter(el => el.type === 'text')
            .forEach(text => {
                formData.append('texts[]', text.text);
                formData.append('positions[]', `${text.x},${text.y}`);
                formData.append('colors[]', text.color);
                formData.append('sizes[]', text.size);
            });

        Promise.all(
            this.elements
                .filter(el => el.type === 'overlay')
                .map(overlay =>
                    fetch(overlay.src)
                        .then(res => res.blob())
                        .then(blob => {
                            formData.append('overlays[]', blob, `overlay${this.elements.indexOf(overlay)}.png`);
                        })
                )
        ).then(() => {
            fetch('/generate', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    this.showResult(data.url);
                }
            });
        });
    }

    showResult(url) {
        this.resultContainer.innerHTML = `
            <img src="${url}" class="generated-meme">
            <a href="${url}" download class="download-btn">Скачать мем</a>
        `;
    }

    addText(x, y) {
        const textEl = document.createElement('div');
        textEl.className = 'meme-text active';
        textEl.contentEditable = true;
        textEl.textContent = ""; // Пустой текст по умолчанию
        textEl.style.left = `${x}px`;
        textEl.style.top = `${y}px`;
        textEl.style.color = this.colorPicker.value; // Чёрный цвет по умолчанию
        textEl.style.fontSize = `${this.sizeSlider.value}px`;
        textEl.style.fontFamily = 'Impact, sans-serif';
        textEl.style.textShadow = 'none'; // Убрали тень для чёрного текста
        textEl.style.minWidth = '50px';
        textEl.style.minHeight = '30px';

    }
}


document.addEventListener('DOMContentLoaded', () => new MemeEditor());