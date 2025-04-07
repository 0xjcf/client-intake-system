export interface IntakeFormData {
  projectName: string;
  projectKey: string;
  projectDescription: string;
  targetAudience: string;
  keyFeatures: string;
  technicalRequirements: string;
  timeline: string;
  budget: string;
  additionalNotes?: string;
  priority?: "low" | "medium" | "high";
  assignee?: string;
  milestone?: string;
}

export interface Issue {
  title: string;
  body: string;
  labels: string[];
  projectKey: string;
  createdAt: string;
  priority: "low" | "medium" | "high";
  assignee?: string;
  milestone?: string;
  status: "todo" | "in-progress" | "review" | "done";
}
