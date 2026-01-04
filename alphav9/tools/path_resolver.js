const path = require('path');

const ROOT = path.join(__dirname, '..');
const DOCS = path.join(ROOT, 'docs');
const TOOLS = path.join(ROOT, 'tools');

module.exports = {
    ROOT,
    DOCS,
    TOOLS,
    SOURCES: {
        PROTOCOLS: path.join(TOOLS, 'protocols.json'),
        GOVERNANCE_CHANGELOG: path.join(TOOLS, 'governance_changelog.json'),
        STATUS: path.join(DOCS, 'status.json'),
        METADATA: path.join(DOCS, 'status_metadata.json'),
        CHANGELOG: path.join(DOCS, 'changelog.json'),
        ROADMAP: path.join(DOCS, 'roadmap.json'),
        REFACTOR_MATRIX: path.join(DOCS, 'refactor_matrix.json')
    },
    TARGETS: {
        README: path.join(DOCS, 'README.md'),
        PROTOCOLS_MD: path.join(TOOLS, 'PROTOCOLS.md')
    }
};
