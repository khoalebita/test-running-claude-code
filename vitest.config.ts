import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  test: {
    projects: [
      {
        plugins: [react(), tailwindcss()],
        test: {
          name: 'client',
          environment: 'jsdom',
          include: ['src/**/__tests__/**/*.test.{ts,tsx}'],
          setupFiles: ['./src/test-setup.ts'],
          globals: false,
        },
      },
      {
        test: {
          name: 'server',
          environment: 'node',
          include: ['server/**/__tests__/**/*.test.ts'],
          globals: false,
        },
      },
    ],
  },
})
