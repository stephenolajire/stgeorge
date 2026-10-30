import { useIsMutating } from '@tanstack/react-query'
import { Download, LayoutList, Mail, Save } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'react-toastify'
import Button from '../../components/admin/common/Button'
import PageHeader from '../../components/admin/common/PageHeader'
import { ErrorCard, LoadingCard } from '../../components/admin/common/QueryState'
import Tabs from '../../components/admin/common/Tabs'
import HomePageForm, { HOME_PAGE_FORM_ID } from '../../components/admin/home/HomePageForm'
import SubscribersPanel from '../../components/admin/home/SubscribersPanel'
import { updateHomePageMutationKey, useHomePage, useSubscribers } from '../../hooks/admin/homeHook'
import { useDebouncedValue } from '../../hooks/useDebouncedValue'
import { homeService } from '../../services/admin/homeService'
import { getErrorMessage } from '../../utils/apiError'

type Tab = 'page' | 'subscribers'

export default function AdminHome() {
  const [tab, setTab] = useState<Tab>('page')
  const [search, setSearch] = useState('')
  const [exporting, setExporting] = useState(false)
  const debouncedSearch = useDebouncedValue(search.trim())
  const page = useHomePage()
  const subscriberCount = useSubscribers({ search: '', page: 1 }).data?.count
  const saving = useIsMutating({ mutationKey: updateHomePageMutationKey }) > 0

  const exportCsv = async () => {
    setExporting(true)
    try {
      await homeService.exportSubscribers(debouncedSearch)
    } catch (e) {
      toast.error(getErrorMessage(e, 'Could not export. Please try again.'))
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Home Page"
        subtitle="Manage the content of your website’s Home page."
        breadcrumb={[{ label: 'Content' }, { label: 'Home Page' }]}
        actions={
          tab === 'page' ? (
            <Button type="submit" form={HOME_PAGE_FORM_ID} disabled={saving || !page.data}>
              <Save className="size-4" /> {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          ) : (
            <Button variant="outline" onClick={exportCsv} disabled={exporting || !subscriberCount}>
              <Download className="size-4" /> {exporting ? 'Exporting...' : 'Export CSV'}
            </Button>
          )
        }
      />

      <Tabs
        label="Home page sections"
        value={tab}
        onChange={setTab}
        items={[
          { value: 'page', label: 'Page Content', icon: LayoutList },
          { value: 'subscribers', label: `Subscribers (${subscriberCount ?? 0})`, icon: Mail },
        ]}
      />

      {tab === 'subscribers' ? (
        <SubscribersPanel search={debouncedSearch} onSearch={setSearch} />
      ) : page.isPending ? (
        <LoadingCard label="Loading Home page..." />
      ) : page.isError ? (
        <ErrorCard message={getErrorMessage(page.error, 'Could not load the Home page.')} onRetry={() => page.refetch()} />
      ) : (
        <HomePageForm content={page.data} />
      )}
    </div>
  )
}
