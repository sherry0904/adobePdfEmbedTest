<template>
  <div>
    <div id="adobe-pdf-viewer" style="height: 600px; width: 100%;"></div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount } from 'vue'
import { useAdobePdfEmbed } from '~/composables/useAdobePdfEmbed'

const props = defineProps<{
  clientId: string // Adobe PDF Embed API Client ID
}>()

const { loadSdk } = useAdobePdfEmbed()

let adobeDCView: any = null

/**
 * 透過後端 API 安全地取得 PDF 檔案內容
 * @returns Promise<ArrayBuffer>
 */
function fetchPdfSecurely(): Promise<ArrayBuffer> {
  // 呼叫我們建立的後端 API
  return fetch('/api/pdf')
    .then(res => {
      if (!res.ok) {
        throw new Error('Failed to fetch PDF');
      }
      return res.arrayBuffer();
    });
}

function renderPdf() {
  const viewerDiv = document.getElementById('adobe-pdf-viewer')
  if (viewerDiv) viewerDiv.innerHTML = ''

  const pdfPromise = fetchPdfSecurely();

  // @ts-ignore
  adobeDCView = new window.AdobeDC.View({
    clientId: props.clientId,
    divId: 'adobe-pdf-viewer'
  })

  // 修改嵌入模式為 FULL_WINDOW，確保工具列固定顯示
  adobeDCView.previewFile(
    {
      content: { promise: pdfPromise },
      metaData: { fileName: 'sample.pdf' } // 這裡的檔名僅供顯示
    },
    {
      embedMode: 'FULL_WINDOW',
      showDownloadPDF: false, // 禁止下載
      showPrintPDF: false, // 禁止列印
      showAnnotationTools: false, // 禁止編輯
      enableTextSelection: true, // 允許選取文字內容
    }
  )
}

onMounted(async () => {
  try {
    await loadSdk()
    // @ts-ignore
    if (window.AdobeDC) {
      renderPdf()
    }
  } catch (error) {
    console.error('Adobe PDF Viewer failed to render:', error)
  }
})

onBeforeUnmount(() => {
  const viewerDiv = document.getElementById('adobe-pdf-viewer')
  if (viewerDiv) viewerDiv.innerHTML = ''
  adobeDCView = null
})
</script>
