import { useState } from 'react'
import type { Member } from '../../../types/admin'
import MemberRow from './MemberRow'

interface MembersTableProps {
  members: Member[]
  /** Row number of the first member on this page, minus one. */
  offset: number
  selectedId: number | null
  onEdit: (member: Member) => void
  onView: (member: Member) => void
  onDelete: (member: Member) => void
  onToggleActive: (member: Member) => void
  /** Called with the page's members in their new order. */
  onReorder: (members: Member[]) => void
}

const HEADERS = ['', '#', 'Photo', 'Name', 'Role', 'Contact', 'Status', 'Actions']

function move(list: Member[], from: number, to: number): Member[] {
  const next = [...list]
  const [item] = next.splice(from, 1)
  next.splice(to, 0, item)
  return next
}

export default function MembersTable({ members, offset, selectedId, ...actions }: MembersTableProps) {
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [overIndex, setOverIndex] = useState<number | null>(null)

  const reorder = (from: number, to: number) => {
    if (from !== to && to >= 0 && to < members.length) actions.onReorder(move(members, from, to))
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-185 text-left">
        <thead>
          <tr className="bg-surface-muted/70 text-[0.8125rem] text-ink">
            {HEADERS.map((h, i) => (
              <th
                key={i}
                scope="col"
                className={`py-3 font-semibold first:rounded-l-md last:rounded-r-md ${i === 1 ? 'text-center' : h === 'Photo' ? 'px-1.5' : 'px-2'}`}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {members.map((member, index) => (
            <MemberRow
              key={member.id}
              member={member}
              number={offset + index + 1}
              selected={member.id === selectedId}
              isFirst={index === 0}
              isLast={index === members.length - 1}
              dropTarget={overIndex === index && dragIndex !== null && dragIndex !== index}
              onEdit={() => actions.onEdit(member)}
              onView={() => actions.onView(member)}
              onDelete={() => actions.onDelete(member)}
              onToggleActive={() => actions.onToggleActive(member)}
              onMoveUp={() => reorder(index, index - 1)}
              onMoveDown={() => reorder(index, index + 1)}
              onDragStart={() => setDragIndex(index)}
              onDragOver={(e) => {
                e.preventDefault()
                setOverIndex(index)
              }}
              onDrop={() => {
                if (dragIndex !== null) reorder(dragIndex, index)
                setDragIndex(null)
                setOverIndex(null)
              }}
              onDragEnd={() => {
                setDragIndex(null)
                setOverIndex(null)
              }}
            />
          ))}
        </tbody>
      </table>
    </div>
  )
}
