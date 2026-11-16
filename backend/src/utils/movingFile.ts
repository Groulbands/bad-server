import { promises as fs } from 'fs'
import { basename, join } from 'path'
import BadRequestError from '../errors/bad-request-error'

async function movingFile(imagePath: string, from: string, to: string) {
    // Never trust a path submitted by a client, even if a file was uploaded previously.
    const fileName = basename(imagePath)
    if (!/^[a-f0-9-]{36}\.(png|jpg|gif)$/.test(fileName) ||
        !imagePath.endsWith(`/${fileName}`)) {
        throw new BadRequestError('Недопустимое имя файла')
    }
    await fs.mkdir(to, { recursive: true })
    await fs.rename(join(from, fileName), join(to, fileName))
}

export default movingFile
