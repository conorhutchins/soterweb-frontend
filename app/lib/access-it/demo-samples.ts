/** Refresh only untouched samples, once per local day. Real demo interactions lose this marker. */
export function refreshSampleDates<T extends { id: number, demoSampleDay?: string }>(records: T[], freshSamples: T[], day: string, dateKeys: (keyof T)[]): T[] {
  let changed = false
  const refreshed = records.map((record) => {
    if (!record.demoSampleDay || record.demoSampleDay === day) return record
    const sample = freshSamples.find((item) => item.id === record.id)
    if (!sample) return record
    changed = true
    const result: T = { ...record, demoSampleDay: day }
    for (const key of dateKeys) result[key] = sample[key]
    return result
  })
  return changed ? refreshed : records
}

export function preserveDemoInteraction(record: { demoSampleDay?: string }) {
  delete record.demoSampleDay
}
