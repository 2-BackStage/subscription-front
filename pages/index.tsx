import React from 'react';
import Link from 'next/link';

export default function Home() {
  return (
    <div style={{ padding: '2rem' }}>
      <h1>Welcome to Toss Billing Demo</h1>
      <Link href="/subscribe">
        <button style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#0064FF', color: '#fff', borderRadius: '8px' }}>
          정기결제 등록하러 가기
        </button>
      </Link>
    </div>
  );
}