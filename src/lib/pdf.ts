export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  // pdf-parse is a CommonJS module
  const pdfParse = require('pdf-parse')
  
  try {
    const data = await pdfParse(buffer)
    const text = data.text?.trim()
    
    if (!text || text.length < 100) {
      throw new Error('Could not extract enough text from this PDF. It may be a scanned document — image-based PDFs are not yet supported.')
    }
    
    return text
  } catch (err: any) {
    if (err.message?.includes('scanned')) throw err
    throw new Error('Failed to read PDF file. Please make sure it\'s a valid PDF document.')
  }
}
