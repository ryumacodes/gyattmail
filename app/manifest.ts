import type { MetadataRoute } from 'next'
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'gyattmail', short_name: 'gyattmail', description: 'Hatched multi-account mail with AI',
    start_url: '/mail', display: 'standalone', background_color: '#f4eddf', theme_color: '#6f523b',
    icons: [{ src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' }],
  }
}
