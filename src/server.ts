import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import { IntakeFormData } from "./types/intake";
import fs from "fs/promises";
import path from "path";
import { generateBrief } from "./scripts/generate-brief";

// Add type declaration for Node.js globals
declare const __dirname: string;

const app = express();
const port = 3001;

// Initialize directories
const REQUIRED_DIRS = ["intake-submissions", "project-briefs"] as const;

const initializeDirectories = async (): Promise<void> => {
  for (const dir of REQUIRED_DIRS) {
    try {
      await fs.access(dir);
    } catch {
      await fs.mkdir(dir, { recursive: true });
      console.error(`✅ Created directory: ${dir}`);
    }
  }
};

// Initialize directories synchronously for now
void initializeDirectories();

app.use(bodyParser.json());

interface ProjectBriefData {
  projectName?: string;
  projectKey?: string;
  projectDescription?: string;
  targetAudience?: string;
  keyFeatures?: string;
  technicalRequirements?: string;
  timeline?: string;
  budget?: string;
  additionalNotes?: string;
}

// Validation function for project brief data
export function validateProjectBrief(data: ProjectBriefData): void {
  if (!data.projectName?.trim()) {
    throw new Error("Missing required field: projectName");
  }
  if (!data.projectKey?.trim()) {
    throw new Error("Missing required field: projectKey");
  }
  if (!data.projectDescription?.trim()) {
    throw new Error("Missing required field: projectDescription");
  }
  if (!data.targetAudience?.trim()) {
    throw new Error("Missing required field: targetAudience");
  }
  if (!data.keyFeatures?.trim()) {
    throw new Error("Missing required field: keyFeatures");
  }
  if (!data.technicalRequirements?.trim()) {
    throw new Error("Missing required field: technicalRequirements");
  }
  if (!data.timeline?.trim()) {
    throw new Error("Missing required field: timeline");
  }
  if (!data.budget?.trim()) {
    throw new Error("Missing required field: budget");
  }

  // Validate project key format
  if (!/^[a-z0-9-]+$/.test(data.projectKey)) {
    throw new Error(
      "Project key must contain only lowercase letters, numbers, and hyphens"
    );
  }
}

app.post(
  "/api/submit-intake",
  async (
    req: Request<Record<string, never>, string, IntakeFormData>,
    res: Response
  ): Promise<void> => {
    const data = req.body;

    try {
      // Validate the request data
      validateProjectBrief(data);

      const timestamp = Date.now();
      const sanitizedName = data.projectName
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");

      const intakeFilename = path.join(
        "intake-submissions",
        `${sanitizedName}-${timestamp}.json`
      );

      await fs.writeFile(intakeFilename, JSON.stringify(data, null, 2));
      console.error(`✅ Intake data saved: ${intakeFilename}`);

      // Generate brief
      const briefContent = generateBrief(data);
      const briefFilename = path.join(
        "project-briefs",
        `${sanitizedName}-${timestamp}.md`
      );
      await fs.writeFile(briefFilename, briefContent);
      console.error(`✅ Brief generated: ${briefFilename}`);

      res.status(200).send("✅ Project brief generated!");
    } catch (error) {
      console.error(
        `❌ Error processing intake: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
      res
        .status(400)
        .send(
          error instanceof Error
            ? error.message
            : "Error processing intake form"
        );
    }
  }
);

// Start the server if this file is run directly
if (require.main === module) {
  app.listen(port, () => {
    console.error(`🚀 Intake server running on http://localhost:${port}`);
  });
}

export default app;
