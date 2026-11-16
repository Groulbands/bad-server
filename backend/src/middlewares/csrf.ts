import crypto from 'crypto'
import { Request, Response, NextFunction } from 'express'
import { REFRESH_TOKEN } from '../config'
import ForbiddenError from '../errors/forbidden-error'

export function setCsrfCookie(res: Response, refreshToken: string) {
    const token = crypto.createHmac('sha256', REFRESH_TOKEN.secret).update(refreshToken).digest('hex')
    res.cookie('csrfToken', token, {
        sameSite: 'lax',
        secure: REFRESH_TOKEN.cookie.options.secure,
        httpOnly: false,
        path: '/',
        maxAge: REFRESH_TOKEN.cookie.options.maxAge,
    })
}

export function verifyCsrf(req: Request, _res: Response, next: NextFunction) {
    const refreshToken = req.cookies?.[REFRESH_TOKEN.cookie.name]
    const provided = req.get('X-CSRF-Token')
    if (typeof refreshToken !== 'string' || typeof provided !== 'string') {
        return next(new ForbiddenError('Недействительный CSRF-токен'))
    }
    const expected = crypto.createHmac('sha256', REFRESH_TOKEN.secret).update(refreshToken).digest('hex')
    const actualBuffer = Buffer.from(provided)
    const expectedBuffer = Buffer.from(expected)
    if (actualBuffer.length !== expectedBuffer.length ||
        !crypto.timingSafeEqual(actualBuffer, expectedBuffer)) {
        return next(new ForbiddenError('Недействительный CSRF-токен'))
    }
    return next()
}
