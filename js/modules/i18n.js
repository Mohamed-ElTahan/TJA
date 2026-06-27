document.addEventListener('DOMContentLoaded', () => {
    if (typeof window.TJA_CONTENT === 'undefined') {
        console.error('TJA_CONTENT is not loaded.');
        return;
    }
    
    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (window.TJA_CONTENT[key]) {
            // For elements that are inputs/textareas with placeholder
            if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                el.placeholder = window.TJA_CONTENT[key];
            } else {
                // Determine if we want to replace text or innerHTML
                el.innerHTML = window.TJA_CONTENT[key];
            }
        }
    });
});
