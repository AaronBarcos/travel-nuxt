// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['nuxt-mcp', '@nuxtjs/tailwindcss', '@nuxtjs/supabase'],
  css: ['~/assets/css/main.css'],
  runtimeConfig: {
    openaiApiKey: process.env.OPENAI_API_KEY,
    travelMcpUrl: process.env.TRAVEL_MCP_URL || 'https://travel-mcp.onrender.com/mcp',
    public: {
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'https://skyai.travel'
    }
  },
  supabase: {
    redirectOptions: {
      login: '/login',
      callback: '/',
      exclude: ['/']
    }
  },
  app: {
    head: {
      htmlAttrs: { lang: 'es' },
      meta: [
        { name: 'theme-color', content: '#1d4ed8' }
      ]
    }
  }
})