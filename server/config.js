import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export function loadEnvConfig() {

  const envFile = process.env.NODE_ENV === 'production'
    ? '.env.production'
    : '.env.development';

  dotenv.config({ path: join(__dirname, '..', envFile) });
}

export {__dirname, join};