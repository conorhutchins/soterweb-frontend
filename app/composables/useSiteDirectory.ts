import { daysFromNow, isoDate } from '~/lib/access-it/time'
import type { Asset, AssetActivity, Building, Contractor, ContractorOrganisation, Permit, StaffContact } from '~/types/access-it'

/** The client organisation running this site. Kiosk screens are branded with it. */
export const siteProfile = {
  clientName: 'Campus Workspace Group',
  siteName: 'Northgate Campus',
  emergencyContactName: 'Fire marshal (duty)',
  emergencyContactEmail: 'fire.marshal@campusworkspace.co.uk',
  dutyManagerEmail: 'estates.duty@campusworkspace.co.uk',
}

const buildingsFixture: Building[] = [
  { id: 1, code: 'NG-ASH', name: 'Ashworth Building', asbestosPresent: true, active: true },
  { id: 2, code: 'NG-PRI', name: 'Priory House', asbestosPresent: true, active: true },
  { id: 3, code: 'NG-LIB', name: 'Library', asbestosPresent: false, active: true },
  { id: 4, code: 'NG-ENC', name: 'Energy Centre', asbestosPresent: false, active: true },
  { id: 5, code: 'NG-SPC', name: 'Sports Centre', asbestosPresent: false, active: true },
  { id: 6, code: 'NG-HAL', name: 'Halifax Halls of Residence', asbestosPresent: true, active: true },
  { id: 7, code: 'NG-CPB', name: 'Car Park B', asbestosPresent: false, active: true },
]

const organisationsFixture: ContractorOrganisation[] = [
  { id: 1, code: 'AQUA', name: 'Aqua Force Plumbing Services', insuranceExpiry: daysFromNow(210), accreditationExpiry: daysFromNow(140), ramsExpiry: daysFromNow(95), highRiskWork: true, disturbsBuildingFabric: false, outOfHoursApproved: false, managedByName: 'Dana Whitfield', managedByEmail: 'dana.whitfield@campusworkspace.co.uk' },
  { id: 2, code: 'ASM', name: 'Advanced Super Monitoring', insuranceExpiry: daysFromNow(320), accreditationExpiry: daysFromNow(400), ramsExpiry: daysFromNow(60), highRiskWork: false, disturbsBuildingFabric: true, outOfHoursApproved: false, managedByName: 'Thomas Fenwick', managedByEmail: 'thomas.fenwick@campusworkspace.co.uk' },
  { id: 3, code: 'DEF', name: 'DEF Scaffolding', insuranceExpiry: daysFromNow(-12), accreditationExpiry: daysFromNow(180), ramsExpiry: daysFromNow(30), highRiskWork: true, disturbsBuildingFabric: false, outOfHoursApproved: false, managedByName: 'Thomas Fenwick', managedByEmail: 'thomas.fenwick@campusworkspace.co.uk' },
  { id: 4, code: 'NCS', name: 'NightClean Services', insuranceExpiry: daysFromNow(150), accreditationExpiry: daysFromNow(150), ramsExpiry: daysFromNow(150), highRiskWork: false, disturbsBuildingFabric: false, outOfHoursApproved: true, managedByName: 'Paul Lendwick', managedByEmail: 'paul.lendwick@campusworkspace.co.uk' },
  { id: 5, code: 'VTX', name: 'Vertex Electrical', insuranceExpiry: daysFromNow(88), accreditationExpiry: daysFromNow(260), ramsExpiry: daysFromNow(120), highRiskWork: false, disturbsBuildingFabric: true, outOfHoursApproved: false, managedByName: 'Gareth Bell', managedByEmail: 'gareth.bell@campusworkspace.co.uk' },
  { id: 6, code: 'MRD', name: 'Meridian Roofing', insuranceExpiry: daysFromNow(200), accreditationExpiry: daysFromNow(200), ramsExpiry: daysFromNow(-40), highRiskWork: true, disturbsBuildingFabric: true, outOfHoursApproved: false, managedByName: 'Dana Whitfield', managedByEmail: 'dana.whitfield@campusworkspace.co.uk' },
]

// Demo accounts are deliberately varied so every branch of the log on journey can be shown.
const contractorsFixture: Contractor[] = [
  { id: 1, organisationId: 1, firstName: 'Stuart', lastName: 'Grey', username: 'contractor1', password: 'demo', mobile: '07744 695 8499', email: 'stuart.grey@aquaforce.co.uk', inductionExpiry: daysFromNow(300), certificateName: 'Gas Safe registration', certificateExpiry: daysFromNow(240) },
  { id: 2, organisationId: 2, firstName: 'Justin', lastName: 'Thorpe', username: 'contractor2', password: 'demo', mobile: '07700 900123', email: 'justin.thorpe@asmonitoring.co.uk', inductionExpiry: daysFromNow(120), certificateName: 'Asbestos awareness', certificateExpiry: daysFromNow(400) },
  { id: 3, organisationId: 3, firstName: 'Priya', lastName: 'Nair', username: 'contractor3', password: 'demo', mobile: '07712 303 9444', email: 'priya.nair@defscaffolding.co.uk', inductionExpiry: daysFromNow(200), certificateName: 'CISRS scaffolder card', certificateExpiry: daysFromNow(500) },
  { id: 4, organisationId: 1, firstName: 'Tom', lastName: 'Ashby', username: 'contractor4', password: 'demo', mobile: '07956 143 287', email: 'tom.ashby@aquaforce.co.uk', inductionExpiry: daysFromNow(-9), certificateName: 'Gas Safe registration', certificateExpiry: daysFromNow(190) },
  { id: 5, organisationId: 4, firstName: 'Amira', lastName: 'Khan', username: 'contractor5', password: 'demo', mobile: '07746 385 627', email: 'amira.khan@nightclean.co.uk', inductionExpiry: daysFromNow(80), certificateName: 'COSHH awareness', certificateExpiry: daysFromNow(330) },
  { id: 6, organisationId: 5, firstName: 'Leon', lastName: 'Baptiste', username: 'contractor6', password: 'demo', mobile: '07919 743 625', email: 'leon.baptiste@vertexelectrical.co.uk', inductionExpiry: daysFromNow(150), certificateName: '18th Edition wiring regulations', certificateExpiry: daysFromNow(-3) },
  { id: 7, organisationId: 5, firstName: 'Chloe', lastName: 'Mensah', username: 'contractor7', password: 'demo', mobile: '07765 234 891', email: 'chloe.mensah@vertexelectrical.co.uk', inductionExpiry: daysFromNow(220), certificateName: '18th Edition wiring regulations', certificateExpiry: daysFromNow(700) },
  { id: 8, organisationId: 6, firstName: 'Ryan', lastName: 'Doyle', username: 'contractor8', password: 'demo', mobile: '07634 128 756', email: 'ryan.doyle@meridianroofing.co.uk', inductionExpiry: daysFromNow(60), certificateName: 'Working at height', certificateExpiry: daysFromNow(410) },
  { id: 9, organisationId: 2, firstName: 'Marcus', lastName: 'Webb', username: 'contractor9', password: 'demo', mobile: '07841 995 234', email: 'marcus.webb@asmonitoring.co.uk', inductionExpiry: daysFromNow(45), certificateName: 'Asbestos awareness', certificateExpiry: daysFromNow(45) },
]

const staffContactsFixture: StaffContact[] = [
  { id: 1, name: 'Thomas Fenwick', email: 'thomas.fenwick@campusworkspace.co.uk', department: 'Estates' },
  { id: 2, name: 'Paul Lendwick', email: 'paul.lendwick@campusworkspace.co.uk', department: 'Facilities' },
  { id: 3, name: 'Sarah Ogundipe', email: 'sarah.ogundipe@campusworkspace.co.uk', department: 'Health and Safety' },
  { id: 4, name: 'Helen Marsh', email: 'helen.marsh@campusworkspace.co.uk', department: 'Reception' },
  { id: 5, name: 'Gareth Bell', email: 'gareth.bell@campusworkspace.co.uk', department: 'IT Services' },
  { id: 6, name: 'Nadia Rossi', email: 'nadia.rossi@campusworkspace.co.uk', department: 'Finance' },
]

const permitsFixture: Permit[] = [
  { id: 1, reference: 'PTW-2026-0142', organisationId: 2, contractorId: 2, buildingId: 2, description: 'Lift 22: replacement of control panel', status: 'Live', outOfHoursAuthorised: false, validFrom: daysFromNow(-3), validTo: daysFromNow(4) },
  { id: 2, reference: 'PTW-2026-0133', organisationId: 1, buildingId: 4, description: 'Hot works: boiler flue replacement', status: 'Live', outOfHoursAuthorised: false, validFrom: daysFromNow(-1), validTo: daysFromNow(6) },
  { id: 3, reference: 'PTW-2026-0150', organisationId: 5, contractorId: 7, buildingId: 3, description: 'Out of hours rewiring of the server room', status: 'Approved', outOfHoursAuthorised: true, validFrom: daysFromNow(0), validTo: daysFromNow(7) },
  { id: 4, reference: 'PTW-2026-0128', organisationId: 3, buildingId: 1, description: 'Scaffold erection, east elevation', status: 'Suspended', outOfHoursAuthorised: false, validFrom: daysFromNow(-20), validTo: daysFromNow(10) },
  { id: 5, reference: 'PTW-2026-0151', organisationId: 6, buildingId: 6, description: 'Roof membrane repairs, block C', status: 'Live', outOfHoursAuthorised: false, validFrom: daysFromNow(-2), validTo: daysFromNow(12) },
  { id: 6, reference: 'PTW-2026-0149', organisationId: 5, buildingId: 1, description: 'Isolation of distribution board DB-A3', status: 'Live', outOfHoursAuthorised: false, validFrom: daysFromNow(-1), validTo: daysFromNow(2) },
]

const assetsFixture: Asset[] = [
  { id: 1, tag: 'ENC-BOIL-000001', parentTag: 'P-ENC-BOIL', description: 'Gas boiler 1', buildingId: 4, location: 'Plant room, ground floor', manufacturer: 'Remeha', model: 'Quinta Pro 115', serialNumber: 'RQ115-44821', ppmOrganisationId: 1, serviceConditionRating: '1 - Good', conditionStatus: 'Acceptable', lastServicedAt: daysFromNow(-1), active: true },
  { id: 2, tag: 'ENC-BOIL-000002', parentTag: 'P-ENC-BOIL', description: 'Gas boiler 2', buildingId: 4, location: 'Plant room, ground floor', manufacturer: 'Remeha', model: 'Quinta Pro 115', serialNumber: 'RQ115-44822', ppmOrganisationId: 1, serviceConditionRating: '2 - Fair', conditionStatus: 'Monitor', lastServicedAt: daysFromNow(-190), active: true },
  { id: 3, tag: 'ENC-PUMP-000001', parentTag: 'P-ENC-PUMP', description: 'Primary circulation pump', buildingId: 4, location: 'Plant room, ground floor', manufacturer: 'Grundfos', model: 'Magna3 50-120', serialNumber: 'GM3-98120', ppmOrganisationId: 1, serviceConditionRating: '3 - Poor', conditionStatus: 'Action required', lastServicedAt: daysFromNow(-370), active: true },
  { id: 4, tag: 'ENC-PUMP-000002', parentTag: 'P-ENC-PUMP', description: 'Secondary circulation pump', buildingId: 4, location: 'Plant room, ground floor', manufacturer: 'Grundfos', model: 'Magna3 50-120', serialNumber: 'GM3-98121', ppmOrganisationId: 1, serviceConditionRating: '1 - Good', conditionStatus: 'Acceptable', lastServicedAt: daysFromNow(-30), active: true },
  { id: 5, tag: 'LIB-LGHT-000001', parentTag: 'P-LIB-LGHT', description: 'Emergency luminaire, reading room', buildingId: 3, location: 'Reading room, level 1', manufacturer: 'Thorlux', model: 'Evolve LED 12W', serialNumber: 'TL-EV-20114', ppmOrganisationId: 5, serviceConditionRating: '1 - Good', conditionStatus: 'Acceptable', lastServicedAt: daysFromNow(-60), active: true },
  { id: 6, tag: 'LIB-LGHT-000002', parentTag: 'P-LIB-LGHT', description: 'LED panel lighting, level 2', buildingId: 3, location: 'Open study area, level 2', manufacturer: 'Ur-Eka', model: 'Crux LED 1x2100 E309', serialNumber: 'UE-CX-55901', ppmOrganisationId: 5, serviceConditionRating: '2 - Fair', conditionStatus: 'Monitor', lastServicedAt: daysFromNow(-200), active: true },
  { id: 7, tag: 'LIB-DIST-000001', parentTag: 'P-LIB-DIST', description: 'Distribution board DB-L2', buildingId: 3, location: 'Electrical riser, level 2', manufacturer: 'Schneider', model: 'Acti9 Isobar', serialNumber: 'SE-ISO-77120', ppmOrganisationId: 5, serviceConditionRating: '1 - Good', conditionStatus: 'Acceptable', lastServicedAt: daysFromNow(-100), active: true },
  { id: 8, tag: 'ASH-LIFT-000001', parentTag: 'P-ASH-LIFT', description: 'Passenger lift 1', buildingId: 1, location: 'Main lobby', manufacturer: 'Otis', model: 'Gen2', serialNumber: 'OT-G2-31007', ppmOrganisationId: 2, serviceConditionRating: '2 - Fair', conditionStatus: 'Monitor', lastServicedAt: daysFromNow(-25), active: true },
]

export function useSiteDirectory() {
  const buildings = useState<Building[]>('access-it-buildings', () => structuredClone(buildingsFixture))
  const organisations = useState<ContractorOrganisation[]>('access-it-contractor-organisations', () => structuredClone(organisationsFixture))
  const contractors = useState<Contractor[]>('access-it-contractors', () => structuredClone(contractorsFixture))
  const staffContacts = useState<StaffContact[]>('access-it-staff-contacts', () => structuredClone(staffContactsFixture))
  // Permits and assets carry dates relative to today, so they are rebuilt on every load rather than persisted.
  const permits = useState<Permit[]>('access-it-permits', () => structuredClone(permitsFixture))
  const assets = useState<Asset[]>('access-it-assets', () => structuredClone(assetsFixture))

  const activeBuildings = computed(() => buildings.value.filter((building) => building.active))

  function buildingById(id: number | undefined) {
    return buildings.value.find((building) => building.id === id)
  }

  function organisationById(id: number | undefined) {
    return organisations.value.find((organisation) => organisation.id === id)
  }

  function contractorById(id: number | undefined) {
    return contractors.value.find((contractor) => contractor.id === id)
  }

  function staffContactById(id: number | undefined) {
    return staffContacts.value.find((contact) => contact.id === id)
  }

  function findContractorByCredentials(username: string, password: string) {
    const normalised = username.trim().toLowerCase()
    return contractors.value.find((contractor) => contractor.username.toLowerCase() === normalised && contractor.password === password) ?? null
  }

  function findOrganisationByCode(code: string) {
    const normalised = code.trim().toUpperCase()
    return organisations.value.find((organisation) => organisation.code === normalised) ?? null
  }

  function contractorFullName(contractor: Contractor) {
    return `${contractor.firstName} ${contractor.lastName}`
  }

  function setPermitStatus(permitId: number, status: Permit['status']) {
    const permit = permits.value.find((candidate) => candidate.id === permitId)
    if (permit) permit.status = status
  }

  /** Current permits held by an organisation, optionally narrowed to one operative. */
  function currentPermitsFor(organisationId: number, contractorId?: number) {
    const today = isoDate(new Date())
    return permits.value.filter((permit) =>
      permit.organisationId === organisationId
      && (!contractorId || !permit.contractorId || permit.contractorId === contractorId)
      && permit.status !== 'Closed'
      && permit.validFrom <= today && permit.validTo >= today,
    )
  }

  function setOrganisationOutOfHours(organisationId: number, approved: boolean) {
    const organisation = organisationById(organisationId)
    if (organisation) organisation.outOfHoursApproved = approved
  }

  function nextAssetTag(parentTag: string) {
    const prefix = parentTag.replace(/^P-/, '')
    const highest = assets.value
      .filter((asset) => asset.parentTag === parentTag)
      .reduce((max, asset) => Math.max(max, Number(asset.tag.split('-').pop()) || 0), 0)
    return `${prefix}-${String(highest + 1).padStart(6, '0')}`
  }

  /** Write an activity captured at log off through to the asset register. */
  function applyAssetActivity(activity: AssetActivity, buildingId: number, organisationId: number, today = isoDate(new Date())) {
    const existing = assets.value.find((asset) => asset.tag === activity.assetTag)

    if (activity.type === 'New asset installed' || activity.type === 'Replaced asset') {
      if (activity.type === 'Replaced asset' && existing) existing.active = false
      const nextId = Math.max(...assets.value.map((asset) => asset.id), 0) + 1
      assets.value.push({
        id: nextId,
        tag: nextAssetTag(activity.parentTag),
        parentTag: activity.parentTag,
        description: activity.description,
        buildingId,
        location: activity.location,
        manufacturer: activity.manufacturer,
        model: activity.model,
        serialNumber: activity.serialNumber,
        ppmOrganisationId: organisationId,
        serviceConditionRating: activity.serviceConditionRating,
        conditionStatus: activity.conditionStatus,
        lastServicedAt: today,
        active: true,
      })
      return
    }

    if (!existing) return

    if (activity.type === 'Removed asset') {
      existing.active = false
      return
    }

    existing.serviceConditionRating = activity.serviceConditionRating
    existing.conditionStatus = activity.conditionStatus
    existing.lastServicedAt = today
    if (activity.serialNumber) existing.serialNumber = activity.serialNumber
  }

  function resetAll() {
    permits.value = structuredClone(permitsFixture)
    assets.value = structuredClone(assetsFixture)
    organisations.value = structuredClone(organisationsFixture)
  }

  return {
    siteProfile,
    buildings,
    activeBuildings,
    organisations,
    contractors,
    staffContacts,
    permits,
    assets,
    buildingById,
    organisationById,
    contractorById,
    staffContactById,
    findContractorByCredentials,
    findOrganisationByCode,
    contractorFullName,
    setPermitStatus,
    currentPermitsFor,
    setOrganisationOutOfHours,
    nextAssetTag,
    applyAssetActivity,
    resetAll,
  }
}
