// Load environment variables from .env.local
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'

// Mock pointer capture API for Radix UI components (not available in jsdom)
// Only run in jsdom environment
if (typeof Element !== 'undefined') {
  Element.prototype.hasPointerCapture = jest.fn(() => false);
  Element.prototype.setPointerCapture = jest.fn();
  Element.prototype.releasePointerCapture = jest.fn();
  Element.prototype.scrollIntoView = jest.fn();
}
