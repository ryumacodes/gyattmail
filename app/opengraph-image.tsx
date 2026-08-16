import { ImageResponse } from 'next/og'

export const alt = 'gyatt.email — Email, carved for focus'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: 'stretch',
          background: '#F4EFE4',
          color: '#4D4136',
          display: 'flex',
          height: '100%',
          padding: '56px',
          position: 'relative',
          width: '100%',
        }}
      >
        <div
          style={{
            backgroundImage: 'repeating-linear-gradient(35deg, rgba(122, 104, 87, .16) 0, rgba(122, 104, 87, .16) 1px, transparent 1px, transparent 12px), repeating-linear-gradient(-35deg, rgba(122, 104, 87, .12) 0, rgba(122, 104, 87, .12) 1px, transparent 1px, transparent 14px)',
            inset: 0,
            opacity: 0.5,
            position: 'absolute',
          }}
        />
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative', width: '100%' }}>
          <div style={{ alignItems: 'center', display: 'flex', fontSize: 30, fontWeight: 700, gap: 14 }}>
            <div style={{ alignItems: 'center', background: '#B7662E', borderRadius: 16, color: '#F4EFE4', display: 'flex', fontFamily: 'serif', fontSize: 34, height: 58, justifyContent: 'center', width: 58 }}>g</div>
            gyatt.email
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontFamily: 'serif', fontSize: 96, fontWeight: 700, letterSpacing: '-5px', lineHeight: 0.95 }}>Email, carved</div>
            <div style={{ color: '#B7662E', fontFamily: 'serif', fontSize: 96, fontWeight: 700, letterSpacing: '-5px', lineHeight: 0.95 }}>for focus.</div>
          </div>
          <div style={{ color: '#7A6857', display: 'flex', fontSize: 25 }}>Open-source email · not-for-profit · built for people</div>
        </div>
      </div>
    ),
    size,
  )
}
