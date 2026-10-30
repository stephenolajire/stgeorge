import { ErrorCard, LoadingCard } from '../../components/admin/common/QueryState'
import ParishLifeForm from '../../components/admin/parishLife/ParishLifeForm'
import { useAdminParishGroups, useParishLifePage } from '../../hooks/admin/parishLifeHook'
import { getErrorMessage } from '../../utils/apiError'

export default function AdminParishLife() {
  const page = useParishLifePage()
  const groups = useAdminParishGroups()

  if (page.isPending || groups.isPending) return <LoadingCard label="Loading Parish Life page..." />
  if (page.isError || groups.isError) {
    const error = page.error ?? groups.error
    return (
      <ErrorCard
        message={getErrorMessage(error, 'Could not load the Parish Life page.')}
        onRetry={() => {
          page.refetch()
          groups.refetch()
        }}
      />
    )
  }

  return <ParishLifeForm content={page.data} groups={groups.data} />
}
