#!/usr/bin/env node

import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import path from 'path'
import { generateZip, validateManifest, generateFileName } from './utils.js'

const yarg = yargs(hideBin(process.argv))
const args = yarg.command('path', 'Path of extension').alias('p', 'path').argv

const extPath = path.resolve(process.cwd(), (await args)["path"] as string)

const manifest = await validateManifest(extPath)
if (manifest) {
    const outputFile = await generateFileName(extPath, manifest)
    if (outputFile) {
        await generateZip(extPath, outputFile, manifest.mopack)
    }
}