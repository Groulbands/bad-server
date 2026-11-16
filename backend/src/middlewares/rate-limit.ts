import { Request, Response, NextFunction } from 'express'

const clients = new Map<string, { count: number; resetAt: number }>()
export const rateLimit = (maxRequests: number, windowMs: number) =>
    (req: Request, res: Response, next: NextFunction) => {
        const now = Date.now()
        const key = req.ip || 'unknown'
        const item = clients.get(key)
        if (!item || item.resetAt <= now) {
            clients.set(key, { count: 1, resetAt: now + windowMs })
        } else {
            item.count += 1
            if (item.count > maxRequests) {
                return res.status(429).json({ message: 'Слишком много запросов' })
            }
        }
        if (clients.size > 10000) {
            clients.forEach((value, ip) => {
                if (value.resetAt <= now) clients.delete(ip)
            })
            if (clients.size > 10000) {
                const oldestKey = clients.keys().next().value as string | undefined
                if (oldestKey) clients.delete(oldestKey)
            }
        }
        return next()
    }
