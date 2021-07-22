import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import path from 'path'
import { generateZip, validateManifest } from './utils.js'

const yarg = yargs(hideBin(process.argv))
const args = yarg.command('path', 'Path of extension').alias('p', 'path').argv

const extPath = path.resolve(process.cwd(), (await args)["path"] as string)

const outputFile = await validateManifest(extPath)
if (outputFile) {
    await generateZip(extPath, outputFile)
}

