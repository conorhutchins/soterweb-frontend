<script setup lang="ts">
import { ArrowRight } from '@lucide/vue'
import { maximumStayHours } from '~/lib/access-it/compliance'
import { fromDateTimeLocal, hoursBetween, hoursFromNow, toDateTimeLocal } from '~/lib/access-it/time'
import type { ContractorIdentity, ContractorWorkDetails } from '~/types/access-it'

const props = defineProps<{ identity: ContractorIdentity }>()
const emit = defineEmits<{ submit: [details: ContractorWorkDetails] }>()

const directory = useSiteDirectory()
const config = useAccessItConfig()

const inputClass = 'h-12 w-full rounded-xl border border-slate-200 bg-white px-3 text-base outline-hidden transition placeholder:text-slate-400 focus:border-soter-500 focus:ring-3 focus:ring-soter-100'

const form = reactive({ buildingId: '', location: '', permitChoice: '', description: '', expectedLogOff: toDateTimeLocal(hoursFromNow(8)) })
const error = ref('')

const showProjectLookup = computed(() => config.paramIsYes('Site Access Show Project Lookup'))
const projectOptions = computed(() => directory.currentPermitsFor(props.identity.organisation.id, props.identity.contractor?.id))
const maxStay = computed(() => maximumStayHours(config.param))
const needsFreeText = computed(() => !showProjectLookup.value || form.permitChoice === 'other')

const resolvedDescription = computed(() => {
  if (showProjectLookup.value && form.permitChoice && form.permitChoice !== 'other') {
    const permit = projectOptions.value.find((candidate) => String(candidate.id) === form.permitChoice)
    return permit ? `${permit.description} (${permit.reference})` : ''
  }
  return form.description.trim()
})

function submit() {
  error.value = ''
  const building = directory.buildingById(Number(form.buildingId))

  if (!building) {
    error.value = 'Choose the building you are working in.'
    return
  }
  if (!form.location.trim()) {
    error.value = 'Tell us where in the building you will be working.'
    return
  }
  if (!resolvedDescription.value) {
    error.value = 'Describe the work you are carrying out.'
    return
  }
  if (!form.expectedLogOff) {
    error.value = 'Tell us when you expect to leave.'
    return
  }

  const expectedLogOffAt = fromDateTimeLocal(form.expectedLogOff)
  const hours = hoursBetween(new Date().toISOString(), expectedLogOffAt)

  if (hours <= 0) {
    error.value = 'Your expected log off time must be later than now.'
    return
  }
  if (maxStay.value && hours > maxStay.value) {
    error.value = `The longest permitted stay is ${maxStay.value} hours. Choose an earlier log off time.`
    return
  }

  emit('submit', { building, location: form.location.trim(), description: resolvedDescription.value, expectedLogOffAt })
}
</script>

<template>
  <form class="space-y-7" @submit.prevent="submit">
    <AccessItENoteCard code="3" />

    <div class="grid gap-4 sm:grid-cols-2">
      <label class="block space-y-2 sm:col-span-2">
        <span class="text-sm font-medium text-slate-700">Building</span>
        <select v-model="form.buildingId" :class="inputClass">
          <option value="" disabled>Choose a building or location</option>
          <option v-for="building in directory.activeBuildings.value" :key="building.id" :value="String(building.id)">{{ building.name }}</option>
        </select>
      </label>

      <label class="block space-y-2 sm:col-span-2">
        <span class="text-sm font-medium text-slate-700">Where in the building</span>
        <input v-model="form.location" type="text" placeholder="e.g. Plant room, level 2 corridor, roof" :class="inputClass" />
      </label>

      <label v-if="showProjectLookup" class="block space-y-2 sm:col-span-2">
        <span class="text-sm font-medium text-slate-700">Project or permit</span>
        <select v-model="form.permitChoice" :class="inputClass">
          <option value="" disabled>Choose the work you are attending for</option>
          <option v-for="permit in projectOptions" :key="permit.id" :value="String(permit.id)">{{ permit.reference }} · {{ permit.description }}</option>
          <option value="other">Other (describe below)</option>
        </select>
      </label>

      <label v-if="needsFreeText" class="block space-y-2 sm:col-span-2">
        <span class="text-sm font-medium text-slate-700">Description of work</span>
        <textarea v-model="form.description" rows="3" placeholder="What are you doing on site today?" class="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-base outline-hidden transition placeholder:text-slate-400 focus:border-soter-500 focus:ring-3 focus:ring-soter-100" />
      </label>

      <label class="block space-y-2 sm:col-span-2">
        <span class="text-sm font-medium text-slate-700">Expected log off time</span>
        <input v-model="form.expectedLogOff" type="datetime-local" :class="inputClass" />
        <span class="block text-xs text-slate-500">{{ maxStay ? `The longest permitted stay is ${maxStay} hours.` : 'There is no limit on how long you may stay.' }}</span>
      </label>
    </div>

    <p v-if="error" role="alert" class="text-sm font-medium text-rose-600">{{ error }}</p>

    <button type="submit" class="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-soter-600 text-base font-semibold text-white shadow-sm transition hover:bg-soter-700 focus:outline-hidden focus:ring-3 focus:ring-soter-200">Continue <ArrowRight class="size-5" /></button>
  </form>
</template>
