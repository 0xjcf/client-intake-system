import { IntakeFormData } from "../types/intake";
import fs from "fs";
import path from "path";

const generateBrief = (data: IntakeFormData): string => {
  const brief = `
# Project Brief: ${data.projectName}

## Project Overview
${data.projectDescription}

## Target Audience
${data.targetAudience}

## Key Features
${data.keyFeatures}

## Technical Requirements
${data.technicalRequirements}

## Timeline
${data.timeline}

## Budget
${data.budget}

## Additional Notes
${data.additionalNotes}
`;

  return brief;
};

const main = async () => {
  try {
    const filename = process.argv[2];
    if (!filename) {
      throw new Error("No input file specified");
    }

    const data = JSON.parse(
      fs.readFileSync(filename, "utf-8")
    ) as IntakeFormData;

    if (!data.projectName) {
      throw new Error("Missing required field: projectName");
    }

    const brief = generateBrief(data);
    const outputPath = path.join(
      "project-briefs",
      `${data.projectName.toLowerCase().replace(/\s/g, "-")}-${Date.now()}.md`
    );

    fs.writeFileSync(outputPath, brief);
    console.log(`✅ Brief generated: ${outputPath}`);
  } catch (error) {
    console.error(`❌ Error generating brief: ${error}`);
    process.exit(1);
  }
};

if (require.main === module) {
  main();
}
