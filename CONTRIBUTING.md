# Contributing to ORSYS

Thank you for your interest in contributing! This document explains how to get involved.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [How to Contribute](#how-to-contribute)
- [Development Setup](#development-setup)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Commit Message Format](#commit-message-format)

---

## Code of Conduct

Please read and follow our [Code of Conduct](CODE_OF_CONDUCT.md). We are committed to maintaining a welcoming and inclusive community.

---

## Getting Started

1. **Fork** the repository on GitHub
2. **Clone** your fork locally:
   ```bash
   git clone https://github.com/your-username/orsys.git
   cd orsys
   ```
3. **Add the upstream remote:**
   ```bash
   git remote add upstream https://github.com/original-owner/orsys.git
   ```

---

## How to Contribute

### Reporting Bugs

- Search existing [issues](../../issues) first to avoid duplicates
- Use the **Bug Report** issue template
- Include steps to reproduce, expected behavior, and screenshots if applicable

### Suggesting Features

- Open a [Feature Request](../../issues/new?template=feature_request.md) issue
- Describe the use case clearly
- Wait for discussion before starting work on large features

### Submitting Code

- For small fixes (typos, minor bugs) — open a PR directly
- For new features or significant changes — open an issue first to discuss

---

## Development Setup

### Requirements

- Node.js 18+
- npm or pnpm
- Firebase project (free tier is fine)

### Steps

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env
# Fill in your Firebase config

# Start development server
npm run dev
```

### Project Structure

```
src/
├── components/     # Reusable UI components
├── hooks/          # TanStack Query hooks
├── layouts/        # Page layout wrappers
├── lib/            # Firebase config, Firestore helpers, utilities
├── pages/          # Route-level page components
└── store/          # Zustand state stores
```

---

## Pull Request Process

1. **Create a branch** from `main`:
   ```bash
   git checkout -b feat/your-feature-name
   ```

2. **Make your changes** — keep them focused and minimal

3. **Test your changes** thoroughly in the browser

4. **Commit** using the [conventional format](#commit-message-format)

5. **Push** to your fork:
   ```bash
   git push origin feat/your-feature-name
   ```

6. **Open a Pull Request** against the `main` branch

7. Fill in the PR template completely

8. Wait for review — address any feedback promptly

### PR Checklist

- [ ] Code follows the project's style guidelines
- [ ] No sensitive data (API keys, passwords, personal info) included
- [ ] No `console.log` statements left in code
- [ ] TypeScript types are properly defined
- [ ] UI is tested on both desktop and mobile

---

## Coding Standards

- **TypeScript** — all new files must be `.ts` or `.tsx`
- **Components** — functional components with hooks only
- **Styling** — Tailwind CSS utility classes only, no inline styles
- **Imports** — use `@/` path alias, not relative `../../` paths
- **No unused variables** — clean up before committing

---

## Commit Message Format

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>: <short description>
```

| Type | When to use |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `refactor` | Code change, no feature or fix |
| `style` | UI/CSS changes only |
| `docs` | Documentation changes |
| `chore` | Dependencies, config, tooling |
| `test` | Adding or fixing tests |

**Examples:**
```
feat: add denomination input +/- buttons
fix: login error message not displaying
docs: update Firebase setup instructions
chore: upgrade firebase to v11
```

---

## Questions?

Open a [Discussion](../../discussions) or an [Issue](../../issues) — we're happy to help!
