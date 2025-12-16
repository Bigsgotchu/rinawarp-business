// Security: OS keychain + runtime encryption for secrets
const { safeStorage } = require('electron');

let keytar;
try {
  keytar = require('keytar');
} catch (_e) {
  console.warn('[SecureStore] keytar not available, using fallback storage');
}

const SERVICE_NAME = 'rinawarp-terminal-pro';

async function saveToken(account, token) {
  if (!token) return;

  try {
    const enc = safeStorage.isEncryptionAvailable()
      ? safeStorage.encryptString(token).toString('base64')
      : token;

    if (keytar) {
      await keytar.setPassword(SERVICE_NAME, account, enc);
      console.log('[SecureStore] Token saved to keychain', { account });
    } else {
      // Fallback: store encrypted in electron-store
      const { default: Store } = await import('electron-store');
      const store = new Store({ projectName: 'rinawarp-terminal-pro' });
      store.set(`secure_${account}`, enc);
      console.warn('[SecureStore] Token saved to fallback storage (keytar unavailable)', {
        account,
      });
    }
  } catch (e) {
    console.error('[SecureStore] Failed to save token', { error: e.message, account });
    throw e;
  }
}

async function getToken(account) {
  try {
    let enc;
    if (keytar) {
      enc = await keytar.getPassword(SERVICE_NAME, account);
    } else {
      const { default: Store } = await import('electron-store');
      const store = new Store({ projectName: 'rinawarp-terminal-pro' });
      enc = store.get(`secure_${account}`);
    }

    if (!enc) return null;

    return safeStorage.isEncryptionAvailable()
      ? safeStorage.decryptString(Buffer.from(enc, 'base64'))
      : enc;
  } catch (e) {
    console.error('[SecureStore] Failed to get token', { error: e.message, account });
    return null;
  }
}

async function deleteToken(account) {
  try {
    if (keytar) {
      await keytar.deletePassword(SERVICE_NAME, account);
    } else {
      const { default: Store } = await import('electron-store');
      const store = new Store({ projectName: 'rinawarp-terminal-pro' });
      store.delete(`secure_${account}`);
    }
    console.log('[SecureStore] Token deleted', { account });
  } catch (e) {
    console.error('[SecureStore] Failed to delete token', { error: e.message, account });
  }
}

module.exports = { saveToken, getToken, deleteToken };
