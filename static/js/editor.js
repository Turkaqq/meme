document.addEventListener('DOMContentLoaded', () => {
    // Элементы интерфейса
    const templateSelect = document.getElementById('template-select');
    const textInput = document.getElementById('text-input');
    const colorPicker = document.getElementById('text-color');
    const sizeSlider = document.getElementById('text-size');
    const sizeValue = document.getElementById('size-value');
    const addTextBtn = document.getElementById('add-text-btn');
    const clearBtn = document.getElementById('clear-btn');
    const generateBtn = document.getElementById('generate-btn');
    const templateImage = document.getElementById('template-image');
    const textContainer = document.getElementById('text-container');
    const resultContainer = document.getElementById('meme-result');
    const downloadBtn = document.getElementById('download-btn');

    // Состояние приложения
    let texts = [];
    let activeText = null;
    let isDragging = false;
    let startX, startY, initialX, initialY;

    // Инициализация
    updateTemplate();
    sizeValue.textContent = sizeSlider.value;

    // События
    templateSelect.addEventListener('change', updateTemplate);
    sizeSlider.addEventListener('input', updateSizeValue);
    addTextBtn.addEventListener('click', addNewText);
    clearBtn.addEventListener('click', clearAllTexts);
    generateBtn.addEventListener('click', generateMeme);

    // Функции
    function updateTemplate() {
        const template = templateSelect.value;
        templateImage.src = `/static/templates/${template}`;
        templateImage.onload = () => {
            textContainer.style.width = `${templateImage.width}px`;
            textContainer.style.height = `${templateImage.height}px`;
        };
        clearAllTexts();
    }

    function updateSizeValue() {
        sizeValue.textContent = sizeSlider.value;
        if (activeText) {
            activeText.style.fontSize = `${sizeSlider.value}px`;
        }
    }

    function addNewText() {
        const textContent = textInput.value.trim();
        if (!textContent) {
            alert('Введите текст для мема');
            return;
        }

        const textElement = document.createElement('div');
        textElement.className = 'meme-text';
        textElement.textContent = textContent;
        textElement.style.color = colorPicker.value;
        textElement.style.fontSize = `${sizeSlider.value}px`;

        // Позиционируем текст по центру изображения
        const centerX = (templateImage.width - textElement.offsetWidth) / 2;
        const centerY = (templateImage.height - textElement.offsetHeight) / 2;

        textElement.style.left = `${centerX}px`;
        textElement.style.top = `${centerY}px`;

        // Добавляем обработчики событий
        textElement.addEventListener('mousedown', startDrag);
        textElement.addEventListener('click', (e) => {
            e.stopPropagation();
            setActiveText(textElement);
        });

        textContainer.appendChild(textElement);
        texts.push(textElement);
        setActiveText(textElement);

        // Очищаем поле ввода
        textInput.value = '';
    }

    function setActiveText(textElement) {
        // Снимаем выделение с предыдущего активного текста
        if (activeText) {
            activeText.classList.remove('active');
        }

        // Устанавливаем новый активный текст
        activeText = textElement;
        activeText.classList.add('active');

        // Обновляем контролы редактора
        colorPicker.value = rgbToHex(activeText.style.color);
        sizeSlider.value = parseInt(activeText.style.fontSize);
        sizeValue.textContent = sizeSlider.value;
    }

    function startDrag(e) {
        if (e.button !== 0) return; // Только левая кнопка мыши

        e.stopPropagation();
        setActiveText(e.target);

        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;
        initialX = parseInt(activeText.style.left) || 0;
        initialY = parseInt(activeText.style.top) || 0;

        document.addEventListener('mousemove', dragText);
        document.addEventListener('mouseup', stopDrag);

        activeText.style.cursor = 'grabbing';
        activeText.style.userSelect = 'none';
    }

    function dragText(e) {
        if (!isDragging || !activeText) return;

        // Вычисляем новые координаты
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;

        let newX = initialX + dx;
        let newY = initialY + dy;

        // Ограничиваем перемещение в пределах контейнера
        const textRect = activeText.getBoundingClientRect();
        const containerRect = textContainer.getBoundingClientRect();

        newX = Math.max(0, Math.min(newX, containerRect.width - textRect.width));
        newY = Math.max(0, Math.min(newY, containerRect.height - textRect.height));

        // Применяем новые координаты
        activeText.style.left = `${newX}px`;
        activeText.style.top = `${newY}px`;
    }

    function stopDrag() {
        if (!isDragging) return;

        isDragging = false;
        if (activeText) {
            activeText.style.cursor = 'grab';
            activeText.style.userSelect = 'auto';
        }

        document.removeEventListener('mousemove', dragText);
        document.removeEventListener('mouseup', stopDrag);
    }

    function clearAllTexts() {
        textContainer.innerHTML = '';
        texts = [];
        activeText = null;
        resultContainer.innerHTML = '';
        downloadBtn.style.display = 'none';
    }

    async function generateMeme() {
        if (texts.length === 0) {
            alert('Добавьте хотя бы один текстовый блок!');
            return;
        }

        // Собираем данные о текстах
        const textData = texts.map(text => {
            return {
                content: text.textContent,
                x: parseInt(text.style.left),
                y: parseInt(text.style.top),
                size: parseInt(text.style.fontSize),
                color: text.style.color
            };
        });

        // Создаем FormData для отправки
        const formData = new FormData();
        formData.append('template', templateSelect.value);
        formData.append('text_data', JSON.stringify(textData));

        try {
            const response = await fetch('/generate', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (result.success) {
                // Показываем результат
                resultContainer.innerHTML = `<img src="${result.url}" alt="Сгенерированный мем">`;
                downloadBtn.href = result.url;
                downloadBtn.style.display = 'inline-block';
            } else {
                alert(`Ошибка: ${result.error}`);
            }
        } catch (error) {
            alert(`Произошла ошибка: ${error.message}`);
        }
    }

    // Вспомогательная функция для преобразования RGB в HEX
    function rgbToHex(rgb) {
        if (!rgb || rgb === 'transparent') return '#000000';

        // Преобразуем форматы типа "rgb(255, 255, 255)" в HEX
        const rgbValues = rgb.match(/\d+/g);
        if (rgbValues && rgbValues.length === 3) {
            return `#${((1 << 24) +
                    (parseInt(rgbValues[0]) << 16) +
                    (parseInt(rgbValues[1]) << 8) +
                    parseInt(rgbValues[2]))
                    .toString(16).slice(1)}`;
        }

        return rgb; // Возвращаем как есть, если это уже HEX
    }
});