<template>
  <div>
    <h1>PDF 預覽範例</h1>
    <client-only>
      <!--
        AdobePdfViewer 使用說明：
        1. clientId 已自動從 runtimeConfig 取得
        2. pdfId 為 private-files 資料夾內的 pdf 檔名 (不含 .pdf)
      -->
      <AdobePdfViewer
        :clientId="clientId"
        pdfId="sample"
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
