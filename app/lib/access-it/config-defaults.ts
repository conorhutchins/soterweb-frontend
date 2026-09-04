import type { EmailAutomation, ENote, LogOffOption, LogOnReason, SystemParameter } from '~/types/access-it'

export const LOG_ON_REASONS: { code: LogOnReason, label: string, hideParameter: string }[] = [
  { code: 'A', label: 'General work', hideParameter: 'AccessIT Sign IN Hide Option A' },
  { code: 'B', label: 'Essential emergency work', hideParameter: 'AccessIT Sign IN Hide Option B' },
  { code: 'C', label: 'Work under an approved permit', hideParameter: 'AccessIT Sign IN Hide Option C' },
  { code: 'D', label: 'Request a permit', hideParameter: 'AccessIT Sign IN Hide Option D' },
  { code: 'E', label: 'Request a permit extension', hideParameter: 'AccessIT Sign IN Hide Option E' },
]

export const LOG_OFF_OPTIONS: { code: LogOffOption, label: string, hideParameter: string, remainsOnSite: boolean, permitAction: 'none' | 'suspend' | 'close' }[] = [
  { code: 'A', label: 'Log out of site', hideParameter: 'AccessIT Sign OUT Hide Option A', remainsOnSite: false, permitAction: 'none' },
  { code: 'B', label: 'Log out of site and suspend permit', hideParameter: 'AccessIT Sign OUT Hide Option B', remainsOnSite: false, permitAction: 'suspend' },
  { code: 'C', label: 'Log out of site and close permit', hideParameter: 'AccessIT Sign OUT Hide Option C', remainsOnSite: false, permitAction: 'close' },
  { code: 'D', label: 'Suspend permit and remain on site', hideParameter: 'AccessIT Sign OUT Hide Option D', remainsOnSite: true, permitAction: 'suspend' },
  { code: 'E', label: 'Close permit and remain on site', hideParameter: 'AccessIT Sign OUT Hide Option E', remainsOnSite: true, permitAction: 'close' },
]

type ParameterSeed = Omit<SystemParameter, 'value'> & { value?: string }

// The legacy default is kept on every parameter; `value` overrides it for the demo tenant so the
// journeys are worth demonstrating (core hours on, visitors on, asset register on).
const parameterSeeds: ParameterSeed[] = [
  { key: 'AccessIT Sign IN Hide Option A', description: 'Hides log on reason A (General work)', group: 'Log on options', type: 'yesno', defaultValue: 'No' },
  { key: 'AccessIT Sign IN Hide Option B', description: 'Hides log on reason B (Essential emergency work)', group: 'Log on options', type: 'yesno', defaultValue: 'No' },
  { key: 'AccessIT Sign IN Hide Option C', description: 'Hides log on reason C (Work under an approved permit)', group: 'Log on options', type: 'yesno', defaultValue: 'No' },
  { key: 'AccessIT Sign IN Hide Option D', description: 'Hides log on reason D (Request a permit)', group: 'Log on options', type: 'yesno', defaultValue: 'No' },
  { key: 'AccessIT Sign IN Hide Option E', description: 'Hides log on reason E (Request a permit extension)', group: 'Log on options', type: 'yesno', defaultValue: 'No', value: 'Yes' },
  { key: 'AccessIT Sign OUT Hide Option A', description: 'Hides log off option A (Log out of site)', group: 'Log off options', type: 'yesno', defaultValue: 'No' },
  { key: 'AccessIT Sign OUT Hide Option B', description: 'Hides log off option B (Log out of site and suspend permit)', group: 'Log off options', type: 'yesno', defaultValue: 'No' },
  { key: 'AccessIT Sign OUT Hide Option C', description: 'Hides log off option C (Log out of site and close permit)', group: 'Log off options', type: 'yesno', defaultValue: 'No' },
  { key: 'AccessIT Sign OUT Hide Option D', description: 'Hides log off option D (Suspend permit and remain on site)', group: 'Log off options', type: 'yesno', defaultValue: 'No', value: 'Yes' },
  { key: 'AccessIT Sign OUT Hide Option E', description: 'Hides log off option E (Close permit and remain on site)', group: 'Log off options', type: 'yesno', defaultValue: 'No', value: 'Yes' },
  { key: 'Site Access Allow Anonymous Access', description: 'Allows log on without a SOTERweb account', group: 'Anonymous access', type: 'yesno', defaultValue: 'Yes' },
  { key: 'Site Access Allow Anonymous Verification Code', description: 'The code an anonymous user must enter', group: 'Anonymous access', type: 'text', defaultValue: '34ABCD' },
  { key: 'Site Access Allow Anonymous Verification Method', description: 'VC = verification code, CC = company code, VC-CC = both, NA = none', group: 'Anonymous access', type: 'select', options: ['VC', 'CC', 'VC-CC', 'NA'], defaultValue: 'VC-CC' },
  { key: 'Site Access Allow Emergency Work', description: 'Offers the essential emergency work route', group: 'Log on options', type: 'yesno', defaultValue: 'No', value: 'Yes' },
  { key: 'Site Access Allow Visitors to LogIn', description: 'Switches on the self-service visitor route', group: 'Visitors', type: 'yesno', defaultValue: 'No', value: 'Yes' },
  { key: 'Site Access Allow Visitors to LogOut Method', description: 'How a visitor is matched at log off: MOB-EMAIL, CSUM or PID', group: 'Visitors', type: 'select', options: ['MOB-EMAIL', 'CSUM', 'PID'], defaultValue: 'MOB-EMAIL' },
  { key: 'Site Access Check Accreditation Expiry', description: "Blocks log on where the organisation's accreditation has expired", group: 'Compliance checks', type: 'yesno', defaultValue: 'Yes' },
  { key: 'Site Access Check Core Hour FINISH', description: 'End of the standard working day, hh:mm (00:00 deactivates)', group: 'Working window', type: 'time', defaultValue: '00:00', value: '18:00' },
  { key: 'Site Access Check Core Hour FINISH Flex', description: 'Outer boundary after core finish, hh:mm (00:00 deactivates)', group: 'Working window', type: 'time', defaultValue: '00:00', value: '22:00' },
  { key: 'Site Access Check Core Hour START', description: 'Start of the standard working day, hh:mm (00:00 deactivates)', group: 'Working window', type: 'time', defaultValue: '00:00', value: '08:00' },
  { key: 'Site Access Check Core Hour START Flex', description: 'Outer boundary before core start, hh:mm (00:00 deactivates)', group: 'Working window', type: 'time', defaultValue: '00:00', value: '06:00' },
  { key: 'Site Access Check Induction Expiry', description: "Blocks log on where the individual's induction has expired", group: 'Compliance checks', type: 'yesno', defaultValue: 'Yes' },
  { key: 'Site Access Check Insurance Expiry', description: "Blocks log on where the organisation's insurance has expired", group: 'Compliance checks', type: 'yesno', defaultValue: 'Yes' },
  { key: 'Site Access Check Org Contact Certificate Expiry', description: "Blocks log on where the individual's certification has expired", group: 'Compliance checks', type: 'yesno', defaultValue: 'Yes' },
  { key: 'Site Access Check RAMS and Docs Expiry', description: 'Blocks log on where RAMS or documents have expired', group: 'Compliance checks', type: 'yesno', defaultValue: 'Yes' },
  { key: 'Site Access Expected Logout Max Duration', description: 'Longest permitted stay in hours (0 = unlimited)', group: 'Working window', type: 'number', defaultValue: '0', value: '12' },
  { key: 'Site Access Show Project Lookup', description: 'Project field at log on: Yes = dropdown of live permits and projects, No = free text', group: 'Integration', type: 'yesno', defaultValue: 'No' },
  { key: 'Site Access Update Asset Register on Log Out', description: 'Offers the asset register question at log off', group: 'Integration', type: 'yesno', defaultValue: 'No', value: 'Yes' },
  { key: 'Site Access User Site Code for Visitors', description: 'Requires visitors to type the code shown on screen', group: 'Visitors', type: 'yesno', defaultValue: 'Yes' },
  { key: 'System Menu Show Access IT (Not Logged In)', description: 'Shows the Access IT tab to signed-out users', group: 'System', type: 'yesno', defaultValue: 'Yes' },
  { key: 'System Menu Show Access IT Tab', description: 'Shows the Access IT tab in the main menu', group: 'System', type: 'yesno', defaultValue: 'Yes' },
  { key: 'System Email Automation Attachments Path', description: 'Directs the system to the Document Manager folder used for email attachments', group: 'System', type: 'text', defaultValue: 'C:\\inetpub\\wwwroot\\docs\\orgdocs\\1\\' },
]

export const defaultParameters: SystemParameter[] = parameterSeeds.map((seed) => ({ ...seed, value: seed.value ?? seed.defaultValue }))

export const defaultENotes: ENote[] = [
  { code: '1', group: 'Log on', screen: 'Log on main screen', title: 'Log in to site', body: 'Enter your username and password, then choose the reason you are attending today.' },
  { code: '2', group: 'Log on', screen: 'Log on compliance message', title: 'Working safely on site', body: "You agree to work safely and in accordance with the organisation's expectations, site rules and any permit conditions that apply to your work." },
  { code: '2a', group: 'Log on', screen: 'Log on compliance message, emergency work', title: 'Essential emergency work', body: 'Emergency work must be limited to making the situation safe. Report to the duty manager on arrival and before any intrusive work begins.' },
  { code: '2A', group: 'Log on', screen: 'Log on out of hours message', title: 'You are logging on outside core hours', body: 'The working hours for contractors are [CoreHours]. Please endeavour to carry out all work within these times. If you need to work outside of these hours you should obtain an Out of Hours Authorisation.' },
  { code: '3', group: 'Log on', screen: 'Log on question guidance (work details screen)', title: 'Tell us where you are working', body: 'Select the building, describe the work you are carrying out and tell us when you expect to leave so we can account for you in an emergency.' },
  { code: '3A', group: 'Log on', screen: 'Log on message, asbestos', title: 'Asbestos warning', body: 'The building you are working in was constructed before the year 2000. Before carrying out any intrusive work, please acknowledge that you have considered the risk of encountering asbestos and will follow the asbestos management procedures.' },
  { code: '3B', group: 'Log on', screen: 'Log on message, RAMS', title: 'Risk assessments and method statements', body: 'Your organisation is registered as undertaking high risk work. Please confirm that you will work in accordance with your approved RAMS and stop work if conditions change.' },
  { code: '4', group: 'Log on', screen: 'Log on accepted', title: 'Login accepted', body: 'Please confirm your mobile number and email address so we can reach you while you are on site. Review any potential conflicts listed below before starting work.' },
  { code: '5', group: 'Log on', screen: 'Log on access denied', title: 'Access denied', body: "Please review the following. Contact your organisation's SOTER administrator if items need updating." },
  { code: '5A', group: 'Log on', screen: 'Log on access denied, initial compliance check', title: 'Compliance check failed', body: 'One or more compliance checks did not pass. Entry remains blocked until the documentation is brought up to date by your organisation.' },
  { code: '5B', group: 'Log on', screen: 'Log on access denied, asbestos', title: 'Asbestos acknowledgement declined', body: 'You cannot log on to this building without acknowledging the asbestos warning. Speak to the estates team before attending.' },
  { code: '5C', group: 'Log on', screen: 'Log on access denied, RAMS', title: 'RAMS acknowledgement declined', body: 'You cannot log on without confirming that you will work to your approved risk assessments and method statements.' },
  { code: '5D', group: 'Log on', screen: 'Log on access denied, out of hours', title: 'Outside permitted hours', body: 'You are attempting to log on outside the permitted working window. An Out of Hours Authorisation is required for work at this time.' },
  { code: '5E', group: 'Log on', screen: 'Log on access denied, out of hours by location', title: 'Outside permitted hours for this location', body: 'This location cannot be accessed at this time. Contact the estates helpdesk to arrange access.' },
  { code: '6', group: 'Log off', screen: 'Log off main screen', title: 'Log out of site', body: 'Ensure work areas are left safe and tidy. Return keys (if applicable) and inform operational staff you are leaving site.' },
  { code: '7', group: 'Log off', screen: 'Log off first screen', title: 'Choose how you are leaving', body: 'Select the option that applies to your visit today. Permit options only apply where you are working under a permit.' },
  { code: '7a', group: 'Log off', screen: 'Log off asset register question', title: 'Please confirm if the asset register needs updating', body: 'You are the designated PPM contractor for assets in this building. Record any assets you serviced, installed, replaced, repaired or removed during this visit.' },
  { code: '8', group: 'Log off', screen: 'Log off final screen', title: 'Logout accepted', body: 'Thank you. Your attendance record has been closed.' },
  { code: '9', group: 'Log off', screen: 'Log off final screen notification', title: 'Before you leave', body: 'Please ensure any keys and equipment are returned and that your work area has been left safe.' },
  { code: 'V0', group: 'Visitors', screen: 'Visitor log on / log off main screen', title: 'Visitor site notification', body: 'Visitors are required to read and observe the visitor rules, a copy of which is available from your host.' },
  { code: 'V1', group: 'Visitors', screen: 'Visitor log on main screen', title: 'Visitor access', body: 'Select the building you are visiting and type the code shown to continue.' },
  { code: 'V2', group: 'Visitors', screen: 'Visitor log on question screen', title: 'Tell us about your visit', body: 'Let us know who you are, who you are visiting and when you expect to leave. Your host will be notified that you have arrived.' },
  { code: 'V3', group: 'Visitors', screen: 'Visitor log on accept screen', title: 'Login accepted', body: 'Please go directly to meet your host. A digital visitor pass has been emailed to you with a link to log off when you leave.' },
  { code: 'V4', group: 'Visitors', screen: 'Visitor log off main screen', title: 'Visitor leaving site', body: 'Please ensure any keys and equipment are returned before you leave.' },
  { code: 'V5', group: 'Visitors', screen: 'Visitor log off accept screen', title: 'Logout accepted', body: 'Thank you for visiting. Your departure has been recorded.' },
  { code: 'VP', group: 'Visitors', screen: 'Visitor print screen', title: 'Visitor pass', body: 'Please wear this pass while on site and return it to reception when you leave.' },
]

export const defaultEmailAutomations: EmailAutomation[] = [
  { runOrder: '00003990', description: 'Visitor log off details sent to a visitor registered at reception', recipient: 'Visitor', subject: 'Your visitor pass for [Building]', body: 'Hello [Name],\n\nYour visit to [Building] to see [Host] has been recorded at [LoggedOn].\n\nWhen leaving please log off here: [LogOffLink]', attachment: 'Visitor site rules.pdf', active: true },
  { runOrder: '00003995', description: 'Visitor log off details sent to a visitor who logged themselves on', recipient: 'Visitor', subject: 'Your visitor pass for [Building]', body: 'Hello [Name],\n\nThank you for logging on at [Building]. Your host [Host] has been notified.\n\nWhen leaving please log off here: [LogOffLink]', attachment: 'Visitor site rules.pdf', active: true },
  { runOrder: '00004000', description: 'Visitor log off details sent to a visitor added by site request', recipient: 'Visitor', subject: 'Your pre-booked visit to [Building]', body: 'Hello [Name],\n\nYou are expected at [Building] on [Expected]. Use this link on arrival to record your presence and notify [Host]: [ArrivalLink]', attachment: '', active: true },
  { runOrder: '00004005', description: 'Notifies the system-held host contact that their visitor has arrived', recipient: 'Host', subject: 'Your visitor [Name] has arrived', body: 'Hello [Host],\n\n[Name] from [Company] has arrived at [Building] at [LoggedOn] to see you. Reason for visit: [Description].', attachment: '', active: true },
  { runOrder: '00004006', description: 'Notifies an ad-hoc host contact that their visitor has arrived', recipient: 'Host', subject: 'Your visitor [Name] has arrived', body: 'Hello,\n\n[Name] from [Company] has arrived at [Building] at [LoggedOn] to see you.', attachment: '', active: true },
  { runOrder: '00004010', description: 'Notifies the nominated Managed By contact that a contractor has logged on', recipient: 'Managed By contact', subject: '[Name] has logged on at [Building]', body: 'Hello [Host],\n\n[Name] ([Company]) logged on at [Building] at [LoggedOn] for: [Description]. Expected log off: [Expected].', attachment: '', active: true },
  { runOrder: '00004200a', description: 'Reminder to anyone still logged on after core hours', recipient: 'Contractor', subject: 'You are still logged on at [Building]', body: 'Hello [Name],\n\nOur records show you are still logged on at [Building]. If you have left site please log off here: [LogOffLink]', attachment: '', active: true },
  { runOrder: '00004200b', description: 'Second reminder to anyone still logged on later in the evening', recipient: 'Contractor', subject: 'Reminder: you are still logged on at [Building]', body: 'Hello [Name],\n\nYou remain logged on at [Building]. Please log off if you have left site: [LogOffLink]', attachment: '', active: true },
  { runOrder: '00004210a', description: 'Warning one hour before expected log out time (emergency work)', recipient: 'Contractor', subject: 'Your expected log off time is approaching', body: 'Hello [Name],\n\nYour expected log off time at [Building] is [Expected]. Please log off or update your expected time.', attachment: '', active: true },
  { runOrder: '00004210b', description: 'Alert after expected log out time has passed (emergency work)', recipient: 'Contractor', subject: 'Your expected log off time has passed', body: 'Hello [Name],\n\nYour expected log off time at [Building] was [Expected] and you are still recorded as on site.', attachment: '', active: true },
  { runOrder: '00004500', description: 'Sends the current on-site list to the nominated emergency contact', recipient: 'Nominated emergency contact', subject: 'People on site at [SentAt]', body: 'The following people are recorded as on site:\n\n[OnSiteList]', attachment: '', active: true },
  { runOrder: '00004900', description: 'Site notification for emergency work', recipient: 'Estates duty manager', subject: 'Emergency work logged at [Building]', body: '[Name] ([Company]) has logged on for essential emergency work at [Building]: [Description].', attachment: '', active: true },
]
