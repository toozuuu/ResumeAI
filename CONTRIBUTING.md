# Contributing to ResumeAI

Thank you for your interest in contributing! This document provides guidelines for contributing to the project.

## Getting Started

1. Fork the repository
2. Clone your fork
3. Create a feature branch: `git checkout -b feature/your-feature-name`
4. Make your changes
5. Commit your changes: `git commit -m 'Add some feature'`
6. Push to the branch: `git push origin feature/your-feature-name`
7. Open a Pull Request

## Environment Setup

1. Copy `.env.example` to `.env` in both `backend/` and `frontend/` directories
2. Add your API keys (see README.md for details)
3. Never commit `.env` files or API keys

## Code Style

- Follow PEP 8 for Python code
- Use ESLint for JavaScript/React code
- Write meaningful commit messages
- Add comments for complex logic

## Testing

Before submitting a PR:
- Test all features locally
- Ensure no API keys are hardcoded
- Check that the app works in demo mode

## Reporting Issues

When reporting bugs or requesting features:
- Use clear, descriptive titles
- Provide steps to reproduce
- Include relevant error messages
- Specify your environment (OS, Python version, etc.)

