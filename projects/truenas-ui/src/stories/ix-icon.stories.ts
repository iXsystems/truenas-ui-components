import type { Meta, StoryObj } from '@storybook/angular';
import { applicationConfig } from '@storybook/angular';
import { importProvidersFrom } from '@angular/core';
import { CommonModule } from '@angular/common';

import { IxIconComponent } from '../lib/ix-icon/ix-icon.component';
import { IxIconRegistryService } from '../lib/ix-icon/ix-icon-registry.service';

// Import Lucide for demonstration
import { Home, User, Settings, Heart, Star, Search, Menu } from 'lucide';

const meta: Meta<IxIconComponent> = {
  title: 'Components/Icon',
  component: IxIconComponent,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
A flexible icon component with a powerful registry system for integrating any third-party icon library.

## Icon Registry System

The component uses a global icon registry that allows you to register:
- **Icon Libraries**: Lucide, Heroicons, Font Awesome, etc.
- **Custom SVG Icons**: Your own icon sets
- **Multiple Sources**: Mix and match different icon libraries

## Integration Examples

### Icon Libraries (via Registry)
- **Lucide**: \`name="lucide:home"\` → Register Lucide with \`setupLucideIntegration()\`
- **Heroicons**: \`name="heroicons:user"\` → Register your own library
- **Font Awesome**: \`name="fa:home"\` → Register FA as a library

### Custom Icons (via Registry)
- **Individual Icons**: \`name="my-logo"\` → Register with \`iconRegistry.registerIcon()\`
- **Icon Sets**: \`name="brand:logo"\` → Register as a library

### Built-in Fallbacks
- **Unicode**: Common icons like \`home\`, \`star\`, \`check\` → ⌂, ★, ✓
- **Text**: Any name → Abbreviated text (e.g., "unknown-icon" → "UN")

## Setup Example

\`\`\`typescript
import { IxIconRegistryService, setupLucideIntegration } from 'truenas-ui';
import * as LucideIcons from 'lucide';

// Register Lucide library
setupLucideIntegration(LucideIcons);

// Register custom icons
iconRegistry.registerIcon('my-logo', '<svg>...</svg>');
iconRegistry.registerIcons({
  'brand-logo': '<svg>...</svg>',
  'custom-heart': '<svg>...</svg>'
});
\`\`\`
        `,
      },
    },
  },
  argTypes: {
    name: {
      control: 'text',
      description: 'Icon identifier. Try: lucide:home, lucide:user, lucide:settings, lucide:heart, lucide:star, lucide:menu, demo-heart, or any Unicode fallback like home, star, check',
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
      // Set up global icon registry for Storybook examples
      if (typeof window !== 'undefined') {
        const mockSanitizer = {
          bypassSecurityTrustHtml: (html: string) => {
            // Create a proper SafeHtml-like object that Angular recognizes
            return {
              changingThisBreaksApplicationSecurity: html,
              getTypeName: () => 'HTML'
            };
          },
          sanitize: (context: any, value: any) => value
        };
        
        const iconRegistry = new IxIconRegistryService(mockSanitizer as any);

        // Register Lucide library
        iconRegistry.registerLibrary({
          name: 'lucide',
          resolver: (iconName: string, options: any = {}) => {
            const iconMap: Record<string, any> = {
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
                const pathElements = iconData.map((path: any) => {
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
                       width="${options.size || 24}" 
                       height="${options.size || 24}" 
                       viewBox="0 0 24 24" 
                       fill="none" 
                       stroke="${options.color || 'currentColor'}" 
                       stroke-width="${options.strokeWidth || 2}" 
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
        (window as any).__storybookIconRegistry = iconRegistry;
      }

      return story();
    }
  ],
};

export default meta;
type Story = StoryObj<IxIconComponent>;

export const Default: Story = {
  args: {
    name: 'home',
    size: 'md',
    tooltip: 'Home icon (Unicode fallback)',
  },
};