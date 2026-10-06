# Claude Code Agent Guide

This file helps coding agents quickly find the right documentation for working on TrueNAS UI Components.

## Quick Decision Tree

**Are you creating a new component?**
→ Read `docs/component_creation_checklist.md` first
→ Then use `docs/component_templates.md` for copy-paste code

**Do you have questions about styling or CSS?**
→ Read `docs/component_styling.md`

**Do you need to write or fix tests?**
→ Read `docs/component_testing.md`

**Do you need to document a component harness?**
→ Read `docs/harness_documentation.md`

**Do you need to understand naming conventions or architecture?**
→ Read `docs/component_conventions.md`

**Do you have questions about Storybook?**
→ See Storybook Resources section below

**Are you unsure where to start?**
→ Read `docs/component_creation_checklist.md` - it links to other files as needed

## File Purposes

| File | Purpose | Read When | Size |
|------|---------|-----------|------|
| `component_creation_checklist.md` | Step-by-step component creation workflow | Creating any new component | ~200 lines |
| `component_templates.md` | Copy-paste boilerplate code for all file types | Need template code for .ts/.html/.scss/.spec/.stories files | ~740 lines |
| `component_styling.md` | CSS patterns, theme variables, responsive design | Working on styles or appearance | ~480 lines |
| `component_testing.md` | Testing patterns, Jest examples, accessibility scans, mocking | Writing or debugging tests | ~800 lines |
| `component_conventions.md` | Naming rules, architecture decisions, patterns | Understanding project structure or design choices | ~610 lines |
| `harness_documentation.md` | Auto-generating harness API docs in Storybook | Creating harness documentation or integrating into stories | ~570 lines |

## Common Usage Patterns

### Pattern 1: New Simple Component
1. Read `component_creation_checklist.md`
2. Copy templates from `component_templates.md`
3. Follow checklist steps

### Pattern 2: New Complex Component (with custom styling)
1. Read `component_creation_checklist.md`
2. Copy templates from `component_templates.md`
3. Read `component_styling.md` for theme variables and patterns
4. Read `component_testing.md` for complex test scenarios

### Pattern 3: Fix Failing Tests
1. Read `component_testing.md`
2. Refer to `component_conventions.md` if architecture clarity needed

### Pattern 4: Style/Theme an Existing Component
1. Read `component_styling.md`
2. Refer to `component_conventions.md` for class naming patterns

### Pattern 5: Understand Existing Code
1. Read `component_conventions.md`
2. Review actual component examples in `projects/truenas-ui/src/lib/`

## Storybook Resources

This project uses **Storybook** for component development and documentation.

### What is Storybook?
Storybook is a tool for building and testing UI components in isolation. It provides:
- Interactive component playground
- Visual documentation
- Automated testing
- Multiple themes/states testing

### Official Storybook Documentation
- **Getting Started:** https://storybook.js.org/docs/get-started
- **Writing Stories:** https://storybook.js.org/docs/writing-stories
- **Angular Guide:** https://storybook.js.org/docs/angular/get-started/introduction
- **Interaction Testing:** https://storybook.js.org/docs/writing-tests/interaction-testing
- **Controls (argTypes):** https://storybook.js.org/docs/essentials/controls
- **Play Functions:** https://storybook.js.org/docs/writing-stories/play-function

### Quick Storybook Commands
```bash
# Start Storybook dev server
yarn storybook

# Build Storybook for production
yarn build-storybook
```

### Story File Templates
Story templates are included in `component_templates.md` under "Storybook Story Templates"

### Harness Documentation in Storybook
**Auto-generated API documentation for component harnesses:**
- Harness JSDoc comments automatically generate Storybook documentation
- Documentation appears at end of component's Docs tab
- See `docs/harness_documentation.md` for complete guide on JSDoc conventions and integration

### Key Storybook Concepts Used Here

**Meta Object:**
Defines component metadata, title, controls, and tags
```typescript
const meta: Meta<TnComponent> = {
  title: 'Components/ComponentName',
  component: TnComponent,
  tags: ['autodocs'],
  argTypes: { /* controls */ }
};
```

**Stories:**
Individual component states/variants
```typescript
export const Default: Story = {
  args: { /* props */ }
};
```

**Play Functions:**
Automated interaction tests within stories
```typescript
play: async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  // Test interactions here
}
```

**Icon Marker:**
For sprite generation in Storybook stories
```typescript
import { tnIconMarker } from '../lib/icon/icon-marker';

tnIconMarker('icon-name', 'library-type');
```

### Existing Examples
Look at these story files for reference:
- `projects/truenas-ui/src/stories/button.stories.ts`
- `projects/truenas-ui/src/stories/card.stories.ts`
- `projects/truenas-ui/src/stories/menu.stories.ts`

## Opening a pull request: do NOT invent a Jira ticket

`CONTRIBUTE.md` requires every PR title to start `NAS-<number> / ` and CI
rejects titles without one. **You cannot mint that number and you must not
copy one.**

**What actually happens:** open the PR with a title that has *no* `NAS-`
prefix — just `type(scope): description` — then apply the **`jira`** label.
bugclerk files a fresh Jira issue and rewrites the PR title with its key,
usually within seconds, and comments the Jira URL. `check-ticket` goes green
on the rename.

```
./scripts/forge.py developer POST /issues/<pr>/labels '{"labels":["jira","no-time-tracked"]}'
```

**Why this is written down.** Every cycle that learned the title format by
reading a recent merged PR copied the key along with the shape — because what
is on `main` is the *post-rename* title. Six agent pull requests ended up
attached to two Jira issues instead of six: NAS-142299 collected three, and
NAS-142319 collected three more. Each cycle reasoned carefully and reached the
wrong answer, because the only evidence available said the key belongs in the
title.

**Do not invent one either.** One cycle cut a branch on `NAS-142300`, thought
better of it, and backed out; the next free id bugclerk assigned was 142316,
so 142300 was someone else's ticket. An invented number maps to nothing or to
a stranger's work, and bugclerk links it either way.

**Branch names need no Jira key at all** — `<issue>-<slug>` is the convention
here, e.g. `204-stepper-aria-structure`.

**The one exception:** carry an existing `NAS-` key only when the work truly
belongs to that Jira issue — a follow-up commit to a PR that already has one.
Not "a related ticket", not "the same component". If you are choosing a key
rather than continuing one, leave it out.

## Reading a failed CI job: use the annotations, not the log

A failed job's log is not reachable through the API —
`GET /actions/jobs/<id>/logs` answers a 302 to a signed blob, and a check run
carries no `output.text`. So **read the annotations instead**:

```
GET /check-runs/<id>/annotations
```

Every Jest failure in `Run Tests` (both its steps) and `Storybook
Interaction Tests` arrives there with the test's full name, the failure
message and the file. A line number comes too when the failure's own stack
names the test file — which a spec failure usually does and a Storybook play
function usually does not, since its frames point into the transformed story
and into `node_modules`. That is `scripts/ci/github-annotations-reporter.cjs`,
a shared reporter wired into all three Jest configs — the Storybook
test-runner is Jest underneath, so it takes the same one through
`.storybook/test-runner-jest.config.mjs`.

**If you add another Jest invocation to CI, add that reporter to it**, or its
failures go back to being log-only. It is silent off a runner, so a local
`yarn test` is unchanged.

GitHub records at most 10 error annotations per step. Up to ten failures each
get their own. Past that the reporter annotates the first nine and spends the
last slot on a summary naming the rest, so **the detailed message is only
there for the first nine** — and the summary's list of names is itself cut
after a few dozen. Its title always carries the exact total.

## A new import under `src/lib/` needs a declaration

`yarn test:scripts` walks the published entry point's import graph and fails
when the library imports a package that `projects/truenas-ui/package.json`
declares in neither `dependencies` nor `peerDependencies`
(`scripts/package-contract/declared-dependencies.spec.ts`). So **adding
`import … from '<package>'` to a shipped file can turn `Run Tests` red in a file
you did not touch.**

The fix is to declare it, not to work around the check. Which block it belongs
in — and, for a peer, which range — is a contract call: since npm 7 a peer the
consumer's tree cannot satisfy is an `ERESOLVE` install failure rather than a
warning, so a floor higher than the code actually needs breaks installs that
work today. Pick the range the source requires, and if the answer is not
obvious, propose it rather than picking one. #354 did exactly that for the gaps
it found but was not scoped to decide, listing them in the spec's
`UNDECLARED_PENDING_A_DECISION` with the reason for each; #358 then decided
them, so **that list is empty today and is meant to stay that way** — the same
check fails if an entry is fixed and left in it.

The check reads `/// <reference types="..." />` as well as imports, because
ng-packagr's flattened `.d.ts` keeps the types a directive resolved and drops the
directive. **A types package may be exempted from declaration when every
reference to its namespace sits inside the body of a function that declares
what it returns** — `TYPES_USED_ONLY_INTERNALLY`, which holds `jest` for
`icon-testing.ts`'s own `jest.fn()` calls.

That exemption is checked rather than promised: a separate test fails, naming
the file, if an exempted namespace is exposed to the published declarations.
Two things about that condition are easy to get wrong, and the check has been
wrong about each of them in turn:

- **"It is a value, not a type" is not enough.** Declaration emit infers the
  type of an exported declaration that carries no annotation, so
  `export const m = jest.fn()` reaches a consumer's `.d.ts` as `jest.Mock<…>`
  with no type position written anywhere.
- **A function shields its body, not itself.** Its signature is emitted
  verbatim, so `export function f(): jest.Mock` and
  `interface M { f(): jest.Mock }` both leak however annotated they are.

`ng-packagr` does not cover this. `allowedNonPeerDependencies` in
`ng-package.json` whitelists packages already in the library's `dependencies`;
it says nothing about one that is imported and declared nowhere.

The README's "Peer Dependencies" block is asserted to match that package.json
verbatim by the same spec — **edit both or neither.**

## A shipped script says `.cjs` or `.mjs`, never `.js`

`ng-package.json` copies `projects/truenas-ui/scripts/**` into the published
package as an asset, so everything under there ships — including the
`truenas-icons` bin a consumer's build runs. **Whether node reads a shipped
`.js` file as CommonJS or as ESM is decided by the `type` field of the generated
`dist/truenas-ui/package.json`, which ng-packagr writes and this repo does
not.** `projects/truenas-ui/package.json` has no `type` field; the built one has
`"type": "module"`.

So a `.js` file that runs correctly from the source tree can be read the other
way once published. That is #362: `cli.js` used `require('child_process')` and
worked in 0.7.12, then ng-packagr started emitting `"type": "module"` and the
identical bytes became ESM in 0.8.2 — every consumer's build died with
`ReferenceError: require is not defined in ES module scope` before the sprite
was touched.

**The rule is not "pick CommonJS" or "pick ESM" — it is don't let a generated
field decide.** `.cjs` and `.mjs` are read the same way whatever a manifest
says. `scripts/package-contract/bin-module-scope.spec.ts` fails on a shipped
`.js` under that directory, on a `bin` target whose extension is ambiguous, and
on a file whose syntax contradicts the extension it claims — so a rename that
does not fix the body, or a body change that does not fix the rename, is caught
too.

The `.ts` files there are mostly ESM already — `make-sprite.ts` and
`lib/add-custom-icons.ts` derive `__dirname` from `import.meta.url`, which is
the idiom to copy, and tsx reads them as whatever the manifest says. One
exception is still open: `cli-main.ts`'s `loadConfig` falls back to a bare
`require(configPath)` when a dynamic `import()` of the consumer's
`truenas-icons.config.js` fails. Under ESM that `require` is itself a
`ReferenceError`, and the surrounding `catch` swallows it — so a CommonJS config
file degrades to `{}` with only a warning rather than being loaded. It does not
crash the CLI, which is why #362 did not cover it.

**The two bin maps and the lockfile hold the same paths three times.** The repo
root's `package.json` declares the commands against `dist/`, and `yarn.lock`
records the workspace's `bin` map as well. Yarn 4 treats an install as immutable
whenever `CI` is set, so a lockfile that disagrees with `package.json` fails
`yarn install` with `YN0028` and takes out every job in `ci-cd.yml` at the shared
`Prepare` step, before lint, test or build runs. **Change a `bin` path and run
`yarn install --mode=update-lockfile`.**

## Important Notes for Agents

- **Don't read all files at once** - Load only what you need for the current task
- **Start with the checklist** - It will reference other files as needed
- **Templates are comprehensive** - component_templates.md has all boilerplate you need
- **Follow the conventions** - component_conventions.md explains the "why" behind patterns
- **Use Storybook examples** - Existing stories show best practices

## Additional Resources

- `CONTRIBUTE.md` - General contribution guidelines, git workflow, icon system
- `projects/truenas-ui/src/lib/` - Existing component examples
- `projects/truenas-ui/src/stories/` - Storybook examples
- **Storybook Docs:** https://storybook.js.org/docs

## Quick Reference

**Creating a component checklist:**
1. Create directory: `projects/truenas-ui/src/lib/[name]/`
2. Create required files: `[name].component.ts`, `.component.html`, `.component.scss`, `.component.spec.ts`
3. Export in `public-api.ts`
4. Create story in `projects/truenas-ui/src/stories/`
5. Run tests: `yarn test`
6. View in Storybook: `yarn storybook`

**All components must be:**
- Standalone (no NgModule)
- Prefixed with `tn-` selector
- Exported in public-api.ts
- Have Storybook story with multiple variants
- Have Jest tests
- Use theme CSS variables

For detailed templates and examples, see the specific documentation files above.
