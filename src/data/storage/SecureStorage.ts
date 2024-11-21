import CryptoJS from "crypto-js";

const SECRET_KEY = process.env.VITE_SESSION_SECRET_KEY ?? "default-secret-key";

export class SecureStorage {
  /**
   * Encrypt data before storing in sessionStorage
   * @param data - The data to encrypt
   * @returns Encrypted string
   */
  static encrypt(data: any): string {
    try {
      return CryptoJS.AES.encrypt(JSON.stringify(data), SECRET_KEY).toString();
    } catch (error) {
      console.error("Encryption error:", error);
      return "";
    }
  }

  /**
   * Decrypt data from sessionStorage
   * @param encryptedData - The encrypted string to decrypt
   * @returns Decrypted data or null
   */
  static decrypt(encryptedData: string): any {
    try {
      const bytes = CryptoJS.AES.decrypt(encryptedData, SECRET_KEY);
      return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    } catch (error) {
      console.error("Decryption error:", error);
      return null;
    }
  }

  /**
   * Save encrypted session data
   * @param key - Storage key
   * @param data - Data to store
   */
  static setItem(key: string, data: any): void {
    try {
      sessionStorage.setItem(key, this.encrypt(data));
    } catch (error) {
      console.error("Error storing encrypted data:", error);
    }
  }

  /**
   * Retrieve and decrypt session data
   * @param key - Storage key
   * @returns Decrypted data or null
   */
  static getItem(key: string): any {
    try {
      const encryptedData = sessionStorage.getItem(key);
      return encryptedData ? this.decrypt(encryptedData) : null;
    } catch (error) {
      console.error("Error retrieving encrypted data:", error);
      return null;
    }
  }

  /**
   * Remove item from sessionStorage
   * @param key - Storage key to remove
   */
  static removeItem(key: string): void {
    sessionStorage.removeItem(key);
  }

  /**
   * Clear all session storage
   */
  static clear(): void {
    sessionStorage.clear();
  }
}
