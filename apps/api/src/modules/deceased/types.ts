export interface CreateDeceasedDTO {
  name: string
  title: string
  chantNumber?: string
  chantPosition?: 'room-one' | 'room-two' | 'room-three' | 'room-four' | 'unknow'
  gender: 'male' | 'female' | 'other'
  deathDate: string
  deathTime?: string
  age?: number
  visitTime?: string
  visitationTeam?: string[]
  birthDate?: string
  religion?: string
  isOrdained?: boolean
  address: string
  causeOfDeath?: string
  familyContact?: string
  familyRelationship?: string
  familyPhone: string
  specialNotes?: string
  funeralArrangements?: string
}

export interface UpdateDeceasedDTO extends Partial<CreateDeceasedDTO> {}

export interface DeceasedListQuery {
  page?: number
  limit?: number
  keyword?: string
  gender?: string
  chantPosition?: string
  startDate?: string
  endDate?: string
}
