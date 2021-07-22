import { promises as fsP, createWriteStream } from 'fs'
import path from 'path'
import archiver from 'archiver'

type manifest = { extensionEntry?: string, moosyncExtension?: string, packageName?: string, name?: string, version?: string}

export async function validateManifest(basePath: string): Promise<string> {
    const manifestPath = path.join(basePath, 'package.json')
    try {

        // check if package.json exists
        fsP.access(manifestPath)

        const parsedManifest = await parseManifest(manifestPath)
        return generateFileName(basePath, parsedManifest)
    } catch (e) {
        console.error("Unable to parse package.json", e)
    }
    return ''
}

function generateFileName(basePath: string, manifest: manifest) {
    return path.join(basePath, `${manifest.packageName}-${manifest.version}.msox`)
}

export async function generateZip(basePath: string, target: string) {
    await removeFileIfExists(target)
    var output = createWriteStream(target);
    const zip = archiver('zip', { store: true })
    zip.pipe(output)
    zip.glob(`**/*`, {
        cwd: basePath,
        ignore: ['node_modules/**', '.git/**', '*.lock', '*.zip']
    })
    await zip.finalize()
}

async function removeFileIfExists(filePath: string) {
    try {
        await fsP.unlink(filePath)
    } catch (e) {
        return        
    }
}

function implementsTKeys<T>(obj: any, keys: (keyof T)[]): obj is T {
    if (!obj || !Array.isArray(keys)) {
        return false;
    }
    return keys.reduce((impl, key) => impl && key in obj, true);
}

async function parseManifest(manifestPath: string): Promise<manifest> {
    const manifest = JSON.parse(await fsP.readFile(manifestPath, 'utf-8'))
    if (implementsTKeys<manifest>(manifest, ['extensionEntry', 'moosyncExtension', 'name', 'packageName', 'version'])) {
        return manifest
    }
    throw new Error('Manifest must include fields "extensionEntry", "moosyncExtension", "name", "packageName", "version"')
}