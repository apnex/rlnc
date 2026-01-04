const fs = require('fs');
const path = require('path');

const matrixPath = path.join(__dirname, '../docs/refactor_matrix.json');

function updateMatrix() {
    const args = process.argv.slice(2);
    if (args.length < 4) {
        console.error('Usage: node update_matrix.js "<title>" "<trigger>" "<sqa1,sqa2>" "<result>"');
        process.exit(1);
    }

    const [title, trigger, sqas, result] = args;
    const newEntry = {
        title,
        trigger,
        sqa_targeted: sqas.split(',').map(s => s.trim()),
        result,
        timestamp: new Date().toISOString()
    };

    let matrix = { refactors: [] };
    if (fs.existsSync(matrixPath)) {
        matrix = JSON.parse(fs.readFileSync(matrixPath, 'utf8'));
    }

    matrix.refactors.push(newEntry);
    fs.writeFileSync(matrixPath, JSON.stringify(matrix, null, 2));
    console.log(`[Success] Refactor Matrix updated: "${title}"`);
}

updateMatrix();
