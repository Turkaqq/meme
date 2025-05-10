document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('meme-form');
    const previewImg = document.getElementById('meme-preview');
    const topTextPreview = document.getElementById('top-text-preview');
    const bottomTextPreview = document.getElementById('bottom-text-preview');
    const imageUpload = document.getElementById('image-upload');

    // Обновляем превью при любых изменениях
    form.addEventListener('input', updatePreview);
    imageUpload.addEventListener('change', handleImageUpload);

    function updatePreview() {
        // Обновляем текст
        topTextPreview.textContent = document.getElementById('top-text').value;
        bottomTextPreview.textContent = document.getElementById('bottom-text').value;

        // Применяем стили
        const fontSelect = document.getElementById('font-select');
        const colorPicker = document.getElementById('text-color');

        const fontFamily = fontSelect.value === 'impact' ? 'Impact, sans-serif' : 'Arial, sans-serif';
        const color = colorPicker.value;

        [topTextPreview, bottomTextPreview].forEach(el => {
            el.style.fontFamily = fontFamily;
            el.style.color = color;
            el.style.fontSize = '24px';
            el.style.textShadow = '2px 2px 4px #000';
        });
    }

    function handleImageUpload(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                previewImg.src = event.target.result;
            };
            reader.readAsDataURL(file);
        }
    }

    // Инициализация
    updatePreview();
});