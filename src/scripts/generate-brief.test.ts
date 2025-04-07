import { generateBrief } from "./generate-brief";
import { IntakeFormData } from "../types/intake";

describe("generateBrief", () => {
  const mockData: IntakeFormData = {
    projectName: "Test Project",
    projectKey: "test-project",
    projectDescription: "A test project description",
    targetAudience: "Test users",
    keyFeatures: "- Feature 1\n- Feature 2\n- Feature 3",
    technicalRequirements: "- Tech 1\n- Tech 2",
    timeline: "2 months",
    budget: "$10,000",
    additionalNotes: "Test notes",
    priority: "high",
    assignee: "test.user",
    milestone: "Q2 2024",
  };

  it("should generate a markdown brief with all sections", () => {
    const brief = generateBrief(mockData);

    // Check main sections
    expect(brief).toContain("# Project Brief: Test Project");
    expect(brief).toContain("## 🧾 Project Key");
    expect(brief).toContain("**Key:** test-project");
    expect(brief).toContain("## Project Overview");
    expect(brief).toContain(mockData.projectDescription);
    expect(brief).toContain("## Target Audience");
    expect(brief).toContain(mockData.targetAudience);
    expect(brief).toContain("## Key Features");
    expect(brief).toContain(mockData.keyFeatures);
    expect(brief).toContain("## Technical Requirements");
    expect(brief).toContain(mockData.technicalRequirements);
    expect(brief).toContain("## Timeline");
    expect(brief).toContain(mockData.timeline);
    expect(brief).toContain("## Budget");
    expect(brief).toContain(mockData.budget);
    expect(brief).toContain("## Additional Notes");
    expect(brief).toContain(mockData.additionalNotes);
  });

  it("should handle missing optional fields", () => {
    const minimalData: IntakeFormData = {
      projectName: "Minimal Project",
      projectKey: "minimal-project",
      projectDescription: "Minimal description",
      targetAudience: "Minimal audience",
      keyFeatures: "- Feature 1",
      technicalRequirements: "- Tech 1",
      timeline: "1 month",
      budget: "$5,000",
    };

    const brief = generateBrief(minimalData);
    expect(brief).toContain("# Project Brief: Minimal Project");
    expect(brief).not.toContain("## Additional Notes");
  });

  it("should throw an error if required fields are missing", () => {
    const invalidData = { ...mockData, projectKey: "" };
    expect(() => generateBrief(invalidData)).toThrow(
      "Missing or invalid required field: projectKey"
    );
  });

  it("should format markdown correctly", () => {
    const brief = generateBrief(mockData);

    // Check markdown formatting
    expect(brief).toMatch(/^# Project Brief: Test Project$/m);
    expect(brief).toMatch(/^## 🧾 Project Key$/m);
    expect(brief).toMatch(/^\*\*Key:\*\* test-project$/m);
    expect(brief).toMatch(/^## Project Overview$/m);
    expect(brief).toMatch(/^## Target Audience$/m);
    expect(brief).toMatch(/^## Key Features$/m);
    expect(brief).toMatch(/^- Feature 1$/m);
    expect(brief).toMatch(/^- Feature 2$/m);
    expect(brief).toMatch(/^- Feature 3$/m);
  });

  it("should sanitize HTML tags in input", () => {
    const dataWithHtml: IntakeFormData = {
      ...mockData,
      projectDescription: "<script>alert('xss')</script>Description",
    };
    const brief = generateBrief(dataWithHtml);
    expect(brief).not.toContain("<script>");
    expect(brief).toContain("Description");
  });

  it("should escape markdown backticks", () => {
    const dataWithBackticks: IntakeFormData = {
      ...mockData,
      projectDescription: "```javascript\ncode\n```",
    };
    const brief = generateBrief(dataWithBackticks);
    expect(brief).toContain("\\`\\`\\`javascript");
  });

  it("should enforce maximum field length", () => {
    const longData: IntakeFormData = {
      ...mockData,
      projectDescription: "x".repeat(11000),
    };
    expect(() => generateBrief(longData)).toThrow("exceeds maximum length");
  });

  it("should validate project key format", () => {
    const invalidKeyData: IntakeFormData = {
      ...mockData,
      projectKey: "Invalid Key!",
    };
    expect(() => generateBrief(invalidKeyData)).toThrow(
      "Project key must contain only lowercase letters, numbers, and hyphens"
    );
  });

  it("should handle special characters in project name", () => {
    const specialData: IntakeFormData = {
      ...mockData,
      projectName: "Project & Co. (2024)",
    };
    const brief = generateBrief(specialData);
    expect(brief).toContain("# Project Brief: Project & Co. (2024)");
  });

  it("should handle multi-line content correctly", () => {
    const multiLineData: IntakeFormData = {
      ...mockData,
      projectDescription: "Line 1\nLine 2\nLine 3",
      keyFeatures:
        "- Feature 1\n  - Sub-feature 1\n  - Sub-feature 2\n- Feature 2",
    };

    const brief = generateBrief(multiLineData);
    expect(brief).toContain("Line 1\nLine 2\nLine 3");
    expect(brief).toContain(
      "- Feature 1\n  - Sub-feature 1\n  - Sub-feature 2\n- Feature 2"
    );
  });
});
