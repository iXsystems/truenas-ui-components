Please review the changes and provide comprehensive feedback.

Focus on:
- Code quality and best practices
- Maintainability, good architecture design and patterns
- Adherence to project conventions (see CLAUDE.md for details)
- Potential bugs or issues
- Performance considerations
- Security implications
- Accessibility (a11y) concerns

Do not provide:
- summary of what PR does
- list of steps you took to review
- numeric rating or score

When describing positive aspects of the PR, just mention them briefly in one - three sentences.

Ignore small nit-picky issues like formatting or style unless they significantly impact readability.

Provide constructive feedback with specific suggestions for improvement.
Use inline comments to highlight specific areas of concern.

## Project Conventions

This is an Angular component library. All components must be:
- Standalone (no NgModule)
- Prefixed with `tn-` selector
- Exported in `public-api.ts`
- Accompanied by a Storybook story with multiple variants
- Covered by Jest tests
- Using theme CSS variables (not hardcoded colors)

Some common pitfalls to watch for:
- Fixing an issue in a specific place without considering other places or overall architecture
- Leaving in unused code
- Forgetting to export new components/harnesses in `public-api.ts`
- Forgetting to take into account accessibility (keyboard navigation, ARIA attributes, screen readers)
- Not using CSS custom properties / theme variables for colors and spacing
- Writing tests that interact with methods that should be private or protected
- Missing CDK component harness for new components
- Storybook stories that don't cover key variants or states

Use enthusiastic and positive tone, you can use some emojis.

Keep review brief and focused:
- do not repeat yourself
- keep overall assessment concise (one sentence)
