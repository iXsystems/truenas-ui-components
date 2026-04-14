import fs from 'fs';
import { resolve } from 'path';

export interface IconSlotMapping {
  iconAttribute: string;
  libraryAttribute?: string;
  defaultLibrary?: string;
}

export interface ForwardingComponentMapping {
  selector: string;
  iconSlots: IconSlotMapping[];
}

/**
 * Load forwarding component mappings from JSON manifest files.
 *
 * Mappings tell the sprite scanner which component attributes forward icon
 * values to `<tn-icon>`. For example, `<tn-empty icon="inbox">` forwards
 * its `icon` attribute to an internal `<tn-icon [name]>`.
 *
 * Sources (merged in order, later entries override by selector):
 * 1. The library's published manifest at
 *    `node_modules/@truenas/ui-components/assets/tn-icons/forwarding-mappings.json`
 * 2. Any `forwarding-mappings.json` files found in the consumer's source dirs
 */
export function discoverForwardingMappings(srcDirs: string[], projectRoot: string): ForwardingComponentMapping[] {
  const bySelector = new Map<string, ForwardingComponentMapping>();

  // Load library manifest (published with the npm package)
  const libraryMappings = loadManifest(resolve(
    projectRoot,
    'node_modules/@truenas/ui-components/assets/tn-icons/forwarding-mappings.json',
  ));
  for (const mapping of libraryMappings) {
    bySelector.set(mapping.selector, mapping);
  }

  // Load consumer manifests from source dirs
  for (const srcDir of srcDirs) {
    const consumerManifest = resolve(srcDir, 'forwarding-mappings.json');
    for (const mapping of loadManifest(consumerManifest)) {
      bySelector.set(mapping.selector, mapping);
    }
  }

  return [...bySelector.values()];
}

/**
 * Read and parse a forwarding-mappings.json file.
 * Returns an empty array if the file is missing or malformed.
 */
function loadManifest(filePath: string): ForwardingComponentMapping[] {
  if (!fs.existsSync(filePath)) {
    return [];
  }

  try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    if (!Array.isArray(data)) {
      return [];
    }
    return data;
  } catch {
    return [];
  }
}
