import { Church } from 'lucide-react'
import type { ChurchInfo } from '../../../types/admin'

export default function SidebarBrand({ church }: { church: ChurchInfo }) {
  return (
    <div className="flex h-19 items-center gap-3 px-4">
      {church.logoUrl ? (
        <img src={church.logoUrl} alt="" className="size-12 shrink-0 rounded-full bg-white object-contain" />
      ) : (
        <span className="flex size-12 shrink-0 items-center justify-center rounded-full border-[3px] border-success bg-white text-danger">
          <Church className="size-6" />
        </span>
      )}
      <div className="min-w-0">
        <p className="text-[0.84rem] leading-snug font-semibold tracking-tight whitespace-nowrap text-white">{church.name}</p>
        <p className="text-xs text-sidebar-text/85">{church.location}</p>
      </div>
    </div>
  )
}
