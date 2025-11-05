# Contributing to Gyattmail

Thank you for your interest in contributing to Gyattmail! This document provides guidelines and instructions for contributing.

## Getting Started

### Prerequisites

- Node.js 20 or higher
- npm or yarn
- Git

### Setup

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/gyattmail.git
   cd gyattmail
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Copy the environment template:
   ```bash
   cp .env.local.example .env.local
   ```

5. Generate an encryption key:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
   Add this to `.env.local` as `ENCRYPTION_KEY`

6. Set up OAuth credentials (see README.md for detailed instructions)

7. Start the development server:
   ```bash
   npm run dev
   ```

## Development Workflow

### Branch Naming

- `feature/description` - New features
- `fix/description` - Bug fixes
- `docs/description` - Documentation updates
- `refactor/description` - Code refactoring
- `test/description` - Test additions or updates

### Commit Messages

Follow the conventional commits format:

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

Example: `feat: add drag-and-drop email organization`

### Code Style

- Use TypeScript for all new code
- Follow the existing code structure
- Use 2 spaces for indentation
- Run `npm run lint` before committing
- Ensure your code passes type checking

### Paper-Hatch Design System

When creating UI components:
- Use existing Paper-Hatch components when possible
- Follow the color tokens defined in `lib/tokens/paper-hatch.ts`
- Maintain the warm, artisanal aesthetic
- Use cross-hatched borders instead of solid lines
- See `docs/paper-hatch.md` for detailed guidelines

## Pull Request Process

1. Create a feature branch from `base-functionality`
2. Make your changes
3. Test thoroughly
4. Update documentation if needed
5. Create a pull request with:
   - Clear description of changes
   - Screenshots (for UI changes)
   - Testing instructions
   - Related issue numbers

### PR Checklist

- [ ] Code follows the project style
- [ ] Tests pass (`npm run build`)
- [ ] Lint passes (`npm run lint`)
- [ ] Documentation updated
- [ ] No console errors
- [ ] Tested in development environment

## Testing

- Test with multiple email providers (Gmail, Outlook, iCloud)
- Verify OAuth flows work correctly
- Test IMAP/SMTP functionality
- Check responsive design
- Verify Paper-Hatch components render correctly

## Security

- Never commit sensitive data (API keys, credentials, etc.)
- Use environment variables for configuration
- Report security vulnerabilities privately to the maintainers
- Don't commit `.env.local` files

## Questions?

- Open an issue for bug reports or feature requests
- Check existing issues before creating new ones
- Be respectful and constructive in discussions
