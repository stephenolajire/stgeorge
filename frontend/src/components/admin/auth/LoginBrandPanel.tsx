import { Church } from 'lucide-react'
import type { ChurchInfo } from '../../../types/admin'

const YEAR = new Date().getFullYear()

/** Left side of the login screen (large screens only). */
export default function LoginBrandPanel({ church }: { church: ChurchInfo }) {
  return (
    <div className="relative hidden flex-col justify-between overflow-hidden bg-linear-to-br from-sidebar to-sidebar-deep p-12 text-white lg:flex">
      <div className="pointer-events-none absolute -top-24 -right-24 size-96 rounded-full bg-accent/10 blur-3xl" />

      <div className="flex items-center gap-3">
        {church.logoUrl ? (
          <img src={church.logoUrl} alt="" className="size-12 rounded-full bg-white object-contain" />
        ) : (
          <span className="flex size-12 items-center justify-center rounded-full border-[3px] border-success bg-white text-danger">
            <Church className="size-6" />
          </span>
        )}
        <div>
          <p className="text-sm font-semibold">{church.name}</p>
          <p className="text-xs text-sidebar-text/80">{church.location}</p>
        </div>
      </div>

      <div className="relative max-w-md">
        <span className="mb-5 block h-0.5 w-16 bg-accent" />
        <h2 className="font-display text-4xl leading-tight font-bold">Parish Website Administration</h2>
        <p className="mt-4 text-base leading-relaxed text-sidebar-text/85">
          Manage your parish website content, keep your community informed and connected.
        </p>
      </div>

      <p className="text-xs text-sidebar-muted">
        © {YEAR} {church.name}
      </p>
    </div>
  )
}
