import { NextFunction, Request, Response } from 'express'
import { constants } from 'http2'
import { promises as fs } from 'fs'
import BadRequestError from '../errors/bad-request-error'

const signatures: Record<string, number[]> = {
    'image/png': [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a],
    'image/jpeg': [0xff, 0xd8, 0xff],
    'image/gif': [0x47, 0x49, 0x46, 0x38],
}

export const uploadFile = async (req: Request, res: Response, next: NextFunction) => {
    if (!req.file) return next(new BadRequestError('Файл не загружен'))
    try {
        if (req.file.size <= 2 * 1024) {
            await fs.unlink(req.file.path)
            return next(new BadRequestError('Размер изображения должен превышать 2 КБ'))
        }
        const file = await fs.open(req.file.path, 'r')
        const buffer = Buffer.alloc(8)
        await file.read(buffer, 0, 8, 0)
        await file.close()
        const signature = signatures[req.file.mimetype]
        if (!signature || !signature.every((byte, index) => buffer[index] === byte)) {
            await fs.unlink(req.file.path)
            return next(new BadRequestError('Недопустимый формат изображения'))
        }
        const fileName = `/${process.env.UPLOAD_PATH || 'images'}/${req.file.filename}`
        return res.status(constants.HTTP_STATUS_CREATED).send({
            fileName,
            originalName: req.file.originalname,
        })
    } catch (error) {
        return next(error)
    }
}
