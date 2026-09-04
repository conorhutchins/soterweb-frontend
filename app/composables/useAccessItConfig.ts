import { LOG_OFF_OPTIONS, LOG_ON_REASONS, defaultEmailAutomations, defaultENotes, defaultParameters } from '~/lib/access-it/config-defaults'
import type { EmailAutomation, ENote, SystemParameter } from '~/types/access-it'

/**
 * The module's configuration: system parameters, eNotes and email automations. Every kiosk
 * screen reads its wording and behaviour from here rather than from code.
 */
export function useAccessItConfig() {
  const { state: parameters, reset: resetParameters } = usePersistedState<SystemParameter[]>('access-it-parameters', () => structuredClone(defaultParameters))
  const { state: eNotes, reset: resetENotes } = usePersistedState<ENote[]>('access-it-enotes', () => structuredClone(defaultENotes))
  const { state: emailAutomations, reset: resetAutomations } = usePersistedState<EmailAutomation[]>('access-it-email-automations', () => structuredClone(defaultEmailAutomations))

  function param(key: string) {
    return parameters.value.find((parameter) => parameter.key === key)?.value ?? ''
  }

  function paramIsYes(key: string) {
    return param(key) === 'Yes'
  }

  function updateParameter(key: string, value: string) {
    const parameter = parameters.value.find((candidate) => candidate.key === key)
    if (parameter) parameter.value = value
  }

  function resetParameter(key: string) {
    const parameter = parameters.value.find((candidate) => candidate.key === key)
    if (parameter) parameter.value = parameter.defaultValue
  }

  function eNote(code: string): ENote {
    return eNotes.value.find((note) => note.code === code) ?? { code, group: 'Log on', screen: '', title: '', body: '' }
  }

  function updateENote(code: string, changes: Pick<ENote, 'title' | 'body'>) {
    const note = eNotes.value.find((candidate) => candidate.code === code)
    if (note) Object.assign(note, changes)
  }

  function resetENote(code: string) {
    const note = eNotes.value.find((candidate) => candidate.code === code)
    const original = defaultENotes.find((candidate) => candidate.code === code)
    if (note && original) Object.assign(note, { title: original.title, body: original.body })
  }

  function automation(runOrder: string) {
    return emailAutomations.value.find((candidate) => candidate.runOrder === runOrder)
  }

  function updateAutomation(runOrder: string, changes: Partial<Omit<EmailAutomation, 'runOrder'>>) {
    const target = automation(runOrder)
    if (target) Object.assign(target, changes)
  }

  /** Log on reasons after the hide parameters and the emergency work switch are applied. */
  const visibleLogOnReasons = computed(() => LOG_ON_REASONS.filter((reason) => {
    if (paramIsYes(reason.hideParameter)) return false
    if (reason.code === 'B' && !paramIsYes('Site Access Allow Emergency Work')) return false
    return true
  }))

  /** Log off options after the hide parameters are applied. */
  const visibleLogOffOptions = computed(() => LOG_OFF_OPTIONS.filter((option) => !paramIsYes(option.hideParameter)))

  const visitorsCanSelfServe = computed(() => paramIsYes('Site Access Allow Visitors to LogIn'))
  const anonymousAccessAllowed = computed(() => paramIsYes('Site Access Allow Anonymous Access'))

  function resetAll() {
    resetParameters()
    resetENotes()
    resetAutomations()
  }

  return {
    parameters,
    eNotes,
    emailAutomations,
    param,
    paramIsYes,
    updateParameter,
    resetParameter,
    eNote,
    updateENote,
    resetENote,
    automation,
    updateAutomation,
    visibleLogOnReasons,
    visibleLogOffOptions,
    visitorsCanSelfServe,
    anonymousAccessAllowed,
    resetAll,
  }
}
