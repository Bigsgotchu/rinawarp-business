# Pull Request

## Description

<!-- Provide a brief description of the changes in this PR -->

## Type of Change

<!-- Mark the relevant options with an "x" -->

- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update
- [ ] Performance improvement
- [ ] Code refactoring
- [ ] Dependency update

## Electron Version Verification

<!-- These checks are required for any changes that might affect the desktop app -->

- [ ] **Electron pinned (20.3.12) & ABI 107 verified**

  ```bash
  cd apps/terminal-pro/desktop && pnpm electron:abi
  # Expected output: 20.3.12 107
  ```

- [ ] **Native modules compatibility confirmed**

  ```bash
  cd apps/terminal-pro/desktop && pnpm rebuild
  # Should complete without errors
  ```

- [ ] **Update feed configuration unchanged**
  - [ ] Update URL still points to `https://updates.rinawarp.dev/stable`
  - [ ] No changes to auto-update configuration in `package.json`

## Testing

<!-- Describe the testing you've done -->

- [ ] Unit tests pass: `pnpm test`
- [ ] Linting passes: `pnpm lint`
- [ ] Type checking passes: `pnpm -r run typecheck`
- [ ] Desktop app builds successfully: `cd apps/terminal-pro/desktop && pnpm build`
- [ ] Smoke tests pass: `cd apps/terminal-pro/desktop && pnpm smoke:security`

## Screenshots (if applicable)

<!-- Add screenshots to help explain your changes -->

## Checklist

<!-- Mark completed items with an "x" -->

- [ ] My code follows the project's style guidelines
- [ ] I have performed a self-review of my own code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally with my changes
- [ ] Any dependent changes have been merged and published

## Additional Notes

<!-- Add any additional notes or context -->
