<template>
  <div>
    <h1>PDF 預覽範例</h1>
    <client-only>
      <!--
        AdobePdfViewer 使用說明：
        1. clientId 已自動從 runtimeConfig 取得
        2. pdfUrl 可傳入 /sample.pdf 或其他公開 PDF 路徑
      -->
      <AdobePdfViewer
        :clientId="clientId"
      />
    </client-only>
    <NuxtRouteAnnouncer />
    <NuxtWelcome />
  </div>
</template>

<script setup lang="ts">
import AdobePdfViewer from '~/components/AdobePdfViewer.vue'
// 取得 runtimeConfig 內的 clientId
const config = useRuntimeConfig()
const clientId = config.public.pdfEmbedClientId
</script>
