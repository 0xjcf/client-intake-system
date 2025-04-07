import request from "supertest";
import app from "./server";
import fs from "fs";
import path from "path";

describe("Intake API", () => {
  const testData = {
    projectName: "Test Project",
    projectDescription: "A test project description",
    targetAudience: "Test target audience",
    keyFeatures: "Test key features",
    technicalRequirements: "Test technical requirements",
    timeline: "Test timeline",
    budget: "Test budget",
    additionalNotes: "Test additional notes",
  };

  // Store original console methods
  const originalConsole = {
    log: console.log,
    error: console.error,
  };

  beforeEach(() => {
    // Mock console methods
    console.log = jest.fn();
    console.error = jest.fn();

    // Ensure directories exist
    ["intake-submissions", "project-briefs"].forEach((dir) => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  });

  afterEach(() => {
    // Restore console methods
    console.log = originalConsole.log;
    console.error = originalConsole.error;

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
    expect(console.log).toHaveBeenCalledWith(
      expect.stringMatching(
        /✅ Intake data saved: intake-submissions\/test-project-\d+\.json/
      )
    );
    expect(console.log).toHaveBeenCalledWith(
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

    expect(response.text).toBe("Project name is required");
    expect(console.error).toHaveBeenCalledWith(
      "❌ Missing required field: projectName"
    );
  });
});
