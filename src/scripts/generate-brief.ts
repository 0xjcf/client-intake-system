import { IntakeFormData } from "../types/intake.js";
import fs from "fs/promises";
import path from "path";

const REQUIRED_FIELDS: (keyof IntakeFormData)[] = [
  "projectName",
  "projectKey",
  "projectDescription",
  "targetAudience",
  "keyFeatures",
  "technicalRequirements",
  "timeline",
  "budget",
] as const;

const MAX_FIELD_LENGTH = 10000; // Reasonable limit for text fields

function sanitizeMarkdown(text: string): string {
  return text
    .replace(/[<>]/g, "") // Remove potential HTML tags
    .replace(/[`]/g, "\\`") // Escape backticks
    .slice(0, MAX_FIELD_LENGTH); // Limit length
}

function validateData(data: IntakeFormData): void {
  // Check required fields using a type-safe approach
  for (const field of REQUIRED_FIELDS) {
    const value = data[field];
    if (!value || typeof value !== "string" || !value.trim()) {
      throw new Error(`Missing or invalid required field: ${field}`);
    }
  }

  // Validate field lengths and content
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === "string" && value.length > MAX_FIELD_LENGTH) {
      throw new Error(
        `Field ${key} exceeds maximum length of ${MAX_FIELD_LENGTH} characters`
      );
    }
  }

  // Validate project key format
  if (!/^[a-z0-9-]+$/.test(data.projectKey)) {
    throw new Error(
      "Project key must contain only lowercase letters, numbers, and hyphens"
    );
  }
}

export const generateBrief = (data: IntakeFormData): string => {
  validateData(data);

  const brief = `
# Project Brief: ${sanitizeMarkdown(data.projectName)}

## 🧾 Project Key

**Key:** ${sanitizeMarkdown(data.projectKey)}

## Project Overview
${sanitizeMarkdown(data.projectDescription)}

## Target Audience
${sanitizeMarkdown(data.targetAudience)}

## Key Features
${sanitizeMarkdown(data.keyFeatures)}

## Technical Requirements
${sanitizeMarkdown(data.technicalRequirements)}

## Timeline
${sanitizeMarkdown(data.timeline)}

## Budget
${sanitizeMarkdown(data.budget)}

${
  data.additionalNotes
    ? `## Additional Notes\n${sanitizeMarkdown(data.additionalNotes)}`
    : ""
}
`;

  return brief;
};

const main = async (): Promise<void> => {
  try {
    const filename = process.argv[2];
    if (!filename) {
      throw new Error("No input file specified");
    }

    // Validate file path
    const resolvedPath = path.resolve(filename);
    if (!resolvedPath.startsWith(process.cwd())) {
      throw new Error("File access denied: Path outside current directory");
    }

    // Validate file exists and is readable
    try {
      await fs.access(filename, fs.constants.R_OK);
    } catch {
      throw new Error("File not accessible or doesn't exist");
    }

    // Read and validate file size
    const stats = await fs.stat(filename);
    if (stats.size > 1024 * 1024) {
      // 1MB limit
      throw new Error("File too large");
    }

    const fileContent = await fs.readFile(filename, "utf-8");
    const data = JSON.parse(fileContent) as IntakeFormData;

    const brief = generateBrief(data);

    // Sanitize output filename
    const sanitizedName = data.projectName
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

    const outputPath = path.join(
      "project-briefs",
      `${sanitizedName}-${Date.now()}.md`
    );

    await fs.writeFile(outputPath, brief);
    console.error(`✅ Brief generated: ${outputPath}`);
  } catch (error) {
    console.error(
      `❌ Error generating brief: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
    process.exit(1);
  }
};

if (require.main === module) {
  void main();
}
