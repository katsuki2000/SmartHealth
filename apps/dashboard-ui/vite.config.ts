import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import federation from '@originjs/vite-plugin-federation'
import https from 'https'

/**
 * Récupère un token d'accès WSO2 via le flux Client Credentials.
 * Équivalent Node.js de l'implémentation Python partagée.
 */
async function getWso2Token(env: Record<string, string>) {
  const consumerKey = env.VITE_WSO2_CONSUMER_KEY
  const consumerSecret = env.VITE_WSO2_CONSUMER_SECRET
  const tokenUrl = 'https://localhost:9443/oauth2/token'

  if (!consumerKey || !consumerSecret) {
    console.warn('⚠️ WSO2 Credentials manquants dans .env, utilisation du token statique.')
    return env.VITE_WSO2_TOKEN || ''
  }

  try {
    const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64')
    
    // On ignore les erreurs TLS pour localhost (verify=False)
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
    console.log('✅ Token WSO2 rafraîchi avec succès via Client Credentials.')
    return data.access_token
  } catch (error) {
    console.error('❌ Échec du rafraîchissement du token WSO2:', error)
    return env.VITE_WSO2_TOKEN || ''
  }
}

export default defineConfig(async ({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  
  // Récupération automatique du token au démarrage
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
        // ── Proxy vers WSO2 API Gateway ──────────────────
        '/api/v1': {
          target: wso2Gateway,
          changeOrigin: true,
          secure: false,           // Accepte le certificat auto-signé de WSO2
          headers: {
            Authorization: `Bearer ${wso2Token}`,
          },
        },
      },
    },
  }
})
