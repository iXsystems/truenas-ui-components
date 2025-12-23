#!/usr/bin/env node

/**
 * Generate Markdown Documentation from Component Harness Files
 *
 * This script parses all *.harness.ts files using the TypeScript Compiler API,
 * extracts class information, methods, interfaces, and JSDoc comments,
 * then generates comprehensive markdown documentation for Storybook.
 *
 * Usage: npx tsx scripts/generate-harness-docs.ts
 */

import * as ts from 'typescript';
import * as fs from 'fs';
import * as path from 'path';

interface MethodInfo {
  name: string;
  parameters: string;
  returnType: string;
  description: string;
  examples: string[];
}

interface InterfaceInfo {
  name: string;
  description: string;
  properties: PropertyInfo[];
}

interface PropertyInfo {
  name: string;
  type: string;
  description: string;
}

interface HarnessInfo {
  className: string;
  description: string;
  hostSelector: string;
  classExamples: string[];
  methods: MethodInfo[];
  interfaces: InterfaceInfo[];
}

const projectRoot = path.join(__dirname, '..');
const loaderFile = path.join(projectRoot, 'projects/truenas-ui/.storybook/harness-docs-loader.ts');

console.log('🔨 Generating harness documentation...');
console.log(`📂 Project root: ${projectRoot}`);
console.log(`📝 Loader file: ${loaderFile}`);

/**
 * Recursively find all files matching a pattern
 */
function findFilesRecursive(dir: string, pattern: RegExp): string[] {
  const results: string[] = [];

  if (!fs.existsSync(dir)) {
    return results;
  }

  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      results.push(...findFilesRecursive(filePath, pattern));
    } else if (pattern.test(file)) {
      results.push(filePath);
    }
  }

  return results;
}

/**
 * Find all harness files in the project
 */
function findHarnessFiles(): string[] {
  const libDir = path.join(projectRoot, 'projects/truenas-ui/src/lib');
  const fileArray = findFilesRecursive(libDir, /\.harness\.ts$/);

  console.log(`\n📦 Found ${fileArray.length} harness file(s):`);
  fileArray.forEach(file => console.log(`  - ${path.relative(projectRoot, file)}`));
  return fileArray;
}

/**
 * Extract JSDoc comment text from a node
 */
function getJSDocComment(node: ts.Node): string {
  const jsDocTags = ts.getJSDocTags(node);
  const jsDocComments = ts.getJSDocCommentsAndTags(node);

  let description = '';
  for (const comment of jsDocComments) {
    if (ts.isJSDoc(comment)) {
      description = comment.comment?.toString() || '';
      break;
    }
  }

  return description.trim();
}

/**
 * Extract @example blocks from JSDoc
 */
function getJSDocExamples(node: ts.Node): string[] {
  const examples: string[] = [];
  const jsDocTags = ts.getJSDocTags(node);

  for (const tag of jsDocTags) {
    if (tag.tagName.text === 'example' && tag.comment) {
      examples.push(tag.comment.toString().trim());
    }
  }

  return examples;
}

/**
 * Get return type description from JSDoc @returns tag
 */
function getReturnsDescription(node: ts.Node): string {
  const jsDocTags = ts.getJSDocTags(node);

  for (const tag of jsDocTags) {
    if (tag.tagName.text === 'returns' && tag.comment) {
      return tag.comment.toString().trim();
    }
  }

  return '';
}

/**
 * Extract method signature including parameters
 */
function getMethodSignature(method: ts.MethodDeclaration, checker: ts.TypeChecker): MethodInfo {
  const name = method.name.getText();

  // Get parameters - show only types, not parameter names
  const params = method.parameters.map(param => {
    const paramType = param.type ? param.type.getText() : 'any';
    const isOptional = param.questionToken ? '?' : '';
    return `${paramType}${isOptional}`;
  }).join(', ');

  // Get return type
  const returnType = method.type ? method.type.getText() : 'void';

  // Get description from JSDoc
  const description = getJSDocComment(method) || getReturnsDescription(method);

  // Get examples
  const examples = getJSDocExamples(method);

  return {
    name,
    parameters: params || '',
    returnType,
    description,
    examples,
  };
}

/**
 * Extract interface properties
 */
function extractInterface(interfaceDecl: ts.InterfaceDeclaration): InterfaceInfo {
  const name = interfaceDecl.name.text;
  const description = getJSDocComment(interfaceDecl);
  const properties: PropertyInfo[] = [];

  interfaceDecl.members.forEach(member => {
    if (ts.isPropertySignature(member) && member.name) {
      const propName = member.name.getText();
      const propType = member.type ? member.type.getText() : 'any';
      const propDescription = getJSDocComment(member);

      properties.push({
        name: propName,
        type: propType,
        description: propDescription,
      });
    }
  });

  return { name, description, properties };
}

/**
 * Parse a harness file and extract all relevant information
 */
function parseHarnessFile(filePath: string): HarnessInfo | null {
  const sourceCode = fs.readFileSync(filePath, 'utf-8');
  const sourceFile = ts.createSourceFile(
    filePath,
    sourceCode,
    ts.ScriptTarget.Latest,
    true
  );

  const program = ts.createProgram([filePath], {});
  const checker = program.getTypeChecker();

  let harnessInfo: HarnessInfo | null = null;
  const interfaces: InterfaceInfo[] = [];

  function visit(node: ts.Node) {
    // Extract harness class
    if (ts.isClassDeclaration(node) && node.name) {
      const className = node.name.text;

      // Only process classes that extend ComponentHarness
      const extendsClause = node.heritageClauses?.find(
        clause => clause.token === ts.SyntaxKind.ExtendsKeyword
      );

      if (extendsClause && extendsClause.types[0]?.expression.getText() === 'ComponentHarness') {
        const description = getJSDocComment(node);
        const classExamples = getJSDocExamples(node);
        let hostSelector = '';
        const methods: MethodInfo[] = [];

        // Extract class members
        node.members.forEach(member => {
          // Extract hostSelector
          if (ts.isPropertyDeclaration(member) &&
              member.name.getText() === 'hostSelector' &&
              member.initializer) {
            hostSelector = member.initializer.getText().replace(/['"]/g, '');
          }

          // Extract public methods (skip constructor and private methods)
          if (ts.isMethodDeclaration(member) && member.name) {
            const methodName = member.name.getText();
            const isPublic = !member.modifiers?.some(
              mod => mod.kind === ts.SyntaxKind.PrivateKeyword ||
                     mod.kind === ts.SyntaxKind.ProtectedKeyword
            );

            if (isPublic && methodName !== 'constructor') {
              methods.push(getMethodSignature(member, checker));
            }
          }
        });

        harnessInfo = {
          className,
          description,
          hostSelector,
          classExamples,
          methods,
          interfaces: [], // Will be populated later
        };
      }
    }

    // Extract interfaces
    if (ts.isInterfaceDeclaration(node) && node.name) {
      const interfaceName = node.name.text;

      // Only include interfaces related to harness filters/options
      if (interfaceName.includes('Filter') || interfaceName.includes('Options')) {
        interfaces.push(extractInterface(node));
      }
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);

  if (harnessInfo) {
    harnessInfo.interfaces = interfaces;
  }

  return harnessInfo;
}

/**
 * Generate markdown documentation from harness info
 */
function generateMarkdown(info: HarnessInfo): string {
  let md = '';

  // Class overview
  md += `#### Class: ${info.className}\n\n`;

  if (info.description) {
    md += `${info.description}\n\n`;
  }

  if (info.hostSelector) {
    md += `**Host Selector**: \`${info.hostSelector}\`\n\n`;
  }

  // Methods table
  if (info.methods.length > 0) {
    md += `#### Methods\n\n`;
    md += `| Method | Parameters | Returns | Description |\n`;
    md += `|--------|------------|---------|-------------|\n`;

    info.methods.forEach(method => {
      const desc = (method.description || '').replace(/\n+/g, ' ').trim();
      const params = method.parameters ? `\`${method.parameters}\`` : '';
      md += `| \`${method.name}()\` | ${params} | \`${method.returnType}\` | ${desc} |\n`;
    });
    md += `\n`;
  }

  // Interfaces
  if (info.interfaces.length > 0) {
    md += `#### Interfaces\n\n`;

    info.interfaces.forEach(iface => {
      md += `##### ${iface.name}\n\n`;

      if (iface.description) {
        md += `${iface.description}\n\n`;
      }

      if (iface.properties.length > 0) {
        md += `| Property | Type | Description |\n`;
        md += `|----------|------|-------------|\n`;

        iface.properties.forEach(prop => {
          const desc = (prop.description || '').replace(/\n+/g, ' ').trim();
          md += `| \`${prop.name}\` | \`${prop.type}\` | ${desc} |\n`;
        });
        md += `\n`;
      }
    });
  }

  return md;
}

/**
 * Get component name from harness file path
 */
function getComponentName(filePath: string): string {
  const basename = path.basename(filePath, '.harness.ts');
  return basename;
}

/**
 * Main execution
 */
function main() {
  try {
    // Find all harness files
    const harnessFiles = findHarnessFiles();

    if (harnessFiles.length === 0) {
      console.log('⚠️  No harness files found');
      return;
    }

    // Process each harness file
    console.log('\n🔍 Processing harness files...\n');

    let successCount = 0;
    let errorCount = 0;
    const docsRegistry: Record<string, string> = {};

    for (const filePath of harnessFiles) {
      const componentName = getComponentName(filePath);
      console.log(`Processing: ${componentName}`);

      try {
        const harnessInfo = parseHarnessFile(filePath);

        if (!harnessInfo) {
          console.log(`  ⚠️  Could not extract harness information`);
          errorCount++;
          continue;
        }

        const markdown = generateMarkdown(harnessInfo);
        docsRegistry[componentName] = markdown;

        console.log(`  ✓ Processed: ${componentName}`);
        successCount++;
      } catch (error) {
        console.error(`  ❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        errorCount++;
      }
    }

    // Generate the loader file
    console.log('\n📝 Writing loader file...\n');

    const loaderContent = generateLoaderFile(docsRegistry);
    fs.writeFileSync(loaderFile, loaderContent, 'utf-8');

    console.log(`  ✓ Written: ${path.relative(projectRoot, loaderFile)}`);

    // Summary
    console.log(`\n✅ Successfully generated ${successCount} documentation(s)`);
    if (errorCount > 0) {
      console.log(`⚠️  ${errorCount} file(s) had errors`);
    }
    console.log(`📦 Documentation available via loadHarnessDoc()\n`);

  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

/**
 * Generate the loader file content with embedded documentation
 */
function generateLoaderFile(docsRegistry: Record<string, string>): string {
  let content = `/**
 * Harness Documentation Registry
 *
 * Auto-generated registry of harness documentation.
 * This file is generated by the generate-harness-docs script.
 *
 * DO NOT EDIT MANUALLY - Run 'npm run generate-harness-docs' to regenerate.
 *
 * Generated: ${new Date().toISOString()}
 *
 * Usage in story files:
 * \`\`\`typescript
 * import { loadHarnessDoc } from '../../.storybook/harness-docs-loader';
 * const harnessDoc = loadHarnessDoc('ix-component');
 * \`\`\`
 */

/* eslint-disable */

export const HARNESS_DOCS: Record<string, string> = {\n`;

  // Add each documentation entry
  for (const [componentName, markdown] of Object.entries(docsRegistry)) {
    // Escape backticks and dollar signs for template literals
    const escaped = markdown
      .replace(/\\/g, '\\\\')
      .replace(/`/g, '\\`')
      .replace(/\$/g, '\\$');

    content += `  '${componentName}': \`${escaped}\`,\n`;
  }

  content += `};

/**
 * Load harness documentation for a component.
 *
 * @param componentName - The component name (e.g., 'ix-banner', 'ix-button')
 * @returns The markdown documentation string, or null if no harness doc exists
 *
 * @example
 * \`\`\`typescript
 * const harnessDoc = loadHarnessDoc('ix-banner');
 *
 * if (harnessDoc) {
 *   // Include in story parameters
 * }
 * \`\`\`
 */
export function loadHarnessDoc(componentName: string): string | null {
  return HARNESS_DOCS[componentName] || null;
}
`;

  return content;
}

main();
