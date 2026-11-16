import { Request, Express } from 'express'
import multer, { FileFilterCallback } from 'multer'
import { mkdirSync } from 'fs'
import { join } from 'path'
import { randomUUID } from 'crypto'

const uploadDir = join(__dirname, '../public', process.env.UPLOAD_PATH_TEMP || 'temp')
const extensions: Record<string, string> = {
    'image/png': '.png',
    'image/jpeg': '.jpg',
    'image/gif': '.gif',
}

const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        mkdirSync(uploadDir, { recursive: true })
        cb(null, uploadDir)
    },
    filename: (_req: Request, file: Express.Multer.File, cb) => {
        cb(null, `${randomUUID()}${extensions[file.mimetype]}`)
    },
})

const fileFilter = (_req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    cb(null, Boolean(extensions[file.mimetype]))
}

export default multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024, files: 1 } })
