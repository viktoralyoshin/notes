import 'dotenv/config'
import { z } from 'zod'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const envSchema = z.object({
  DATABASE_URL: z.string(),
  JWT_SECRET: z.string().min(10),
  PORT: z.coerce.number().default(3000),
  HOST: z.string().default('0.0.0.0'),
})

export const env = envSchema.parse(process.env)

// Uploads directory (absolute path)
export const UPLOADS_DIR = path.resolve(__dirname, '../../uploads')
