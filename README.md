# Client Intake System

A comprehensive system for handling project intake, brief generation, and issue management.

## Features

- Client-facing HTML intake form
- Automated project brief generation
- Issue creation and management
- GitHub integration for automation

## Documentation

- [Generate Brief Script](docs/generate-brief.md) - Converts intake forms to project briefs
- [Create Issues Script](docs/create-issues-from-brief.md) - Generates issues from project briefs

## Quick Start

1. **Setup**

   ```bash
   # Install dependencies
   pnpm install

   # Build the project
   pnpm build
   ```

2. **Generate Project Brief**

   ```bash
   # Convert intake form to brief
   pnpm generate-brief input.json
   ```

3. **Create Issues**
   ```bash
   # Generate issues from briefs
   pnpm create-issues
   ```

## Directory Structure

```
client-intake-system/
├── src/
│   ├── scripts/
│   │   ├── generate-brief.ts        # Brief generation script
│   │   └── create-issues-from-brief.mts  # Issue creation script
│   └── types/
│       └── intake.ts                # Type definitions
├── project-briefs/                  # Generated briefs
├── local-issues/                    # Generated issues
└── docs/                            # Documentation
```

## Development

```bash
# Run tests
pnpm test

# Run tests with coverage
pnpm test:coverage

# Lint code
pnpm lint
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License - See [LICENSE](LICENSE) for details
