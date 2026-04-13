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
const bgVars = ['--tn-bg1', '--tn-bg2', '--tn-bg3', '--tn-alt-bg1', '--tn-alt-bg2'];
const uiVars = ['--tn-primary', '--tn-primary-txt', '--tn-accent', '--tn-topbar', '--tn-topbar-txt', '--tn-lines'];
const statusVars = ['--tn-red', '--tn-green', '--tn-yellow', '--tn-orange', '--tn-blue', '--tn-cyan', '--tn-magenta', '--tn-violet'];

function swatchRow(varName: string, type: 'bg' | 'fg'): string {
  if (type === 'bg') {
    return `
      <div style="display:flex; align-items:center; gap:12px; padding:8px 0;">
        <div style="width:48px; height:48px; border-radius:8px; border:1px solid var(--tn-lines); background:var(${varName});"></div>
        <div>
          <div style="font-weight:600; font-size:14px; color:var(--tn-fg1);">${varName}</div>
          <div style="font-size:12px; color:var(--tn-fg3);">Background</div>
        </div>
      </div>`;
  }
  return `
    <div style="display:flex; align-items:center; gap:12px; padding:8px 0;">
      <div style="width:48px; height:48px; border-radius:8px; border:1px solid var(--tn-lines); background:var(--tn-bg2); display:flex; align-items:center; justify-content:center;">
        <span style="font-size:18px; font-weight:700; color:var(${varName});">Aa</span>
      </div>
      <div>
        <div style="font-weight:600; font-size:14px; color:var(--tn-fg1);">${varName}</div>
        <div style="font-size:12px; color:var(--tn-fg3);">Text</div>
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

function comboGrid(): string {
  const headers = bgVars.map(bg => `<th style="padding:8px; font-size:11px; color:var(--tn-fg3); font-weight:600;">${bg.replace('--tn-', '')}</th>`).join('');
  const rows = fgVars.map(fg => {
    const cells = bgVars.map(bg => `
      <td style="padding:4px;">
        <div style="background:var(${bg}); border-radius:6px; padding:8px; text-align:center; border:1px solid var(--tn-lines);">
          <span style="color:var(${fg}); font-size:13px; font-weight:600;">Aa</span>
        </div>
      </td>`).join('');
    return `<tr>
      <td style="padding:8px; font-size:11px; color:var(--tn-fg3); font-weight:600;">${fg.replace('--tn-', '')}</td>
      ${cells}
    </tr>`;
  }).join('');

  return `
    <div style="margin-bottom:32px;">
      <h3 style="font-size:16px; font-weight:700; color:var(--tn-fg1); margin-bottom:12px; border-bottom:1px solid var(--tn-lines); padding-bottom:8px;">Foreground × Background Combinations</h3>
      <div style="overflow-x:auto;">
        <table style="border-collapse:collapse; width:100%;">
          <thead><tr><th></th>${headers}</tr></thead>
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
    template: section('Status Colors', statusVars, 'bg'),
  }),
};

export const Combinations: Story = {
  name: 'FG × BG Matrix',
  render: () => ({
    template: comboGrid(),
  }),
};
