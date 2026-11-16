import { Request } from 'express'
import BadRequestError from '../errors/bad-request-error'

/** Reject nested MongoDB operators and arrays in list query parameters. */
export const validateFlatQuery = (query: Request['query']) => {
    const invalid = Object.entries(query).some(
        ([key, value]) => !/^[a-zA-Z][a-zA-Z0-9]*$/.test(key) ||
            typeof value !== 'string'
    )
    if (invalid) {
        throw new BadRequestError('Некорректные параметры запроса')
    }
}

/** Apply the same server-side page limit to database queries and API metadata. */
export const normalizePagination = (query: Request['query'], defaultLimit = 10) => {
    const positiveInteger = (value: unknown, fallback: number): number => {
        if (value === undefined || value === '') return fallback
        if (typeof value !== 'string' || !/^\d{1,8}$/.test(value)) {
            throw new BadRequestError('Некорректные параметры пагинации')
        }
        return Math.max(1, Number(value))
    }

    const currentPage = positiveInteger(query.page, 1)
    const pageSize = Math.min(10, positiveInteger(query.limit, defaultLimit))

    return {
        currentPage,
        pageSize,
        skip: (currentPage - 1) * pageSize,
    }
}
