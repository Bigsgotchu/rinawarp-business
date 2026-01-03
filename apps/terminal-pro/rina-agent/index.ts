import { RinaAgent } from "./rina-agent";

export default {
    async fetch(request: Request, env: any, ctx: any): Promise<Response> {
        const url = new URL(request.url);

        // Route to Rina Agent
        return RinaAgent.fetch(request, env, ctx);
    }
};