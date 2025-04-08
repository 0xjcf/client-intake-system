# 🧾 client-intake-system

> Transform client project submissions into structured GitHub issues and project workflows.

---

## 📋 Table of Contents

1. [Quick Start](#-quick-start)
2. [Project Overview](#-project-overview)
3. [Installation](#-installation)
4. [Usage Guide](#-usage-guide)
5. [API Reference](#-api-reference)
6. [Testing](#-testing)
7. [Development](#-development)
8. [Project Structure](#-project-structure)

---

## 🚀 Quick Start

Want to get started quickly? Here's the minimal setup:

```bash
# 1. Clone and enter the project
git clone https://github.com/0xjcf/client-intake-system
cd client-intake-system

# 2. Install dependencies
pnpm install

# 3. Create and configure your .env file
touch .env
# Add your GitHub PAT: GH_PAT=your_pat_here

# 4. Start the development server
pnpm dev
```

Your API will be running at `http://localhost:3000`!

---

## 📦 Project Overview

This system helps you automate your client onboarding process by:

1. **Receiving Project Submissions**

   - Accepts structured JSON data via API
   - Stores raw submissions for reference
   - Validates input data

2. **Generating Project Briefs**

   - Converts submissions to markdown
   - Organizes information into clear sections
   - Stores briefs in version control

3. **Creating GitHub Issues**
   - Automatically generates issues from briefs
   - Labels issues by project and type
   - Prepares for project board integration

---

## 📥 Installation

### Prerequisites

- Node.js 22 or later
- pnpm package manager
- GitHub account with PAT (Personal Access Token)

### Step-by-Step Setup

1. **Clone the Repository**

   ```bash
   git clone https://github.com/0xjcf/client-intake-system
   cd client-intake-system
   ```

2. **Install Dependencies**

   ```bash
   pnpm install
   ```

3. **Configure Environment**

   ```bash
   # Create .env file
   touch .env

   # Add your GitHub PAT
   echo "GH_PAT=your_pat_here" >> .env
   ```

4. **Build the Project**
   ```bash
   pnpm build
   ```

---

## 📝 Usage Guide

### As a Backend Service

1. **Start the Server**

   ```bash
   pnpm dev
   ```

2. **Submit a Project Brief**

   ```bash
   curl -X POST http://localhost:3000/api/submit-intake \
     -H "Content-Type: application/json" \
     -d '{
       "projectName": "My Project",
       "projectKey": "my-project",
       "projectDescription": "Description here",
       "targetAudience": "Target users",
       "keyFeatures": "Key features",
       "technicalRequirements": "Tech requirements",
       "timeline": "2 weeks",
       "budget": "$5000",
       "additionalNotes": "Additional info"
     }'
   ```

3. **Check Generated Brief**
   ```bash
   cat project-briefs/my-project.md
   ```

### Command Line Tools

1. **Generate a Brief from JSON**

   ```bash
   # First, create your JSON file
   echo '{
     "projectName": "CLI Test",
     "projectKey": "cli-test",
     "projectDescription": "Testing CLI"
   }' > intake-submissions/test.json

   # Generate the brief
   pnpm build
   node dist/scripts/generate-brief.js intake-submissions/test.json
   ```

2. **Create GitHub Issues**
   ```bash
   pnpm create-issues
   ```

---

## 🔌 API Reference

### POST /api/submit-intake

Accepts project intake data and generates a brief.

**Request:**

```json
{
  "projectName": "Example Project",
  "projectKey": "example-project",
  "projectDescription": "Project description",
  "targetAudience": "Target users",
  "keyFeatures": "Key features",
  "technicalRequirements": "Tech requirements",
  "timeline": "Timeline",
  "budget": "Budget",
  "additionalNotes": "Additional notes"
}
```

**Response:**

```
✅ Project brief generated!
```

---

## 🧪 Testing

### Local Testing

1. **Run Unit Tests**

   ```bash
   pnpm test
   ```

2. **Watch Mode (Development)**

   ```bash
   pnpm test:watch
   ```

3. **Generate Coverage Report**
   ```bash
   pnpm test:coverage
   ```

### Docker Testing

The project includes Docker-based testing for running tests in an isolated environment. This is useful for:

- Ensuring tests work in a clean environment
- Testing with different Node.js versions
- Verifying containerized deployment

To run tests in Docker:

```bash
pnpm test:docker
```

This will:

1. Build a test container using `Dockerfile.test`
2. Mount necessary volumes for test data and coverage
3. Run tests in an isolated environment
4. Generate coverage reports in the `coverage` directory

The Docker test setup includes:

- Test-specific environment variables
- Pre-configured test directories
- Volume mounts for:
  - Coverage reports
  - Project briefs
  - Local issues

---

## 🔧 Development

### Project Structure

```
client-intake-system/
├── src/                    # Source code
│   ├── server.ts           # Express API entrypoint
│   ├── scripts/            # Utility scripts
│   └── utils/              # Helper functions
├── project-briefs/         # Generated markdown briefs
├── intake-submissions/     # Raw JSON intake payloads
├── test/                   # Test files
├── .github/workflows/      # GitHub Actions
│   └── ci.yml             # CI/CD pipeline
├── Dockerfile             # Production Dockerfile
├── Dockerfile.test        # Testing Dockerfile
└── docker-compose.yml     # Docker configuration
```

### Common Development Tasks

1. **Adding New Features**

   ```bash
   # 1. Create feature branch
   git checkout -b feature/new-feature

   # 2. Make changes
   # 3. Run tests
   pnpm test

   # 4. Build and verify
   pnpm build
   ```

2. **Debugging**
   ```bash
   # Start server with debug logs
   DEBUG=* pnpm dev
   ```

---

## 📈 Next Steps

- [ ] GitHub Project Board Automation
- [ ] Enhanced Error Handling
- [ ] Webhook Support
- [ ] API Documentation

---

## 📄 License

MIT © José Flores  
[github.com/0xjcf](https://github.com/0xjcf)
