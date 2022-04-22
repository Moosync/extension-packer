#!/usr/bin/env node

import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import path from "path";
import { generateZip, validateManifest, generateFileName } from "./utils";

const yarg = yargs(hideBin(process.argv)).options({
    path: { type: "string", default: ".", alias: "p", describe: "Path of extension"}
});

const extPath = path.resolve(process.cwd(), yarg.parseSync().path);

validateManifest(extPath).then(manifest => {
    if (manifest && manifest.name) {
        const outputFile = generateFileName(process.cwd(), manifest);
        if (outputFile) {
            generateZip(extPath, outputFile, manifest.mopack);
        }
    }
});
