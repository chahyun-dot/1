import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// SUPABASE_ 접두사 변수도 브라우저 코드에 노출 (anon 키 전용 — service_role 키는 절대 넣지 말 것)
export default defineConfig({
  plugins: [react()],
  envPrefix: ['VITE_', 'SUPABASE_'],
})
