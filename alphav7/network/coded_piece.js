class CodedPiece {
    constructor(genId, coeffs, data) {
        this.genId = genId;
        this.coeffs = coeffs; // Uint8Array
        this.data = data;     // Uint8Array
    }
}
module.exports = CodedPiece;
