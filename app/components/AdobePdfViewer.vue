<template>
  <div>
    <div
      :id="divId"
      ref="viewerRef"
      style="height: 600px; width: 100%"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from "vue";
import { useAdobePdfEmbed } from "~/composables/useAdobePdfEmbed";

const props = defineProps<{
  clientId: string; // Adobe PDF Embed API Client ID
  pdfId: string; // 要載入的 PDF 檔案識別碼 (不含 .pdf)
  divId?: string
  embedMode?: "FULL_WINDOW" | "SIZED_CONTAINER" | "IN_LINE" | "LIGHT_BOX";
  showDownloadPDF?: boolean;
  showPrintPDF?: boolean;
  showAnnotationTools?: boolean;
  enableTextSelection?: boolean;
}>();

const { loadSdk } = useAdobePdfEmbed();

let adobeDCView: any = null;
const viewerRef = ref<HTMLDivElement | null>(null);

/**
 * 透過公開的代理 API 取得 PDF 檔案內容
 * @returns Promise<ArrayBuffer>
 */
function fetchPdfSecurely(): Promise<ArrayBuffer> {
  // 呼叫新的、公開的代理 API，這個請求不包含任何金鑰
  return fetch(`/api/viewer/${props.pdfId}`).then((res) => {
    if (!res.ok) {
      throw new Error(`Failed to fetch PDF: ${res.statusText}`);
    }
    return res.arrayBuffer();
  });
}

function renderPdf() {
  // SDK 會自動覆蓋內容，不需手動清空
  const pdfPromise = fetchPdfSecurely();
  // @ts-ignore
  adobeDCView = new window.AdobeDC.View({
    clientId: props.clientId,
    divId: props.divId ?? 'adobe-pdf-viewer',
  });
  adobeDCView.previewFile(
    {
      content: { promise: pdfPromise },
      metaData: { fileName: `${props.pdfId}.pdf` },
    },
    {
      embedMode: props.embedMode ?? "FULL_WINDOW",
      showDownloadPDF: props.showDownloadPDF ?? false,
      showPrintPDF: props.showPrintPDF ?? false,
      showAnnotationTools: props.showAnnotationTools ?? false,
      enableTextSelection: props.enableTextSelection ?? true,
    }
  );
}

onMounted(async () => {
  try {
    await loadSdk();
    // @ts-ignore
    if (window.AdobeDC) {
      renderPdf();
    }
  } catch (error) {
    console.error("Adobe PDF Viewer failed to render:", error);
  }
});

onBeforeUnmount(() => {
  if (viewerRef.value) {
    while (viewerRef.value.firstChild) {
      viewerRef.value.removeChild(viewerRef.value.firstChild);
    }
  }
  adobeDCView = null;
});
</script>
