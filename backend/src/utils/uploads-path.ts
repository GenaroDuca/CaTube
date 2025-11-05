import * as path from 'path';
import * as fs from 'fs';

/**
 * Devuelve una ruta consistente al directorio de uploads y permite pasar subcarpetas.
 * Intenta varias ubicaciones comunes (repo root, backend folder, paths relativos a __dirname)
 * y devuelve la primera que exista. Si ninguna existe, crea `process.cwd()/uploads`.
 */
export function getUploadsPath(...subpaths: string[]) {
    const candidates = [
        path.resolve(process.cwd(), 'backend', 'uploads'), // when started from repo root
        path.resolve(process.cwd(), 'uploads'), // when started with cwd=backend
        path.resolve(__dirname, '..', '..', 'uploads'), // relative to src (dev)
        path.resolve(__dirname, '..', '..', '..', 'uploads'), // possible other build layouts
        path.resolve(__dirname, '..', 'uploads'),
    ];

    for (const base of candidates) {
        try {
            if (fs.existsSync(base)) {
                return path.join(base, ...subpaths);
            }
        } catch (e) {
            // ignore and try next
        }
    }

    // Ninguna candidata existía; usaremos process.cwd()/uploads como directorio por defecto
    const fallback = path.resolve(process.cwd(), 'uploads');
    fs.mkdirSync(path.join(fallback, ...subpaths), { recursive: true });
    return path.join(fallback, ...subpaths);
}
