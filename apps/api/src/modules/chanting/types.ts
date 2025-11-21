export interface CreateChantingScheduleDTO {
  location: 'fuhuiyuan' | 'waiqin'
  date: string
  timeSlot: string
  bellVolunteerId?: number
  teachingVolunteerId?: number
  backupVolunteerId?: number
  deceasedId: number
  status?: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled'
  expectedParticipants?: number
  specialRequirements?: string
}

export interface UpdateChantingScheduleDTO extends Partial<CreateChantingScheduleDTO> {}

export interface ChantingScheduleListQuery {
  page?: number
  limit?: number
  startDate?: string
  endDate?: string
  location?: string
  status?: string
  deceasedId?: number
}
