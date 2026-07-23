# 🤝 EduEarn - Contributing Guide

We welcome contributions to EduEarn! To ensure codebase quality, please follow these guidelines when adding features or fixing bugs.

---

## 🍴 Code Workflow

1. **Fork and Branch**:
   - Create a feature branch off `main` for your changes:
     ```bash
     git checkout -b feature/your-feature-name
     ```
2. **Implement Changes**:
   - Write clean, type-safe React code using Tailwind v4.
   - Re-use design components in `src/components/ui/` rather than rolling custom styles.
   - Maintain the feature-based folder structure.
3. **Verify and Format**:
   - Verify that your changes build and compile with zero errors:
     ```bash
     npm run lint
     npx tsc --noEmit
     npm run build
     ```
4. **Pull Requests**:
   - Describe what the feature adds or what bug it resolves.
   - Ensure the linter and test pipeline passes cleanly before submitting.

---

## 🔍 Pull Request Checklist

Before submitting a PR, ensure you can check off the following items:

- [ ] Core typescript builds cleanly without any `any` casting or `ts-ignore` bypasses.
- [ ] Linter checks (`npm run lint`) pass with 0 errors and 0 warnings.
- [ ] Page navigation is responsive and verified on mobile breakpoints.
- [ ] Semantic HTML is preserved and keyboard accessibility is tested.
- [ ] Stale debug console logs or test code is removed.
