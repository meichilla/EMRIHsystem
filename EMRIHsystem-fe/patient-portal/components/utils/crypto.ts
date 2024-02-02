import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
  pbkdf2Sync,
} from 'crypto';

// const passphrase = 'dappemr@890';
// const salt = randomBytes(16);
// const iterations = 10000;
// const keyLength = 32; // 32 bytes for AES-256

// const derivedKey = pbkdf2Sync(
//   passphrase,
//   salt,
//   iterations,
//   keyLength,
//   'sha256',
// );
const key = `f0cc970173bc7731347b532fa1f037c695836ba3f9615a67dc55bdfe8f4a5b95`//derivedKey.toString('hex');
const algorithm = 'aes-256-cbc';

export const encrypt = (text: string): string => {
  const iv = randomBytes(16);
  const cipher = createCipheriv(algorithm, Buffer.from(key, 'hex'), iv);
  let encrypted = cipher.update(text, 'utf-8', 'hex');
  encrypted += cipher.final('hex');
  return `${iv.toString('hex')}:${encrypted}`;
};

export const decrypt = (text: string): string => {
  const parts = text.split(':');
  const decipher = createDecipheriv(
    algorithm,
    Buffer.from(key, 'hex'),
    Buffer.from(parts[0], 'hex'),
  );
  let decrypted = decipher.update(parts[1], 'hex', 'utf-8');
  decrypted += decipher.final('utf-8');
  return decrypted;
};
