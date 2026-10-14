(() => {
    const entities = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    };

    window.escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, character => entities[character]);

    window.safeImageURL = value => {
        if (typeof value !== 'string') return null;
        if (/^\/uploads\/[A-Za-z0-9._-]+$/.test(value)) return value;

        try {
            const url = new URL(value);
            const cloudinaryPath = url.pathname.split('/').filter(Boolean);
            if (
                url.protocol === 'https:' &&
                url.hostname === 'res.cloudinary.com' &&
                !url.username &&
                !url.password &&
                cloudinaryPath.length > 3 &&
                cloudinaryPath[1] === 'image' &&
                cloudinaryPath[2] === 'upload'
            ) {
                return url.href;
            }
        } catch {
            return null;
        }

        return null;
    };
})();
