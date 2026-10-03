import Link from 'next/link';

export default function DemoPage() {
  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Re:Learn Developer & Judge Mode</h1>
      <p>Select a diagnosis journey to evaluate the core engine:</p>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '2rem' }}>
        <Link href="/workspace?demo=programming" style={{ padding: '1rem', background: '#3b82f6', color: 'white', textDecoration: 'none', borderRadius: '8px', textAlign: 'center' }}>
          PROGRAMMING DIAGNOSIS
        </Link>
        <Link href="/workspace?demo=algebra" style={{ padding: '1rem', background: '#10b981', color: 'white', textDecoration: 'none', borderRadius: '8px', textAlign: 'center' }}>
          ALGEBRA DIAGNOSIS
        </Link>
        <Link href="/workspace?demo=physics" style={{ padding: '1rem', background: '#8b5cf6', color: 'white', textDecoration: 'none', borderRadius: '8px', textAlign: 'center' }}>
          PHYSICS DIAGNOSIS
        </Link>
      </div>

      <div style={{ marginTop: '3rem', padding: '1.5rem', background: '#f3f4f6', borderRadius: '8px', color: '#111827' }}>
        <h3>Why did Re:Learn diagnose this?</h3>
        <p>The system does not arbitrarily evaluate text. It executes semantic abstraction against a strict taxonomy of 45 misconceptions. Misconceptions are isolated using exact trigger patterns, missing evidence detection, and when necessary, discriminating questions.</p>
      </div>
    </div>
  );
}
