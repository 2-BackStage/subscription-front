'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function PaymentFailPage() {
  const params = useSearchParams();
  const [failInfo, setFailInfo] = useState({
    code: '',
    message: '',
    orderId: '',
  });

  useEffect(() => {
    const code = params.get('code') || 'UNKNOWN_ERROR';
    const message = params.get('message') || '결제가 실패했습니다.';
    const orderId = params.get('orderId') || '';

    setFailInfo({ code, message, orderId });
  }, [params]);

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-red-50 p-6">
      <h1 className="text-3xl font-bold text-red-600 mb-4">❌ 결제가 실패했어요</h1>
      <p className="text-lg text-gray-800 mb-2">
        사유: {decodeURIComponent(failInfo.message)}
      </p>

      {failInfo.orderId && (
        <p className="text-sm text-gray-500 mt-1">주문 ID: {failInfo.orderId}</p>
      )}

      <p className="text-sm text-gray-400 mt-2">에러 코드: {failInfo.code}</p>

      <button
        className="mt-6 px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-800"
        onClick={() => window.location.href = '/subscribe'}
      >
        다시 시도하기
      </button>
    </div>
  );
}
