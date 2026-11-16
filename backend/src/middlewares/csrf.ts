import crypto from 'crypto'
import { Request, Response, NextFunction } from 'express'
import { REFRESH_TOKEN } from '../config'
import ForbiddenError from '../errors/forbidden-error'

const ANONYMOUS_CSRF_COOKIE = '_csrf'

const signToken = (value: string) => crypto
    .createHmac('sha256', REFRESH_TOKEN.secret)
    .update(value)
    .digest('hex')

const tokenMatches = (provided: string, expected: string) => {
    const actualBuffer = Buffer.from(provided)
    const expectedBuffer = Buffer.from(expected)
    return actualBuffer.length === expectedBuffer.length &&
        crypto.timingSafeEqual(actualBuffer, expectedBuffer)
}

// The public endpoint is used by automation and by the browser before login.
// Keep a random nonce in a SameSite, HttpOnly cookie and return only its HMAC.
export function getCsrfToken(_req: Request, res: Response) {
    const nonce = crypto.randomBytes(32).toString('hex')
    res.cookie(ANONYMOUS_CSRF_COOKIE, nonce, {
        httpOnly: true,
        sameSite: 'lax',
        secure: REFRESH_TOKEN.cookie.options.secure,
        path: '/',
        maxAge: REFRESH_TOKEN.cookie.options.maxAge,
    })
    res.set('Cache-Control', 'no-store')
    return res.json({ csrfToken: signToken(`anonymous:${nonce}`) })
}

// The anonymous token is required for login/registration, to prevent login CSRF.
export function verifyAnonymousCsrf(req: Request, _res: Response, next: NextFunction) {
    const provided = req.get('X-CSRF-Token')
    const nonce = req.cookies?.[ANONYMOUS_CSRF_COOKIE]
    if (typeof provided !== 'string' || typeof nonce !== 'string' ||
        !tokenMatches(provided, signToken(`anonymous:${nonce}`))) {
        return next(new ForbiddenError('Недействительный CSRF-токен'))
    }
    return next()
}

// The app uses a separate, refresh-token-bound cookie for logged-in requests.
export function setCsrfCookie(res: Response, refreshToken: string) {
    res.cookie('csrfToken', signToken(refreshToken), {
        sameSite: 'lax',
        secure: REFRESH_TOKEN.cookie.options.secure,
        httpOnly: false,
        path: '/',
        maxAge: REFRESH_TOKEN.cookie.options.maxAge,
    })
}

export function verifyCsrf(req: Request, _res: Response, next: NextFunction) {
    const provided = req.get('X-CSRF-Token')
    if (typeof provided !== 'string') {
        return next(new ForbiddenError('Недействительный CSRF-токен'))
    }

    const refreshToken = req.cookies?.[REFRESH_TOKEN.cookie.name]
    const nonce = req.cookies?.[ANONYMOUS_CSRF_COOKIE]
    const authenticatedMatch = typeof refreshToken === 'string' &&
        tokenMatches(provided, signToken(refreshToken))
    const anonymousMatch = typeof nonce === 'string' &&
        tokenMatches(provided, signToken(`anonymous:${nonce}`))

    if (!authenticatedMatch && !anonymousMatch) {
        return next(new ForbiddenError('Недействительный CSRF-токен'))
    }
    return next()
}
