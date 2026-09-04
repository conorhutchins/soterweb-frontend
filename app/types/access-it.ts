// Access IT: who is on site, where they are working and what they are doing.
// These shapes mirror the legacy SOTERweb module so the mock stores can later be
// swapped for the .NET API without changing the screens.

export type YesNo = 'Yes' | 'No'

/** Estates > Locations > Locations (Buildings). Non-building locations (car parks, fields) are allowed. */
export interface Building {
  id: number
  code: string
  name: string
  /** Location flagged as containing asbestos (typically constructed before 2000). */
  asbestosPresent: boolean
  active: boolean
}

/** A contractor company. Insurance, accreditation and RAMS belong to the organisation. */
export interface ContractorOrganisation {
  id: number
  /** Company code, also used for anonymous log on. */
  code: string
  name: string
  insuranceExpiry: string
  accreditationExpiry: string
  ramsExpiry: string
  /** Flagged as undertaking high risk work: triggers the RAMS acknowledgement. */
  highRiskWork: boolean
  /** Flagged as likely to disturb the fabric of the building: triggers the asbestos acknowledgement. */
  disturbsBuildingFabric: boolean
  /** Removes all working-window checks for this organisation's operatives. */
  outOfHoursApproved: boolean
  /** The nominated Managed By contact, notified when an operative logs on (automation 00004010). */
  managedByName: string
  managedByEmail: string
}

/** An individual operative. Induction and certification belong to the person. */
export interface Contractor {
  id: number
  organisationId: number
  firstName: string
  lastName: string
  username: string
  password: string
  mobile: string
  email: string
  inductionExpiry: string
  certificateName: string
  certificateExpiry: string
}

/** Internal staff who can host visitors and receive notifications. */
export interface StaffContact {
  id: number
  name: string
  email: string
  department: string
}

export type PermitStatus = 'Approved' | 'Live' | 'Suspended' | 'Closed'

/** A permit from the Permit to Work module. Used for conflicts and out-of-hours authorisation. */
export interface Permit {
  id: number
  reference: string
  organisationId: number
  contractorId?: number
  buildingId: number
  description: string
  status: PermitStatus
  outOfHoursAuthorised: boolean
  validFrom: string
  validTo: string
}

export type ServiceConditionRating = '1 - Good' | '2 - Fair' | '3 - Poor' | '4 - Very poor' | '5 - Failed'
export type ConditionStatus = 'Acceptable' | 'Monitor' | 'Action required' | 'Unacceptable'

/** An entry in the asset register that a designated PPM contractor may update at log off. */
export interface Asset {
  id: number
  tag: string
  parentTag: string
  description: string
  buildingId: number
  location: string
  manufacturer: string
  model: string
  serialNumber: string
  /** The organisation designated as the PPM contractor for this asset. */
  ppmOrganisationId: number
  serviceConditionRating: ServiceConditionRating
  conditionStatus: ConditionStatus
  lastServicedAt: string | null
  active: boolean
}

export type AssetActivityType =
  | 'PPM visit'
  | 'New asset installed'
  | 'Replaced asset'
  | 'Repaired asset'
  | 'Removed asset'

export interface AssetActivity {
  type: AssetActivityType
  assetTag: string
  parentTag: string
  description: string
  location: string
  manufacturer: string
  model: string
  serialNumber: string
  serviceConditionRating: ServiceConditionRating
  conditionStatus: ConditionStatus
  notes: string
  certificateFileName?: string
  photoFileName?: string
}

/** Who is logging on at the kiosk, resolved from an account or from an anonymous entry. */
export interface ContractorIdentity {
  contractor: Contractor | null
  organisation: ContractorOrganisation
  name: string
  mobile: string
  email: string
  anonymous: boolean
}

/** Where the contractor is working, what they are doing and when they expect to leave. */
export interface ContractorWorkDetails {
  building: Building
  location: string
  description: string
  expectedLogOffAt: string
}

/** Log on reasons A to E. Each can be hidden by a system parameter. */
export type LogOnReason = 'A' | 'B' | 'C' | 'D' | 'E'

/** Log off options A to E. Each can be hidden by a system parameter. */
export type LogOffOption = 'A' | 'B' | 'C' | 'D' | 'E'

export type AttendanceType = 'Contractor' | 'Visitor'
export type AttendanceStatus = 'Expected' | 'On site' | 'Departed'
export type VisitorSource = 'Self service' | 'Reception' | 'Pre-booked'
export type WorkingWindowBasis = 'Checks disabled' | 'Core hours' | 'Flex period' | 'Permit' | 'Approved organisation'

/** One attendance: a contractor or visitor, expected, on site or departed. */
export interface AttendanceRecord {
  id: number
  type: AttendanceType
  status: AttendanceStatus
  name: string
  company: string
  mobile: string
  email: string
  buildingId: number
  buildingName: string
  /** Contractor: the location or project. Visitor: the person they are visiting. */
  locationOrHost: string
  /** The visit description or reason for attendance. */
  description: string
  /** Pre-booked visitors only: when they are expected to arrive. */
  expectedArrivalAt?: string
  loggedOnAt: string | null
  expectedLogOffAt: string
  loggedOffAt: string | null
  /** Token carried in the emailed pass so the person can log off with one click. */
  passToken: string
  // Contractor detail
  contractorId?: number
  organisationId?: number
  reason?: LogOnReason
  anonymous?: boolean
  workingWindowBasis?: WorkingWindowBasis
  logOffOption?: LogOffOption
  assetActivities?: AssetActivity[]
  // Visitor detail
  source?: VisitorSource
  hostContactId?: number
  hostEmail?: string
  vehicleReg?: string
}

export type ParameterType = 'yesno' | 'text' | 'time' | 'number' | 'select'

export type ParameterGroup =
  | 'Log on options'
  | 'Log off options'
  | 'Anonymous access'
  | 'Compliance checks'
  | 'Working window'
  | 'Visitors'
  | 'Integration'
  | 'System'

/** One of the module's system parameters. Behaviour is set by configuration rather than by code. */
export interface SystemParameter {
  key: string
  description: string
  group: ParameterGroup
  type: ParameterType
  options?: string[]
  defaultValue: string
  value: string
}

export type ENoteGroup = 'Log on' | 'Log off' | 'Visitors'

/** User-definable text shown on a kiosk screen. */
export interface ENote {
  code: string
  screen: string
  group: ENoteGroup
  title: string
  body: string
}

/** An automated email triggered by a system event. Placeholders in square brackets are replaced when sent. */
export interface EmailAutomation {
  runOrder: string
  description: string
  recipient: string
  subject: string
  body: string
  attachment: string
  active: boolean
}

export interface SentEmail {
  id: number
  runOrder: string
  to: string
  subject: string
  body: string
  attachment: string
  sentAt: string
}
