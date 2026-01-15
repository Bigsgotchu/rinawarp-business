import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

const logFile = path.join(__dirname, "logs", "licensing.log");

function log(message) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}\n`;
    fs.appendFileSync(logFile, logMessage);
    console.log(logMessage.trim());
}

// License generation endpoint
app.post("/license", (req, res) => {
    try {
        const { userId, email } = req.body;
        const licenseKey = `RINA-LIC-${userId}-${Date.now()}-${Math.random().toString(36).substr(2, 8)}`;
        
        log(`License generated for user: ${userId} (${email})`);
        
        res.json({
            success: true,
            licenseKey,
            expires: "2026-12-31",
            userId,
            email
        });
    } catch (err) {
        log(`License error: ${err.message}`);
        res.status(500).json({ error: err.message });
    }
});

app.listen(5657, () => {
    log("🔑 Licensing service running on port 5657");
});
