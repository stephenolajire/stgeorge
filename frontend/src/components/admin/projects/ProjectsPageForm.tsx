import { useState, type FormEvent } from 'react'
import { toast } from 'react-toastify'
import { useUpdateProjectsPage } from '../../../hooks/admin/projectsHook'
import { PUBLIC_PATHS } from '../../../routes/publicRoute'
import type { ProjectsPageContent } from '../../../types/admin'
import { getErrorMessage } from '../../../utils/apiError'
import HeroSectionEditor from '../about/HeroSectionEditor'
import PageOutline from '../parishLife/PageOutline'

export const PROJECTS_PAGE_FORM_ID = 'projects-page-form'

export default function ProjectsPageForm({ content }: { content: ProjectsPageContent }) {
  const [hero, setHero] = useState(content.hero)
  const { mutate: save } = useUpdateProjectsPage()

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!hero.title.trim()) return void toast.error('Enter the banner title.')
    save(
      { hero },
      {
        onSuccess: (saved) => {
          setHero((h) => ({ ...h, image: saved.hero.image }))
          toast.success('Projects page saved')
        },
        onError: (error) => toast.error(getErrorMessage(error, 'Could not save the page. Please try again.')),
      },
    )
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_17rem]">
      <form id={PROJECTS_PAGE_FORM_ID} onSubmit={submit} noValidate>
        <div id="hero" className="scroll-mt-20">
          <HeroSectionEditor value={hero} onChange={setHero} />
        </div>
      </form>
      <div className="xl:sticky xl:top-22 xl:self-start">
        <PageOutline
          publicPath={PUBLIC_PATHS.projects}
          items={[
            { id: 'hero', label: 'Hero Section' },
          ]}
        />
        <p className="mt-3 px-1 text-xs leading-relaxed text-muted">The project cards come from the project tabs. The banner photo fades in behind the text on the right.</p>
      </div>
    </div>
  )
}
