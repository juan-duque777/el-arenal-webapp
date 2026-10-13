(() => {
    const entities = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    };

    window.escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, character => entities[character]);
})();
