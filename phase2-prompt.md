# ✅ Phase 2 – Intake Processing & Project Brief Generator

**Repo: [`client-intake-system`](https://github.com/0xjcf/client-intake-system)**

> **Goal:**  
> Build a local backend that receives form submissions, saves them as `.json`, and converts them into `project-brief.md` files using the existing brief template logic.

---

## 🛠️ Step-by-Step Instructions (Inside `client-intake-system`)

### 📁 1. . Create a Local Express Server to Handle Submissions

Create the server:

```bash
touch server.js
```

Paste this code:

```js
const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const { exec } = require("child_process");
const app = express();
const port = 3001;

app.use(bodyParser.json());

app.post("/api/submit-intake", (req, res) => {
  const data = req.body;
  const timestamp = Date.now();
  const filename = `intake-submissions/${data.projectName
    .toLowerCase()
    .replace(/\s/g, "-")}-${timestamp}.json`;

  fs.writeFileSync(filename, JSON.stringify(data, null, 2));

  console.log(`✅ Intake data saved: ${filename}`);

  exec(
    `node scripts/generate-brief.js '${filename}'`,
    (err, stdout, stderr) => {
      if (err) {
        console.error(`❌ Brief generation error: ${stderr}`);
        return res.status(500).send("Error generating project brief.");
      }
      console.log(stdout);
      res.status(200).send("✅ Project brief generated!");
    }
  );
});

app.listen(port, () => {
  console.log(`🚀 Intake server running on http://localhost:${port}`);
});
```

✅ This will:

- Accept POST requests
- Save the JSON in `intake-submissions/`
- Generate a `project-brief.md` in `project-briefs/`

---

### 🧾 3. Update the Brief Generator Script

Edit `scripts/generate-brief.js` so it works with a provided `.json` file path:

```js
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
```

---

### 🧪 4. Test the Full Flow Locally

Run your server:

```bash
node server.js
```

Then test using `curl` or Postman:

```bash
curl -X POST http://localhost:3001/api/submit-intake \
  -H "Content-Type: application/json" \
  -d '{"projectName":"TestBot","summary":"Lead-gen bot","launchDate":"2025-06-01"}'
```

✅ You should see:

- A new file in `intake-submissions/`
- A new `.md` brief in `project-briefs/`

---

## ✅ Deliverables for Phase 2

| File/Folder                 | Purpose                         |
| --------------------------- | ------------------------------- |
| `server.js`                 | Handles API submissions         |
| `scripts/generate-brief.js` | Converts JSON → markdown        |
| `/intake-submissions/`      | Stores raw data                 |
| `/project-briefs/`          | Stores dev-ready project briefs |

---

## 🔜 What’s Next (Phase 3)

- 🔗 Hook this into your live form in `port8080folio`
- 🧠 Auto-create GitHub Issues from the brief
- 📤 Deploy the server so clients can submit forms directly
