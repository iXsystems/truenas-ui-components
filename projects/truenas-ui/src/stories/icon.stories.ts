import type { Meta, StoryObj } from '@storybook/angular';
import { Heart, Home, Menu, Search, Settings, Star, User } from 'lucide';
import { loadHarnessDoc } from '../../.storybook/harness-docs-loader';
import { tnIconMarker } from '../lib/icon/icon-marker';
import { TnIconRegistryService } from '../lib/icon/icon-registry.service';
import { TnIconComponent } from '../lib/icon/icon.component';

// Mark MDI icons for sprite generation (used in story templates)
tnIconMarker('bell', 'mdi');
tnIconMarker('close', 'mdi');
tnIconMarker('cog', 'mdi');
tnIconMarker('content-copy', 'mdi');
tnIconMarker('database', 'mdi');
tnIconMarker('delete', 'mdi');
tnIconMarker('file', 'mdi');
tnIconMarker('folder', 'mdi');
tnIconMarker('harddisk', 'mdi');
tnIconMarker('magnify', 'mdi');
tnIconMarker('memory', 'mdi');
tnIconMarker('menu', 'mdi');
tnIconMarker('nas', 'mdi');
tnIconMarker('network', 'mdi');
tnIconMarker('pencil', 'mdi');
tnIconMarker('refresh', 'mdi');
tnIconMarker('server', 'mdi');
tnIconMarker('star', 'mdi');

// Load harness documentation
const harnessDoc = loadHarnessDoc('icon');

const meta: Meta<TnIconComponent> = {
  title: 'Components/Icon',
  component: TnIconComponent,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
A flexible icon component with automatic sprite generation for optimal performance.

## 📚 Complete Documentation

**For full setup instructions, integration guide, and best practices, see [API / Icon System](/story/api-icon-system).**

## Quick Example

The icon system supports 7000+ MDI icons, Material icons, library custom icons, and your own custom icons:

\`\`\`html
<!-- MDI icons -->
<tn-icon name="folder" library="mdi" size="lg"></tn-icon>

<!-- Material icons -->
<tn-icon name="home" library="material"></tn-icon>

<!-- Library custom icons (TrueNAS-specific) -->
<tn-icon name="dataset" library="custom"></tn-icon>
\`\`\`

Run \`yarn icons\` to generate the sprite with only the icons you use.

## Features

- ✅ **7,000+ MDI icons** - Material Design Icons for general use
- ✅ **Automatic sprite generation** - Bundles only icons you actually use
- ✅ **40+ TrueNAS icons** - Storage, hardware, networking icons with \`tn-\` prefix
- ✅ **Custom icon support** - Add your own SVG icons to your app
- ✅ **Tree-shaking** - Optimal bundle size
- ✅ **Cache-busting** - Versioned sprite URLs

## Using Other Icon Libraries (Optional)

For icon libraries beyond MDI (like Lucide, Heroicons, Font Awesome), use the registry system:

\`\`\`typescript
import { TnIconRegistryService } from '@ixsystems/truenas-ui';
import { Home, User, Settings } from 'lucide';

// In your component or app initializer
iconRegistry.registerLibrary({
  name: 'lucide',
  resolver: (iconName: string) => {
    const icons = { home: Home, user: User, settings: Settings };
    return convertToSvgString(icons[iconName]);
  }
});
\`\`\`

Then use: \`<tn-icon name="home" library="lucide"></tn-icon>\`

**Note**: MDI icons use the sprite system (no registry needed). Other libraries require manual registration.
        `,
      },
    },
  },
  argTypes: {
    name: {
      control: 'text',
      description: 'Icon name. Use with library parameter for icon libraries (e.g., name="home" library="lucide" or name="cog" library="mdi"). Try: home, user, settings, heart, star, menu, or Unicode fallbacks',
    },
    library: {
      control: 'select',
      options: [undefined, 'mdi', 'lucide', 'material', 'custom'],
      description: 'Icon library. Use "mdi" for Material Design Icons, "lucide" for Lucide icons',
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
      description: 'Icon size',
    },
    color: {
      control: 'color',
      description: 'Icon color (CSS color value)',
    },
    tooltip: {
      control: 'text',
      description: 'Tooltip text shown on hover',
    },
    ariaLabel: {
      control: 'text',
      description: 'Accessibility label for screen readers',
    },
  },
  decorators: [
    (story) => {
      // Set up global icon registry for Storybook examples with Lucide icons
      if (typeof window !== 'undefined') {
        const mockSanitizer = {
          bypassSecurityTrustHtml: (html: string) => {
            // Create a proper SafeHtml-like object that Angular recognizes
            return {
              changingThisBreaksApplicationSecurity: html,
              getTypeName: () => 'HTML'
            };
          },
          sanitize: (context: unknown, value: unknown) => value
        };

        // Create a mock sprite loader for the registry (real sprite loader will work in components via DI)
        const mockSpriteLoader = {
          isSpriteLoaded: () => false,
          getIconUrl: () => null,
          getSafeIconUrl: () => null,
          ensureSpriteLoaded: () => Promise.resolve(false),
          getSpriteConfig: () => undefined
        };

        const iconRegistry = new TnIconRegistryService(mockSanitizer as never, mockSpriteLoader as never);

        // Register Lucide library
        iconRegistry.registerLibrary({
          name: 'lucide',
          resolver: (iconName: string, options?: unknown) => {
            const opts = (options || {}) as { size?: number; color?: string; strokeWidth?: number };
            const iconMap: Record<string, unknown> = {
              'home': Home,
              'user': User,
              'settings': Settings,
              'heart': Heart,
              'star': Star,
              'search': Search,
              'menu': Menu
            };

            const iconData = iconMap[iconName];

            if (iconData && Array.isArray(iconData)) {
              try {
                // Lucide icons are arrays of path elements
                const pathElements = iconData.map((path: unknown) => {
                  if (Array.isArray(path) && path[0] === 'path') {
                    const attrs = path[1];
                    let pathString = `<path`;
                    Object.entries(attrs).forEach(([key, value]) => {
                      pathString += ` ${key}="${value}"`;
                    });
                    pathString += `/>`;
                    return pathString;
                  }
                  return '';
                }).join('');

                const svgString = `
                  <svg xmlns="http://www.w3.org/2000/svg"
                       width="${opts.size || 24}"
                       height="${opts.size || 24}"
                       viewBox="0 0 24 24"
                       fill="none"
                       stroke="${opts.color || 'currentColor'}"
                       stroke-width="${opts.strokeWidth || 2}"
                       stroke-linecap="round"
                       stroke-linejoin="round">
                    ${pathElements}
                  </svg>
                `;

                return svgString;
              } catch (error) {
                console.warn('Failed to render Lucide icon:', iconName, error);
              }
            }
            return null;
          },
          defaultOptions: { size: 24, strokeWidth: 2 }
        });

        // Register some custom icons for demo
        iconRegistry.registerIcons({
          'demo-heart': `<svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>`,
          'demo-rocket': `<svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M2.81 14.7l1.68-1.68L7.66 16.2 6.93 17.78 2.81 14.7zm16.55-11.45c-.78-.78-2.05-.78-2.83 0l-1.72 1.72c-.78.78-.78 2.05 0 2.83.78.78 2.05.78 2.83 0l1.72-1.72c.78-.78.78-2.05 0-2.83z"/>
          </svg>`
        });

        // Make it available globally for the component
        (window as unknown as { __storybookIconRegistry: TnIconRegistryService }).__storybookIconRegistry = iconRegistry;
      }

      return story();
    }
  ],
};

export default meta;
type Story = StoryObj<TnIconComponent>;

export const Default: Story = {
  args: {
    name: 'home',
    size: 'md',
    tooltip: 'Home icon (Unicode fallback)',
  },
};

export const LucideIcons: Story = {
  args: {
    name: 'home',
    library: 'lucide',
    size: 'md',
    tooltip: 'Lucide Home icon',
  },
  parameters: {
    docs: {
      description: {
        story: 'Icons from the Lucide library using the `library="lucide"` parameter. These are rendered as SVG icons with proper stroke styling.',
      },
    },
  },
};

export const MdiIcons: Story = {
  args: {
    name: 'harddisk',
    library: 'mdi',
    size: 'md',
    tooltip: 'MDI Harddisk icon',
  },
  parameters: {
    docs: {
      description: {
        story: 'Material Design Icons (MDI) using the `library="mdi"` parameter. These icons are loaded from the generated sprite file which includes 7,000+ MDI icons and 40 custom TrueNAS icons. Perfect for TrueNAS-specific hardware and storage icons.',
      },
    },
  },
};

export const TrueNASIconShowcase: Story = {
  render: () => ({
    template: `
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 20px; padding: 20px;">
        <div style="text-align: center;">
          <tn-icon name="harddisk" library="mdi" size="lg" tooltip="Hard Disk"></tn-icon>
          <div style="margin-top: 8px; font-size: 12px;">Hard Disk</div>
        </div>
        <div style="text-align: center;">
          <tn-icon name="server" library="mdi" size="lg" tooltip="Server"></tn-icon>
          <div style="margin-top: 8px; font-size: 12px;">Server</div>
        </div>
        <div style="text-align: center;">
          <tn-icon name="nas" library="mdi" size="lg" tooltip="NAS"></tn-icon>
          <div style="margin-top: 8px; font-size: 12px;">NAS</div>
        </div>
        <div style="text-align: center;">
          <tn-icon name="database" library="mdi" size="lg" tooltip="Database"></tn-icon>
          <div style="margin-top: 8px; font-size: 12px;">Database</div>
        </div>
        <div style="text-align: center;">
          <tn-icon name="memory" library="mdi" size="lg" tooltip="Memory"></tn-icon>
          <div style="margin-top: 8px; font-size: 12px;">Memory</div>
        </div>
        <div style="text-align: center;">
          <tn-icon name="network" library="mdi" size="lg" tooltip="Network"></tn-icon>
          <div style="margin-top: 8px; font-size: 12px;">Network</div>
        </div>
        <div style="text-align: center;">
          <tn-icon name="folder" library="mdi" size="lg" tooltip="Folder"></tn-icon>
          <div style="margin-top: 8px; font-size: 12px;">Folder</div>
        </div>
        <div style="text-align: center;">
          <tn-icon name="file" library="mdi" size="lg" tooltip="File"></tn-icon>
          <div style="margin-top: 8px; font-size: 12px;">File</div>
        </div>
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story: 'Complete showcase of available MDI icons in the TrueNAS UI library. All icons use `library="mdi"` and are specifically chosen for TrueNAS use cases.',
      },
    },
  },
};

export const LibraryComparison: Story = {
  render: () => ({
    template: `
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; padding: 20px;">
        <div style="text-align: center; border: 1px solid var(--border-color, #ccc); padding: 16px; border-radius: 8px;">
          <h4 style="margin-top: 0;">Material (Default)</h4>
          <tn-icon name="home" size="lg" tooltip="Material Home"></tn-icon>
          <div style="margin-top: 8px;">name="home"</div>
          <div style="font-size: 12px; color: var(--text-secondary, #666);">Unicode fallback</div>
        </div>
        <div style="text-align: center; border: 1px solid var(--border-color, #ccc); padding: 16px; border-radius: 8px;">
          <h4 style="margin-top: 0;">Lucide</h4>
          <tn-icon name="home" library="lucide" size="lg" tooltip="Lucide Home"></tn-icon>
          <div style="margin-top: 8px;">library="lucide"</div>
          <div style="font-size: 12px; color: var(--text-secondary, #666);">Library parameter</div>
        </div>
        <div style="text-align: center; border: 1px solid var(--border-color, #ccc); padding: 16px; border-radius: 8px;">
          <h4 style="margin-top: 0;">MDI</h4>
          <tn-icon name="folder" library="mdi" size="lg" tooltip="MDI Folder"></tn-icon>
          <div style="margin-top: 8px;">library="mdi"</div>
          <div style="font-size: 12px; color: var(--text-secondary, #666);">Library parameter</div>
        </div>
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story: `Comparison of different icon library approaches supported by the tn-icon component.

All libraries use the consistent \`library\` parameter:
- **MDI**: \`<tn-icon name="folder" library="mdi">\`
- **Lucide**: \`<tn-icon name="home" library="lucide">\`
- **Material**: \`<tn-icon name="home">\` (default, falls back to Unicode)

**Note for Menu Items**: When using icons in \`tn-menu\`, use the \`iconLibrary\` property:
\`\`\`typescript
{ id: '1', label: 'Home', icon: 'folder', iconLibrary: 'mdi' }
{ id: '2', label: 'User', icon: 'user', iconLibrary: 'lucide' }
\`\`\`
This provides a consistent, type-safe API for menu item configuration.`,
      },
    },
  },
};

export const SizesAndColors: Story = {
  render: () => ({
    template: `
      <div style="padding: 20px;">
        <h4>Sizes</h4>
        <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 24px;">
          <tn-icon name="harddisk" library="mdi" size="xs"></tn-icon>
          <tn-icon name="harddisk" library="mdi" size="sm"></tn-icon>
          <tn-icon name="harddisk" library="mdi" size="md"></tn-icon>
          <tn-icon name="harddisk" library="mdi" size="lg"></tn-icon>
          <tn-icon name="harddisk" library="mdi" size="xl"></tn-icon>
        </div>

        <h4>Colors</h4>
        <div style="display: flex; align-items: center; gap: 16px;">
          <tn-icon name="server" library="mdi" size="lg" color="var(--tn-primary, #007acc)"></tn-icon>
          <tn-icon name="server" library="mdi" size="lg" color="var(--success, #28a745)"></tn-icon>
          <tn-icon name="server" library="mdi" size="lg" color="var(--warning, #ffc107)"></tn-icon>
          <tn-icon name="server" library="mdi" size="lg" color="var(--danger, #dc3545)"></tn-icon>
          <tn-icon name="server" library="mdi" size="lg" color="#9c27b0"></tn-icon>
        </div>
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story: 'Demonstration of different sizes and color customization options for MDI icons.',
      },
    },
  },
};

export const ComponentHarness: Story = {
  tags: ['!dev'],
  parameters: {
    docs: {
      canvas: {
        hidden: true,
        sourceState: 'none'
      },
      description: {
        story: harnessDoc || ''
      }
    },
    controls: { disable: true },
    layout: 'fullscreen'
  },
  render: () => ({ template: '' })
};