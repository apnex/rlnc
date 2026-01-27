/**
 * RLNC Data Structure
 * @warden-purpose Represents a single linear combination and its coefficients.
 * @warden-scope Transport Layer
 */
class CodedPiece {
    constructor(genId, coeffs, data) {
        this.genId = genId;
        this.coeffs = coeffs; // Uint8Array
        this.data = data;     // Uint8Array
    }
}
module.exports = CodedPiece;
