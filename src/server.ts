import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import { exec } from "child_process";
import { IntakeFormData } from "./types/intake";
import fs from "fs";
import path from "path";

// Add type declaration for Node.js globals
declare const __dirname: string;

const app = express();
const port = 3001;

// Ensure required directories exist
const requiredDirs = ["intake-submissions", "project-briefs"];
requiredDirs.forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`✅ Created directory: ${dir}`);
  }
});

app.use(bodyParser.json());

app.post(
  "/api/submit-intake",
  (
    req: Request<Record<string, never>, string, IntakeFormData>,
    res: Response
  ) => {
    const data = req.body;

    if (!data.projectName) {
      console.error("❌ Missing required field: projectName");
      return res.status(400).send("Project name is required");
    }

    const timestamp = Date.now();
    const filename = path.join(
      "intake-submissions",
      `${data.projectName.toLowerCase().replace(/\s/g, "-")}-${timestamp}.json`
    );

    try {
      fs.writeFileSync(filename, JSON.stringify(data, null, 2));
      console.log(`✅ Intake data saved: ${filename}`);

      const tsNodePath = path.join(__dirname, "../node_modules/.bin/ts-node");
      const briefScriptPath = path.join(__dirname, "scripts/generate-brief.ts");

      exec(
        `${tsNodePath} ${briefScriptPath} '${filename}'`,
        (err, stdout, stderr) => {
          if (err) {
            console.error(`❌ Brief generation error: ${stderr}`);
            return res
              .status(500)
              .send("Error generating project brief. Please try again later.");
          }
          console.log(stdout);
          res.status(200).send("✅ Project brief generated!");
        }
      );
    } catch (error) {
      console.error(`❌ Error processing intake: ${error}`);
      res
        .status(500)
        .send("Error processing intake form. Please try again later.");
    }
  }
);

// Start the server if this file is run directly
if (require.main === module) {
  app.listen(port, () => {
    console.log(`🚀 Intake server running on http://localhost:${port}`);
  });
}

export default app;
