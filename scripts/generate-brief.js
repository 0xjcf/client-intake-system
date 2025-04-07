const fs = require("fs");

const filePath = process.argv[2];
if (!filePath) {
  console.error("❌ No input file provided.");
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));

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

const filename = `project-briefs/${data.projectName
  .toLowerCase()
  .replace(/\s/g, "-")}.md`;
fs.writeFileSync(filename, brief);
console.log(`✅ Brief saved to ${filename}`);
