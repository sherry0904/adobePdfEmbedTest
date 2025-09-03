export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  runtimeConfig: {
    // 金鑰只存在於伺服器端，客戶端無法存取
    pdfViewerSecretToken: process.env.PDF_VIEWER_SECRET_TOKEN,
    public: {
      pdfEmbedClientId: process.env.PDF_EMBED_CLIENT_ID,
    },
  },
  nitro: {
    // routeRules: {
    //   '/': {
    //     headers: {
    //       'Content-Security-Policy': "script-src 'self' https://documentcloud.adobe.com 'unsafe-inline';"
    //     }
    //   }
    // },
    includeFiles: ['private-files/**'],
  }
})
