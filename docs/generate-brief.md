# Generate Brief Script

## Overview

The `generate-brief.ts` script converts a JSON intake form into a well-formatted markdown project brief. It handles data validation, sanitization, and file operations.

## Usage

```bash
# Basic usage
node generate-brief.js input.json

# Example
node generate-brief.js project-intake.json
```

## Input Format

The script expects a JSON file with the following structure:

```typescript
interface IntakeFormData {
  projectName: string;
  projectKey: string; // lowercase letters, numbers, and hyphens only
  projectDescription: string;
  targetAudience: string;
  keyFeatures: string;
  technicalRequirements: string;
  timeline: string;
  budget: string;
  additionalNotes?: string; // optional
}
```

## Output

- Generates a markdown file in the `project-briefs` directory
- Filename format: `{sanitized-project-name}-{timestamp}.md`
- Includes all project details in a structured markdown format

## Features

- Validates required fields
- Sanitizes input to prevent markdown injection
- Enforces field length limits (10,000 characters)
- Validates project key format
- Handles file access and size checks
- Provides clear error messages

## Error Handling

- Missing input file
- Invalid file path
- File access issues
- File size limits (1MB)
- Invalid JSON format
- Missing required fields
- Invalid field values

## Security

- Validates file paths to prevent directory traversal
- Sanitizes markdown content
- Enforces file size limits
- Validates project key format

## Example Output

```markdown
# Project Brief: Project Name

## 🧾 Project Key

**Key:** project-key

## Project Overview

Project description...

## Target Audience

Target audience description...

## Key Features

- Feature 1
- Feature 2

## Technical Requirements

Technical requirements...

## Timeline

Project timeline...

## Budget

Budget details...

## Additional Notes

Optional additional notes...
```
