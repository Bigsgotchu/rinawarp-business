#!/usr/bin/env node

/**
 * Phase 2: VS Code Configuration Validation
 * Ensures VS Code is properly configured for the project
 */

import fs from 'fs';
import path from 'path';

const projectRoot = process.cwd();

const requiredSettings = [
    'kilocode.singleAIAgentMode',
    'workbench.editor.enablePreview',
    'editor.formatOnSave',
    'editor.codeActionsOnSave',
    'eslint.workingDirectories'
];

const requiredExtensions = [
    'kilocode.kilo-code',
    'esbenp.prettier-vscode',
    'dbaeumer.vscode-eslint'
];

console.log('🔧 RinaWarp: Phase 2 – VS Code Validation');
console.log('=========================================\n');

// Check VS Code settings
console.log('⚙️  Checking VS Code settings...');
const settingsPath = path.join(projectRoot, '.vscode', 'settings.json');
if (fs.existsSync(settingsPath)) {
    try {
        const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
        const missingSettings = [];

        for (const setting of requiredSettings) {
            if (settings[setting] !== undefined) {
                console.log(`  ✅ ${setting}: ${JSON.stringify(settings[setting])}`);
            } else {
                console.log(`  ❌ ${setting}: MISSING`);
                missingSettings.push(setting);
            }
        }

        if (missingSettings.length === 0) {
            console.log('  ✅ All required VS Code settings present');
        } else {
            console.log(`  ⚠️  Missing settings: ${missingSettings.join(', ')}`);
        }
    } catch (error) {
        console.log('  ❌ Could not parse .vscode/settings.json');
    }
} else {
    console.log('  ❌ .vscode/settings.json not found');
}

// Check VS Code extensions
console.log('\n🔌 Checking VS Code extensions...');
const extensionsPath = path.join(projectRoot, '.vscode', 'extensions.json');
if (fs.existsSync(extensionsPath)) {
    try {
        const extensions = JSON.parse(fs.readFileSync(extensionsPath, 'utf8'));
        const recommended = extensions.recommendations || [];

        for (const ext of requiredExtensions) {
            if (recommended.includes(ext)) {
                console.log(`  ✅ ${ext}`);
            } else {
                console.log(`  ⚠️  ${ext} - Not in recommendations`);
            }
        }
    } catch (error) {
        console.log('  ❌ Could not parse .vscode/extensions.json');
    }
} else {
    console.log('  ⚠️  .vscode/extensions.json not found');
}

// Check tasks.json
console.log('\n📋 Checking VS Code tasks...');
const tasksPath = path.join(projectRoot, '.vscode', 'tasks.json');
if (fs.existsSync(tasksPath)) {
    try {
        const tasks = JSON.parse(fs.readFileSync(tasksPath, 'utf8'));
        const rinaTasks = tasks.tasks?.filter(task => task.label?.includes('RinaWarp')) || [];
        console.log(`  ✅ Found ${rinaTasks.length} RinaWarp tasks`);
        rinaTasks.forEach(task => {
            console.log(`    - ${task.label}`);
        });
    } catch (error) {
        console.log('  ❌ Could not parse .vscode/tasks.json');
    }
} else {
    console.log('  ❌ .vscode/tasks.json not found');
}

// Check keybindings
console.log('\n⌨️  Checking VS Code keybindings...');
const keybindingsPath = path.join(projectRoot, '.vscode', 'keybindings.json');
if (fs.existsSync(keybindingsPath)) {
    try {
        const keybindings = JSON.parse(fs.readFileSync(keybindingsPath, 'utf8'));
        const rinaKeybindings = keybindings.filter(kb => kb.command?.includes('RinaWarp')) || [];
        console.log(`  ✅ Found ${rinaKeybindings.length} RinaWarp keybindings`);
        rinaKeybindings.forEach(kb => {
            console.log(`    - ${kb.key} → ${kb.command}`);
        });
    } catch (error) {
        console.log('  ❌ Could not parse .vscode/keybindings.json');
    }
} else {
    console.log('  ⚠️  .vscode/keybindings.json not found (optional)');
}

// Check launch configurations
console.log('\n🚀 Checking VS Code launch configurations...');
const launchPath = path.join(projectRoot, '.vscode', 'launch.json');
if (fs.existsSync(launchPath)) {
    try {
        const launch = JSON.parse(fs.readFileSync(launchPath, 'utf8'));
        const configs = launch.configurations || [];
        console.log(`  ✅ Found ${configs.length} launch configurations`);
        configs.forEach(config => {
            console.log(`    - ${config.name}`);
        });
    } catch (error) {
        console.log('  ❌ Could not parse .vscode/launch.json');
    }
} else {
    console.log('  ⚠️  .vscode/launch.json not found (optional)');
}

console.log('\n✅ VS Code configuration validation complete');
console.log('💡 Tip: Use "⌘⇧P → RinaWarp: Phase 2 – VS Code Validation" to re-run this check');
