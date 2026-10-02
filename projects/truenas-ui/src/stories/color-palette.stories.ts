import type { Meta, StoryObj } from '@storybook/angular';

const meta: Meta = {
  title: 'API/Color Palette',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Visual reference for all `--tn-*` CSS color variables. Switch themes in the Storybook toolbar to see how each variable adapts.',
      },
    },
    controls: { disable: true },
  },
};

export default meta;
type Story = StoryObj;

const fgVars = ['--tn-fg1', '--tn-fg2', '--tn-fg3', '--tn-fg4', '--tn-alt-fg1', '--tn-alt-fg2'];

/**
 * What each foreground is for, under each swatch. `--tn-fg3` and `--tn-fg4` are
 * NOT text: they are tuned to the 3:1 non-text minimum against --tn-bg1 and
 * --tn-bg2, and neither is guaranteed as text in any theme — --tn-fg4 reaches
 * the 4.5:1 text minimum in none of the nine and --tn-fg3 in only four (#240).
 * Labelling every
 * row "Text" is what this story used to do, and it is the same claim theming.mdx
 * was making — so a reader who scanned the grid instead of the prose still came
 * away with it.
 */
const fgRoles: Record<string, string> = {
  '--tn-fg3': 'Non-text (3:1)',
  '--tn-fg4': 'Non-text (3:1)',
};
const bgVars = ['--tn-bg1', '--tn-bg2', '--tn-bg3', '--tn-alt-bg1', '--tn-alt-bg2'];
const uiVars = ['--tn-primary', '--tn-primary-txt', '--tn-accent', '--tn-accent-txt', '--tn-topbar', '--tn-topbar-txt', '--tn-lines'];
const statusVars = ['--tn-red', '--tn-green', '--tn-yellow', '--tn-orange', '--tn-blue', '--tn-cyan', '--tn-magenta', '--tn-violet'];
const statusTextVars = ['--tn-error-text'];

/**
 * The class `parameters.a11y.context.exclude` names, put on the swatches that
 * render a NON-TEXT token as text on purpose. See `NON_TEXT_SAMPLE` below.
 */
const NON_TEXT_CLASS = 'tn-palette-non-text-sample';

/**
 * Why two stories exclude a selector from the a11y scan rather than being fixed.
 *
 * `--tn-fg3` and `--tn-fg4` are tuned to the 3:1 NON-TEXT minimum (see
 * `fgRoles` above, and #240). Both of these stories render every foreground as
 * the literal string "Aa" so the colour can be seen — which makes axe measure
 * them as text and hold them to 4.5:1, and `--tn-fg4` misses it in all nine
 * palettes (3.12:1 on `--tn-bg2` in `.tn-dark`), `--tn-fg3` in five. That is
 * the `color-contrast` violation the Storybook a11y run reported on
 * API/Color Palette > Foregrounds and > FG × BG Matrix (#337).
 *
 * There is nothing to fix: the swatch is a colour sample, not a text
 * recommendation, and both stories say so in their own prose. So the exclusion
 * is scoped to the samples of the two non-text tokens — by selector, not by
 * turning `color-contrast` off for the story — which leaves the rule live on
 * every other swatch, on the labels under them, and on the four foregrounds
 * that DO carry a text guarantee.
 */
const NON_TEXT_SAMPLE = {
  a11y: { context: { exclude: [`.${NON_TEXT_CLASS}`] } },
};

function swatchRow(varName: string, type: 'bg' | 'fg'): string {
  if (type === 'bg') {
    return `
      <div style="display:flex; align-items:center; gap:12px; padding:8px 0;">
        <div style="width:48px; height:48px; border-radius:8px; border:1px solid var(--tn-lines); background:var(${varName});"></div>
        <div>
          <div style="font-weight:600; font-size:14px; color:var(--tn-fg1);">${varName}</div>
          <div style="font-size:12px; color:var(--tn-fg2);">Background</div>
        </div>
      </div>`;
  }
  // Keyed off `fgRoles` so the swatch excluded from the contrast scan is
  // exactly the one labelled "Non-text (3:1)" underneath it, rather than a
  // second list that can drift from the first.
  const sampleClass = fgRoles[varName] ? ` class="${NON_TEXT_CLASS}"` : '';
  return `
    <div style="display:flex; align-items:center; gap:12px; padding:8px 0;">
      <div style="width:48px; height:48px; border-radius:8px; border:1px solid var(--tn-lines); background:var(--tn-bg2); display:flex; align-items:center; justify-content:center;">
        <span${sampleClass} style="font-size:18px; font-weight:700; color:var(${varName});">Aa</span>
      </div>
      <div>
        <div style="font-weight:600; font-size:14px; color:var(--tn-fg1);">${varName}</div>
        <div style="font-size:12px; color:var(--tn-fg2);">${fgRoles[varName] ?? 'Text'}</div>
      </div>
    </div>`;
}

function section(title: string, vars: string[], type: 'bg' | 'fg'): string {
  return `
    <div style="margin-bottom:32px;">
      <h3 style="font-size:16px; font-weight:700; color:var(--tn-fg1); margin-bottom:12px; border-bottom:1px solid var(--tn-lines); padding-bottom:8px;">${title}</h3>
      <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(240px, 1fr)); gap:4px;">
        ${vars.map(v => swatchRow(v, type)).join('')}
      </div>
    </div>`;
}

/**
 * The corner cell of the matrix below is a `<td>`, not a `<th>`.
 *
 * A `<th>` with no text fails axe's `empty-table-header`, and this one labels
 * nothing — it sits above the column of foreground names, not above data. That
 * was the second of the two violations reported on this story (#337).
 */
function comboGrid(): string {
  const headers = bgVars.map(bg => `<th style="padding:8px; font-size:11px; color:var(--tn-fg2); font-weight:600;">${bg.replace('--tn-', '')}</th>`).join('');
  const rows = fgVars.map(fg => {
    const sampleClass = fgRoles[fg] ? ` class="${NON_TEXT_CLASS}"` : '';
    const cells = bgVars.map(bg => `
      <td style="padding:4px;">
        <div style="background:var(${bg}); border-radius:6px; padding:8px; text-align:center; border:1px solid var(--tn-lines);">
          <span${sampleClass} style="color:var(${fg}); font-size:13px; font-weight:600;">Aa</span>
        </div>
      </td>`).join('');
    return `<tr>
      <td style="padding:8px; font-size:11px; color:var(--tn-fg2); font-weight:600;">${fg.replace('--tn-', '')}</td>
      ${cells}
    </tr>`;
  }).join('');

  return `
    <div style="margin-bottom:32px;">
      <h3 style="font-size:16px; font-weight:700; color:var(--tn-fg1); margin-bottom:12px; border-bottom:1px solid var(--tn-lines); padding-bottom:8px;">Foreground × Background Combinations</h3>
      <p style="font-size:12px; color:var(--tn-fg2); margin:0 0 12px;">Every cell renders "Aa" as a color sample, not as a recommendation: the <code>fg3</code> and <code>fg4</code> rows are non-text foregrounds, and neither is guaranteed as text in any theme (<code>fg4</code> reaches the 4.5:1 text minimum in none of the nine, <code>fg3</code> in only four). Only the <code>bg1</code> and <code>bg2</code> columns of those two rows carry a guarantee at all — the 3:1 non-text minimum.</p>
      <div style="overflow-x:auto;">
        <table style="border-collapse:collapse; width:100%;">
          <thead><tr><td></td>${headers}</tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    </div>`;
}

export const Backgrounds: Story = {
  render: () => ({
    template: section('Background Variables', bgVars, 'bg'),
  }),
};

export const Foregrounds: Story = {
  parameters: NON_TEXT_SAMPLE,
  render: () => ({
    template: section('Foreground Variables', fgVars, 'fg'),
  }),
};

export const UIColors: Story = {
  name: 'UI Colors',
  render: () => ({
    template: section('UI & Chrome', uiVars, 'bg'),
  }),
};

export const StatusColors: Story = {
  render: () => ({
    // --tn-error-text is only guaranteed as a text color against --tn-bg1/--tn-bg2
    // (see component_styling.md), not as the 3:1 border/component color the other
    // status vars are for — rendered as a text swatch rather than a bg swatch so
    // the story doesn't imply it's interchangeable with them.
    template: section('Status Colors', statusVars, 'bg') + section('Status Text Colors', statusTextVars, 'fg'),
  }),
};

export const Combinations: Story = {
  name: 'FG × BG Matrix',
  parameters: NON_TEXT_SAMPLE,
  render: () => ({
    template: comboGrid(),
  }),
};
