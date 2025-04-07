"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const child_process_1 = require("child_process");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const app = (0, express_1.default)();
const port = 3001;
app.use(body_parser_1.default.json());
app.post("/api/submit-intake", (req, res) => {
    const data = req.body;
    const timestamp = Date.now();
    const filename = path_1.default.join("intake-submissions", `${data.projectName.toLowerCase().replace(/\s/g, "-")}-${timestamp}.json`);
    // Ensure directory exists
    if (!fs_1.default.existsSync("intake-submissions")) {
        fs_1.default.mkdirSync("intake-submissions", { recursive: true });
    }
    fs_1.default.writeFileSync(filename, JSON.stringify(data, null, 2));
    console.log(`✅ Intake data saved: ${filename}`);
    (0, child_process_1.exec)(`node dist/scripts/generate-brief.js '${filename}'`, (err, stdout, stderr) => {
        if (err) {
            console.error(`❌ Brief generation error: ${stderr}`);
            return res.status(500).send("Error generating project brief.");
        }
        console.log(stdout);
        res.status(200).send("✅ Project brief generated!");
    });
});
// Only start the server if this file is run directly
if (require.main === module) {
    app.listen(port, () => {
        console.log(`🚀 Intake server running on http://localhost:${port}`);
    });
}
exports.default = app;
