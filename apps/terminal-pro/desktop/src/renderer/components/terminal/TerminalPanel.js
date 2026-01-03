import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
export const TerminalPanel = ({ terminals, onBackToConversation, }) => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [activeTerminal, setActiveTerminal] = useState(null);
    const toggleCollapse = () => {
        setIsCollapsed(!isCollapsed);
    };
    return (_jsxs("div", { className: "terminal-panel", children: [_jsxs("div", { className: "terminal-header", children: [_jsx("button", { className: "back-button", onClick: onBackToConversation, children: "\u2190 Back to Conversation" }), _jsx("h3", { children: "Terminal Output" }), _jsx("button", { className: "collapse-button", onClick: toggleCollapse, children: isCollapsed ? '▶' : '▼' })] }), !isCollapsed && (_jsxs("div", { className: "terminal-content", children: [_jsxs("div", { className: "terminal-tabs", children: [terminals.map((terminal) => (_jsxs("button", { className: `terminal-tab ${activeTerminal === terminal.id ? 'active' : ''}`, onClick: () => setActiveTerminal(terminal.id), children: [terminal.name, _jsx("span", { className: "close-tab", onClick: (e) => {
                                            e.stopPropagation();
                                            // Handle close terminal
                                        }, children: "\u00D7" })] }, terminal.id))), _jsx("button", { className: "new-terminal-btn", onClick: () => {
                                    // Handle create new terminal
                                }, children: "+" })] }), _jsx("div", { className: "terminal-output", children: activeTerminal ? (_jsx("div", { className: "terminal-session", children: _jsxs("div", { className: "terminal-prompt", children: [_jsx("span", { className: "prompt-symbol", children: "$" }), _jsx("input", { type: "text", className: "terminal-input", placeholder: "Type a command...", autoFocus: true })] }) })) : (_jsxs("div", { className: "terminal-placeholder", children: [_jsx("p", { children: "Select a terminal session or create a new one" }), _jsx("button", { className: "create-terminal-btn", onClick: () => {
                                        // Handle create terminal
                                    }, children: "Create Terminal" })] })) }), _jsxs("div", { className: "terminal-controls", children: [_jsx("button", { className: "terminal-btn", children: "Clear" }), _jsx("button", { className: "terminal-btn", children: "Export" }), _jsx("button", { className: "terminal-btn", children: "Settings" })] })] }))] }));
};
