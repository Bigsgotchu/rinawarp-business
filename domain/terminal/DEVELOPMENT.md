# 🛠️ RinaWarp Terminal Pro - Development Guide

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- npm >= 8.0.0
- Git

### Setup Development Environment

```bash
# Clone and setup
git clone <repository-url>
cd rinawarp-terminal-clean
npm install
npm run setup

# Edit environment variables
nano .env
```

## Development Workflow

### Code Quality Standards

```bash
# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format

# Run tests
npm test
npm run test:watch
npm run test:coverage

```

### Development Commands

```bash
# Start development servers
npm start                    # Backend server
npm run dev:frontend         # Frontend development
npm run dev:website          # Website development
npm run electron             # Desktop app

# Build for production
npm run build               # Frontend build
npm run build:website       # Website build
npm run electron:build      # Desktop app build

# Clean up
npm run clean               # Remove build artifacts
```

## Project Structure

```
rinawarp-terminal-clean/
├── frontend/               # React web application
├── local-terminal-app/     # Electron desktop app
├── unified-backend/        # Node.js backend server
├── lambda/                 # AWS Lambda functions
├── server/                 # Express development server
├── src/                    # Shared source code
│   ├── analytics/          # Google Analytics integration
│   ├── backend/            # Backend utilities
│   ├── components/         # React components
│   └── website/            # Website components
├── test/                   # Test files
├── assets/                 # Static assets
└── docs/                   # Documentation
```

## Code Standards

### JavaScript/React

- Use ES6+ features
- Prefer functional components with hooks

- Use meaningful variable names
- Add JSDoc comments for functions
- Follow ESLint configuration

### File Naming

- Components: PascalCase (e.g., `MyComponent.jsx`)
- Utilities: camelCase (e.g., `myUtility.js`)
- Constants: UPPER_SNAKE_CASE (e.g., `API_ENDPOINTS.js`)

### Git Workflow

1. Create feature branch from `main`
2. Make changes with descriptive commits

3. Run tests and linting
4. Create pull request
5. Code review and merge

## Testing

### Test Structure

```bash

test/
├── unit/                   # Unit tests
├── integration/            # Integration tests
├── e2e/                    # End-to-end tests
└── fixtures/               # Test data
```

### Writing Tests

```javascript
// Example test structure
describe('Component Name', () => {
  it('should do something specific', () => {
    // Arrange
    const input = 'test';

    // Act
    const result = myFunction(input);

    // Assert
    expect(result).toBe('expected');
  });
});
```

## Environment Variables

### Required for Development

```bash
# AI APIs
OPENAI_API_KEY=your_openai_key
GROQ_API_KEY=your_groq_key


# Voice Synthesis
ELEVENLABS_API_KEY=your_elevenlabs_key
ELEVENLABS_VOICE_ID=ULm8JbxJlz7SpQhRhqnO

# Development
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

### Optional

```bash
# Monitoring
SENTRY_DSN=your_sentry_dsn

# Analytics

GA_MEASUREMENT_ID=G-XXXXXXXXXX

# AWS (for production features)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
```

## Debugging

### Backend Debugging

```bash
# Enable debug mode

DEBUG=true npm start

# Check logs
tail -f logs/app.log
```

### Frontend Debugging

- Use React DevTools browser extension
- Check browser console for errors
- Use Vite's hot reload for development

### Common Issues

1. **Port conflicts**: Change ports in config files
2. **API key errors**: Verify .env file configuration
3. **Build failures**: Run `npm run clean` and rebuild

## Performance Optimization

### Frontend

- Use lazy loading for components
- Implement code splitting
- Optimize bundle size with Vite
- Use React.memo for expensive components

### Backend

- Implement caching strategies

- Use connection pooling
- Monitor memory usage
- Optimize database queries

## Security Best Practices

- Never commit API keys or secrets

- Use environment variables for configuration
- Validate all user inputs
- Implement rate limiting
- Use HTTPS in production
- Regular dependency updates

## Deployment

### Staging

```bash
# Deploy to staging
npm run build
npm run deploy:staging
```

### Production

```bash
# Deploy to production
npm run build
npm run deploy:production
npm run verify:production
```

## Contributing

1. Fork the repository
2. Create feature branch
3. Make changes following code standards
4. Add tests for new features
5. Update documentation
6. Submit pull request

## Resources

- [React Documentation](https://react.dev/)
- [Node.js Documentation](https://nodejs.org/docs/)
- [AWS SDK Documentation](https://docs.aws.amazon.com/sdk/)
- [Stripe Documentation](https://stripe.com/docs)
- [OpenAI API Documentation](https://platform.openai.com/docs)
