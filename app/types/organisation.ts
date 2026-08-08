export interface Organisation {
  id: number
  code: string
  name: string
  telephone: string
  email: string
  active: boolean
}

export type OrganisationInput = Omit<Organisation, 'id' | 'active'> & {
  active?: boolean
}
