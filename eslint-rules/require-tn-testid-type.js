'use strict';

/**
 * @fileoverview Guardrail for the "library owns the test-id prefix" scheme.
 *
 * Under that scheme a component declares its element type via `tnTestIdType`
 * next to `[tnTestId]`, and the library composes `${type}-${base}`. If an
 * interactive element binds `[tnTestId]` but forgets `tnTestIdType`, the value
 * is written verbatim — silently DROPPING the prefix. That is a quiet test-id
 * regression for automation, which this rule catches.
 *
 * Scope: native interactive elements only (button, a, input, select,
 * textarea) — the elements that should own a type prefix. Containers
 * (div/span/li) are intentionally exempt; verbatim `[tnTestId]` is legitimate
 * there during rollout.
 *
 * Known intentional exception: a component may compose the FULL id in
 * TypeScript (e.g. `tn-menu`'s `resolvedTestId()` already includes the
 * `menu-item` prefix via `composeTestId`) and pass it through `[tnTestId]`
 * without a `tnTestIdType`. Those are correct — suppress with
 * `<!-- eslint-disable-next-line tn-local/require-tn-testid-type -->`.
 */

const { getTemplateParserServices } = require('@angular-eslint/utils');

const INTERACTIVE_TAGS = new Set(['button', 'a', 'input', 'select', 'textarea']);

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Interactive elements binding [tnTestId] must declare tnTestIdType so the library owns the element-type prefix.',
    },
    schema: [],
    messages: {
      requireType:
        'Interactive <{{tag}}> binds [tnTestId] but is missing `tnTestIdType`. Declare the element type ' +
        '(e.g. tnTestIdType="button") so the library prepends the prefix — otherwise the value is written ' +
        'verbatim and the prefix is silently dropped. If you intentionally pass a fully-composed id, ' +
        'suppress this rule on the line.',
    },
  },
  create(context) {
    const parserServices = getTemplateParserServices(context);
    return {
      Element(node) {
        if (!INTERACTIVE_TAGS.has(node.name)) {
          return;
        }
        const names = new Set([
          ...(node.attributes ?? []).map((a) => a.name),
          ...(node.inputs ?? []).map((i) => i.name),
        ]);
        if (!names.has('tnTestId') || names.has('tnTestIdType')) {
          return;
        }
        context.report({
          loc: parserServices.convertNodeSourceSpanToLoc(node.sourceSpan),
          messageId: 'requireType',
          data: { tag: node.name },
        });
      },
    };
  },
};
