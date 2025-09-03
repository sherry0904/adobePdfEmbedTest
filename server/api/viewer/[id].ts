/**
 * 這是一個公開的代理 API 端點
 * 它的職責是安全地從後端取得受保護的 PDF 檔案
 */
export default defineEventHandler(async (event) => {
  // --- Referer Check --- 
  const referer = getRequestHeader(event, 'referer')
  const host = getRequestHeader(event, 'host')

  // 如果有 referer，檢查它是否來自同一個網站
  // if (referer) {
  //   const refererHost = new URL(referer).host
  //   if (refererHost !== host) {
  //     throw createError({
  //       statusCode: 403,
  //       statusMessage: 'Forbidden: Hotlinking is not allowed.',
  //     })
  //   }
  // } else {
  //   // 如果沒有 referer (例如直接在瀏覽器開啟)，也直接阻擋
  //   throw createError({
  //     statusCode: 403,
  //     statusMessage: 'Forbidden: Direct access is not allowed.',
  //   })
  // }
  // --- End of Referer Check ---

  const config = useRuntimeConfig(event)
  const secretToken = config.pdfViewerSecretToken

  const pdfId = event.context.params?.id
  if (!pdfId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request: No file ID provided',
    })
  }

  try {
    // 使用 globalThis.$fetch 發起一個乾淨、不繼承原始標頭的內部請求
    const pdfBlob = await globalThis.$fetch(`/api/pdf/${pdfId}`, {
      headers: {
        Authorization: `Bearer ${secretToken}`,
      },
      responseType: 'blob', // 直接取得二進位資料
    })

    // 將從受保護端點拿到的 PDF 資料回傳給前端
    return pdfBlob

  } catch (error: any) {
    // 如果內部請求失敗 (例如 401, 404)，則將錯誤轉發給前端
    console.error('[Viewer API] Internal fetch failed:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: `Failed to fetch PDF on server: ${error.statusMessage || error.message}`,
    })
  }
})
