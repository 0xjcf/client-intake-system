import { generateBrief } from "./generate-brief";
import type { IntakeFormData } from "../types/intake";

jest.mock("fs/promises");

describe("generateBrief", () => {
  const mockProjectData: IntakeFormData = {
    projectName: "Test Project",
    projectKey: "test-project",
    projectDescription: "A test project",
    targetAudience: "Test users",
    keyFeatures: "Test features",
    technicalRequirements: "Test requirements",
    timeline: "1 week",
    budget: "$1000",
    additionalNotes: "Test notes",
  };

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("should generate a brief with all sections", () => {
    const brief = generateBrief(mockProjectData);
    expect(brief).toContain("# Project Brief: Test Project");
    expect(brief).toContain("## Project Overview");
    expect(brief).toContain("## Target Audience");
    expect(brief).toContain("## Key Features");
    expect(brief).toContain("## Technical Requirements");
    expect(brief).toContain("## Timeline");
    expect(brief).toContain("## Budget");
    expect(brief).toContain("## Additional Notes");
  });

  it("should throw error for missing required fields", () => {
    const invalidData = {
      ...mockProjectData,
      projectKey: "",
    };
    expect(() => generateBrief(invalidData)).toThrow(
      "Missing or invalid required field: projectKey"
    );
  });

  it("should throw error for invalid project key format", () => {
    const invalidKeyData = {
      ...mockProjectData,
      projectKey: "Invalid Key!",
    };
    expect(() => generateBrief(invalidKeyData)).toThrow(
      "Project key must contain only lowercase letters, numbers, and hyphens"
    );
  });

  it("should throw error for exceeding field length", () => {
    const longData = {
      ...mockProjectData,
      projectDescription: "x".repeat(11000),
    };
    expect(() => generateBrief(longData)).toThrow("exceeds maximum length");
  });

  it("should handle missing optional fields", () => {
    const dataWithoutOptional = {
      ...mockProjectData,
      additionalNotes: undefined,
    };
    const brief = generateBrief(dataWithoutOptional);
    expect(brief).not.toContain("## Additional Notes");
  });

  it("should handle special characters in project name", () => {
    const dataWithSpecialChars = {
      ...mockProjectData,
      projectName: "Test & Project",
    };
    const brief = generateBrief(dataWithSpecialChars);
    expect(brief).toContain("# Project Brief: Test & Project");
  });

  it("should handle multi-line content", () => {
    const dataWithMultiLine = {
      ...mockProjectData,
      projectDescription: "Line 1\nLine 2\nLine 3",
    };
    const brief = generateBrief(dataWithMultiLine);
    expect(brief).toContain("Line 1\nLine 2\nLine 3");
  });

  it("should handle empty strings", () => {
    const dataWithEmpty = {
      ...mockProjectData,
      additionalNotes: "",
    };
    const brief = generateBrief(dataWithEmpty);
    expect(brief).not.toContain("## Additional Notes");
  });

  it("should handle very long content", () => {
    const longContent = "a".repeat(1000);
    const dataWithLongContent = {
      ...mockProjectData,
      projectDescription: longContent,
    };
    const brief = generateBrief(dataWithLongContent);
    expect(brief).toContain(longContent);
  });
});
