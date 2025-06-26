'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { loadTossPayments } from '@tosspayments/payment-sdk';
import { v4 as uuidv4 } from 'uuid';

const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY!;

export default function SuccessPage() {
  const params = useSearchParams();
  const router = useRouter();

  const [message, setMessage] = useState('카드 등록 성공! 결제 진행 중...');
  const [userUuid, setUserUuid] = useState('');
  const [buskerUuid, setBuskerUuid] = useState('');
  const [price, setPrice] = useState(0);
  const [canCancel, setCanCancel] = useState(false);

  const startBillingProcess = () => {
    const authKey = params.get('authKey');
    const customerKey = params.get('customerKey');
    const user = params.get('userUuid')!;
    const busker = params.get('buskerUuid')!;
    const rawPrice = Number(params.get('price'));

    if (!authKey || !customerKey || !user || !busker || !rawPrice) {
      setMessage('❌ 필수 파라미터 누락');
      return;
    }

    setUserUuid(user);
    setBuskerUuid(busker);
    setPrice(rawPrice);
    setMessage('카드 등록 중...');

    fetch('http://localhost:8088/support-service/api/v1/subscription/save-billing-key', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ authKey, customerKey, userUuid: user, buskerUuid: busker, price: rawPrice }),
    })
      .then((res) => {
        if (!res.ok) throw new Error('billingKey 발급 실패');
        return res.json();
      })
      .then((data) => {
        const billingKey = data.result.billingKey;
        const orderName = `${busker} 정기 구독`;

        return fetch('http://localhost:8087/payment-service/api/v1/membership/billing/execute', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            billingKey,
            customerKey,
            userUuid: user,
            buskerUuid: busker,
            orderName,
            price: rawPrice,
          }),
        });
      })
      .then((res) => {
        if (!res.ok) throw new Error('결제 실패');
        return res.json();
      })
      .then(() => {
        setMessage('🎉 결제 성공!');
        setCanCancel(true);
      })
      .catch((err) => {
        console.error('❌ 오류:', err);
        setMessage(`❌ 오류 발생: ${err.message}`);
      });
  };

  const handleCancel = async () => {
    const res = await fetch('http://localhost:8088/support-service/api/v1/subscription', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userUuid, buskerUuid }),
    });

    if (res.ok) {
      setMessage('🛑 정기 구독이 정상적으로 해지되었습니다.');
      setCanCancel(false);
    } else {
      const error = await res.json();
      setMessage(`❌ 해지 실패: ${error.message || '알 수 없는 오류'}`);
    }
  };

  const handleRenew = async () => {
    const tossPayments = await loadTossPayments(clientKey);
    const newCustomerKey = `cus_${uuidv4().replace(/-/g, '')}`;

    tossPayments
      .requestBillingAuth('카드', {
        customerKey: newCustomerKey,
        successUrl: `${window.location.origin}/success?customerKey=${newCustomerKey}&userUuid=${userUuid}&buskerUuid=${buskerUuid}&price=${price}`,
        failUrl: `${window.location.origin}/fail`,
      })
      .catch((err) => {
        alert(err.message);
      });
  };

  useEffect(() => {
    startBillingProcess();
  }, [params]);

  return (
    <div className="p-10 flex flex-col items-center gap-6">
      <h1 className="text-2xl font-semibold">{message}</h1>

      {canCancel && (
        <button
          onClick={handleCancel}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
        >
          정기 구독 해지하기
        </button>
      )}

      {!canCancel && (
        <button
          onClick={handleRenew}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          🔄 재구독하기
        </button>
      )}
    </div>
  );
}
