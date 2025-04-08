import fs from "fs";
import path from "path";
import { IntakeFormData, Issue } from "../types/intake.js";

const briefsDir = "project-briefs";
const issuesDir = "local-issues";

// Create issues directory if it doesn't exist
if (!fs.existsSync(issuesDir)) {
  fs.mkdirSync(issuesDir);
}

// Get JSON files from test directory
const testDir = path.join(briefsDir, "test");

// Check if test directory exists
if (!fs.existsSync(testDir)) {
  console.error(`Test directory not found: ${testDir}`);
  console.error("Please ensure the test directory exists with JSON files");
  process.exit(1);
}

try {
  const files = fs
    .readdirSync(testDir)
    .filter((file) => file.endsWith(".json"));

  if (files.length === 0) {
    console.error(`No JSON files found in ${testDir}`);
    process.exit(1);
  }

  for (const file of files) {
    try {
      const data = JSON.parse(
        fs.readFileSync(path.join(testDir, file), "utf8")
      ) as IntakeFormData;
      const projectKey = data.projectKey;

      // Create project directory if it doesn't exist
      const projectDir = path.join(issuesDir, projectKey);
      if (!fs.existsSync(projectDir)) {
        fs.mkdirSync(projectDir);
      }

      // Create issues from key features
      const features = data.keyFeatures
        .split("\n")
        .map((line: string) => line.replace(/^[-*]\s*/, "").trim())
        .filter((line: string) => line.length > 0);

      for (const feature of features) {
        const issue: Issue = {
          title: `[${data.projectName}] ${feature}`,
          body: `Generated from ${file}\n\nProject: ${data.projectName}\nProject Key: ${projectKey}\n\nDescription: ${data.projectDescription}`,
          labels: [
            "auto-generated",
            "intake",
            `project:${projectKey}`,
            `name:${data.projectName.toLowerCase().replace(/\s+/g, "-")}`,
            `priority:${data.priority || "medium"}`,
          ],
          projectKey,
          createdAt: new Date().toISOString(),
          priority: data.priority || "medium",
          assignee: data.assignee,
          milestone: data.milestone,
          status: "todo",
        };

        const filename = `${Date.now()}-${feature
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")}.json`;
        fs.writeFileSync(
          path.join(projectDir, filename),
          JSON.stringify(issue, null, 2)
        );
        console.log(`✅ Created issue: ${feature}`);
      }

      // Create additional issues
      const additionalIssues = [
        {
          title: "Technical Setup",
          content: data.technicalRequirements,
          priority: "high" as const,
        },
        {
          title: "Budget Planning",
          content: data.budget,
          priority: "high" as const,
        },
        {
          title: "Timeline Planning",
          content: data.timeline,
          priority: "high" as const,
        },
      ];

      for (const item of additionalIssues) {
        const issue: Issue = {
          title: `[${data.projectName}] ${item.title}`,
          body: `Generated from ${file}\n\nProject: ${data.projectName}\nProject Key: ${projectKey}\n\n${item.content}`,
          labels: [
            "auto-generated",
            "intake",
            `project:${projectKey}`,
            `name:${data.projectName.toLowerCase().replace(/\s+/g, "-")}`,
            `priority:${item.priority}`,
          ],
          projectKey,
          createdAt: new Date().toISOString(),
          priority: item.priority,
          assignee: data.assignee,
          milestone: data.milestone,
          status: "todo",
        };

        const filename = `${Date.now()}-${item.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")}.json`;
        fs.writeFileSync(
          path.join(projectDir, filename),
          JSON.stringify(issue, null, 2)
        );
        console.log(`✅ Created issue: ${item.title}`);
      }

      console.log(`\n✨ Created issues for project: ${projectKey}`);
    } catch (error) {
      console.error(`❌ Error processing ${file}:`, error);
    }
  }

  console.log("\n✨ All projects processed!");
} catch (error) {
  console.error("❌ Error processing test directory:", error);
}
