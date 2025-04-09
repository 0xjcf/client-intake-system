import { join } from "path";
import { generateBrief } from "./generate-brief";
import { IntakeFormData } from "../types/intake";
import {
  setupTestDir,
  verifyFileContent,
  verifyFileExists,
  TestEnvironment,
} from "../test-utils/integration";
import fs from "fs/promises";

describe("generateBrief Integration Tests", () => {
  let testEnv: TestEnvironment;

  beforeEach(async () => {
    testEnv = await setupTestDir();
  });

  afterEach(async () => {
    await testEnv.cleanup();
  });

  test("should create a project brief file with valid input", async () => {
    const brief: IntakeFormData = {
      projectName: "Test Project",
      projectKey: "test-project",
      projectDescription: "A test project description",
      targetAudience: "Test users",
      keyFeatures: "Test features",
      technicalRequirements: "Test requirements",
      timeline: "1 week",
      budget: "$1000",
      additionalNotes: "Test notes",
    };

    const outputPath = join(testEnv.tempDir, "test-brief.md");
    const briefContent = generateBrief(brief);
    await fs.writeFile(outputPath, briefContent);

    // Verify file exists and has correct content
    await verifyFileExists(outputPath);
    await verifyFileContent(
      outputPath,
      "\n# Project Brief: Test Project\n\n## 🧾 Project Key\n\n**Key:** test-project\n\n## Project Overview\nA test project description\n\n## Target Audience\nTest users\n\n## Key Features\nTest features\n\n## Technical Requirements\nTest requirements\n\n## Timeline\n1 week\n\n## Budget\n$1000\n\n## Additional Notes\nTest notes\n"
    );
  });

  test("should handle concurrent brief generation", async () => {
    const briefs: IntakeFormData[] = [
      {
        projectName: "Project 1",
        projectKey: "project-1",
        projectDescription: "Description 1",
        targetAudience: "Users 1",
        keyFeatures: "Features 1",
        technicalRequirements: "Requirements 1",
        timeline: "1 week",
        budget: "$1000",
        additionalNotes: "Notes 1",
      },
      {
        projectName: "Project 2",
        projectKey: "project-2",
        projectDescription: "Description 2",
        targetAudience: "Users 2",
        keyFeatures: "Features 2",
        technicalRequirements: "Requirements 2",
        timeline: "2 weeks",
        budget: "$2000",
        additionalNotes: "Notes 2",
      },
    ];

    const promises = briefs.map(async (brief, index) => {
      const outputPath = join(testEnv.tempDir, `brief-${index}.md`);
      const briefContent = generateBrief(brief);
      await fs.writeFile(outputPath, briefContent);
    });

    await Promise.all(promises);

    // Verify all files were created
    for (let i = 0; i < briefs.length; i++) {
      const outputPath = join(testEnv.tempDir, `brief-${i}.md`);
      await verifyFileExists(outputPath);
    }
  });

  test("should handle file system errors gracefully", async () => {
    const brief: IntakeFormData = {
      projectName: "Test Project",
      projectKey: "test-project",
      projectDescription: "A test project description",
      targetAudience: "Test users",
      keyFeatures: "Test features",
      technicalRequirements: "Test requirements",
      timeline: "1 week",
      budget: "$1000",
      additionalNotes: "Test notes",
    };

    // Try to write to a non-existent directory
    const invalidPath = join(testEnv.tempDir, "nonexistent", "brief.md");

    await expect(
      fs.writeFile(invalidPath, generateBrief(brief))
    ).rejects.toThrow();
  });
});
