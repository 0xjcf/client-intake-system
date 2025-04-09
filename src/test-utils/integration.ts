import { mkdtemp, rm, readFile } from "fs/promises";
import { join } from "path";
import os from "os";

export interface TestEnvironment {
  tempDir: string;
  cleanup: () => Promise<void>;
}

export const setupTestDir = async (): Promise<TestEnvironment> => {
  const tempDir = await mkdtemp(join(os.tmpdir(), "test-"));
  return {
    tempDir,
    cleanup: async () => {
      try {
        await rm(tempDir, { recursive: true, force: true });
      } catch (error) {
        console.error("Error cleaning up temp directory:", error);
      }
    },
  };
};

export const verifyFileContent = async (
  filePath: string,
  expectedContent: string
): Promise<void> => {
  const content = await readFile(filePath, "utf-8");
  expect(content).toBe(expectedContent);
};

export const verifyFileExists = async (filePath: string): Promise<void> => {
  try {
    await readFile(filePath);
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(`File ${filePath} does not exist: ${error.message}`);
    }
    throw new Error(`File ${filePath} does not exist`);
  }
};
