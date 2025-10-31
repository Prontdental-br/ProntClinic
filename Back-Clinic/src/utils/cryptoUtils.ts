/* eslint-disable prettier/prettier */
import * as crypto from 'crypto';

// Cria chave de 32 bytes usando SHA-256
const AES_SECRET_KEY = crypto.createHash('sha256')
  .update(process.env.AES_SECRET_KEY || 'minhaChaveSecreta!')
  .digest(); // Buffer de 32 bytes

// IV fixo de 16 bytes
const AES_IV = Buffer.from((process.env.AES_IV || '1234567890123456').slice(0, 16), 'utf8');

export class CryptoUtils {
  static encrypt(text: string): string {
    // Converte para Uint8Array para compatibilidade com Node 20+
    const key = new Uint8Array(AES_SECRET_KEY);
    const iv = new Uint8Array(AES_IV);

    // Força algoritmo para evitar erro de tipo (GCM vs CBC)
    const cipher = crypto.createCipheriv('aes-256-cbc' as string, key, iv);

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    return encrypted;
  }

  static decrypt(encryptedText: string): string {
    const key = new Uint8Array(AES_SECRET_KEY);
    const iv = new Uint8Array(AES_IV);

    const decipher = crypto.createDecipheriv('aes-256-cbc' as string, key, iv);

    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }
}
