import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { MessageType } from '../../../shared/types/conversation.types';
export const MessageBubble = ({ message, isLast = false }) => {
    const isUser = message.type === MessageType.USER;
    const isAgent = message.type === MessageType.AGENT;
    const isSystem = message.type === MessageType.SYSTEM;
    const formatTimestamp = (timestamp) => {
        return timestamp.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
        });
    };
    return (_jsxs("div", { className: `message-bubble-container ${isUser ? 'user' : 'agent'} ${isLast ? 'last' : ''}`, children: [_jsxs("div", { className: `message-bubble ${isUser ? 'user-bubble' : 'agent-bubble'}`, children: [_jsx("div", { className: "message-content", children: message.content }), message.metadata && (_jsxs("div", { className: "message-metadata", children: [message.metadata.processingTime && (_jsxs("span", { className: "processing-time", children: [message.metadata.processingTime, "ms"] })), message.metadata.confidence && (_jsxs("span", { className: "confidence", children: [Math.round(message.metadata.confidence * 100), "% confident"] }))] }))] }), _jsxs("div", { className: "message-footer", children: [_jsx("span", { className: "message-timestamp", children: formatTimestamp(message.timestamp) }), isAgent && (_jsxs("div", { className: "message-actions", children: [_jsx("button", { className: "action-btn", title: "Copy message", children: "\uD83D\uDCCB" }), _jsx("button", { className: "action-btn", title: "Regenerate response", children: "\uD83D\uDD04" })] }))] })] }));
};
