const fs = require("fs");

function generateBrief(data) {
  const content = `# Project Brief – ${data.projectName}
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
${data.notes}`;

  const fileName = `project-briefs/${data.projectName
    .toLowerCase()
    .replace(/\s/g, "-")}.md`;
  fs.writeFileSync(fileName, content);
  console.log(`✅ Brief generated: ${fileName}`);
}
