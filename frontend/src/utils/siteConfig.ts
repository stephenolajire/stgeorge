import type { ChurchInfo } from '../types/admin'

// Parish details used across the website. Empty values are hidden on the site.
export const CHURCH: ChurchInfo = {
  name: 'St. George Catholic Church',
  location: 'Ofatedo, Osun State',
  diocese: 'Catholic Diocese of Osogbo',
  // Used by the "Learn More About Our Diocese" button on the About page.
  dioceseWebsite: 'https://catholicdioceseosogbo.org/',
  tagline: 'A faith-filled community, worshipping God, living the Gospel and serving with love.',
  contact: {
    address: 'St. George Catholic Church, Ofatedo, Osun State.',
    phone: '',
    email: 'stgeorgeofatedo@gmail.com',
    hours: 'Mon - Sun: 8:00 AM - 6:00 PM',
  },
  social: {
    facebook: '',
    youtube: '',
    instagram: '',
  },
}

/** The parish's time zone: event times are entered and shown in this time, wherever the viewer is. */
export const PARISH_TIME_ZONE = 'Africa/Lagos'
