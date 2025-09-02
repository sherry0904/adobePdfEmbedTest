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
  pdfId: string // 要載入的 PDF 檔案識別碼 (不含 .pdf)
}>()

const { loadSdk } = useAdobePdfEmbed()

let adobeDCView: any = null

/**
 * 透過公開的代理 API 取得 PDF 檔案內容
 * @returns Promise<ArrayBuffer>
 */
function fetchPdfSecurely(): Promise<ArrayBuffer> {
  // 呼叫新的、公開的代理 API，這個請求不包含任何金鑰
  return fetch(`/api/viewer/${props.pdfId}`)
    .then(res => {
      if (!res.ok) {
        throw new Error(`Failed to fetch PDF: ${res.statusText}`)
      }
      return res.arrayBuffer()
    })
}

function renderPdf() {
  const viewerDiv = document.getElementById('adobe-pdf-viewer')
  if (viewerDiv) viewerDiv.innerHTML = ''

  const pdfPromise = fetchPdfSecurely()

  // @ts-ignore
  adobeDCView = new window.AdobeDC.View({
    clientId: props.clientId,
    divId: 'adobe-pdf-viewer',
  })

  // 修改嵌入模式為 FULL_WINDOW，確保工具列固定顯示
  adobeDCView.previewFile(
    {
      content: { promise: pdfPromise },
      metaData: { fileName: `${props.pdfId}.pdf` }, // 這裡的檔名僅供顯示
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
