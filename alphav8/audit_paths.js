const fs = require('fs');
const path = require('path');
const { builtinModules } = require('module');

const ROOT = process.cwd();
const IGNORE_DIRS = ['node_modules', '.git', 'docs', 'coverage'];

function auditDir(dir) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            if (!IGNORE_DIRS.includes(file)) auditDir(fullPath);
        } else if (file.endsWith('.js')) {
            checkFilePaths(fullPath);
        }
    });
}

function checkFilePaths(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    const relativeFilePath = path.relative(ROOT, filePath);
    const dirOfFile = path.dirname(filePath);
    
    // Detects any string starting with ./ or ../
    const genericPathRegex = /['"](\.\.?\/.*?)['"]/g;

    let fileHeaderPrinted = false;

    lines.forEach((line, index) => {
        let match;
        while ((match = genericPathRegex.exec(line)) !== null) {
            const rawPath = match[1];

            // Filter 1: Ignore Node.js built-ins
            if (builtinModules.includes(rawPath)) continue;

            const resolvedPath = path.resolve(dirOfFile, rawPath);
            const exists = fs.existsSync(resolvedPath) || fs.existsSync(resolvedPath + '.js');

            if (!fileHeaderPrinted) {
                console.log(`\n📄 File: ${relativeFilePath}`);
                fileHeaderPrinted = true;
            }

            if (!exists) {
                console.log(`  ❌ Line ${index + 1}: Broken Path -> "${rawPath}"`);
            } else {
                // Filter 2: The Robustness Check
                // Ignore if it's a require() or if it already uses __dirname
                const isRequire = line.includes('require(');
                const isAnchored = line.includes('__dirname');

                if (!isRequire && !isAnchored) {
                    console.log(`  ⚠️  Line ${index + 1}: Brittle Path -> "${rawPath}"`);
                    console.log(`      Context: ${line.trim()}`);
                    console.log(`      Fix: Use path.join(__dirname, '${rawPath}') for runtime stability.`);
                }
            }
        }
    });
}

console.log("🔍 Starting ALPHAv6 Robustness Audit...");
auditDir(ROOT);
console.log("\n✅ Audit complete.");
