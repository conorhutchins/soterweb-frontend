import type { Organisation, OrganisationInput } from '~/types/organisation'

const organisationsFixture: Organisation[] = [
  { id: 1, code: 'SOTERweb001', name: 'SOTERweb', telephone: '03773 695 6239', email: 'rik@montgomeryandcoupers.co.uk', active: true },
  { id: 2, code: 'NORTH001', name: 'Northshore Facilities Ltd', telephone: '0161 555 0182', email: 'facilities@northshore.co.uk', active: true },
  { id: 3, code: 'CAMPUS002', name: 'Campus Workspace Group', telephone: '0113 410 6650', email: 'operations@campusworkspace.co.uk', active: true },
  { id: 4, code: 'HARBOR003', name: 'Harbour House Management', telephone: '020 7946 8201', email: 'hello@harbourhouse.co.uk', active: true },
  { id: 5, code: 'GREEN004', name: 'Greendale Business Park', telephone: '0121 799 4870', email: 'estates@greendalepark.co.uk', active: true },
  { id: 6, code: 'WEST005', name: 'Westfield Community Trust', telephone: '0141 611 9360', email: 'admin@westfieldtrust.org.uk', active: true },
  { id: 7, code: 'RIVER006', name: 'Riverside Property Services', telephone: '0131 322 7105', email: 'team@riversideproperty.co.uk', active: true },
  { id: 8, code: 'KINGS007', name: 'Kingsgate Offices', telephone: '0117 380 4412', email: 'support@kingsgateoffices.co.uk', active: true },
  { id: 9, code: 'MEADOW008', name: 'Meadowbrook Care Estates', telephone: '0151 210 3910', email: 'estates@meadowbrookcare.co.uk', active: true },
  { id: 10, code: 'OLD009', name: 'Old Mill Workspace', telephone: '0191 410 2653', email: 'office@oldmillworkspace.co.uk', active: false },
]

export function useOrganisations() {
  const organisations = useState<Organisation[]>('organisations', () => structuredClone(organisationsFixture))

  function list() {
    return organisations.value
  }

  function create(organisationInput: OrganisationInput) {
    const nextId = Math.max(...organisations.value.map((organisation) => organisation.id), 0) + 1
    const organisation = { ...organisationInput, id: nextId, active: organisationInput.active ?? true }
    organisations.value.unshift(organisation)
    return organisation
  }

  function update(organisationId: number, organisationInput: OrganisationInput) {
    const organisationIndex = organisations.value.findIndex((organisation) => organisation.id === organisationId)

    if (organisationIndex === -1) return

    const currentOrganisation = organisations.value[organisationIndex]

    if (!currentOrganisation) return

    organisations.value[organisationIndex] = {
      ...currentOrganisation,
      ...organisationInput,
    }
  }

  function deactivate(organisationId: number) {
    const organisation = organisations.value.find((currentOrganisation) => currentOrganisation.id === organisationId)

    if (organisation) organisation.active = false
  }

  return { organisations, list, create, update, deactivate }
}
