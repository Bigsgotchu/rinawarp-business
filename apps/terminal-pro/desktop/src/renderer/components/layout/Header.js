import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { AgentStatus } from '../../../shared/types/conversation.types';
export const Header = ({ agentStatus, currentView, onViewChange }) => {
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
    return (_jsxs("header", { className: "app-header", children: [_jsxs("div", { className: "header-left", children: [_jsx("h1", { className: "app-title", children: "RinaWarp" }), _jsx("span", { className: "app-subtitle", children: "Terminal Pro" })] }), _jsx("div", { className: "header-center", children: _jsxs("nav", { className: "view-navigation", children: [_jsx("button", { className: `nav-button ${currentView === 'conversation' ? 'active' : ''}`, onClick: () => onViewChange('conversation'), children: "\uD83D\uDCAC Conversation" }), _jsx("button", { className: `nav-button ${currentView === 'intent' ? 'active' : ''}`, onClick: () => onViewChange('intent'), children: "\uD83C\uDFAF Intent" }), _jsx("button", { className: `nav-button ${currentView === 'terminal' ? 'active' : ''}`, onClick: () => onViewChange('terminal'), children: "\uD83D\uDCBB Terminal" })] }) }), _jsxs("div", { className: "header-right", children: [_jsxs("div", { className: "agent-status", children: [_jsx("div", { className: "status-indicator", style: { backgroundColor: getStatusColor(agentStatus) } }), _jsx("span", { className: "status-text", children: getStatusText(agentStatus) })] }), _jsxs("div", { className: "header-actions", children: [_jsx("button", { className: "header-button", title: "Settings", children: "\u2699\uFE0F" }), _jsx("button", { className: "header-button", title: "Help", children: "\u2753" })] })] })] }));
};
