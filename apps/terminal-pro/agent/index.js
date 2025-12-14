"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const supervisor_1 = require("./supervisor");
const protocol_1 = require("./protocol");
console.log("[RinaAgent] starting…");
process.on("message", async (msg) => {
    try {
        await (0, protocol_1.handleMessage)(msg);
    }
    catch (err) {
        process.send?.({
            type: "agent:error",
            error: String(err),
        });
    }
});
(0, supervisor_1.setupSupervisor)();
process.send?.({
    type: "agent:ready",
    pid: process.pid,
});
