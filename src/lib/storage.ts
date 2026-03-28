import { promises as fs } from 'fs'
import path from 'path'
import crypto from 'crypto'

// In production, use Supabase Storage or S3
// For MVP, use local /tmp directory
const UPLOAD_DIR = path.join(process.cwd(), 'tmp', 'uploads')

export async function storeFile(buffer: Buffer): Promise<string> {
  await fs.mkdir(UPLOAD_DIR, { recursive: true })
  const fileId = crypto.randomUUID()
  const filePath = path.join(UPLOAD_DIR, `${fileId}.pdf`)
  await fs.writeFile(filePath, buffer)
  return fileId
}

export async function retrieveFile(fileId: string): Promise<Buffer> {
  const filePath = path.join(UPLOAD_DIR, `${fileId}.pdf`)
  try {
    return await fs.readFile(filePath)
  } catch {
    throw new Error('File not found or expired. Please upload your contract again.')
  }
}

export async function deleteFile(fileId: string): Promise<void> {
  const filePath = path.join(UPLOAD_DIR, `${fileId}.pdf`)
  try {
    await fs.unlink(filePath)
  } catch {
    // File may already be deleted, ignore
  }
}
