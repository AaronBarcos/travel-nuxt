// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['nuxt-mcp', '@nuxtjs/tailwindcss'],
  css: ['~/assets/css/main.css'],
  nitro: {
    esbuild: {
      options: {
        target: 'node18'
      }
    },
    experimental: {
      wasm: true
    },
    externals: {
      inline: ['@supabase/supabase-js']
    }
  },
  vite: {
    optimizeDeps: {
      include: ['@supabase/supabase-js']
    }
  },
  runtimeConfig: {
    openaiApiKey: process.env.OPENAI_API_KEY,
    travelMcpUrl: process.env.TRAVEL_MCP_URL || 'https://travel-mcp.onrender.com/mcp',
    public: {
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'https://skyai.travel',
      supabaseUrl: process.env.NUXT_PUBLIC_SUPABASE_URL || '',
      supabaseAnonKey: process.env.NUXT_PUBLIC_SUPABASE_ANON_KEY || ''
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