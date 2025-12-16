import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'Whiskerknots - Handmade Crochet Creations';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default async function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#fffdf7',
          backgroundImage: 'radial-gradient(circle at 25px 25px, #faa499 2%, transparent 0%), radial-gradient(circle at 75px 75px, #f97986 2%, transparent 0%)',
          backgroundSize: '100px 100px',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'white',
            borderRadius: '48px',
            padding: '80px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          }}
        >
          <div
            style={{
              fontSize: 120,
              marginBottom: 20,
            }}
          >
            🧶
          </div>
          <div
            style={{
              fontSize: 80,
              fontWeight: 'bold',
              background: 'linear-gradient(to right, #8b5a3c, #f97986)',
              backgroundClip: 'text',
              color: 'transparent',
              marginBottom: 20,
            }}
          >
            Whiskerknots
          </div>
          <div
            style={{
              fontSize: 36,
              color: '#6b7280',
              fontStyle: 'italic',
            }}
          >
            Loops of Love ❤️
          </div>
          <div
            style={{
              fontSize: 28,
              color: '#9ca3af',
              marginTop: 30,
              textAlign: 'center',
              maxWidth: '700px',
            }}
          >
            Handmade Crochet Creations • Amigurumi • Wearables • Home Decor
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
