import request from "supertest";
import app from "./server";
import fs from "fs";
import path from "path";
import { validateProjectBrief } from "./server";

describe("Intake API", () => {
  const testData = {
    projectName: "Test Project",
    projectKey: "test-project",
    projectDescription: "A test project description",
    targetAudience: "Test target audience",
    keyFeatures: "Test key features",
    technicalRequirements: "Test technical requirements",
    timeline: "Test timeline",
    budget: "Test budget",
    additionalNotes: "Test additional notes",
  };

  // Use Jest spies for console methods
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    // Setup console spy
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();

    // Ensure directories exist
    ["intake-submissions", "project-briefs"].forEach((dir) => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  });

  afterEach(() => {
    // Restore console spy
    consoleErrorSpy.mockRestore();

    // Clean up test files
    const files = fs.readdirSync("intake-submissions");
    files.forEach((file) => {
      if (file.includes("testproject")) {
        fs.unlinkSync(path.join("intake-submissions", file));
      }
    });

    const briefs = fs.readdirSync("project-briefs");
    briefs.forEach((file) => {
      if (file.includes("test-project")) {
        fs.unlinkSync(path.join("project-briefs", file));
      }
    });
  });

  it("should process intake form and generate brief", async () => {
    const response = await request(app)
      .post("/api/submit-intake")
      .send(testData)
      .expect(200);

    expect(response.text).toBe("✅ Project brief generated!");
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringMatching(
        /✅ Intake data saved: intake-submissions\/test-project-\d+\.json/
      )
    );
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringMatching(
        /✅ Brief generated: project-briefs\/test-project-\d+\.md/
      )
    );

    // Verify brief content
    const briefs = fs.readdirSync("project-briefs");
    const latestBrief = briefs
      .filter((file) => file.includes("test-project"))
      .sort()
      .pop();

    if (!latestBrief) {
      throw new Error("No brief file found");
    }

    const briefContent = fs.readFileSync(
      path.join("project-briefs", latestBrief),
      "utf-8"
    );

    expect(briefContent).toContain("# Project Brief: Test Project");
    expect(briefContent).toContain("## Project Overview");
    expect(briefContent).toContain("## Target Audience");
    expect(briefContent).toContain("## Key Features");
    expect(briefContent).toContain("## Technical Requirements");
    expect(briefContent).toContain("## Timeline");
    expect(briefContent).toContain("## Budget");
    expect(briefContent).toContain("## Additional Notes");
  });

  it("should handle missing required fields", async () => {
    const response = await request(app)
      .post("/api/submit-intake")
      .send({ ...testData, projectName: "" })
      .expect(400);

    expect(response.text).toBe("Missing required field: projectName");
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "❌ Error processing intake: Missing required field: projectName"
    );
  });
});

describe("validateProjectBrief", () => {
  const validData = {
    projectName: "Test Project",
    projectKey: "test-project",
    projectDescription: "Test description",
    targetAudience: "Test audience",
    keyFeatures: "Test features",
    technicalRequirements: "Test requirements",
    timeline: "Test timeline",
    budget: "Test budget",
    additionalNotes: "Test notes",
  };

  it("should not throw for valid data", () => {
    expect(() => validateProjectBrief(validData)).not.toThrow();
  });

  it("should throw for missing projectName", () => {
    const data = { ...validData, projectName: undefined };
    expect(() => validateProjectBrief(data)).toThrow(
      new Error("Missing required field: projectName")
    );
  });

  it("should throw for empty projectName", () => {
    const data = { ...validData, projectName: "   " };
    expect(() => validateProjectBrief(data)).toThrow(
      new Error("Missing required field: projectName")
    );
  });

  it("should throw for missing projectKey", () => {
    const data = { ...validData, projectKey: undefined };
    expect(() => validateProjectBrief(data)).toThrow(
      new Error("Missing required field: projectKey")
    );
  });

  it("should throw for invalid projectKey format", () => {
    const data = { ...validData, projectKey: "Invalid Key" };
    expect(() => validateProjectBrief(data)).toThrow(
      new Error(
        "Project key must contain only lowercase letters, numbers, and hyphens"
      )
    );
  });

  it("should throw for missing projectDescription", () => {
    const data = { ...validData, projectDescription: undefined };
    expect(() => validateProjectBrief(data)).toThrow(
      new Error("Missing required field: projectDescription")
    );
  });

  it("should throw for missing targetAudience", () => {
    const data = { ...validData, targetAudience: undefined };
    expect(() => validateProjectBrief(data)).toThrow(
      new Error("Missing required field: targetAudience")
    );
  });

  it("should throw for missing keyFeatures", () => {
    const data = { ...validData, keyFeatures: undefined };
    expect(() => validateProjectBrief(data)).toThrow(
      new Error("Missing required field: keyFeatures")
    );
  });

  it("should throw for missing technicalRequirements", () => {
    const data = { ...validData, technicalRequirements: undefined };
    expect(() => validateProjectBrief(data)).toThrow(
      new Error("Missing required field: technicalRequirements")
    );
  });

  it("should throw for missing timeline", () => {
    const data = { ...validData, timeline: undefined };
    expect(() => validateProjectBrief(data)).toThrow(
      new Error("Missing required field: timeline")
    );
  });

  it("should throw for missing budget", () => {
    const data = { ...validData, budget: undefined };
    expect(() => validateProjectBrief(data)).toThrow(
      new Error("Missing required field: budget")
    );
  });
});
