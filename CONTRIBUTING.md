# Contributing to GreenSteps

Thank you for your interest in contributing to GreenSteps! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [How to Contribute](#how-to-contribute)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Pull Request Process](#pull-request-process)
- [Reporting Bugs](#reporting-bugs)
- [Suggesting Enhancements](#suggesting-enhancements)

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment. We expect all contributors to:

- Use welcoming and inclusive language
- Be respectful of differing viewpoints and experiences
- Gracefully accept constructive criticism
- Focus on what is best for the community
- Show empathy towards other community members

## Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (v18 or higher)
- pnpm package manager
- Git
- A code editor (VS Code recommended)

### Fork and Clone

1. Fork the repository on GitHub
2. Clone your fork locally:

```bash
git clone https://github.com/your-username/greensteps.git
cd greensteps
```

3. Add the upstream repository:

```bash
git remote add upstream https://github.com/original-owner/greensteps.git
```

## Development Setup

### 1. Install Dependencies

```bash
# Install root dependencies
pnpm install

# Install frontend dependencies
cd frontend
pnpm install
cd ..
```

### 2. Configure Environment Variables

Copy the example environment files and fill in your values:

```bash
# Root environment
cp .env.example .env

# Frontend environment
cp frontend/.env.example frontend/.env
```

Edit the `.env` files with your local development values.

### 3. Compile Smart Contracts

```bash
pnpm hardhat compile
```

### 4. Run Tests

```bash
# Run smart contract tests
pnpm test

# Run frontend in development mode
cd frontend
pnpm dev
```

## How to Contribute

### Types of Contributions

We welcome various types of contributions:

- **Bug fixes**: Fix issues in existing code
- **New features**: Add new functionality
- **Documentation**: Improve or add documentation
- **Tests**: Add or improve test coverage
- **Code quality**: Refactoring and optimization
- **Security**: Identify and fix security vulnerabilities

### Contribution Workflow

1. **Check existing issues**: Look for existing issues or create a new one
2. **Discuss your approach**: Comment on the issue to discuss your proposed solution
3. **Create a branch**: Create a feature branch from `main`
4. **Make changes**: Implement your changes following our coding standards
5. **Test thoroughly**: Ensure all tests pass and add new tests if needed
6. **Commit your changes**: Use clear, descriptive commit messages
7. **Push to your fork**: Push your changes to your GitHub fork
8. **Open a pull request**: Submit a PR with a clear description

### Branch Naming Convention

Use descriptive branch names that indicate the type of change:

- `feature/add-user-profile` - New features
- `fix/wallet-connection-bug` - Bug fixes
- `docs/update-readme` - Documentation updates
- `refactor/optimize-contract` - Code refactoring
- `test/add-unit-tests` - Test additions

## Coding Standards

### General Guidelines

- Write clean, readable, and maintainable code
- Follow existing code style and patterns
- Add comments for complex logic
- Keep functions small and focused
- Use meaningful variable and function names

### JavaScript/React Standards

- Use ES6+ syntax
- Use functional components with hooks
- Follow React best practices
- Use PropTypes or TypeScript for type checking
- Avoid console.log in production code (use console.error for errors only)

### Solidity Standards

- Follow Solidity style guide
- Use latest stable Solidity version
- Add NatSpec comments for all public functions
- Follow checks-effects-interactions pattern
- Be mindful of gas optimization
- Use OpenZeppelin contracts when possible

### File Organization

- Place components in `frontend/src/components/`
- Place custom hooks in `frontend/src/hooks/`
- Place utilities in `frontend/src/utils/`
- Place smart contracts in `contracts/`
- Place deployment scripts in `scripts/`

### Code Formatting

We use consistent formatting across the project:

- **Indentation**: 2 spaces
- **Quotes**: Single quotes for JavaScript, double quotes for JSX attributes
- **Semicolons**: Use semicolons
- **Line length**: Maximum 100 characters (flexible for readability)

## Testing Guidelines

### Writing Tests

All contributions should include appropriate tests:

- **Smart Contracts**: Write unit tests using Hardhat/Chai
- **Frontend Components**: Write component tests using React Testing Library
- **Integration**: Test interactions between components

### Test Requirements

- All new features must include tests
- Bug fixes should include regression tests
- Aim for high test coverage (>80%)
- Tests should be clear and well-documented
- Tests must pass before submitting PR

### Running Tests

```bash
# Run all smart contract tests
pnpm test

# Run specific test file
pnpm hardhat test test/GreenStepsToken.test.js

# Run tests with coverage
pnpm hardhat coverage
```

## Pull Request Process

### Before Submitting

- [ ] Code follows project style guidelines
- [ ] All tests pass locally
- [ ] New tests added for new functionality
- [ ] Documentation updated if needed
- [ ] No console.log statements in production code
- [ ] Commit messages are clear and descriptive
- [ ] Branch is up to date with main

### PR Description Template

```markdown
## Description

Brief description of changes

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Code refactoring
- [ ] Performance improvement

## Related Issue

Closes #(issue number)

## Testing

Describe the tests you ran and how to reproduce

## Checklist

- [ ] My code follows the project style guidelines
- [ ] I have performed a self-review of my code
- [ ] I have commented my code where necessary
- [ ] I have updated the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix/feature works
- [ ] New and existing tests pass locally
```

### Review Process

1. Maintainers will review your PR
2. Address any requested changes
3. Once approved, a maintainer will merge your PR
4. Your contribution will be included in the next release

### PR Guidelines

- Keep PRs focused and reasonably sized
- One PR per feature or bug fix
- Link related issues in the PR description
- Respond to review comments promptly
- Be open to feedback and suggestions

## Reporting Bugs

### Before Reporting

- Check if the bug has already been reported
- Verify the bug exists in the latest version
- Collect relevant information about the bug

### Bug Report Template

When reporting bugs, include:

- **Description**: Clear description of the bug
- **Steps to Reproduce**: Detailed steps to reproduce the issue
- **Expected Behavior**: What you expected to happen
- **Actual Behavior**: What actually happened
- **Environment**: OS, Node version, browser, etc.
- **Screenshots**: If applicable
- **Additional Context**: Any other relevant information

### Security Vulnerabilities

**Do not report security vulnerabilities as public issues.**

Please follow our [Security Policy](SECURITY.md) for reporting security issues.

## Suggesting Enhancements

We welcome suggestions for new features and improvements!

### Enhancement Proposal Template

- **Feature Description**: Clear description of the proposed feature
- **Use Case**: Why is this feature needed?
- **Proposed Solution**: How should it work?
- **Alternatives Considered**: Other approaches you've considered
- **Additional Context**: Mockups, examples, or references

### Discussion Process

1. Open an issue with your enhancement proposal
2. Discuss with maintainers and community
3. If approved, the issue will be labeled for implementation
4. You or another contributor can implement the feature

## Development Tips

### Smart Contract Development

- Test on local network first
- Use Hardhat console for debugging
- Be cautious with gas costs
- Follow security best practices
- Review OpenZeppelin documentation

### Frontend Development

- Use React DevTools for debugging
- Test with different wallets (MetaMask, etc.)
- Ensure responsive design
- Test error scenarios
- Use ErrorBoundary for error handling

### Common Commands

```bash
# Compile contracts
pnpm hardhat compile

# Run tests
pnpm test

# Start local blockchain
pnpm hardhat node

# Deploy locally
pnpm hardhat run scripts/deploy-greensteps.js --network localhost

# Start frontend dev server
cd frontend && pnpm dev

# Build frontend for production
cd frontend && pnpm build
```

## Getting Help

If you need help with your contribution:

- Check existing documentation
- Review closed issues and PRs
- Ask questions in issue comments
- Reach out to maintainers

## Recognition

Contributors will be recognized in:

- GitHub contributors list
- Release notes (for significant contributions)
- Project README (for major contributors)

## License

By contributing to GreenSteps, you agree that your contributions will be licensed under the same license as the project.

---

Thank you for contributing to GreenSteps! Your efforts help make this project better for everyone.

**Questions?** Open an issue or contact the maintainers.
