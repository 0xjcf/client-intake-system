import * as fs from "fs/promises";
import * as path from "path";
import { main } from "./generate-brief";

// Mock console.error to suppress output
const mockConsoleError = jest
  .spyOn(console, "error")
  .mockImplementation(() => {});

// Mock process.cwd
const mockCwd = "/app";

// Mock fs/promises with proper Jest mock implementation
jest.mock("fs/promises", () => {
  const actualFs = jest.requireActual("fs/promises");
  const mockFs: typeof fs = {
    ...actualFs,
    access: jest.fn().mockImplementation((filename: string, _mode: number) => {
      const resolvedPath = path.resolve(filename);
      if (resolvedPath === `${mockCwd}/test.json`) {
        return Promise.resolve(undefined);
      }
      return Promise.reject(new Error("ENOENT"));
    }),
    stat: jest.fn().mockImplementation((filename: string) => {
      const resolvedPath = path.resolve(filename);
      if (resolvedPath === `${mockCwd}/test.json`) {
        return Promise.resolve({ size: 500 });
      }
      return Promise.reject(new Error("ENOENT"));
    }),
    readFile: jest
      .fn()
      .mockImplementation((filename: string, encoding: string) => {
        const resolvedPath = path.resolve(filename);
        if (resolvedPath === `${mockCwd}/test.json` && encoding === "utf-8") {
          return Promise.resolve(
            JSON.stringify({
              projectName: "Test Project",
              projectKey: "test-project",
              projectDescription: "A test project",
              targetAudience: "Test users",
              keyFeatures: "Test features",
              technicalRequirements: "Test requirements",
              timeline: "1 week",
              budget: "$1000",
            })
          );
        }
        return Promise.reject(new Error("ENOENT"));
      }),
    writeFile: jest
      .fn()
      .mockImplementation((filePath: string, _content: string) => {
        const resolvedPath = path.resolve(filePath);
        if (resolvedPath.match(/project-briefs\/test-project-\d+\.md/)) {
          return Promise.resolve(undefined);
        }
        if (resolvedPath.match(/project-briefs\/test-project-\d+\.md/)) {
          return Promise.resolve(undefined);
        }
        return Promise.reject(new Error("ENOENT"));
      }),
    mkdir: jest.fn().mockResolvedValue(undefined),
    constants: { R_OK: 4 },
  };
  return mockFs;
});

// Mock path
jest.mock("path", () => ({
  resolve: jest.fn((...args: string[]): string => {
    const lastArg = args[args.length - 1];
    if (!lastArg) return mockCwd;
    if (lastArg.startsWith("/")) {
      return lastArg;
    }
    return `${mockCwd}/${lastArg}`;
  }),
  join: jest.fn((...args: string[]): string => {
    const joined = args.join("/");
    return joined.startsWith("/") ? joined : `${mockCwd}/${joined}`;
  }),
}));

describe("CLI functionality", () => {
  let realDateNow: () => number;

  beforeEach(() => {
    jest.resetAllMocks();
    process.argv = ["node", "script.js", "test.json"];
    // Mock process.cwd to return our test directory
    process.cwd = jest.fn().mockReturnValue(mockCwd);
    // Reset all mocks
    (fs.access as jest.Mock).mockReset();
    (fs.stat as jest.Mock).mockReset();
    (fs.readFile as jest.Mock).mockReset();
    (fs.writeFile as jest.Mock).mockReset();
    // Set up default mock implementations
    (fs.access as jest.Mock).mockResolvedValue(undefined);
    (fs.stat as jest.Mock).mockResolvedValue({ size: 500 });
    (fs.writeFile as jest.Mock).mockResolvedValue(undefined);
    // Mock Date.now
    realDateNow = Date.now;
    Date.now = jest.fn(() => 1744121167251); // Fixed timestamp for tests
  });

  afterEach(() => {
    mockConsoleError.mockClear();
    jest.clearAllMocks();
    // Restore Date.now
    Date.now = realDateNow;
  });

  afterAll(() => {
    mockConsoleError.mockRestore();
  });

  it("should handle missing input file", async () => {
    process.argv = ["node", "script.js"];
    const consoleSpy = jest.spyOn(console, "error");

    await main();

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("No input file specified")
    );
  });

  it("should validate file path", async () => {
    const outsidePath = "/outside/test.json";
    (path.resolve as jest.Mock).mockReturnValue(outsidePath);
    const consoleSpy = jest.spyOn(console, "error");

    await main();

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining(
        "File access denied: Path outside current directory"
      )
    );
  });

  it("should handle file access errors", async () => {
    const testPath = `${mockCwd}/test.json`;
    (path.resolve as jest.Mock).mockReturnValue(testPath);
    (fs.access as jest.Mock).mockRejectedValue(new Error("ENOENT"));
    const consoleSpy = jest.spyOn(console, "error");

    await main();

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("File not accessible or doesn't exist")
    );
  });

  it("should handle large files", async () => {
    const testPath = `${mockCwd}/test.json`;
    (path.resolve as jest.Mock).mockReturnValue(testPath);
    (fs.access as jest.Mock).mockResolvedValue(undefined);
    (fs.stat as jest.Mock).mockResolvedValue({ size: 2 * 1024 * 1024 });
    const consoleSpy = jest.spyOn(console, "error");

    await main();

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("File too large")
    );
  });

  it("should handle invalid JSON", async () => {
    const testPath = `${mockCwd}/test.json`;
    (path.resolve as jest.Mock).mockReturnValue(testPath);
    (fs.readFile as jest.Mock).mockResolvedValue("invalid json");
    const consoleSpy = jest.spyOn(console, "error");

    await main();

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("Error generating brief")
    );
  });

  it("should successfully generate brief", async () => {
    const testPath = `${mockCwd}/test.json`;
    const projectName = "Test Project";
    const sanitizedName = projectName
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
    const timestamp = 1744121167251;
    const expectedOutputPath = `project-briefs/${sanitizedName}-${timestamp}.md`;

    // Mock path.resolve to handle both input and output paths
    (path.resolve as jest.Mock).mockImplementation((p: string) => {
      if (p === "test.json") return testPath;
      if (p.includes("project-briefs")) return `${mockCwd}/${p}`;
      return `${mockCwd}/${p}`;
    });

    // Mock path.join to handle output path
    (path.join as jest.Mock).mockImplementation((...args: string[]) => {
      return args.join("/");
    });

    (fs.readFile as jest.Mock).mockResolvedValue(
      JSON.stringify({
        projectName,
        projectKey: "test-project",
        projectDescription: "A test project",
        targetAudience: "Test users",
        keyFeatures: "Test features",
        technicalRequirements: "Test requirements",
        timeline: "1 week",
        budget: "$1000",
      })
    );

    await main();

    // Verify file operations were called in the correct order
    expect(fs.access).toHaveBeenCalledWith("test.json", fs.constants.R_OK);
    expect(fs.stat).toHaveBeenCalledWith("test.json");
    expect(fs.readFile).toHaveBeenCalledWith("test.json", "utf-8");

    const writeFileCalls = (fs.writeFile as jest.Mock).mock.calls;
    expect(writeFileCalls.length).toBe(1);
    const [actualPath, actualContent] = writeFileCalls[0];

    expect(actualPath).toBe(expectedOutputPath);
    expect(actualContent).toContain(`# Project Brief: ${projectName}`);
    expect(mockConsoleError).toHaveBeenCalledWith(
      expect.stringContaining("✅ Brief generated")
    );
  });

  it("should exit with code 1 when not in test environment", async () => {
    const mockExit = jest.spyOn(process, "exit").mockImplementation(() => {
      throw new Error("process.exit() was called");
    });
    const prevEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "development";
    process.argv = ["node", "script.js"]; // Trigger an error

    try {
      await main();
    } catch (error) {
      expect(error).toEqual(new Error("process.exit() was called"));
    }

    expect(mockExit).toHaveBeenCalledWith(1);

    // Cleanup
    process.env.NODE_ENV = prevEnv;
    mockExit.mockRestore();
  });

  it("should execute main function when module is run directly", async () => {
    const testFile = "test.json";
    const projectName = "Test Project";
    const sanitizedName = projectName
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
    const timestamp = 1744121167251;
    const expectedOutputPath = `project-briefs/${sanitizedName}-${timestamp}.md`;

    // Mock path.resolve to handle both input and output paths
    (path.resolve as jest.Mock).mockImplementation((p: string) => {
      if (p === testFile) return `${mockCwd}/${testFile}`;
      if (p.includes("project-briefs")) return `${mockCwd}/${p}`;
      return `${mockCwd}/${p}`;
    });

    // Mock path.join to handle output path
    (path.join as jest.Mock).mockImplementation((...args: string[]) => {
      return args.join("/");
    });

    (fs.readFile as jest.Mock).mockResolvedValue(
      JSON.stringify({
        projectName,
        projectKey: "test-project",
        projectDescription: "A test project",
        targetAudience: "Test users",
        keyFeatures: "Test features",
        technicalRequirements: "Test requirements",
        timeline: "1 week",
        budget: "$1000",
      })
    );

    await main();

    // Verify file operations were called in the correct order
    expect(fs.access).toHaveBeenCalledWith(testFile, fs.constants.R_OK);
    expect(fs.stat).toHaveBeenCalledWith(testFile);
    expect(fs.readFile).toHaveBeenCalledWith(testFile, "utf-8");

    const writeFileCalls = (fs.writeFile as jest.Mock).mock.calls;
    expect(writeFileCalls.length).toBe(1);
    const [actualPath, actualContent] = writeFileCalls[0];

    expect(actualPath).toBe(expectedOutputPath);
    expect(actualContent).toContain(`# Project Brief: ${projectName}`);
  });

  it("should handle invalid project key format", async () => {
    const testPath = `${mockCwd}/test.json`;
    (path.resolve as jest.Mock).mockReturnValue(testPath);
    (fs.access as jest.Mock).mockResolvedValue(undefined);
    (fs.stat as jest.Mock).mockResolvedValue({ size: 500 });
    (fs.readFile as jest.Mock).mockResolvedValue(
      JSON.stringify({
        projectName: "Test Project",
        projectKey: "Invalid Key!",
        projectDescription: "A test project",
        targetAudience: "Test users",
        keyFeatures: "Test features",
        technicalRequirements: "Test requirements",
        timeline: "1 week",
        budget: "$1000",
      })
    );
    const consoleSpy = jest.spyOn(console, "error");

    await main();

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining(
        "Project key must contain only lowercase letters, numbers, and hyphens"
      )
    );
  });

  it("should handle missing required fields", async () => {
    const testPath = `${mockCwd}/test.json`;
    (path.resolve as jest.Mock).mockReturnValue(testPath);
    (fs.access as jest.Mock).mockResolvedValue(undefined);
    (fs.stat as jest.Mock).mockResolvedValue({ size: 500 });
    (fs.readFile as jest.Mock).mockResolvedValue(
      JSON.stringify({
        projectName: "Test Project",
        // Missing projectKey
        projectDescription: "A test project",
        targetAudience: "Test users",
        keyFeatures: "Test features",
        technicalRequirements: "Test requirements",
        timeline: "1 week",
        budget: "$1000",
      })
    );
    const consoleSpy = jest.spyOn(console, "error");

    await main();

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("Missing or invalid required field: projectKey")
    );
  });

  it("should handle field length limits", async () => {
    const testPath = `${mockCwd}/test.json`;
    (path.resolve as jest.Mock).mockReturnValue(testPath);
    (fs.access as jest.Mock).mockResolvedValue(undefined);
    (fs.stat as jest.Mock).mockResolvedValue({ size: 500 });
    (fs.readFile as jest.Mock).mockResolvedValue(
      JSON.stringify({
        projectName: "Test Project",
        projectKey: "test-project",
        projectDescription: "A".repeat(10001), // Exceeds MAX_FIELD_LENGTH
        targetAudience: "Test users",
        keyFeatures: "Test features",
        technicalRequirements: "Test requirements",
        timeline: "1 week",
        budget: "$1000",
      })
    );
    const consoleSpy = jest.spyOn(console, "error");

    await main();

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("exceeds maximum length")
    );
  });

  it("should handle HTML sanitization", async () => {
    const testPath = `${mockCwd}/test.json`;
    const projectName = "Test Project";
    const sanitizedName = projectName
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
    const timestamp = 1744121167251;
    const expectedOutputPath = `project-briefs/${sanitizedName}-${timestamp}.md`;

    // Mock path.resolve to handle both input and output paths
    (path.resolve as jest.Mock).mockImplementation((p: string) => {
      if (p === "test.json") return testPath;
      if (p.includes("project-briefs")) return `${mockCwd}/${p}`;
      return `${mockCwd}/${p}`;
    });

    // Mock path.join to handle output path
    (path.join as jest.Mock).mockImplementation((...args: string[]) => {
      return args.join("/");
    });

    (fs.readFile as jest.Mock).mockResolvedValue(
      JSON.stringify({
        projectName,
        projectKey: "test-project",
        projectDescription: "<script>alert('xss')</script>",
        targetAudience: "Test users",
        keyFeatures: "Test features",
        technicalRequirements: "Test requirements",
        timeline: "1 week",
        budget: "$1000",
      })
    );

    await main();

    // Verify file operations were called in the correct order
    expect(fs.access).toHaveBeenCalledWith("test.json", fs.constants.R_OK);
    expect(fs.stat).toHaveBeenCalledWith("test.json");
    expect(fs.readFile).toHaveBeenCalledWith("test.json", "utf-8");

    const writeFileCalls = (fs.writeFile as jest.Mock).mock.calls;
    expect(writeFileCalls.length).toBe(1);
    const [actualPath, actualContent] = writeFileCalls[0];

    expect(actualPath).toBe(expectedOutputPath);
    expect(actualContent).not.toContain("<script>");
    expect(actualContent).not.toContain("</script>");
  });

  it("should handle special characters in project name", async () => {
    const testPath = `${mockCwd}/test.json`;
    const projectName = "Test Project!@#$%^&*()";
    const sanitizedName = projectName
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
    const timestamp = 1744121167251;
    const expectedOutputPath = `project-briefs/${sanitizedName}-${timestamp}.md`;

    // Mock path.resolve to handle both input and output paths
    (path.resolve as jest.Mock).mockImplementation((p: string) => {
      if (p === "test.json") return testPath;
      if (p.includes("project-briefs")) return `${mockCwd}/${p}`;
      return `${mockCwd}/${p}`;
    });

    // Mock path.join to handle output path
    (path.join as jest.Mock).mockImplementation((...args: string[]) => {
      return args.join("/");
    });

    (fs.readFile as jest.Mock).mockResolvedValue(
      JSON.stringify({
        projectName,
        projectKey: "test-project",
        projectDescription: "A test project",
        targetAudience: "Test users",
        keyFeatures: "Test features",
        technicalRequirements: "Test requirements",
        timeline: "1 week",
        budget: "$1000",
      })
    );

    await main();

    // Verify file operations were called in the correct order
    expect(fs.access).toHaveBeenCalledWith("test.json", fs.constants.R_OK);
    expect(fs.stat).toHaveBeenCalledWith("test.json");
    expect(fs.readFile).toHaveBeenCalledWith("test.json", "utf-8");

    const writeFileCalls = (fs.writeFile as jest.Mock).mock.calls;
    expect(writeFileCalls.length).toBe(1);
    const [actualPath, actualContent] = writeFileCalls[0];

    expect(actualPath).toBe(expectedOutputPath);
    expect(actualContent).toContain(`# Project Brief: ${projectName}`);
  });
});
