import { AsyncThunk } from '@reduxjs/toolkit'
import { useDispatch, useSelector } from '@store/hooks'
import { AppDispatch, RootState } from '@store/store'
import { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { WebLarekAPI } from '../../../utils/weblarek-api'

interface PaginationResult<U> {
    data: U[]
    totalPages: number
    currentPage: number
    limit: number
    nextPage: () => void
    prevPage: () => void
    setPage: (page: number) => void
    setLimit: (limit: number) => void
}

type PaginationResponse = { pagination: { totalPages: number } }
type AppThunkConfig = {
    extra: WebLarekAPI
    state: RootState
    dispatch: AppDispatch
}

const usePagination = <T extends PaginationResponse, U>(
    asyncAction: AsyncThunk<T, Record<string, unknown>, AppThunkConfig>,
    selector: (state: RootState) => U[],
    defaultLimit: number
): PaginationResult<U> => {
    const dispatch = useDispatch()
    const data = useSelector(selector)
    const [searchParams, setSearchParams] = useSearchParams()
    const [totalPages, setTotalPages] = useState<number>(1)

    const currentPage = Math.max(1, Number(searchParams.get('page')) || 1)
    const limit = Math.max(1, Number(searchParams.get('limit')) || defaultLimit)

    const updateURL = useCallback(
        (newParams: Record<string, string | number | undefined>) => {
            const updatedParams = new URLSearchParams(searchParams)
            Object.entries(newParams).forEach(([key, value]) => {
                if (value !== undefined) {
                    updatedParams.set(key, String(value))
                } else {
                    updatedParams.delete(key)
                }
            })
            setSearchParams(updatedParams)
        },
        [searchParams, setSearchParams]
    )

    const setPage = useCallback(
        (page: number) => {
            updateURL({ page: Math.max(1, Math.min(page, totalPages)), limit })
        },
        [limit, totalPages, updateURL]
    )

    useEffect(() => {
        let cancelled = false
        const params = Object.fromEntries(searchParams.entries())
        dispatch(asyncAction({ ...params, page: currentPage, limit }))
            .unwrap()
            .then((result) => {
                if (cancelled) return
                const pages = Math.max(1, result.pagination.totalPages)
                setTotalPages(pages)
                if (currentPage > pages) {
                    updateURL({ page: pages, limit })
                }
            })
            .catch(() => {
                // A rejected request is handled by the corresponding Redux slice.
            })
        return () => {
            cancelled = true
        }
    }, [asyncAction, currentPage, dispatch, limit, searchParams, updateURL])

    const nextPage = () => {
        if (currentPage < totalPages) {
            updateURL({ page: currentPage + 1, limit })
        }
    }

    const prevPage = () => {
        if (currentPage > 1) {
            updateURL({ page: currentPage - 1, limit })
        }
    }

    const setLimit = (newLimit: number) => {
        updateURL({ page: 1, limit: newLimit })
    }

    return { data, totalPages, currentPage, limit, nextPage, prevPage, setPage, setLimit }
}

export default usePagination
