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
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'https://skyai.travel',
      supabaseUrl: process.env.NUXT_PUBLIC_SUPABASE_URL || 'https://kanbpunmsqzlzrfdctyo.supabase.co',
      supabaseAnonKey: process.env.NUXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImthbmJwdW5tc3F6bHpyZmRjdHlvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM0NjA1NDcsImV4cCI6MjA3OTAzNjU0N30.VNbUvDbmtQmybRrJC_RIt1UXqd0_IQJsFZMCDojCA4Q'
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
