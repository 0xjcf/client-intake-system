# Create Issues from Brief Script

## Overview

The `create-issues-from-brief.mts` script processes project briefs and creates structured issue files for project management. It converts project briefs into individual issues for features, technical requirements, budget, and timeline.

## Usage

```bash
# Basic usage
node create-issues-from-brief.mts

# The script automatically processes all JSON files in the project-briefs/test directory
```

## Input

- Reads JSON files from `project-briefs/test` directory
- Each file should contain a valid project brief in the IntakeFormData format

## Output

- Creates a directory structure in `local-issues/{projectKey}/`
- Generates individual JSON issue files for:
  - Each key feature
  - Technical setup
  - Budget planning
  - Timeline planning

## Issue Structure

```typescript
interface Issue {
  title: string; // Format: [Project Name] Feature/Task
  body: string; // Description and context
  labels: string[]; // Auto-generated labels
  projectKey: string; // Project identifier
  createdAt: string; // ISO timestamp
  priority: string; // high/medium/low
  assignee?: string; // Optional assignee
  milestone?: string; // Optional milestone
  status: string; // Initial status
}
```

## Features

- Automatic issue creation from project briefs
- Structured directory organization by project
- Automatic label generation
- Priority assignment
- Timestamp tracking
- Error handling and logging

## Directory Structure

```
local-issues/
└── project-key/
    ├── timestamp-feature-1.json
    ├── timestamp-feature-2.json
    ├── timestamp-technical-setup.json
    ├── timestamp-budget-planning.json
    └── timestamp-timeline-planning.json
```

## Labels

Automatically generated labels include:

- `auto-generated`
- `intake`
- `project:{projectKey}`
- `name:{projectName}`
- `priority:{priority}`

## Error Handling

- Validates input files
- Handles missing directories
- Provides detailed error messages
- Continues processing on individual file errors

## Example Issue File

```json
{
  "title": "[Project Name] Feature Description",
  "body": "Generated from project-brief.json\n\nProject: Project Name\nProject Key: project-key\n\nDescription: Feature details...",
  "labels": [
    "auto-generated",
    "intake",
    "project:project-key",
    "name:project-name",
    "priority:medium"
  ],
  "projectKey": "project-key",
  "createdAt": "2024-02-20T12:00:00.000Z",
  "priority": "medium",
  "status": "todo"
}
```
