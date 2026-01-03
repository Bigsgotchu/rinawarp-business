import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useRef, useEffect } from 'react';
export const IntentInput = ({ value, onChange, onSend, onKeyPress, disabled = false, placeholder = 'Tell Rina what you want to build...', }) => {
    const textareaRef = useRef(null);
    // Auto-resize textarea
    useEffect(() => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = 'auto';
            textarea.style.height = `${textarea.scrollHeight}px`;
        }
    }, [value]);
    const handleChange = (event) => {
        onChange(event.target.value);
    };
    return (_jsxs("div", { className: "intent-input-section", children: [_jsx("textarea", { ref: textareaRef, className: "intent-input", value: value, onChange: handleChange, onKeyDown: onKeyPress, placeholder: placeholder, disabled: disabled, rows: 1 }), _jsxs("div", { className: "intent-actions", children: [_jsx("button", { className: "intent-btn primary", onClick: onSend, disabled: disabled || !value.trim(), children: "\uD83D\uDCAC Send Message" }), _jsx("button", { className: "intent-btn secondary", onClick: () => onChange(''), disabled: disabled || !value.trim(), children: "\uD83D\uDDD1\uFE0F Clear" })] })] }));
};
