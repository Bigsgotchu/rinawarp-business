/**
 * tools/fix-shared-imports.mjs
 *
 * Rewrites imports/requires that resolve into the "non-canonical" shared folder
 * to point at the canonical shared folder.
 *
 * Usage:
 *   node tools/fix-shared-imports.mjs           # dry run
 *   node tools/fix-shared-imports.mjs --apply   # apply changes
 *
 * Canonical selection:
 *   - prefers ./src/shared if it exists
 *   - otherwise uses ./shared
 */

import fs from 'node:fs/promises';
import path from 'node:path';

const argv = new Set(process.argv.slice(2));
const APPLY = argv.has('--apply');

const PROJECT_ROOT = process.cwd();

const IGNORE_DIRS = new Set([
    'node_modules',
    'dist',
    'dist-electron',
    'dist-terminal-pro',
    'build-output',
    'out',
    'release',
    'legacy',
    '.git',
]);

const exists = async (p) => {
    try {
        await fs.access(p);
        return true;
    } catch {
        return false;
    }
};

const toPosix = (p) => p.split(path.sep).join('/');

const stripExt = (p) =>
    p.replace(/\.(ts|tsx|js|jsx|mjs|cjs|d\.ts)$/i, '');

async function resolveWithExtensions(absNoExt) {
    const candidates = [
        absNoExt,
        `${absNoExt}.ts`,
        `${absNoExt}.tsx`,
        `${absNoExt}.js`,
        `${absNoExt}.mjs`,
        `${absNoExt}.cjs`,
        `${absNoExt}.d.ts`,
        path.join(absNoExt, 'index.ts'),
        path.join(absNoExt, 'index.tsx'),
        path.join(absNoExt, 'index.js'),
        path.join(absNoExt, 'index.mjs'),
        path.join(absNoExt, 'index.cjs'),
    ];
    for (const c of candidates) {
        if (await exists(c)) return c;
    }
    return null;
}

async function walk(dirAbs, out = []) {
    const entries = await fs.readdir(dirAbs, { withFileTypes: true });
    for (const e of entries) {
        if (e.isDirectory()) {
            if (IGNORE_DIRS.has(e.name)) continue;
            await walk(path.join(dirAbs, e.name), out);
        } else if (e.isFile()) {
            const ext = path.extname(e.name).toLowerCase();
            if (
                ext === '.ts' ||
                ext === '.tsx' ||
                ext === '.js' ||
                ext === '.mjs' ||
                ext === '.cjs'
            ) {
                out.push(path.join(dirAbs, e.name));
            }
        }
    }
    return out;
}

function isWithin(childAbs, parentAbs) {
    const rel = path.relative(parentAbs, childAbs);
    return rel && !rel.startsWith('..') && !path.isAbsolute(rel);
}

function relImport(fromDirAbs, targetAbsNoExt) {
    let rel = path.relative(fromDirAbs, targetAbsNoExt);
    if (!rel.startsWith('.')) rel = `./${rel}`;
    return toPosix(rel);
}

async function main() {
    const srcShared = path.join(PROJECT_ROOT, 'src', 'shared');
    const rootShared = path.join(PROJECT_ROOT, 'shared');

    const hasSrcShared = await exists(path.join(srcShared, 'constants.ts'));
    const hasRootShared = await exists(path.join(rootShared, 'constants.ts'));

    if (!hasSrcShared && !hasRootShared) {
        console.error(
            '❌ Could not find constants.ts in either ./src/shared or ./shared. Aborting.',
        );
        process.exit(1);
    }

    const canonicalShared = hasSrcShared ? srcShared : rootShared;
    const otherShared = hasSrcShared && hasRootShared ? rootShared : null;

    console.log(`🔧 Canonical shared: ${path.relative(PROJECT_ROOT, canonicalShared)}`);
    if (otherShared) {
        console.log(`⚠️  Also found: ${path.relative(PROJECT_ROOT, otherShared)}`);
    }

    const files = await walk(path.join(PROJECT_ROOT, 'src'));
    let touched = 0;
    let changes = 0;

    const importFromRe = /from\s+['"]([^'"]+)['"]/g;
    const requireRe = /require\(\s*['"]([^'"]+)['"]\s*\)/g;

    for (const fileAbs of files) {
        const fileDir = path.dirname(fileAbs);
        const original = await fs.readFile(fileAbs, 'utf8');
        let next = original;

        const rewriteSpecifier = async (spec) => {
            if (!spec.startsWith('.')) return spec; // only relative imports
            if (!spec.includes('/shared/')) return spec;

            const absNoExt = path.resolve(fileDir, spec);
            const resolved = await resolveWithExtensions(absNoExt);
            if (!resolved) return spec;

            if (!otherShared) return spec; // no duplication to fix

            if (!isWithin(resolved, otherShared)) return spec; // not pointing at "other"

            const tailRel = path.relative(otherShared, resolved);
            const canonicalTarget = path.join(canonicalShared, tailRel);

            const canonicalResolved = await resolveWithExtensions(stripExt(canonicalTarget));
            if (!canonicalResolved) return spec;

            const canonicalNoExt = stripExt(canonicalResolved);
            return relImport(fileDir, canonicalNoExt);
        };

        // rewrite `import ... from '...';`
        next = await replaceAsync(next, importFromRe, async (m, spec) => {
            const rewritten = await rewriteSpecifier(spec);
            return rewritten === spec ? m : m.replace(spec, rewritten);
        });

        // rewrite `require('...')`
        next = await replaceAsync(next, requireRe, async (m, spec) => {
            const rewritten = await rewriteSpecifier(spec);
            return rewritten === spec ? m : m.replace(spec, rewritten);
        });

        if (next !== original) {
            touched += 1;
            const delta =
                original.split('\n').length !== next.split('\n').length ? 1 : 0;
            changes += delta;

            console.log(`📝 ${path.relative(PROJECT_ROOT, fileAbs)}`);
            if (APPLY) {
                await fs.writeFile(fileAbs, next, 'utf8');
            }
        }
    }

    console.log(
        APPLY
            ? `✅ Applied changes to ${touched} file(s).`
            : `✅ Dry run: would change ${touched} file(s). Re-run with --apply to write.`,
    );
}

async function replaceAsync(str, regex, asyncFn) {
    const matches = [...str.matchAll(regex)];
    if (matches.length === 0) return str;

    let out = str;
    // replace from end to start to preserve indices
    for (let i = matches.length - 1; i >= 0; i -= 1) {
        const match = matches[i];
        const full = match[0];
        const index = match.index ?? 0;
        const replacement = await asyncFn(...match);
        out = out.slice(0, index) + replacement + out.slice(index + full.length);
    }
    return out;
}

main().catch((e) => {
    console.error('❌ Failed:', e);
    process.exit(1);
});