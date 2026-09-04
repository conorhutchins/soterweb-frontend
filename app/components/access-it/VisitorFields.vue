<script setup lang="ts">
import { OTHER_HOST, type VisitorFormState } from '~/lib/access-it/visitor-form'

// The visitor's details: who they are, who they are visiting and when they expect to leave.
// Shared by the self-service kiosk and the reception dialog.
const form = defineModel<VisitorFormState>({ required: true })

const { staffContacts } = useSiteDirectory()

const isOtherHost = computed(() => form.value.host === OTHER_HOST)

const inputClass = 'h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-hidden transition placeholder:text-slate-400 focus:border-soter-500 focus:ring-3 focus:ring-soter-100'
const labelClass = 'text-sm font-medium text-slate-700'
</script>

<template>
  <div class="grid gap-5 sm:grid-cols-2">
    <label class="space-y-2">
      <span :class="labelClass">Full name</span>
      <input v-model="form.name" required autocomplete="name" placeholder="e.g. Fred Bloggs" :class="inputClass" />
    </label>
    <label class="space-y-2">
      <span :class="labelClass">Company</span>
      <input v-model="form.company" required autocomplete="organization" placeholder="Organisation you represent" :class="inputClass" />
    </label>
    <label class="space-y-2">
      <span :class="labelClass">Mobile number</span>
      <input v-model="form.mobile" required type="tel" autocomplete="tel" placeholder="07700 900123" :class="inputClass" />
    </label>
    <label class="space-y-2">
      <span :class="labelClass">Email address</span>
      <input v-model="form.email" required type="email" autocomplete="email" placeholder="name@company.co.uk" :class="inputClass" />
    </label>
    <label class="space-y-2">
      <span :class="labelClass">Vehicle registration <span class="font-normal text-slate-400">(optional)</span></span>
      <input v-model="form.vehicleReg" placeholder="AB12 CDE" class="uppercase placeholder:normal-case" :class="inputClass" />
    </label>
    <label class="space-y-2">
      <span :class="labelClass">Visiting</span>
      <select v-model="form.host" required :class="inputClass">
        <option value="" disabled>Choose who you are visiting</option>
        <option v-for="contact in staffContacts" :key="contact.id" :value="String(contact.id)">{{ contact.name }} · {{ contact.department }}</option>
        <option :value="OTHER_HOST">Someone else</option>
      </select>
    </label>
    <template v-if="isOtherHost">
      <label class="space-y-2">
        <span :class="labelClass">Host name</span>
        <input v-model="form.hostName" required placeholder="Who are you here to see?" :class="inputClass" />
      </label>
      <label class="space-y-2">
        <span :class="labelClass">Host email</span>
        <input v-model="form.hostEmail" required type="email" placeholder="host@campusworkspace.co.uk" :class="inputClass" />
      </label>
    </template>
    <label class="space-y-2">
      <span :class="labelClass">Reason for visit</span>
      <input v-model="form.description" required placeholder="e.g. Design team meeting" :class="inputClass" />
    </label>
    <label class="space-y-2">
      <span :class="labelClass">Expected log off</span>
      <input v-model="form.expectedLogOffAt" required type="datetime-local" :class="inputClass" />
    </label>
  </div>
</template>
