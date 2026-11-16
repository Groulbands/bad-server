import { ErrorRequestHandler } from 'express'

const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
    const statusCode = err.statusCode || 500
    const message =
        statusCode === 500 ? 'На сервере произошла ошибка' : err.message
    if (statusCode >= 500) console.error('Internal server error')

    res.status(statusCode).send({ message })

    // Response has been sent; do not pass the error further.
}

export default errorHandler
