declare global {
  namespace jest {
    interface Mock<T = unknown, Y extends unknown[] = unknown[]> {
      mockResolvedValue(value: Awaited<T>): this;
      mockRejectedValue(value: unknown): this;
      mockReturnValue(value: T): this;
      mockImplementation(fn: (...args: Y) => T): this;
      mockClear(): void;
      mockReset(): void;
      mockRestore(): void;
    }
  }
}
