import {
  IconGraduation,
  IconLandmark,
  IconMonitor,
  IconMusic,
  IconStar,
  IconTrophy,
} from '../../components/icons'
import type { EventCategory } from './types'

export const categoryIcons: Record<EventCategory, typeof IconMusic> = {
  MUSIC: IconMusic,
  SPORTS: IconTrophy,
  TECHNOLOGY: IconMonitor,
  EDUCATION: IconGraduation,
  CULTURE: IconLandmark,
  ENTERTAINMENT: IconStar,
}
