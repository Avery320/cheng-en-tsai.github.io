(function () {
    'use strict';

    const DEFAULT_MEDIA_OPTIONS = Object.freeze({ border: false, radius: true });
    const BOOLEAN_VALUES = Object.freeze({
        true: true,
        false: false
    });

    function stripOptionalQuotes(raw = '') {
        const value = String(raw).trim();
        const quote = value[0];
        return value.length > 1 && (quote === '"' || quote === '\'') && value[value.length - 1] === quote
            ? value.slice(1, -1).trim()
            : value;
    }

    function normalizeMediaOptions(options = {}) {
        const merged = { ...DEFAULT_MEDIA_OPTIONS, ...(options && typeof options === 'object' ? options : {}) };
        return {
            border: Boolean(merged.border),
            radius: Boolean(merged.radius)
        };
    }

    function parseMediaOptions(raw = '') {
        const text = String(raw || '').trim();
        if (!text) return { ...DEFAULT_MEDIA_OPTIONS };

        const next = { ...DEFAULT_MEDIA_OPTIONS };
        text.split(',').forEach((chunk) => {
            const segment = chunk.trim();
            if (!segment) return;

            const separator = segment.indexOf('=');
            const key = (separator < 0 ? segment : segment.slice(0, separator)).trim().toLowerCase();
            const value = stripOptionalQuotes(separator < 0 ? 'true' : segment.slice(separator + 1)).toLowerCase();

            if (key === 'border') {
                const parsed = BOOLEAN_VALUES[value];
                if (typeof parsed === 'boolean') next.border = parsed;
                return;
            }

            if (key === 'radius') {
                const parsed = BOOLEAN_VALUES[value];
                if (typeof parsed === 'boolean') next.radius = parsed;
            }
        });

        return normalizeMediaOptions(next);
    }

    function getMediaOptionClasses(options = DEFAULT_MEDIA_OPTIONS) {
        const { border, radius } = normalizeMediaOptions(options);
        return [border ? 'media-with-border' : '', radius ? 'media-radius-on' : ''].filter(Boolean);
    }

    window.MarkdownOptions = Object.freeze({
        DEFAULT_MEDIA_OPTIONS,
        parseMediaOptions,
        getMediaOptionClasses
    });
})();
