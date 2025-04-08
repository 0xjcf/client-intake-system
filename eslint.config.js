const tsParser = require("@typescript-eslint/parser");
const tsPlugin = require("@typescript-eslint/eslint-plugin");
const securityPlugin = require("eslint-plugin-security");

module.exports = [
  {
    ignores: [
      "dist/**/*",
      "node_modules/**/*",
      "coverage/**/*",
      "*.js",
      "!src/**/*.js",
      "!src/**/*.ts",
    ],
  },
  {
    files: ["src/**/*.ts"],
    plugins: {
      "@typescript-eslint": tsPlugin,
      security: securityPlugin,
    },
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        project: "./tsconfig.json",
        tsconfigRootDir: ".",
      },
    },
    rules: {
      // TypeScript recommended rules
      ...tsPlugin.configs.recommended.rules,

      // Security-focused rules
      "security/detect-object-injection": "off", // We're using TypeScript's type checking
      "security/detect-non-literal-fs-filename": "off", // We're validating paths
      "security/detect-non-literal-regexp": "error",
      "security/detect-unsafe-regex": "error",
      "security/detect-buffer-noassert": "error",
      "security/detect-child-process": "error",
      "security/detect-disable-mustache-escape": "error",
      "security/detect-eval-with-expression": "error",
      "security/detect-no-csrf-before-method-override": "error",
      "security/detect-possible-timing-attacks": "error",
      "security/detect-pseudoRandomBytes": "error",

      // TypeScript-specific security rules
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-call": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/no-unsafe-return": "error",
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unsafe-argument": "error",
      "@typescript-eslint/restrict-template-expressions": [
        "error",
        {
          allowNumber: true,
          allowBoolean: true,
          allowAny: false,
          allowNullish: true,
          allowRegExp: true,
        },
      ],
      "@typescript-eslint/no-misused-promises": [
        "error",
        {
          checksVoidReturn: false,
        },
      ],
      "@typescript-eslint/no-floating-promises": "error",
      "@typescript-eslint/require-await": "error",

      // General security rules
      "no-eval": "error",
      "no-implied-eval": "error",
      "no-script-url": "error",
      "no-unsafe-finally": "error",
      "no-unsafe-optional-chaining": "error",

      // Project-specific rules
      "no-console": ["warn", { allow: ["warn", "error"] }], // Only allow console.warn and console.error
      "no-undef": "off", // TypeScript handles this
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          destructuredArrayIgnorePattern: "^_",
        },
      ],
    },
  },
];
