import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import federation from '@originjs/vite-plugin-federation'

/**
 * Recupere un token d'acces WSO2 via le flux Client Credentials.
 */
async function getWso2Token(env: Record<string, string>) {
  const consumerKey = env.VITE_WSO2_CONSUMER_KEY
  const consumerSecret = env.VITE_WSO2_CONSUMER_SECRET
  const tokenUrl = 'https://localhost:9443/oauth2/token'

  if (!consumerKey || !consumerSecret) {
    console.warn('[WSO2] Credentials manquants dans .env, utilisation du token statique.')
    return env.VITE_WSO2_TOKEN || ''
  }

  try {
    const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64')
    
    const prevReject = process.env.NODE_TLS_REJECT_UNAUTHORIZED
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({ grant_type: 'client_credentials' }),
    })

    process.env.NODE_TLS_REJECT_UNAUTHORIZED = prevReject

    if (!response.ok) {
      throw new Error(`Erreur WSO2: ${response.statusText}`)
    }

    const data: any = await response.json()
    console.log('[WSO2] Token rafraichi avec succes via Client Credentials.')
    return data.access_token
  } catch (error) {
    console.error('[WSO2] Echec du rafraichissement du token:', error)
    return env.VITE_WSO2_TOKEN || ''
  }
}

export default defineConfig(async ({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  
  const wso2Token = await getWso2Token(env)
  const wso2Gateway = env.VITE_WSO2_GATEWAY || 'https://localhost:8243/smarthealth/1.0.0'

  return {
    plugins: [
      react(),
      federation({
        name: 'dashboard_shell',
        remotes: {
          patients_mfe: 'http://localhost:5001/assets/remoteEntry.js',
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
      port: 5000,
      cors: true,
      proxy: {
        // All application API routes → direct backend (NestJS JWT guards handle security)
        // WSO2 provides governance at the gateway level for external consumers.
        // In development, Vite proxies directly to the backend for simplicity.
        '/api/v1': {
          target: 'http://localhost:3000',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/v1/, ''),
        },
      },
    },
  }
})
