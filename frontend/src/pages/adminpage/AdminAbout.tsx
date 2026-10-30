import AboutPageForm from '../../components/admin/about/AboutPageForm'
import { ErrorCard, LoadingCard } from '../../components/admin/common/QueryState'
import { useAboutPage } from '../../hooks/admin/aboutHook'
import { getErrorMessage } from '../../utils/apiError'

export default function AdminAbout() {
  const { data, isPending, isError, error, refetch } = useAboutPage()

  if (isPending) return <LoadingCard label="Loading About page..." />
  if (isError) return <ErrorCard message={getErrorMessage(error, 'Could not load the About page.')} onRetry={() => refetch()} />

  return <AboutPageForm initialContent={data} />
}
