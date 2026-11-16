import { useActionCreators, useDispatch, useSelector } from '@store/hooks'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
    customersActions,
    customersSelector,
} from '../../services/slice/customers'
import { fetchCustomersWithFilters } from '../../services/slice/customers/thunk'
import { AppRoute } from '../../utils/constants'
import Filter from '../filter'
import styles from './admin.module.scss'
import { customersFilterFields } from './helpers/customersFilterFields'
import { FiltersCustomers } from '../../services/slice/customers/type'

export default function AdminFilterCustomers() {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const [_, setSearchParams] = useSearchParams()
    const { updateFilter, clearFilters } = useActionCreators(customersActions)
    const filterCustomersOption = useSelector(
        customersSelector.selectFilterOption
    )
    const handleFilter = (filters: Record<string, unknown>) => {
        // The Filter component only emits fields defined in customersFilterFields.
        const normalized = Object.fromEntries(
            Object.entries(filters).map(([key, value]) => [
                key,
                value !== null && typeof value === 'object' && 'value' in value
                    ? value.value
                    : value,
            ])
        ) as Partial<FiltersCustomers>

        dispatch(updateFilter(normalized))
        const queryParams: Record<string, string> = {}
        Object.entries(normalized).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                queryParams[key] = String(value)
            }
        })
        setSearchParams(queryParams)
        navigate(`${AppRoute.AdminCustomers}?${new URLSearchParams(queryParams)}`)
    }

    const handleClearFilters = () => {
        dispatch(clearFilters())
        setSearchParams({})
        dispatch(fetchCustomersWithFilters({}))
        navigate(AppRoute.AdminCustomers)
    }

    return (
        <>
            <h2 className={styles.admin__title}>Фильтры</h2>
            <Filter
                fields={customersFilterFields}
                onFilter={handleFilter}
                defaultValue={filterCustomersOption}
                onClear={handleClearFilters}
            />
        </>
    )
}
