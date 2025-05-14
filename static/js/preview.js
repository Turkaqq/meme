document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('meme-form');
    const previewImg = document.getElementById('meme-preview');
    const topText = document.getElementById('top-text-preview');
    const bottomText = document.getElementById('bottom-text-preview');

    form.addEventListener('input', function() {
        topText.textContent = form.elements['top_text'].value;
        bottomText.textContent = form.elements['bottom_text'].value;

        // Применяем стили
        const font = form.elements['font'].value === 'impact' ?
            'Impact, sans-serif' : 'Arial, sans-serif';

        topText.style.fontFamily = font;
        bottomText.style.fontFamily = font;
    });
});