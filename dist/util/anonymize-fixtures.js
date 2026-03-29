/**
 * Anonymizes test fixture data in tests/fixtures/
 *
 * Scrambles: file paths, message text content, tool inputs/results, memory files
 * Preserves: UUIDs, timestamps, structural fields (type, role, name, version, is_error, etc.)
 *
 * Usage: npx ts-node util/anonymize-fixtures.ts
 */
import { readFileSync, writeFileSync, readdirSync, renameSync, statSync, existsSync } from 'fs';
import { join, basename } from 'path';
const FIXTURES_DIR = join(import.meta.dirname, '..', 'tests', 'fixtures');
// --- Deterministic fake data generators ---
const LOREM_WORDS = [
    'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit',
    'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore',
    'magna', 'aliqua', 'enim', 'ad', 'minim', 'veniam', 'quis', 'nostrud',
    'exercitation', 'ullamco', 'laboris', 'nisi', 'aliquip', 'ex', 'ea', 'commodo',
    'consequat', 'duis', 'aute', 'irure', 'in', 'reprehenderit', 'voluptate',
    'velit', 'esse', 'cillum', 'fugiat', 'nulla', 'pariatur', 'excepteur', 'sint',
    'occaecat', 'cupidatat', 'non', 'proident', 'sunt', 'culpa', 'qui', 'officia',
    'deserunt', 'mollit', 'anim', 'id', 'est', 'laborum',
];
const FAKE_DIRS = ['alpha', 'beta', 'gamma', 'delta', 'epsilon', 'zeta', 'eta', 'theta'];
const FAKE_FILES = [
    'main.ts', 'index.ts', 'utils.ts', 'helpers.ts', 'config.ts', 'app.ts',
    'server.ts', 'client.ts', 'handler.ts', 'service.ts', 'model.ts', 'types.ts',
    'router.ts', 'middleware.ts', 'db.ts', 'auth.ts', 'logger.ts', 'parser.ts',
];
const FAKE_EXTENSIONS = ['.ts', '.js', '.json', '.md', '.css', '.html'];
let wordIdx = 0;
let pathIdx = 0;
let fileIdx = 0;
function nextLorem(count) {
    const words = [];
    for (let i = 0; i < count; i++) {
        words.push(LOREM_WORDS[wordIdx % LOREM_WORDS.length]);
        wordIdx++;
    }
    return words.join(' ');
}
function loremForLength(original) {
    // Produce lorem ipsum roughly matching the original character length
    const targetLen = original.length;
    if (targetLen === 0)
        return '';
    const wordCount = Math.max(1, Math.ceil(targetLen / 6));
    const result = nextLorem(wordCount);
    // Trim or pad to roughly match
    if (result.length > targetLen + 20)
        return result.slice(0, targetLen);
    return result;
}
function fakePath() {
    const dir = FAKE_DIRS[pathIdx % FAKE_DIRS.length];
    const file = FAKE_FILES[fileIdx % FAKE_FILES.length];
    pathIdx++;
    fileIdx++;
    return `/home/anon/projects/${dir}/src/${file}`;
}
function fakeSlug() {
    const dir = FAKE_DIRS[pathIdx % FAKE_DIRS.length];
    pathIdx++;
    return `anon-project-${dir}`;
}
// --- Path detection ---
function looksLikePath(value) {
    if (value.length < 3)
        return false;
    // Unix or Windows-style paths
    if (/^[\/~]/.test(value) && value.includes('/'))
        return true;
    if (/^[A-Z]:[\\\/]/.test(value))
        return true;
    // Anonymized path pattern (C--Users-xxx-dev-yyy)
    if (/^C--Users-/.test(value))
        return true;
    // Relative paths with extensions
    if (/\.(ts|js|json|md|css|html|txt|yaml|yml|toml|py|go|rs|java|sh|bash)$/i.test(value))
        return true;
    return false;
}
// --- Structural field preservation ---
const PRESERVE_KEYS = new Set([
    'type', 'role', 'name', 'uuid', 'messageId', 'timestamp', 'version',
    'is_error', 'isSidechain', 'parentUuid', 'tool_use_id', 'id', 'promptId',
    'stop_reason', 'stop_sequence', 'model', 'usage',
]);
// Keys whose string values should be replaced
const PATH_KEYS = new Set(['cwd', 'file_path', 'path', 'filePath', 'file', 'directory', 'dir']);
const TEXT_KEYS = new Set(['text', 'content', 'description', 'command', 'body', 'prompt', 'output', 'old_string', 'new_string', 'pattern', 'query', 'skill']);
const SLUG_KEYS = new Set(['slug', 'projectSlug']);
// --- Deep scramble ---
function scrambleValue(key, value) {
    if (value === null || value === undefined)
        return value;
    if (typeof value === 'boolean' || typeof value === 'number')
        return value;
    if (Array.isArray(value)) {
        return value.map((item, i) => scrambleValue(String(i), item));
    }
    if (typeof value === 'object') {
        return scrambleObject(value);
    }
    // String value
    const str = value;
    if (str.length === 0)
        return str;
    if (PRESERVE_KEYS.has(key))
        return str;
    if (SLUG_KEYS.has(key))
        return fakeSlug();
    if (PATH_KEYS.has(key))
        return fakePath();
    if (TEXT_KEYS.has(key))
        return loremForLength(str);
    // Heuristic: if it looks like a path, replace it
    if (looksLikePath(str))
        return fakePath();
    // Unknown string keys: replace with lorem if longish, keep short identifiers
    if (str.length > 30)
        return loremForLength(str);
    return str;
}
function scrambleObject(obj) {
    const result = {};
    for (const [key, value] of Object.entries(obj)) {
        if (PRESERVE_KEYS.has(key)) {
            result[key] = value;
        }
        else if (key === 'message' && typeof value === 'object' && value !== null) {
            // message object: scramble content but preserve role
            result[key] = scrambleMessage(value);
        }
        else if (key === 'data' && typeof value === 'object' && value !== null) {
            // data object: deep scramble
            result[key] = scrambleObject(value);
        }
        else if (key === 'snapshot' && typeof value === 'object' && value !== null) {
            // snapshot: scramble deeply (file-history-snapshot contains file paths)
            result[key] = scrambleSnapshot(value);
        }
        else if (key === 'trackedFileBackups' && typeof value === 'object' && value !== null) {
            // trackedFileBackups: object keys are file paths that need scrambling
            result[key] = scrambleTrackedFileBackups(value);
        }
        else {
            result[key] = scrambleValue(key, value);
        }
    }
    return result;
}
function scrambleMessage(msg) {
    const result = {};
    for (const [key, value] of Object.entries(msg)) {
        if (key === 'role') {
            result[key] = value;
        }
        else if (key === 'content') {
            result[key] = scrambleContent(value);
        }
        else {
            result[key] = scrambleValue(key, value);
        }
    }
    return result;
}
function scrambleContent(content) {
    if (typeof content === 'string') {
        return loremForLength(content);
    }
    if (Array.isArray(content)) {
        return content.map(block => scrambleContentBlock(block));
    }
    return content;
}
function scrambleSnapshot(snapshot) {
    const result = {};
    for (const [key, value] of Object.entries(snapshot)) {
        if (key === 'trackedFileBackups' && typeof value === 'object' && value !== null) {
            result[key] = scrambleTrackedFileBackups(value);
        }
        else {
            result[key] = scrambleValue(key, value);
        }
    }
    return result;
}
function scrambleTrackedFileBackups(backups) {
    const result = {};
    for (const [filePath, metadata] of Object.entries(backups)) {
        // filePath is the key - replace with a fake path if it looks like one
        const newPath = looksLikePath(filePath) ? fakePath() : filePath;
        result[newPath] = scrambleValue('metadata', metadata);
    }
    return result;
}
function scrambleContentBlock(block) {
    if (typeof block !== 'object' || block === null)
        return block;
    const b = block;
    const result = {};
    for (const [key, value] of Object.entries(b)) {
        if (key === 'type' || key === 'id' || key === 'tool_use_id' || key === 'is_error') {
            result[key] = value;
        }
        else if (key === 'name') {
            // tool_use name: preserve (it's a tool identifier like "Bash", "Read")
            result[key] = value;
        }
        else if (key === 'text') {
            result[key] = typeof value === 'string' ? loremForLength(value) : value;
        }
        else if (key === 'content') {
            // tool_result content: can be string or nested
            if (typeof value === 'string') {
                result[key] = loremForLength(value);
            }
            else if (Array.isArray(value)) {
                result[key] = value.map(item => scrambleContentBlock(item));
            }
            else {
                result[key] = value;
            }
        }
        else if (key === 'input') {
            // tool_use input: deep scramble preserving structure
            result[key] = scrambleValue(key, value);
        }
        else {
            result[key] = scrambleValue(key, value);
        }
    }
    return result;
}
// --- File processors ---
function processJsonlFile(filePath) {
    const content = readFileSync(filePath, 'utf-8');
    const lines = content.trim().split('\n').filter(l => l.trim());
    const scrambled = lines.map(line => {
        try {
            const entry = JSON.parse(line);
            return JSON.stringify(scrambleObject(entry));
        }
        catch {
            // If line isn't valid JSON, replace with lorem
            return line;
        }
    });
    writeFileSync(filePath, scrambled.join('\n') + '\n');
    console.log(`  jsonl: ${basename(filePath)}`);
}
function processMetaJson(filePath) {
    const content = readFileSync(filePath, 'utf-8');
    try {
        const obj = JSON.parse(content);
        const scrambled = scrambleObject(obj);
        writeFileSync(filePath, JSON.stringify(scrambled, null, 2) + '\n');
        console.log(`  meta:  ${basename(filePath)}`);
    }
    catch {
        console.log(`  meta:  ${basename(filePath)} (skipped, invalid JSON)`);
    }
}
function processToolResult(filePath) {
    const original = readFileSync(filePath, 'utf-8');
    writeFileSync(filePath, loremForLength(original) + '\n');
    console.log(`  txt:   ${basename(filePath)}`);
}
function processMemoryFile(filePath) {
    const original = readFileSync(filePath, 'utf-8');
    const name = basename(filePath);
    if (name === 'MEMORY.md') {
        // Replace with fake memory index
        writeFileSync(filePath, [
            '# Memory Index',
            '',
            '- [Project Notes](project_notes.md) — lorem ipsum project context',
            '- [User Preferences](user_prefs.md) — dolor sit amet preferences',
            '',
        ].join('\n'));
    }
    else {
        // Replace with fake memory content preserving frontmatter structure
        const hasFrontmatter = original.startsWith('---');
        if (hasFrontmatter) {
            writeFileSync(filePath, [
                '---',
                `name: ${name.replace('.md', '').replace(/_/g, ' ')}`,
                'description: Lorem ipsum dolor sit amet',
                'type: feedback',
                '---',
                '',
                nextLorem(20),
                '',
            ].join('\n'));
        }
        else {
            writeFileSync(filePath, loremForLength(original) + '\n');
        }
    }
    console.log(`  mem:   ${name}`);
}
// --- Rename project directories ---
function renameProjectDirs() {
    const projects = readdirSync(FIXTURES_DIR);
    let idx = 0;
    for (const project of projects) {
        const projectPath = join(FIXTURES_DIR, project);
        if (!statSync(projectPath).isDirectory())
            continue;
        const newName = `C--Users-anon-projects-${FAKE_DIRS[idx % FAKE_DIRS.length]}`;
        idx++;
        if (project === newName)
            continue;
        const newPath = join(FIXTURES_DIR, newName);
        if (existsSync(newPath)) {
            console.log(`  SKIP rename ${project} -> ${newName} (target exists)`);
            continue;
        }
        renameSync(projectPath, newPath);
        console.log(`  rename: ${project} -> ${newName}`);
    }
}
// --- Main ---
function walkAndProcess(dir) {
    const entries = readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
        const fullPath = join(dir, entry.name);
        if (entry.isDirectory()) {
            if (entry.name === 'memory') {
                // Process memory files
                const memFiles = readdirSync(fullPath);
                for (const f of memFiles) {
                    if (f.endsWith('.md')) {
                        processMemoryFile(join(fullPath, f));
                    }
                }
            }
            else {
                walkAndProcess(fullPath);
            }
        }
        else if (entry.name.endsWith('.jsonl')) {
            processJsonlFile(fullPath);
        }
        else if (entry.name.endsWith('.meta.json')) {
            processMetaJson(fullPath);
        }
        else if (entry.name.endsWith('.txt') && dir.includes('tool-results')) {
            processToolResult(fullPath);
        }
    }
}
console.log('Anonymizing fixtures in:', FIXTURES_DIR);
console.log();
console.log('Step 1: Scrambling file contents...');
walkAndProcess(FIXTURES_DIR);
console.log();
console.log('Step 2: Renaming project directories...');
renameProjectDirs();
console.log();
console.log('Done.');
//# sourceMappingURL=anonymize-fixtures.js.map