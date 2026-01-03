import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useRef, useEffect } from 'react';
import { MessageBubble } from './MessageBubble';
import { ConversationHeader } from './ConversationHeader';
import { IntentInput } from './IntentInput';
export const ConversationInterface = ({ messages, isTyping, agentStatus, onSendMessage, onIntentDetected, }) => {
    const [inputValue, setInputValue] = useState('');
    const messagesEndRef = useRef(null);
    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping]);
    const handleSendMessage = async () => {
        if (!inputValue.trim())
            return;
        const message = inputValue.trim();
        setInputValue('');
        await onSendMessage(message);
    };
    const handleKeyPress = (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            handleSendMessage();
        }
    };
    return (_jsxs("div", { className: "conversation-interface", children: [_jsx(ConversationHeader, { agentStatus: agentStatus, messageCount: messages.length }), _jsxs("div", { className: "conversation-messages", children: [messages.map((message) => (_jsx(MessageBubble, { message: message, isLast: message.id === messages[messages.length - 1]?.id }, message.id))), isTyping && (_jsxs("div", { className: "typing-indicator", children: [_jsxs("div", { className: "typing-dots", children: [_jsx("span", {}), _jsx("span", {}), _jsx("span", {})] }), _jsx("span", { className: "typing-text", children: "Rina is thinking..." })] })), _jsx("div", { ref: messagesEndRef })] }), _jsx(IntentInput, { value: inputValue, onChange: setInputValue, onSend: handleSendMessage, onKeyPress: handleKeyPress, disabled: isTyping, placeholder: "Tell Rina what you want to build or do..." })] }));
};
