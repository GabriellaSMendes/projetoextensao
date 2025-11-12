import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  //Redireciona qualquer requisição que não for um arquivo estático para o Flask na porta 5000
 server: {
  proxy: {
    '/api': {
      target: 'http://127.0.0.1:5000',
      changeOrigin: true,
      secure: false
    }
  }
}
})
