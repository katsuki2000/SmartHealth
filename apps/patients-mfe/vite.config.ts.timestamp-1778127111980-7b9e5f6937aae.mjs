// vite.config.ts
import { defineConfig } from "file:///D:/projets/SmartHealth/node_modules/.pnpm/vite@5.4.21_@types+node@24._79f8219a04962ce6aa27901bad9e529a/node_modules/vite/dist/node/index.js";
import react from "file:///D:/projets/SmartHealth/node_modules/.pnpm/@vitejs+plugin-react@4.7.0__bbb2b76ae7f148dbcbc825e04f8093fc/node_modules/@vitejs/plugin-react/dist/index.js";
import federation from "file:///D:/projets/SmartHealth/node_modules/.pnpm/@originjs+vite-plugin-federation@1.4.1/node_modules/@originjs/vite-plugin-federation/dist/index.mjs";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    federation({
      name: "patients_mfe",
      filename: "remoteEntry.js",
      exposes: {
        "./PatientList": "./src/components/PatientList",
        "./PatientDetail": "./src/components/PatientDetail",
        "./EmergencyTrigger": "./src/components/EmergencyTrigger",
        "./AnalyticsWidget": "./src/components/AnalyticsWidget",
        "./AppointmentList": "./src/components/AppointmentList",
        "./PrescriptionList": "./src/components/PrescriptionList"
      },
      shared: ["react", "react-dom"]
    })
  ],
  build: {
    target: "esnext",
    minify: false,
    cssCodeSplit: false
  },
  server: {
    port: 5001,
    cors: true
  },
  preview: {
    port: 5001,
    cors: true
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFxwcm9qZXRzXFxcXFNtYXJ0SGVhbHRoXFxcXGFwcHNcXFxccGF0aWVudHMtbWZlXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJEOlxcXFxwcm9qZXRzXFxcXFNtYXJ0SGVhbHRoXFxcXGFwcHNcXFxccGF0aWVudHMtbWZlXFxcXHZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9EOi9wcm9qZXRzL1NtYXJ0SGVhbHRoL2FwcHMvcGF0aWVudHMtbWZlL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSdcbmltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdCdcbmltcG9ydCBmZWRlcmF0aW9uIGZyb20gJ0BvcmlnaW5qcy92aXRlLXBsdWdpbi1mZWRlcmF0aW9uJ1xuXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xuICBwbHVnaW5zOiBbXG4gICAgcmVhY3QoKSxcbiAgICBmZWRlcmF0aW9uKHtcbiAgICAgIG5hbWU6ICdwYXRpZW50c19tZmUnLFxuICAgICAgZmlsZW5hbWU6ICdyZW1vdGVFbnRyeS5qcycsXG4gICAgICBleHBvc2VzOiB7XG4gICAgICAgICcuL1BhdGllbnRMaXN0JzogJy4vc3JjL2NvbXBvbmVudHMvUGF0aWVudExpc3QnLFxuICAgICAgICAnLi9QYXRpZW50RGV0YWlsJzogJy4vc3JjL2NvbXBvbmVudHMvUGF0aWVudERldGFpbCcsXG4gICAgICAgICcuL0VtZXJnZW5jeVRyaWdnZXInOiAnLi9zcmMvY29tcG9uZW50cy9FbWVyZ2VuY3lUcmlnZ2VyJyxcbiAgICAgICAgJy4vQW5hbHl0aWNzV2lkZ2V0JzogJy4vc3JjL2NvbXBvbmVudHMvQW5hbHl0aWNzV2lkZ2V0JyxcbiAgICAgICAgJy4vQXBwb2ludG1lbnRMaXN0JzogJy4vc3JjL2NvbXBvbmVudHMvQXBwb2ludG1lbnRMaXN0JyxcbiAgICAgICAgJy4vUHJlc2NyaXB0aW9uTGlzdCc6ICcuL3NyYy9jb21wb25lbnRzL1ByZXNjcmlwdGlvbkxpc3QnLFxuICAgICAgfSxcbiAgICAgIHNoYXJlZDogWydyZWFjdCcsICdyZWFjdC1kb20nXSxcbiAgICB9KSxcbiAgXSxcbiAgYnVpbGQ6IHtcbiAgICB0YXJnZXQ6ICdlc25leHQnLFxuICAgIG1pbmlmeTogZmFsc2UsXG4gICAgY3NzQ29kZVNwbGl0OiBmYWxzZSxcbiAgfSxcbiAgc2VydmVyOiB7XG4gICAgcG9ydDogNTAwMSxcbiAgICBjb3JzOiB0cnVlLFxuICB9LFxuICBwcmV2aWV3OiB7XG4gICAgcG9ydDogNTAwMSxcbiAgICBjb3JzOiB0cnVlLFxuICB9LFxufSlcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBb1QsU0FBUyxvQkFBb0I7QUFDalYsT0FBTyxXQUFXO0FBQ2xCLE9BQU8sZ0JBQWdCO0FBRXZCLElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQzFCLFNBQVM7QUFBQSxJQUNQLE1BQU07QUFBQSxJQUNOLFdBQVc7QUFBQSxNQUNULE1BQU07QUFBQSxNQUNOLFVBQVU7QUFBQSxNQUNWLFNBQVM7QUFBQSxRQUNQLGlCQUFpQjtBQUFBLFFBQ2pCLG1CQUFtQjtBQUFBLFFBQ25CLHNCQUFzQjtBQUFBLFFBQ3RCLHFCQUFxQjtBQUFBLFFBQ3JCLHFCQUFxQjtBQUFBLFFBQ3JCLHNCQUFzQjtBQUFBLE1BQ3hCO0FBQUEsTUFDQSxRQUFRLENBQUMsU0FBUyxXQUFXO0FBQUEsSUFDL0IsQ0FBQztBQUFBLEVBQ0g7QUFBQSxFQUNBLE9BQU87QUFBQSxJQUNMLFFBQVE7QUFBQSxJQUNSLFFBQVE7QUFBQSxJQUNSLGNBQWM7QUFBQSxFQUNoQjtBQUFBLEVBQ0EsUUFBUTtBQUFBLElBQ04sTUFBTTtBQUFBLElBQ04sTUFBTTtBQUFBLEVBQ1I7QUFBQSxFQUNBLFNBQVM7QUFBQSxJQUNQLE1BQU07QUFBQSxJQUNOLE1BQU07QUFBQSxFQUNSO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
