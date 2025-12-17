import React, { useRef, useEffect } from 'react';

interface IntentInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onKeyPress: (event: React.KeyboardEvent) => void;
  disabled?: boolean;
  placeholder?: string;
}

export const IntentInput: React.FC<IntentInputProps> = ({
  value,
  onChange,
  onSend,
  onKeyPress,
  disabled = false,
  placeholder = 'Tell Rina what you want to build...',
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [value]);

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(event.target.value);
  };

  return (
    <div className="intent-input-section">
      <textarea
        ref={textareaRef}
        className="intent-input"
        value={value}
        onChange={handleChange}
        onKeyDown={onKeyPress}
        placeholder={placeholder}
        disabled={disabled}
        rows={1}
      />

      <div className="intent-actions">
        <button
          className="intent-btn primary"
          onClick={onSend}
          disabled={disabled || !value.trim()}
        >
          💬 Send Message
        </button>

        <button
          className="intent-btn secondary"
          onClick={() => onChange('')}
          disabled={disabled || !value.trim()}
        >
          🗑️ Clear
        </button>
      </div>
    </div>
  );
};
