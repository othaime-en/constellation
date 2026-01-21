const fs = require('fs').promises;
const path = require('path');
const os = require('os');

const CACHE_DIR = path.join(os.homedir(), '.github-constellation-cache');
const CACHE_DURATION = 2 * 60 * 60 * 1000; // 2 hours

async function ensureCacheDir() {
    try {
        await fs.mkdir(CACHE_DIR, { recursive: true });
    } catch (error) {
        // Dir might already exist
    }
}

async function getCache(key) {
    await ensureCacheDir();
    const cachePath = path.join(CACHE_DIR, `${key}.json`);

    try {
        const stats = await fs.stat(cachePath);
        const now = Date.now();

        // cache still valid?
        if (now - stats.mtimeMs > CACHE_DURATION) {
            return null;
        }

        const data = await fs.readFile(cachePath, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        return null;
    }
}

async function setCache(key, data) {
    await ensureCacheDir();
    const cachePath = path.join(CACHE_DIR, `${key}.json`);
    await fs.writeFile(cachePath, JSON.stringify(data, null, 2));
}

module.exports = { getCache, setCache };