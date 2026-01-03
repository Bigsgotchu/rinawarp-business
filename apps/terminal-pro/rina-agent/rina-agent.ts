import { Agent } from "agents";

type Env = {
    OPENAI_API_KEY?: string;
    RINAWARP_LICENSE_VERIFY_URL?: string;
    RINAWARP_API_URL?: string;
    RINA_AGENT_SECRET?: string;
};

type RinaState = {
    licenseCache?: Record<string, { ok: boolean; ts: number; plan?: string; features?: string[] }>;
    userPreferences?: Record<string, any>;
    conversationHistory?: Array<{ role: string; content: string; timestamp: number }>;
};

const RINA_SYSTEM_PROMPT = `
You are Rina, the RinaWarp Terminal Pro assistant.
Personality: confident, warm, slightly playful, very practical.
Style: concise, step-by-step, no fluff.
You must:
- prioritize security + correctness
- ask for missing info only if truly necessary
- never expose secrets
- maintain consistent tone and helpfulness
- provide actionable, specific guidance
- adapt responses based on user's license plan and context
`;

export class RinaAgent extends Agent<Env, RinaState> {
    async onRequest(request: Request): Promise<Response> {
        const url = new URL(request.url);

        // Health check
        if (request.method === "GET" && url.pathname === "/health") {
            return Response.json({
                ok: true,
                agent: "rina",
                ts: Date.now(),
                version: "1.0.0"
            });
        }

        // Main chat endpoint
        if (request.method === "POST" && url.pathname === "/api/agent") {
            const body = await request.json().catch(() => ({}));
            const prompt = (body.prompt ?? body.message ?? "").toString();
            const licenseKey = (body.licenseKey ?? "").toString();
            const context = body.context ?? {};
            const mode = (body.mode ?? "rina").toString();

            if (!prompt.trim()) {
                return Response.json({ ok: false, error: "Empty prompt" }, { status: 400 });
            }

            // License gate
            const license = await this.verifyLicenseCached(licenseKey);
            if (!license.ok) {
                return Response.json(
                    {
                        ok: false,
                        error: "License required",
                        license: { status: "invalid" },
                    },
                    { status: 402 }
                );
            }

            // Add user context to conversation
            const conversationContext = this.buildConversationContext(prompt, license);

            const reply = await this.callOpenAI({
                system: this.buildSystemPrompt(license),
                user: prompt,
                context: {
                    mode,
                    ...context,
                    plan: license.plan ?? "unknown",
                    features: license.features || [],
                    conversationContext
                },
            });

            // Store conversation history
            this.addToConversationHistory("user", prompt);
            this.addToConversationHistory("assistant", reply);

            return Response.json({
                ok: true,
                reply,
                license: {
                    status: "active",
                    plan: license.plan ?? "unknown",
                    features: license.features || []
                },
                conversationId: this.getConversationId(),
            });
        }

        return new Response("Not found", { status: 404 });
    }

    private buildSystemPrompt(license: { ok: boolean; plan?: string; features?: string[] }): string {
        const basePrompt = RINA_SYSTEM_PROMPT;
        const planInfo = license.plan ? `User plan: ${license.plan}. ` : "";
        const featuresInfo = license.features && license.features.length > 0
            ? `Available features: ${license.features.join(", ")}. `
            : "";

        return `${basePrompt}

${planInfo}${featuresInfo}
Context: This user has a ${license.ok ? 'valid' : 'invalid'} license.
Always provide helpful, accurate responses while respecting license restrictions.`;
    }

    private buildConversationContext(prompt: string, license: any): string {
        const recentMessages = this.state.conversationHistory?.slice(-3) || [];
        const context = recentMessages.map((msg: any) => `${msg.role}: ${msg.content}`).join('\n');

        return `Recent conversation context:\n${context}\n\nCurrent user input: ${prompt}`;
    }

    private getConversationId(): string {
        return `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    private addToConversationHistory(role: string, content: string) {
        if (!this.state.conversationHistory) {
            this.state.conversationHistory = [];
        }

        this.state.conversationHistory.push({
            role,
            content,
            timestamp: Date.now()
        });

        // Keep only last 20 messages to prevent memory bloat
        if (this.state.conversationHistory.length > 20) {
            this.state.conversationHistory = this.state.conversationHistory.slice(-20);
        }
    }

    private async verifyLicenseCached(licenseKey: string): Promise<{ ok: boolean; plan?: string; features?: string[] }> {
        const verifyUrl = this.env.RINAWARP_LICENSE_VERIFY_URL || "https://api.rinawarptech.com/api/license/verify";

        if (!licenseKey) return { ok: false };

        const now = Date.now();
        const cache = (this.state.licenseCache ||= {});
        const cached = cache[licenseKey];

        // cache for 10 minutes
        if (cached && now - cached.ts < 10 * 60 * 1000) {
            return { ok: cached.ok, plan: cached.plan, features: cached.features };
        }

        const res = await fetch(`${verifyUrl}?key=${encodeURIComponent(licenseKey)}`, {
            method: "GET",
            headers: { "Accept": "application/json" },
        }).catch(() => null);

        if (!res || !res.ok) {
            cache[licenseKey] = { ok: false, ts: now };
            return { ok: false };
        }

        const data = await res.json().catch(() => ({}));
        const ok = Boolean(data.valid);
        const plan = data?.data?.plan || data?.plan;
        const features = data?.data?.features || data?.features || [];

        cache[licenseKey] = { ok, ts: now, plan, features };
        return { ok, plan, features };
    }

    private async callOpenAI(args: {
        system: string;
        user: string;
        context: Record<string, unknown>;
    }): Promise<string> {
        if (!this.env.OPENAI_API_KEY) {
            return "OpenAI API key is not configured on the server.";
        }

        const res = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${this.env.OPENAI_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "gpt-4o-mini",
                messages: [
                    { role: "system", content: args.system },
                    { role: "user", content: `${args.user}\n\nContext:\n${JSON.stringify(args.context)}` },
                ],
                temperature: 0.6,
                max_tokens: 1000,
            }),
        });

        if (!res.ok) {
            const txt = await res.text().catch(() => "");
            return `Rina backend error (OpenAI): HTTP ${res.status} ${txt}`;
        }

        const json = await res.json();
        return json?.choices?.[0]?.message?.content ?? "No response.";
    }
}