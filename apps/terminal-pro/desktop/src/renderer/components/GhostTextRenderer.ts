/**
 * GhostTextRenderer - Minimal, production-safe implementation for inline suggestions
 * Renders "ghost text" after user's typed text with Tab-to-accept functionality
 */

export interface GhostTextConfig {
  inputEl: HTMLInputElement | HTMLTextAreaElement;
  ghostLayerEl: HTMLElement;
  getSuggestion: () => Promise<string> | string;
  onAccept?: (fullText: string) => void;
  onDismiss?: () => void;
}

export interface GhostTextInstance {
  setSuggestion(text: string): void;
  clear(): void;
  refreshSuggestion(): void;
  destroy(): void;
}

export function attachGhostText(config: GhostTextConfig): GhostTextInstance {
  let suggestion = "";
  let dismissed = false;
  let refreshTimer: number | undefined;

  function render() {
    const typed = config.inputEl.value ?? "";
    const show = !dismissed && suggestion && suggestion.startsWith(typed) && suggestion.length > typed.length;

    if (!show) {
      config.ghostLayerEl.innerHTML = "";
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
    const typed = config.inputEl.value ?? "";
    
    if (!typed.trim()) {
      suggestion = "";
      render();
      return;
    }

    try {
      const s = await config.getSuggestion();
      suggestion = (typeof s === "string" ? s : "") || "";
      render();
    } catch (error) {
      console.warn("Ghost text suggestion failed:", error);
      suggestion = "";
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

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === "Tab") {
      const typed = config.inputEl.value ?? "";
      if (!dismissed && suggestion && suggestion.startsWith(typed) && suggestion.length > typed.length) {
        e.preventDefault();
        config.inputEl.value = suggestion;
        suggestion = "";
        dismissed = false;
        config.ghostLayerEl.innerHTML = "";
        config.onAccept?.(config.inputEl.value);
      }
    }

    if (e.key === "Escape") {
      dismissed = true;
      render();
      config.onDismiss?.();
    }
  }

  // Event listeners
  config.inputEl.addEventListener("input", handleInput);
  config.inputEl.addEventListener("keydown", handleKeydown);

  // Public API
  return {
    setSuggestion(text: string) {
      suggestion = text || "";
      dismissed = false;
      render();
    },
    
    clear() {
      suggestion = "";
      dismissed = false;
      render();
    },
    
    refreshSuggestion,
    
    destroy() {
      window.clearTimeout(refreshTimer);
      config.inputEl.removeEventListener("input", handleInput);
      config.inputEl.removeEventListener("keydown", handleKeydown);
    }
  };
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[c] as string));
}
