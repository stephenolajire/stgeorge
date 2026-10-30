import { useEffect } from 'react'
import { CHURCH } from '../utils/siteConfig'

/** Sets the browser tab title, e.g. "About | St. George Catholic Church". */
export function usePageTitle(title: string) {
  useEffect(() => {
    document.title = title ? `${title} | ${CHURCH.name}` : CHURCH.name
  }, [title])
}
