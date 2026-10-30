import type { Member, MemberCategory, MemberFormValues, Tone } from '../types/admin'

/** Badge shown in the Role column for each category. */
export const CATEGORY_BADGE: Record<MemberCategory, { label: string; tone: Tone }> = {
  clergy: { label: 'Priest', tone: 'violet' },
  religious: { label: 'Religious', tone: 'info' },
  staff: { label: 'Staff', tone: 'success' },
}

export const PHOTO_MAX_BYTES = 2 * 1024 * 1024
export const PHOTO_TYPES = ['image/jpeg', 'image/png']

export const emptyMemberForm: MemberFormValues = {
  fullName: '',
  role: '',
  shortBio: '',
  description: '',
  phone: '',
  email: '',
  isActive: true,
  photo: null,
}

export function memberToForm(member: Member): MemberFormValues {
  return {
    fullName: member.fullName,
    role: member.role,
    shortBio: member.shortBio,
    description: member.description,
    phone: member.phone,
    email: member.email,
    isActive: member.isActive,
    photo: member.photo ? { url: member.photo } : null,
  }
}

export type MemberFormErrors = Partial<Record<keyof MemberFormValues, string>>

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function validateMember(values: MemberFormValues): MemberFormErrors {
  const errors: MemberFormErrors = {}
  if (!values.fullName.trim()) errors.fullName = 'Enter the full name.'
  if (!values.role) errors.role = 'Choose a role.'
  if (!values.shortBio.trim()) errors.shortBio = 'Enter a short bio or position.'
  if (values.email && !EMAIL_PATTERN.test(values.email)) errors.email = 'Enter a valid email address.'
  return errors
}

/** Maps the server's field names back to the form's, for showing validation errors. */
export const MEMBER_API_FIELDS: Record<string, keyof MemberFormValues> = {
  full_name: 'fullName',
  role: 'role',
  short_bio: 'shortBio',
  description: 'description',
  phone: 'phone',
  email: 'email',
  photo: 'photo',
  is_active: 'isActive',
}
