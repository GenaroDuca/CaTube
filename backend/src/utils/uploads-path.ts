import * as path from 'path';
import * as fs from 'fs';

export function getUploadsPath(...subpaths: string[]) {
    const candidates = [
        path.resolve(process.cwd(), 'backend', 'uploads'),
        path.resolve(process.cwd(), 'uploads'),
        path.resolve(__dirname, '..', '..', 'uploads'),
        path.resolve(__dirname, '..', '..', '..', 'uploads'),
        path.resolve(__dirname, '..', 'uploads'),
    ];

    for (const base of candidates) {
        try {
            if (fs.existsSync(base)) {
                return path.join(base, ...subpaths);
            }
        } catch (e) {
        }
    }

    const fallback = path.resolve(process.cwd(), 'uploads');
    fs.mkdirSync(path.join(fallback, ...subpaths), { recursive: true });
    return path.join(fallback, ...subpaths);
}