// Load environment variables from .env.local
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'
