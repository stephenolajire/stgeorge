import { contactService } from '../admin/contactService'

// Calls used by the public Contact page and the footer.
export const publicContactService = {
  getPage: contactService.getPage,
  subjects: contactService.subjects,
  send: contactService.send,
}
