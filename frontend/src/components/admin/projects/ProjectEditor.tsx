import { isAxiosError } from 'axios'
import { FolderKanban, Save, Trash2 } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { toast } from 'react-toastify'
import { useSaveProject } from '../../../hooks/admin/projectsHook'
import type { CategoryOption, Project, ProjectForm } from '../../../types/admin'
import { getErrorMessage } from '../../../utils/apiError'
import { PROJECT_STATUS_OPTIONS } from '../../../utils/projects'
import Button from '../common/Button'
import FormField from '../common/FormField'
import ImagePickerField from '../common/ImagePickerField'
import { SelectField } from '../common/Select'
import TextAreaField from '../common/TextAreaField'

type Errors = Partial<Record<keyof ProjectForm, string>>
const API_FIELDS: Record<string, keyof ProjectForm> = {
  title: 'title',
  category: 'category',
  status: 'status',
  short_description: 'shortDescription',
  content: 'content',
  image: 'image',
  progress: 'progress',
  target_amount: 'targetAmount',
  target_date: 'targetDate',
}

function toForm(project: Project | null, categories: CategoryOption[]): ProjectForm {
  if (!project) {
    return {
      title: '',
      category: categories[0]?.value ?? 'other',
      status: 'ongoing',
      shortDescription: '',
      content: '',
      image: null,
      progress: '0',
      targetAmount: '',
      targetDate: '',
    }
  }
  return {
    title: project.title,
    category: project.category,
    status: project.status,
    shortDescription: project.shortDescription,
    content: project.content,
    image: project.image ? { url: project.image } : null,
    progress: String(project.progress),
    targetAmount: project.targetAmount == null ? '' : project.targetAmount.toLocaleString('en-NG'),
    targetDate: project.targetDate ?? '',
  }
}

interface ProjectEditorProps {
  /** The project being edited, or null to add one. */
  project: Project | null
  categories: CategoryOption[]
  onSaved: (project: Project) => void
  onDelete: (project: Project) => void
  onCancel: () => void
}

/** Right-hand panel for adding or editing a project. Remount it (with a key) to switch project. */
export default function ProjectEditor({ project, categories, onSaved, onDelete, onCancel }: ProjectEditorProps) {
  const [values, setValues] = useState<ProjectForm>(() => toForm(project, categories))
  const [errors, setErrors] = useState<Errors>({})
  const { mutate: save, isPending } = useSaveProject()

  const set = <K extends keyof ProjectForm>(key: K, value: ProjectForm[K]) => {
    setValues((v) => ({ ...v, [key]: value }))
    setErrors((e) => ({ ...e, [key]: undefined }))
  }

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const found: Errors = {}
    if (!values.title.trim()) found.title = 'Enter the project title.'
    if (!values.shortDescription.trim()) found.shortDescription = 'Enter a short description.'
    const progress = Number(values.progress)
    if (values.status !== 'completed' && (!Number.isInteger(progress) || progress < 0 || progress > 100)) found.progress = 'Enter a whole number from 0 to 100.'
    setErrors(found)
    if (Object.keys(found).length) return
    save(
      { project, values },
      {
        onSuccess: (saved) => {
          toast.success(project ? 'Changes saved' : 'Project added')
          onSaved(saved)
        },
        onError: (error) => {
          const data = isAxiosError(error) ? error.response?.data : null
          if (data && typeof data === 'object') {
            const fieldErrors: Errors = {}
            for (const [field, messages] of Object.entries(data)) {
              const key = API_FIELDS[field]
              if (key) fieldErrors[key] = Array.isArray(messages) ? String(messages[0]) : String(messages)
            }
            if (Object.keys(fieldErrors).length) return setErrors(fieldErrors)
          }
          toast.error(getErrorMessage(error, 'Could not save. Please try again.'))
        },
      },
    )
  }

  const err = (key: keyof ProjectForm) => errors[key] && <p className="mt-1 text-xs text-danger">{errors[key]}</p>

  return (
    <form onSubmit={submit} noValidate className="card flex flex-col p-4 pt-3.5">
      <header className="mb-4 flex items-start gap-3 border-b border-line pb-4">
        <FolderKanban className="mt-1 size-5.5 shrink-0 text-ink" strokeWidth={1.75} />
        <div>
          <h2 className="font-display text-lg font-bold text-ink">{project ? 'Edit Project' : 'Add New Project'}</h2>
          <p className="text-[0.8125rem] text-muted">{project ? 'Update the project details.' : 'Create a new parish project.'}</p>
        </div>
      </header>

      <div className="space-y-4">
        <div>
          <FormField label="Project Title *" value={values.title} onChange={(v) => set('title', v)} maxLength={150} placeholder="Enter project title" />
          {err('title')}
        </div>
        <SelectField label="Category *" value={values.category} onChange={(v) => set('category', v)} options={categories} />
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <SelectField label="Status *" value={values.status} onChange={(v) => set('status', v as ProjectForm['status'])} options={PROJECT_STATUS_OPTIONS} />
            {err('status')}
          </div>
          <div>
            <label htmlFor="project-progress" className="form-label">
              Progress (%)
            </label>
            <input
              id="project-progress"
              type="number"
              min={0}
              max={100}
              value={values.status === 'completed' ? '100' : values.progress}
              disabled={values.status === 'completed'}
              onChange={(e) => set('progress', e.target.value)}
              className="form-input disabled:opacity-60"
            />
            {values.status === 'completed' ? <p className="mt-1 text-xs text-muted">Completed projects show 100%.</p> : err('progress')}
          </div>
        </div>
        <div>
          <TextAreaField
            label="Short Description *"
            value={values.shortDescription}
            onChange={(v) => set('shortDescription', v)}
            rows={2}
            maxLength={300}
            placeholder="A brief description of the project."
          />
          {err('shortDescription')}
        </div>
        <div>
          <TextAreaField
            label="Full Description (optional)"
            value={values.content}
            onChange={(v) => set('content', v)}
            rows={4}
            maxLength={10000}
            placeholder="Provide detailed information about the project."
          />
          <p className="mt-1 text-xs text-muted">Leave a blank line between paragraphs.</p>
        </div>
        <ImagePickerField label="Project Image" value={values.image} onChange={(image) => set('image', image)} error={errors.image} className="h-32" />
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="project-amount" className="form-label">
              Target Amount (₦)
            </label>
            <input
              id="project-amount"
              inputMode="numeric"
              value={values.targetAmount}
              onChange={(e) => {
                const digits = e.target.value.replace(/[^\d]/g, '').slice(0, 15)
                set('targetAmount', digits ? Number(digits).toLocaleString('en-NG') : '')
              }}
              placeholder="e.g. 5,000,000"
              className="form-input"
            />
            {err('targetAmount')}
          </div>
          <div>
            <label htmlFor="project-date" className="form-label">
              Target Date
            </label>
            <input id="project-date" type="date" value={values.targetDate} onChange={(e) => set('targetDate', e.target.value)} className="form-input" />
            {err('targetDate')}
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-2.5 [&>button]:px-3.5">
        {project && (
          <Button variant="danger" onClick={() => onDelete(project)} className="mr-auto">
            <Trash2 className="size-4" /> Delete
          </Button>
        )}
        <Button
          variant="outline"
          className={project ? '' : 'ml-auto'}
          onClick={() => {
            setValues(toForm(project, categories))
            setErrors({})
            onCancel()
          }}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isPending}>
          <Save className="size-4" /> {isPending ? 'Saving...' : 'Save Project'}
        </Button>
      </div>
    </form>
  )
}
