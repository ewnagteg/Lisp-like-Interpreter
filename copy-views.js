import { existsSync, mkdirSync, readdirSync, lstatSync, copyFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const srcDir = join(__dirname, 'views');
const destDir = join(__dirname, 'dist', 'views');

function copyRecursive(src, dest) {
    if (!existsSync(src)) return;
    if (!existsSync(dest)) mkdirSync(dest, { recursive: true });
    for (const entry of readdirSync(src)) {
        const srcPath = join(src, entry);
        const destPath = join(dest, entry);
        if (lstatSync(srcPath).isDirectory()) {
            copyRecursive(srcPath, destPath);
        } else {
            copyFileSync(srcPath, destPath);
        }
    }
}

copyRecursive(srcDir, destDir);