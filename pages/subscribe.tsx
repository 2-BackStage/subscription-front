'use client';

import { loadTossPayments } from '@tosspayments/payment-sdk';
import { v4 as uuidv4 } from 'uuid';

const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY!;

function generateRandomCustomerKey(): string {
  return `cus_${uuidv4().replace(/-/g, '')}`;
}

export default function SubscribePage() {
  const handlePayment = async () => {
    const userUuid = '7e7742d7-d2f9-42be-b889-6fb0f41b9276';
    const buskerUuid = 'af0560d2-48ec-42e4-8b88-9be3c91d6814';
    const price = 6900;
    const customerKey = generateRandomCustomerKey();

    const tossPayments = await loadTossPayments(clientKey);

    tossPayments
      .requestBillingAuth('카드', {
        customerKey,
        successUrl: `${window.location.origin}/success?customerKey=${customerKey}&userUuid=${userUuid}&buskerUuid=${buskerUuid}&price=${price}`,
        failUrl: `${window.location.origin}/fail`,
      })
      .catch((err) => {
        alert(err.message);
      });
  };

  return (
    <div className="p-10">
      <button
        className="bg-blue-600 text-white p-3 rounded"
        onClick={handlePayment}
      >
        정기결제 등록하기
      </button>
    </div>
  );
}
