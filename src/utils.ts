import { promises as fsP, createWriteStream } from "fs";
import path from "path";
import archiver from "archiver";

type mopackOptions = { include?: string | string[], exclude?: string | string[] }
type manifest = { extensionEntry?: string, moosyncExtension?: string, displayName?: string, name?: string, version?: string, mopack?: mopackOptions}

export async function validateManifest(basePath: string): Promise<manifest> {
    const manifestPath = path.join(basePath, "package.json");
    try {
        // check if package.json exists
        await fsP.access(manifestPath);
        const parsedManifest = await parseManifest(manifestPath);
        await fsP.access(parsedManifest.extensionEntry);
        return parsedManifest;
    } catch (e) {
        console.error("Unable to parse package.json", (e as Error).message);
    }
    return {};
}

export function generateFileName(basePath: string, manifest: manifest) {
    return path.join(basePath, `${manifest.name}-${manifest.version}.msox`);
}

export async function generateZip(basePath: string, target: string, options?: mopackOptions) {
    await removeFileIfExists(target);
    const output = createWriteStream(target);
    const zip = archiver("zip", { store: true });
    let ignore: string[] = [];

    if (options && options.exclude) {
        ignore = (Array.isArray(options.exclude) ? options.exclude : [options.exclude]);
    }

    zip.pipe(output);
    zip.glob("**/*", {
        cwd: basePath,
        ignore: ["node_modules/**", ".git/**", "*.lock", "*.zip", "*.msox", ...ignore]
    });

    if (options && options.include) {
        if (!Array.isArray(options.include)) {
            options.include = [options.include];
        }
        for (const inc of options.include) {
            zip.glob(inc, { cwd: basePath });
        }
    }

    await zip.finalize();
}

async function removeFileIfExists(filePath: string) {
    try {
        await fsP.unlink(filePath);
    } catch (e) {
        return;        
    }
}

function implementsTKeys<T>(obj: any, keys: string[]): obj is T {
    if (!obj || !Array.isArray(keys)) {
        return false;
    }
    return keys.reduce((impl, key) => impl && key in obj, true);
}

async function parseManifest(manifestPath: string): Promise<manifest> {
    const manifest = JSON.parse(await fsP.readFile(manifestPath, "utf-8"));
    if (implementsTKeys<manifest>(manifest, ["extensionEntry", "moosyncExtension", "name", "displayName", "version"])) {
        return manifest;
    }
    throw new Error("Manifest must include fields extensionEntry, moosyncExtension, name, displayName, version");
}