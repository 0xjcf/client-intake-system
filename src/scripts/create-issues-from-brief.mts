import fs from "fs";
import path from "path";
import { Octokit } from "octokit";

interface FileWithTime {
  file: string;
  time: number;
}

const octokit = new Octokit({ auth: process.env.GH_PAT });
const owner = "0xjcf";
const repo = "client-intake-system";

const briefsDir = "project-briefs";
const files = fs.readdirSync(briefsDir);

// Grab the most recently modified brief
const latestBrief = files
  .map(
    (file): FileWithTime => ({
      file,
      time: fs.statSync(path.join(briefsDir, file)).mtime.getTime(),
    })
  )
  .sort((a, b) => b.time - a.time)[0].file;

const content = fs.readFileSync(path.join(briefsDir, latestBrief), "utf8");

const deliverablesSection = content.match(/## 📦 Deliverables\n([\s\S]*?)\n##/);
if (!deliverablesSection) {
  console.log("❌ No deliverables section found.");
  process.exit(0);
}

const tasks = deliverablesSection[1]
  .split("\n")
  .map((line) => line.replace(/[-*]/g, "").trim())
  .filter((line) => line.length > 0);

(async () => {
  for (const task of tasks) {
    await octokit.rest.issues.create({
      owner,
      repo,
      title: task,
      body: `Generated from ${latestBrief}`,
      labels: ["auto-generated", "intake"],
    });
    console.log(`✅ Created issue: ${task}`);
  }
})();
