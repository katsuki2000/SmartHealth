import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import federation from '@originjs/vite-plugin-federation'

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'patients_mfe',
      filename: 'remoteEntry.js',
      exposes: {
        './PatientList': './src/components/PatientList',
        './PatientDetail': './src/components/PatientDetail',
        './EmergencyTrigger': './src/components/EmergencyTrigger',
        './AnalyticsWidget': './src/components/AnalyticsWidget',
        './AppointmentList': './src/components/AppointmentList',
        './PrescriptionList': './src/components/PrescriptionList',
      },
      shared: ['react', 'react-dom'],
    }),
  ],
  build: {
    target: 'esnext',
    minify: false,
    cssCodeSplit: false,
  },
  server: {
    port: 5001,
    cors: true,
  },
  preview: {
    port: 5001,
    cors: true,
  },
})
