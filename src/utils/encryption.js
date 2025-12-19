import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const SALT_LENGTH = 64;
const TAG_LENGTH = 16;
const KEY_LENGTH = 32;

// Get encryption key from environment or generate one
function getEncryptionKey() {
    const key = process.env.ENCRYPTION_KEY;
    if (!key) {
        throw new Error('ENCRYPTION_KEY environment variable is required');
    }
    if (key.length < 32) {
        throw new Error('ENCRYPTION_KEY must be at least 32 characters long');
    }
    return crypto.scryptSync(key, 'salt', KEY_LENGTH);
}

// Encrypt sensitive data
export function encrypt(text) {
    if (!text) return null;
    
    try {
        const key = getEncryptionKey();
        const iv = crypto.randomBytes(IV_LENGTH);
        const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
        
        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        const tag = cipher.getAuthTag();
        
        return iv.toString('hex') + ':' + tag.toString('hex') + ':' + encrypted;
    } catch (error) {
        throw new Error('Encryption failed: ' + error.message);
    }
}

// Decrypt sensitive data
export function decrypt(encryptedText) {
    if (!encryptedText) return null;
    
    try {
        const key = getEncryptionKey();
        const parts = encryptedText.split(':');
        if (parts.length !== 3) {
            throw new Error('Invalid encrypted data format');
        }
        
        const iv = Buffer.from(parts[0], 'hex');
        const tag = Buffer.from(parts[1], 'hex');
        const encrypted = parts[2];
        
        const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
        decipher.setAuthTag(tag);
        
        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        
        return decrypted;
    } catch (error) {
        throw new Error('Decryption failed: ' + error.message);
    }
}

// Hash sensitive data (one-way)
export function hash(data) {
    if (!data) return null;
    return crypto.createHash('sha256').update(data).digest('hex');
}

// Generate secure random token
export function generateSecureToken(length = 32) {
    return crypto.randomBytes(length).toString('hex');
}

// Generate secure random string
export function generateSecureString(length = 16) {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const randomBytes = crypto.randomBytes(length);
    let result = '';
    for (let i = 0; i < length; i++) {
        result += charset[randomBytes[i] % charset.length];
    }
    return result;
}

