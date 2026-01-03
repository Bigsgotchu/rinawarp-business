import crypto from 'crypto';
export function generateToken() {
    return crypto.randomBytes(24).toString('hex');
}
export function verifyToken(token, expectedToken) {
    return token === expectedToken;
}
