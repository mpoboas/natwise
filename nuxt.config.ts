// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    devtools: { enabled: false },
    modules: ["@nuxtjs/tailwindcss", '@nuxtjs/supabase'],
    supabase: {
      redirect: false,
    },
    css: ['element-plus/dist/index.css',
          '~/assets/styles/global.css'
    ],
    compatibilityDate: "2024-12-12",
});