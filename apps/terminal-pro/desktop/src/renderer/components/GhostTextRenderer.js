/**
 * GhostTextRenderer - Minimal, production-safe implementation for inline suggestions
 * Renders "ghost text" after user's typed text with Tab-to-accept functionality
 */
export function attachGhostText(config) {
    let suggestion = '';
    let dismissed = false;
    let refreshTimer;
    function render() {
        const typed = config.inputEl.value ?? '';
        const show = !dismissed && suggestion && suggestion.startsWith(typed) && suggestion.length > typed.length;
        if (!show) {
            config.ghostLayerEl.innerHTML = '';
            return;
        }
        const suffix = suggestion.slice(typed.length);
        config.ghostLayerEl.innerHTML = `
      <span class="ghost-text-typed">${escapeHtml(typed)}</span>
      <span class="ghost-text-suggestion">${escapeHtml(suffix)}</span>
    `;
    }
    async function refreshSuggestion() {
        dismissed = false;
        const typed = config.inputEl.value ?? '';
        if (!typed.trim()) {
            suggestion = '';
            render();
            return;
        }
        try {
            const s = await config.getSuggestion();
            suggestion = (typeof s === 'string' ? s : '') || '';
            render();
        }
        catch (error) {
            console.warn('Ghost text suggestion failed:', error);
            suggestion = '';
            render();
        }
    }
    function handleInput() {
        dismissed = false;
        render();
        // Debounce suggestion refresh
        window.clearTimeout(refreshTimer);
        refreshTimer = window.setTimeout(refreshSuggestion, 120);
    }
    function handleKeydown(e) {
        if (e.key === 'Tab') {
            const typed = config.inputEl.value ?? '';
            if (!dismissed &&
                suggestion &&
                suggestion.startsWith(typed) &&
                suggestion.length > typed.length) {
                e.preventDefault();
                config.inputEl.value = suggestion;
                suggestion = '';
                dismissed = false;
                config.ghostLayerEl.innerHTML = '';
                config.onAccept?.(config.inputEl.value);
            }
        }
        if (e.key === 'Escape') {
            dismissed = true;
            render();
            config.onDismiss?.();
        }
    }
    // Event listeners
    config.inputEl.addEventListener('input', handleInput);
    config.inputEl.addEventListener('keydown', handleKeydown);
    // Public API
    return {
        setSuggestion(text) {
            suggestion = text || '';
            dismissed = false;
            render();
        },
        clear() {
            suggestion = '';
            dismissed = false;
            render();
        },
        refreshSuggestion,
        destroy() {
            window.clearTimeout(refreshTimer);
            config.inputEl.removeEventListener('input', handleInput);
            config.inputEl.removeEventListener('keydown', handleKeydown);
        },
    };
}
function escapeHtml(s) {
    return s.replace(/[&<>"']/g, (c) => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
    })[c]);
}
