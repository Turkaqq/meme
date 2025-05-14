document.addEventListener('DOMContentLoaded', function() {
    const templateSelect = document.getElementById('template-select');
    const memeTemplate = document.getElementById('meme-template');
    const textElements = document.querySelectorAll('.text-editor');
    const textColor = document.getElementById('text-color');
    const textSize = document.getElementById('text-size');
    const generateBtn = document.getElementById('generate-btn');

    // Загрузка нового шаблона
    templateSelect.addEventListener('change', function() {
        memeTemplate.src = `/static/templates/${this.value}`;
    });

    // Изменение стилей текста
    function updateTextStyles() {
        textElements.forEach(el => {
            el.style.color = textColor.value;
            el.style.fontSize = `${textSize.value}px`;
        });
    }

    textColor.addEventListener('input', updateTextStyles);
    textSize.addEventListener('input', updateTextStyles);

    // Генерация мема
    generateBtn.addEventListener('click', function() {
        const formData = new FormData();
        formData.append('template', templateSelect.value);
        formData.append('top_text', document.querySelector('.top-text').textContent);
        formData.append('bottom_text', document.querySelector('.bottom-text').textContent);

        fetch('/generate', {
            method: 'POST',
            body: formData
        })
        .then(response => response.blob())
        .then(blob => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'my_meme.jpg';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        });
    });
});