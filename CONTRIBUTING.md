# Contributing to PomodoroFlow 🍅🌱

First of all, thank you for taking the time to contribute! 🎉

This document provides guidelines and conventions for contributing to the **PomodoroFlow** open-source project.

---

## 📜 Code of Conduct

We are committed to providing a welcoming, inclusive, and harassment-free environment for everyone. Please be respectful and considerate in all interactions.

---

## 🛠️ How to Contribute

### 1. Reporting Bugs

If you encounter any unexpected behavior:
1. Search existing issues to see if the problem has already been reported.
2. Open a new issue with a clear title and description.
3. Include reproduction steps, your operating system, browser version, and console logs if applicable.

### 2. Suggesting Features

We welcome new ideas, themes, and gamification enhancements!
- Open an issue titled `Feature: [Brief description]`.
- Explain why the feature is useful and how you envision the user experience.

### 3. Pull Requests

1. **Fork the repository** on GitHub.
2. **Create a branch** for your feature or bugfix:
   ```bash
   git checkout -b feature/awesome-feature
   ```
3. **Make your changes** following our coding standards:
   - Ensure clean, decoupled logic. Pure math and state machines should reside in `src/utils/`.
   - Maintain the Claymorphic aesthetic standards (soft dual shadows, rounded radii, pastel palette).
   - Ensure all buttons and controls have accessible names/labels (`aria-label`).
4. **Run tests & verification**:
   ```bash
   npx tsx --test src/utils/*.test.ts
   npm run build
   ```
   All tests and builds must pass before submitting your PR.
5. **Commit your changes** using descriptive commit messages:
   - `feat: add custom theme preset for pastel lavender`
   - `fix: prevent timer drift on background tabs`
   - `test: add unit tests for new achievement criteria`
6. **Push to your fork** and open a Pull Request against the `main` branch.

---

## 🧪 Unit Testing Guidelines

We prioritize fast, deterministic unit tests without heavy mocks.
- Pure logic functions in `src/utils/` should always have corresponding `*.test.ts` test suites.
- Use Node's built-in `node:test` runner and `node:assert/strict`.
- Keep assertions clear and focused on boundary conditions.

---

Thank you for helping make PomodoroFlow better for learners and builders everywhere!
