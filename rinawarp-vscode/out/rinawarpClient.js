"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.RinaWarpClient = void 0;
const vscode = __importStar(require("vscode"));
class RinaWarpClient {
    constructor(context) {
        this.context = context;
        const config = vscode.workspace.getConfiguration("rinawarp");
        this.apiBase = (config.get("apiBaseUrl") || "https://api.rinawarptech.com").replace(/:+$/g, "");
    }
    async getInlineCompletion(req) {
        try {
            // Use the new /api/ai/inline endpoint for Copilot-style completion
            const res = await fetch(`${this.apiBase}/api/ai/inline`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    before: req.textBeforeCursor,
                    after: req.textAfterCursor,
                }),
            });
            if (!res.ok) {
                console.error("RinaWarp inline completion error:", res.status, res.statusText);
                return null;
            }
            const data = await res.json();
            return data.completion || null;
        }
        catch (err) {
            console.error("RinaWarp inline completion request failed:", err);
            return null;
        }
    }
    async fixCode(req) {
        try {
            // Use the new /api/ai/fix endpoint for RinaWarp Fix Mode
            const instructions = `Fix and improve this ${req.mode === "file" ? "entire file" : "code selection"} for ${req.languageId}. Provide only the fixed code.`;
            const res = await fetch(`${this.apiBase}/api/ai/fix`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    code: req.originalCode,
                    instructions: instructions,
                }),
            });
            if (!res.ok) {
                console.error("RinaWarp fix-code error:", res.status, res.statusText);
                return null;
            }
            const data = await res.json();
            return {
                fixedCode: data.fixed || "No changes suggested",
                summary: "Code fixed by RinaWarp AI",
            };
        }
        catch (err) {
            console.error("RinaWarp fix-code request failed:", err);
            return null;
        }
    }
}
exports.RinaWarpClient = RinaWarpClient;
//# sourceMappingURL=rinawarpClient.js.map