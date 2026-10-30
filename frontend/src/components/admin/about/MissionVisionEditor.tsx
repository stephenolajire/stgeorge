import { Eye, SquareUserRound, Target } from 'lucide-react'
import SectionCard from '../common/SectionCard'
import MissionVisionItem from './MissionVisionItem'

interface MissionVisionEditorProps {
  mission: string
  vision: string
  onMissionChange: (text: string) => void
  onVisionChange: (text: string) => void
}

export default function MissionVisionEditor({
  mission,
  vision,
  onMissionChange,
  onVisionChange,
}: MissionVisionEditorProps) {
  return (
    <SectionCard title="Mission & Vision" icon={SquareUserRound} serif>
      <div className="grid gap-6 lg:grid-cols-2">
        <MissionVisionItem title="Our Mission" icon={Target} tone="warning" value={mission} onChange={onMissionChange} />
        <MissionVisionItem title="Our Vision" icon={Eye} tone="info" value={vision} onChange={onVisionChange} />
      </div>
    </SectionCard>
  )
}
