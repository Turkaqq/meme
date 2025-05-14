function selectTemplate(templateName) {
    fetch(`/set-template?name=${templateName}`)
        .then(response => {
            if (response.ok) {
                window.location.href = '/';
            }
        });
}

document.addEventListener('DOMContentLoaded', () => {
    // Добавляем эффект при наведении
    const cards = document.querySelectorAll('.template-card');
    cards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'scale(1.05)';
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'scale(1)';
        });
    });
});