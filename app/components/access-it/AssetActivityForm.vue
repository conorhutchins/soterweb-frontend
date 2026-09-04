<script setup lang="ts">
import { FileUp, ImageUp, LogOut, Plus } from '@lucide/vue'
import type { Asset, AssetActivity, AssetActivityType, ConditionStatus, ServiceConditionRating } from '~/types/access-it'

// Captures one asset register update as the contractor leaves site.
const props = defineProps<{
  assets: Asset[]
  type: AssetActivityType
}>()

const emit = defineEmits<{
  next: [activity: AssetActivity]
  finish: [activity: AssetActivity | null]
}>()

const RATINGS: ServiceConditionRating[] = ['1 - Good', '2 - Fair', '3 - Poor', '4 - Very poor', '5 - Failed']
const STATUSES: ConditionStatus[] = ['Acceptable', 'Monitor', 'Action required', 'Unacceptable']

const inputClass = 'h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-hidden transition placeholder:text-slate-400 focus:border-soter-500 focus:ring-3 focus:ring-soter-100'

function blankForm() {
  return {
    description: '',
    location: '',
    manufacturer: '',
    model: '',
    serialNumber: '',
    serviceConditionRating: '1 - Good' as ServiceConditionRating,
    conditionStatus: 'Acceptable' as ConditionStatus,
    notes: '',
    certificateFileName: '',
    photoFileName: '',
  }
}

const parentTag = ref('')
const assetTag = ref('')
const form = reactive(blankForm())
const error = ref('')

const parents = computed(() => Array.from(new Set(props.assets.map((asset) => asset.parentTag))))
const children = computed(() => props.assets.filter((asset) => asset.parentTag === parentTag.value))
const selectedAsset = computed(() => props.assets.find((asset) => asset.tag === assetTag.value) ?? null)

const isNewAsset = computed(() => props.type === 'New asset installed')
const isReplacement = computed(() => props.type === 'Replaced asset')
const isRemoval = computed(() => props.type === 'Removed asset')
const showDetailFields = computed(() => isNewAsset.value || isReplacement.value)
const showCondition = computed(() => !isRemoval.value)

const assetLabel = computed(() => {
  if (isNewAsset.value) return 'Base the new asset on'
  if (isReplacement.value) return 'Asset being replaced'
  if (isRemoval.value) return 'Asset removed'
  return 'Asset worked on'
})

const notesPlaceholder = computed(() => {
  if (isNewAsset.value) return 'e.g. New light fitting installed'
  if (isReplacement.value) return 'e.g. Replaced cooker hood with like-for-like unit'
  if (isRemoval.value) return 'e.g. Removed, unit was beyond economical repair'
  if (props.type === 'Repaired asset') return 'e.g. Repaired locking mechanism'
  return 'e.g. Annual scheme of examination completed'
})

watch(parentTag, () => {
  assetTag.value = ''
})

watch(selectedAsset, (asset) => {
  if (!asset) return
  form.description = asset.description
  form.location = asset.location
  form.manufacturer = asset.manufacturer
  form.model = asset.model
  form.serialNumber = showDetailFields.value ? '' : asset.serialNumber
  form.serviceConditionRating = asset.serviceConditionRating
  form.conditionStatus = asset.conditionStatus
})

function reset() {
  parentTag.value = ''
  assetTag.value = ''
  Object.assign(form, blankForm())
  error.value = ''
}

function pickFile(event: Event, key: 'certificateFileName' | 'photoFileName') {
  const input = event.target as HTMLInputElement
  form[key] = input.files?.[0]?.name ?? ''
}

function buildActivity(): AssetActivity | null {
  error.value = ''
  const asset = selectedAsset.value

  if (!asset) {
    error.value = 'Select the asset first.'
    return null
  }
  if (showDetailFields.value && !form.description.trim()) {
    error.value = 'Describe the asset.'
    return null
  }
  if (!form.notes.trim()) {
    error.value = 'Add a short note describing the work.'
    return null
  }

  return {
    type: props.type,
    assetTag: asset.tag,
    parentTag: asset.parentTag,
    description: form.description.trim(),
    location: form.location.trim(),
    manufacturer: form.manufacturer.trim(),
    model: form.model.trim(),
    serialNumber: form.serialNumber.trim(),
    serviceConditionRating: form.serviceConditionRating,
    conditionStatus: form.conditionStatus,
    notes: form.notes.trim(),
    certificateFileName: form.certificateFileName || undefined,
    photoFileName: form.photoFileName || undefined,
  }
}

function next() {
  const activity = buildActivity()
  if (!activity) return
  emit('next', activity)
  reset()
}

function finish() {
  if (!assetTag.value && !form.notes.trim()) {
    emit('finish', null)
    return
  }
  const activity = buildActivity()
  if (activity) emit('finish', activity)
}
</script>

<template>
  <form class="space-y-6" @submit.prevent="next">
    <div class="grid gap-4 sm:grid-cols-2">
      <label class="block space-y-2">
        <span class="text-sm font-medium text-slate-700">Parent asset / system</span>
        <select v-model="parentTag" :class="inputClass">
          <option value="" disabled>Choose a system</option>
          <option v-for="parent in parents" :key="parent" :value="parent">{{ parent }}</option>
        </select>
      </label>
      <label class="block space-y-2">
        <span class="text-sm font-medium text-slate-700">{{ assetLabel }}</span>
        <select v-model="assetTag" :disabled="!parentTag" :class="inputClass" class="disabled:bg-slate-50 disabled:text-slate-400">
          <option value="" disabled>{{ parentTag ? 'Choose an asset' : 'Choose a system first' }}</option>
          <option v-for="asset in children" :key="asset.tag" :value="asset.tag">{{ asset.tag }} · {{ asset.description }}</option>
        </select>
      </label>
    </div>

    <div v-if="selectedAsset" class="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
      <p class="text-xs text-slate-500">Previously recorded as <span class="font-medium text-slate-700">{{ selectedAsset.serviceConditionRating }}</span> and <span class="font-medium text-slate-700">{{ selectedAsset.conditionStatus }}</span>, located at {{ selectedAsset.location }}.</p>

      <div v-if="showDetailFields" class="grid gap-4 sm:grid-cols-2">
        <label class="block space-y-2 sm:col-span-2">
          <span class="text-sm font-medium text-slate-700">Description</span>
          <input v-model="form.description" type="text" :class="inputClass" />
        </label>
        <label class="block space-y-2 sm:col-span-2">
          <span class="text-sm font-medium text-slate-700">Location</span>
          <input v-model="form.location" type="text" :class="inputClass" />
        </label>
        <label class="block space-y-2">
          <span class="text-sm font-medium text-slate-700">Manufacturer</span>
          <input v-model="form.manufacturer" type="text" :class="inputClass" />
        </label>
        <label class="block space-y-2">
          <span class="text-sm font-medium text-slate-700">Model / part number</span>
          <input v-model="form.model" type="text" :class="inputClass" />
        </label>
        <label class="block space-y-2 sm:col-span-2">
          <span class="text-sm font-medium text-slate-700">Serial number</span>
          <input v-model="form.serialNumber" type="text" placeholder="Serial number of the new unit" :class="inputClass" />
        </label>
      </div>

      <div v-if="showCondition" class="grid gap-4 sm:grid-cols-2">
        <label class="block space-y-2">
          <span class="text-sm font-medium text-slate-700">Service condition rating</span>
          <select v-model="form.serviceConditionRating" :class="inputClass">
            <option v-for="rating in RATINGS" :key="rating" :value="rating">{{ rating }}</option>
          </select>
        </label>
        <label class="block space-y-2">
          <span class="text-sm font-medium text-slate-700">Condition status</span>
          <select v-model="form.conditionStatus" :class="inputClass">
            <option v-for="status in STATUSES" :key="status" :value="status">{{ status }}</option>
          </select>
        </label>
      </div>

      <label class="block space-y-2">
        <span class="text-sm font-medium text-slate-700">Notes</span>
        <textarea v-model="form.notes" rows="3" :placeholder="notesPlaceholder" class="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-hidden transition placeholder:text-slate-400 focus:border-soter-500 focus:ring-3 focus:ring-soter-100" />
      </label>

      <div v-if="!isRemoval" class="grid gap-4 sm:grid-cols-2">
        <label class="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-slate-300 bg-white px-4 py-3 text-sm text-slate-600 transition hover:border-soter-500 hover:bg-soter-50">
          <FileUp class="size-5 shrink-0 text-slate-400" />
          <span class="min-w-0 flex-1 truncate">{{ form.certificateFileName || 'Attach certificate (PDF or JPG)' }}</span>
          <input type="file" accept=".pdf,.jpg,.jpeg" class="sr-only" @change="pickFile($event, 'certificateFileName')" />
        </label>
        <label class="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-slate-300 bg-white px-4 py-3 text-sm text-slate-600 transition hover:border-soter-500 hover:bg-soter-50">
          <ImageUp class="size-5 shrink-0 text-slate-400" />
          <span class="min-w-0 flex-1 truncate">{{ form.photoFileName || 'Attach photograph (JPG)' }}</span>
          <input type="file" accept="image/jpeg" class="sr-only" @change="pickFile($event, 'photoFileName')" />
        </label>
      </div>
    </div>

    <p v-if="error" role="alert" class="text-sm font-medium text-rose-600">{{ error }}</p>

    <div class="grid gap-3 sm:grid-cols-2">
      <button type="submit" class="flex h-13 items-center justify-center gap-2 rounded-2xl border border-soter-200 bg-soter-50 px-5 text-sm font-semibold text-soter-700 transition hover:bg-soter-100 focus:outline-hidden focus:ring-3 focus:ring-soter-100"><Plus class="size-4" /> Next activity</button>
      <button type="button" class="flex h-13 items-center justify-center gap-2 rounded-2xl bg-soter-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-soter-700 focus:outline-hidden focus:ring-3 focus:ring-soter-200" @click="finish"><LogOut class="size-4" /> Log off site</button>
    </div>
  </form>
</template>
