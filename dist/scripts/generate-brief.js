"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const filePath = process.argv[2];
if (!filePath) {
    console.error("❌ No input file provided.");
    process.exit(1);
}
const data = JSON.parse(fs_1.default.readFileSync(filePath, "utf-8"));
const brief = `# Project Brief – ${data.projectName}

## 🧾 Summary
**Overview:** ${data.summary}
**Launch Date:** ${data.launchDate}

## 🧠 Purpose
**Goal:** ${data.mainGoal}
**Audience:** ${data.audience}
**Success Criteria:** ${data.successCriteria}

## 🔌 Tech & Stack
**Platform:** ${data.platform}
**Tech Stack:** ${data.stack}
**AI Usage:** ${data.aiUsage}
**Real-Time Features:** ${data.realtime}

## 🔗 Integrations
${data.integrations}

## 🎨 Design
${data.design}

## 📦 Deliverables
${data.deliverables}

## 💰 Budget
${data.budget}

## 🚀 Launch Plan
${data.launchPlan}

## 📝 Other Notes
${data.notes}
`;
// Ensure directory exists
if (!fs_1.default.existsSync("project-briefs")) {
    fs_1.default.mkdirSync("project-briefs", { recursive: true });
}
const filename = path_1.default.join("project-briefs", `${data.projectName.toLowerCase().replace(/\s/g, "-")}.md`);
fs_1.default.writeFileSync(filename, brief);
console.log(`✅ Brief saved to ${filename}`);
