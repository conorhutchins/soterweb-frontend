import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  ssr: false,
  css: ['~/assets/css/main.css'],
  app: {
    baseURL: process.env.NUXT_APP_BASE_URL || '/',
    head: {
      title: 'SoterWeb',
    },
  },
  modules: ['@nuxt/eslint', 'shadcn-nuxt'],
  vite: {
    plugins: [tailwindcss()],
  },
  shadcn: {
    componentDir: './app/components/ui',
  },
})
