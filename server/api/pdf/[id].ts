import fs from 'node:fs'
import path from 'node:path'
import { sendStream } from 'h3'

export default defineEventHandler(async (event) => {
  // 從私有 runtimeConfig 讀取金鑰
  const config = useRuntimeConfig(event)
  const secretToken = config.pdfViewerSecretToken

  // 1. 驗證授權
  const authHeader = getRequestHeader(event, 'Authorization')
          
  if (authHeader !== `Bearer ${secretToken}`) {
    console.error('[PDF API] Authorization failed. Header and Expected Token do not match.')
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
    })
  }

  // 2. 從動態路由取得檔案 ID
  const pdfId = event.context.params?.id
  if (!pdfId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request: No file ID provided',
    })
  }

  // 安全性：防止路徑遍歷攻擊 (Path Traversal)
  const safePdfId = path.basename(pdfId)
  // 用 import.meta.dir 取得 server/api/pdf 目錄，再往上到專案根目錄
  const filePath = path.join(import.meta.dir, '../../..', 'private-files', `${safePdfId}.pdf`)

  // log 實際檔案路徑，方便 Vercel 部署時追蹤
  console.log('PDF file path:', filePath)

  // 3. 檢查檔案是否存在並回傳
  try {
    await fs.promises.access(filePath)
  } catch (error) {
    console.error('PDF file not accessible:', filePath, error)
    throw createError({
      statusCode: 404,
      statusMessage: 'File Not Found',
    })
  }

  event.node.res.setHeader('Content-Type', 'application/pdf')
  return sendStream(event, fs.createReadStream(filePath))
})
