<script setup lang="ts">
import { toast } from 'vue-sonner'
import type { ParameterGroup } from '~/types/access-it'

// System parameters grouped by purpose. Every change saves immediately.
const { parameters, updateParameter, resetParameter } = useAccessItConfig()

const groupOrder: { group: ParameterGroup, intro: string }[] = [
  { group: 'Working window', intro: 'Core hours set the standard day; the flex period extends it either side with a reminder. 00:00 deactivates a check.' },
  { group: 'Compliance checks', intro: 'The five checks run at the point of entry. Insurance, accreditation and RAMS belong to the organisation; induction and certification to the person.' },
  { group: 'Log on options', intro: 'Which reasons for attendance a contractor can choose.' },
  { group: 'Log off options', intro: 'Which log off routes a contractor can choose.' },
  { group: 'Anonymous access', intro: 'Contractors without a SOTERweb account can log on with a verification code, a company code, or both.' },
  { group: 'Visitors', intro: 'The self-service visitor route and how visitors are matched at log off.' },
  { group: 'Integration', intro: 'How Access IT works with the Permit to Work and asset register modules.' },
  { group: 'System', intro: 'Menu visibility and document paths used across the system.' },
]

const groups = computed(() => groupOrder
  .map((entry) => ({ ...entry, parameters: parameters.value.filter((parameter) => parameter.group === entry.group) }))
  .filter((entry) => entry.parameters.length))

function change(key: string, value: string) {
  updateParameter(key, value)
  toast.success('Parameter saved', { description: key })
}

function reset(key: string) {
  resetParameter(key)
  toast.success('Parameter reset to default', { description: key })
}
</script>

<template>
  <div class="space-y-6">
    <section v-for="entry in groups" :key="entry.group" class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <header class="border-b border-slate-100 bg-slate-50 px-5 py-4">
        <h2 class="text-base font-semibold text-ink">{{ entry.group }}</h2>
        <p class="mt-1 text-sm text-slate-500">{{ entry.intro }}</p>
      </header>
      <div class="divide-y divide-slate-100">
        <AccessItParameterEditor v-for="parameter in entry.parameters" :key="parameter.key" :parameter="parameter" @change="change(parameter.key, $event)" @reset="reset(parameter.key)" />
      </div>
    </section>
  </div>
</template>
