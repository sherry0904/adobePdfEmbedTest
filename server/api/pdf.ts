import fs from 'node:fs'
import path from 'node:path'
import { sendStream } from 'h3'

export default defineEventHandler(async (event) => {
  const pdfPath = 'sample.pdf'
  const filePath = path.join(process.cwd(), 'private-files', pdfPath)

  try {
    // 檢查檔案是否存在
    await fs.promises.access(filePath)
  } catch (error) {
    console.error('PDF file not accessible:', filePath, error)
    event.node.res.statusCode = 404
    return 'File not found'
  }

  // 在串流開始前，明確設定 Content-Type 標頭
  event.node.res.setHeader('Content-Type', 'application/pdf')

  // 使用 sendStream 將檔案串流回傳給客戶端
  return sendStream(event, fs.createReadStream(filePath))
})
