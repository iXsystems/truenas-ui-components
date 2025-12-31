/**
 * Default base path for sprite assets (namespaced to avoid collisions with consumer apps)
 */
export const defaultSpriteBasePath = 'assets/tn-icons';

/**
 * Configuration options for icon sprite generation
 */
export interface SpriteGeneratorConfig {
  /**
   * Source directories to scan for icon usage
   * Defaults to ['./src/lib', './src/app']
   */
  srcDirs?: string[];

  /**
   * Output directory for generated sprite files
   * Defaults to `./${defaultSpriteBasePath}`
   */
  outputDir?: string;

  /**
   * Optional directory containing custom SVG icons
   * Custom icons will be automatically prefixed with 'tn-'
   */
  customIconsDir?: string;

  /**
   * Project root directory (for resolving relative paths)
   * Defaults to process.cwd()
   */
  projectRoot?: string;
}

/**
 * Resolved configuration with all defaults applied
 */
export interface ResolvedSpriteConfig {
  srcDirs: string[];
  outputDir: string;
  customIconsDir: string | null;
  projectRoot: string;
}

/**
 * Applies defaults to partial configuration
 */
export function resolveConfig(config: SpriteGeneratorConfig = {}): ResolvedSpriteConfig {
  const projectRoot = config.projectRoot || process.cwd();

  return {
    projectRoot,
    srcDirs: config.srcDirs || ['./src/lib', './src/app'],
    outputDir: config.outputDir || `./${defaultSpriteBasePath}`,
    customIconsDir: config.customIconsDir || null,
  };
}
