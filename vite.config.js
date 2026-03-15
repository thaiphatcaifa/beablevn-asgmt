import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate', // Tự động cập nhật service worker khi có phiên bản mới
      includeAssets: ['BA LOGO.png'], // Các tài nguyên tĩnh cần cache
      manifest: {
        name: 'BAVN ASGMT',
        short_name: 'BAVN',
        description: 'Ứng dụng BAVN Assignment',
        theme_color: '#ffffff', // Màu nền chủ đạo của app (bạn có thể đổi theo UI của bạn)
        background_color: '#ffffff',
        display: 'standalone', // Thiết lập mở app độc lập, mất thanh địa chỉ của trình duyệt
        icons: [
          {
            src: '/BA LOGO.png', // Đường dẫn tới logo trong thư mục public
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/BA LOGO.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
})