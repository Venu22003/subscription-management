# Contributing to Subscription Manager

First off, thank you for considering contributing to Subscription Manager! It's people like you that make this project better for everyone.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Process](#development-process)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Commit Message Guidelines](#commit-message-guidelines)
- [Testing Guidelines](#testing-guidelines)

## 📜 Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code. Please report unacceptable behavior to [your-email@example.com].

### Our Standards

- Be respectful and inclusive
- Welcome newcomers and help them get started
- Accept constructive criticism gracefully
- Focus on what is best for the community
- Show empathy towards other community members

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- MongoDB (local or Atlas)
- Git

### Setup Development Environment

1. **Fork the repository**
   
   Click the "Fork" button at the top right of the repository page.

2. **Clone your fork**

   ```bash
   git clone https://github.com/YOUR_USERNAME/subscription-management.git
   cd subscription-management
   ```

3. **Add upstream remote**

   ```bash
   git remote add upstream https://github.com/Venu22003/subscription-management.git
   ```

4. **Install dependencies**

   ```bash
   # Backend
   cd backend
   npm install

   # Frontend
   cd ../frontend
   npm install
   ```

5. **Setup environment variables**

   ```bash
   # Backend
   cd backend
   cp .env.example .env
   # Edit .env with your configuration

   # Frontend
   cd ../frontend
   cp .env.example .env
   # Edit .env with your configuration
   ```

6. **Start development servers**

   ```bash
   # Terminal 1 - Backend
   cd backend
   npm run dev

   # Terminal 2 - Frontend
   cd frontend
   npm start
   ```

## 🔄 Development Process

### Branching Strategy

We use a simplified Git Flow:

- `main` - Production-ready code
- `develop` - Integration branch for features
- `feature/*` - New features
- `bugfix/*` - Bug fixes
- `hotfix/*` - Urgent production fixes

### Creating a Feature Branch

```bash
# Update your local main branch
git checkout main
git pull upstream main

# Create a new feature branch
git checkout -b feature/your-feature-name
```

### Making Changes

1. **Write clean, readable code**
   - Follow the existing code style
   - Add comments for complex logic
   - Keep functions small and focused

2. **Test your changes**
   - Write unit tests for new features
   - Ensure all existing tests pass
   - Test manually in the browser

3. **Commit your changes**
   - Follow commit message guidelines (see below)
   - Make small, logical commits
   - Don't commit commented-out code

## 🔀 Pull Request Process

### Before Submitting

1. **Update your branch**

   ```bash
   git checkout main
   git pull upstream main
   git checkout feature/your-feature-name
   git rebase main
   ```

2. **Run tests**

   ```bash
   # Backend
   cd backend
   npm test

   # Frontend
   cd frontend
   npm test
   ```

3. **Check linting**

   ```bash
   # Backend
   cd backend
   npm run lint

   # Frontend
   cd frontend
   npm run lint
   ```

### Submitting Pull Request

1. **Push your branch**

   ```bash
   git push origin feature/your-feature-name
   ```

2. **Create Pull Request**
   - Go to the repository on GitHub
   - Click "Pull Request" button
   - Select your branch
   - Fill in the PR template

3. **PR Title Format**

   ```
   [Type] Brief description of changes
   ```

   Types:
   - `[Feature]` - New feature
   - `[Fix]` - Bug fix
   - `[Docs]` - Documentation changes
   - `[Style]` - Code style changes (formatting)
   - `[Refactor]` - Code refactoring
   - `[Test]` - Adding or updating tests
   - `[Chore]` - Maintenance tasks

### PR Description Template

```markdown
## Description
Brief description of what this PR does.

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
Describe the tests you ran and how to reproduce them.

## Screenshots (if applicable)
Add screenshots for UI changes.

## Checklist
- [ ] My code follows the project's style guidelines
- [ ] I have performed a self-review of my code
- [ ] I have commented my code where necessary
- [ ] I have updated the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix/feature works
- [ ] New and existing unit tests pass locally
```

## 📝 Coding Standards

### JavaScript/React

- Use ES6+ features
- Use `const` and `let`, avoid `var`
- Use arrow functions for callbacks
- Use template literals for string concatenation
- Use destructuring when appropriate
- Use async/await over promises when possible

### React Specific

- Use functional components with hooks
- Keep components small and focused
- Use PropTypes for type checking
- Extract reusable logic into custom hooks
- Use meaningful component and variable names

### Backend Specific

- Use async/await for asynchronous operations
- Always handle errors properly
- Use try-catch blocks
- Validate all inputs
- Use meaningful error messages
- Log important operations

### Code Style

```javascript
// Good ✅
const getUserSubscriptions = async (userId) => {
  try {
    const subscriptions = await Subscription.find({ userId });
    return subscriptions;
  } catch (error) {
    logger.error('Error fetching subscriptions:', error);
    throw error;
  }
};

// Bad ❌
function getSubscriptions(id) {
  return Subscription.find({userId: id}).then(data => {
    return data
  }).catch(err => {
    console.log(err)
  })
}
```

## 📋 Commit Message Guidelines

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, missing semicolons, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Examples

```bash
feat(auth): add password reset functionality

- Add password reset email
- Implement reset token generation
- Add reset password route

Closes #123
```

```bash
fix(subscriptions): correct calculation of yearly spending

The yearly spending calculation was multiplying by 11 instead of 12.
This commit fixes the calculation logic.

Fixes #456
```

```bash
docs(readme): update deployment instructions

- Add MongoDB Atlas setup steps
- Update Vercel deployment process
- Add troubleshooting section
```

### Rules

- Use present tense ("add feature" not "added feature")
- Use imperative mood ("move cursor to..." not "moves cursor to...")
- First line should not exceed 72 characters
- Reference issues and PRs in footer

## 🧪 Testing Guidelines

### Writing Tests

1. **Test file naming**
   - Unit tests: `filename.test.js`
   - Integration tests: `filename.integration.test.js`

2. **Test structure**

   ```javascript
   describe('Component/Function Name', () => {
     describe('specific functionality', () => {
       it('should do something specific', () => {
         // Arrange
         const input = 'test';
         
         // Act
         const result = someFunction(input);
         
         // Assert
         expect(result).toBe(expected);
       });
     });
   });
   ```

3. **Test coverage**
   - Aim for at least 80% coverage
   - Test edge cases
   - Test error conditions
   - Test async operations

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test -- filename.test.js
```

## 🐛 Bug Reports

### Before Submitting

1. Check if the bug has already been reported
2. Reproduce the bug consistently
3. Isolate the problem (minimal reproducible example)

### Bug Report Template

```markdown
## Description
Clear description of the bug

## Steps to Reproduce
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

## Expected Behavior
What you expected to happen

## Actual Behavior
What actually happened

## Screenshots
If applicable, add screenshots

## Environment
- OS: [e.g. Windows 10]
- Browser: [e.g. Chrome 100]
- Node Version: [e.g. 18.0.0]

## Additional Context
Any other relevant information
```

## 💡 Feature Requests

### Feature Request Template

```markdown
## Feature Description
Clear description of the feature

## Problem it Solves
What problem does this feature solve?

## Proposed Solution
How do you envision this feature working?

## Alternatives Considered
What other solutions did you consider?

## Additional Context
Any mockups, examples, or references
```

## 📞 Getting Help

If you need help:

1. Check the [documentation](./README.md)
2. Search [existing issues](https://github.com/Venu22003/subscription-management/issues)
3. Join our community chat (if available)
4. Create a new issue with the `question` label

## 🙏 Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes
- Project website (if applicable)

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to Subscription Manager! 🎉
