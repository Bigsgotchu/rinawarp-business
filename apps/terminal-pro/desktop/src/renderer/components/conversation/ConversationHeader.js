import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { AgentStatus } from '../../../shared/types/conversation.types';
export const ConversationHeader = ({ agentStatus, messageCount, }) => {
    const getStatusColor = (status) => {
        switch (status) {
            case AgentStatus.CONNECTED:
                return '#10b981';
            case AgentStatus.ERROR:
                return '#ef4444';
            default:
                return '#f59e0b';
        }
    };
    const getStatusText = (status) => {
        switch (status) {
            case AgentStatus.CONNECTED:
                return 'Connected';
            case AgentStatus.ERROR:
                return 'Disconnected';
            default:
                return 'Connecting...';
        }
    };
    return (_jsxs("div", { className: "conversation-header", children: [_jsxs("div", { children: [_jsx("h2", { className: "conversation-title", children: "Chat with Rina" }), _jsx("p", { className: "conversation-subtitle", children: "Your AI coding assistant" })] }), _jsxs("div", { className: "header-stats", children: [_jsxs("div", { className: "agent-status", children: [_jsx("div", { className: "status-dot", style: { backgroundColor: getStatusColor(agentStatus) } }), _jsx("span", { children: getStatusText(agentStatus) })] }), _jsxs("div", { className: "message-count", children: [messageCount, " messages"] })] })] }));
};
