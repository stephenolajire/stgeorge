import { isAxiosError } from 'axios'
import { Save, Trash2, UserRound } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { toast } from 'react-toastify'
import { useSaveMember } from '../../../hooks/admin/clergyHook'
import type { Member, MemberFormValues, RoleOption } from '../../../types/admin'
import { getErrorMessage } from '../../../utils/apiError'
import {
  MEMBER_API_FIELDS,
  emptyMemberForm,
  memberToForm,
  validateMember,
  type MemberFormErrors,
} from '../../../utils/clergy'
import Button from '../common/Button'
import FormField from '../common/FormField'
import { SelectField } from '../common/Select'
import TextAreaField from '../common/TextAreaField'
import MemberPhotoField from './MemberPhotoField'
import MemberStatusSelect from './MemberStatusSelect'

interface MemberEditorProps {
  /** The member being edited, or null to add a new one. */
  member: Member | null
  roles: RoleOption[]
  onSaved: (member: Member) => void
  onDelete: (member: Member) => void
  onCancel: () => void
}

function FieldError({ message }: { message?: string }) {
  return message ? <p className="mt-1 text-xs text-danger">{message}</p> : null
}

/** Right-hand panel for adding or editing a member. Remount it (with a key) to switch member. */
export default function MemberEditor({ member, roles, onSaved, onDelete, onCancel }: MemberEditorProps) {
  const [values, setValues] = useState<MemberFormValues>(member ? memberToForm(member) : emptyMemberForm)
  const [errors, setErrors] = useState<MemberFormErrors>({})
  const { mutate: save, isPending } = useSaveMember()

  const set = <K extends keyof MemberFormValues>(key: K, value: MemberFormValues[K]) => {
    setValues((v) => ({ ...v, [key]: value }))
    setErrors((e) => ({ ...e, [key]: undefined }))
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const found = validateMember(values)
    setErrors(found)
    if (Object.keys(found).length) return

    save(
      { member, values },
      {
        onSuccess: (saved) => {
          toast.success(member ? 'Changes saved' : 'Member added')
          onSaved(saved)
        },
        onError: (error) => {
          // Show the server's field errors next to the fields.
          const data = isAxiosError(error) ? error.response?.data : null
          if (data && typeof data === 'object') {
            const fieldErrors: MemberFormErrors = {}
            for (const [field, messages] of Object.entries(data)) {
              const key = MEMBER_API_FIELDS[field]
              if (key) fieldErrors[key] = Array.isArray(messages) ? String(messages[0]) : String(messages)
            }
            if (Object.keys(fieldErrors).length) return setErrors(fieldErrors)
          }
          toast.error(getErrorMessage(error, 'Could not save. Please try again.'))
        },
      },
    )
  }

  const handleCancel = () => {
    setValues(member ? memberToForm(member) : emptyMemberForm)
    setErrors({})
    onCancel()
  }

  return (
    <form onSubmit={handleSubmit} className="card flex flex-col p-4 pt-3" noValidate>
      <header className="mb-4 flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <UserRound className="mt-1 size-6 shrink-0 text-ink" strokeWidth={1.75} />
          <div>
            <h2 className="font-display text-lg font-bold text-ink">{member ? 'Edit Clergy / Staff' : 'Add Clergy / Staff'}</h2>
            <p className="text-[0.8125rem] text-muted">
              {member ? "Update the member's information." : 'Add a new member to the parish.'}
            </p>
          </div>
        </div>
        <MemberStatusSelect isActive={values.isActive} onChange={(isActive) => set('isActive', isActive)} />
      </header>

      <div className="space-y-3.5">
        <div>
          <FormField
            label="Full Name *"
            value={values.fullName}
            onChange={(v) => set('fullName', v)}
            maxLength={150}
            aria-invalid={Boolean(errors.fullName)}
          />
          <FieldError message={errors.fullName} />
        </div>
        <div>
          <SelectField
            label="Role *"
            value={values.role}
            onChange={(v) => set('role', v)}
            options={roles}
            placeholder="Choose a role"
            aria-invalid={Boolean(errors.role)}
          />
          <FieldError message={errors.role} />
        </div>
        <div>
          <TextAreaField
            label="Short Bio / Position *"
            value={values.shortBio}
            onChange={(v) => set('shortBio', v)}
            rows={2}
            maxLength={255}
            aria-invalid={Boolean(errors.shortBio)}
          />
          <FieldError message={errors.shortBio} />
        </div>
        <TextAreaField
          label="Full Description (optional)"
          value={values.description}
          onChange={(v) => set('description', v)}
          rows={5}
          maxLength={5000}
        />

        <div>
          <p className="mb-2 text-sm font-semibold text-ink">Contact Information</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Phone Number" type="tel" value={values.phone} onChange={(v) => set('phone', v)} maxLength={30} />
            <div>
              <FormField
                label="Email Address"
                type="email"
                value={values.email}
                onChange={(v) => set('email', v)}
                aria-invalid={Boolean(errors.email)}
              />
              <FieldError message={errors.email} />
            </div>
          </div>
        </div>

        <MemberPhotoField value={values.photo} onChange={(photo) => set('photo', photo)} error={errors.photo} />
      </div>

      <div className="mt-7 flex flex-wrap justify-end gap-2 [&>button]:gap-1.5 [&>button]:px-3.5">
        {member && (
          <Button variant="danger" onClick={() => onDelete(member)} className="mr-auto">
            <Trash2 className="size-4" /> Delete Member
          </Button>
        )}
        <Button variant="outline" onClick={handleCancel} className={member ? '' : 'ml-auto'}>
          Cancel
        </Button>
        <Button type="submit" disabled={isPending}>
          <Save className="size-4" /> {isPending ? 'Saving...' : member ? 'Save Changes' : 'Add Member'}
        </Button>
      </div>
    </form>
  )
}
