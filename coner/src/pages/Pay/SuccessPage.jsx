import React, { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../lib/firebase"; // Firebase 설정 경로에 맞게 수정하세요

const API_BASE_URL = "http://localhost:3000/payment"; // /api/payment에서 /payment로 변경

export default function SuccessPage() {
  const { requestId } = useParams();
  const [searchParams] = useSearchParams();
  const paymentKey = searchParams.get("paymentKey");
  const orderId = searchParams.get("orderId");

  const [state, setState] = useState({
    loading: true,
    success: false,
    error: "",
    payment: null,
    amount: 0,
  });

  useEffect(() => {
    const confirmPayment = async () => {
      try {
        if (!paymentKey || !orderId || !requestId) {
          throw new Error("필수 파라미터가 누락되었습니다.");
        }

        // Firebase에서 결제 정보 가져오기
        console.log("Firebase에서 결제 정보 조회 중...", requestId);
        const paymentDocRef = doc(db, "Payment", requestId);
        const paymentDocSnap = await getDoc(paymentDocRef);

        if (!paymentDocSnap.exists()) {
          throw new Error("결제 정보를 찾을 수 없습니다.");
        }

        const paymentData = paymentDocSnap.data();
        const amount = paymentData.amount || paymentData.payment_amount || 0;

        console.log("Firebase에서 가져온 데이터:", { amount, paymentData });

        if (!amount || amount <= 0) {
          throw new Error("결제 금액 정보가 올바르지 않습니다.");
        }

        // 백엔드 API 호출 (requestId 없이 /confirm 경로 사용)
        console.log("백엔드 API 호출 중...", { paymentKey, orderId, amount });

        const response = await fetch(`${API_BASE_URL}/confirm`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            paymentKey,
            orderId,
            amount,
          }),
        });

        console.log("응답 상태:", response.status);

        // 응답이 HTML인지 확인 (404, 500 에러 등)
        const contentType = response.headers.get("content-type");
        if (!response.ok) {
          if (contentType && contentType.includes("text/html")) {
            throw new Error(
              `API 경로 오류 (${response.status}): ${API_BASE_URL}/confirm 경로를 확인해주세요`
            );
          }
        }

        // JSON 응답 파싱
        const data = await response.json();
        console.log("서버 응답:", data);

        if (response.ok && (data.success || data.ok)) {
          setState({
            loading: false,
            success: true,
            error: "",
            payment: data.data || data.payment || { method: "CARD" },
            amount: amount,
          });
        } else {
          throw new Error(data.message || data.error || "결제 승인 실패");
        }
      } catch (error) {
        console.error("결제 승인 오류:", error);
        setState({
          loading: false,
          success: false,
          error: error.message,
          payment: null,
          amount: 0,
        });
      }
    };

    setTimeout(confirmPayment, 1500);
  }, [paymentKey, orderId, requestId]);

  if (state.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-2xl shadow-lg text-center max-w-md">
          <div className="animate-spin w-8 h-8 border-4 border-blue-200 border-t-blue-500 rounded-full mx-auto mb-4"></div>
          <h1 className="text-xl font-bold text-gray-800 mb-2">결제 확인 중</h1>
          <p className="text-gray-600">잠시만 기다려 주세요...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-lg text-center max-w-md w-full">
        {state.success ? (
          <>
            <div className="text-6xl mb-4">✅</div>
            <h1 className="text-2xl font-bold text-gray-800 mb-4">
              결제 완료!
            </h1>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 text-left">
              <div className="flex justify-between py-1">
                <span className="text-gray-600">주문번호:</span>
                <span className="font-medium">{orderId}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-gray-600">결제수단:</span>
                <span className="font-medium">
                  {state.payment?.method || "CARD"}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-gray-600">결제금액:</span>
                <span className="font-medium">
                  {state.amount.toLocaleString()}원
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-gray-600">결제키:</span>
                <span className="font-medium text-xs">{paymentKey}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => (window.location.href = "/")}
                className="flex-1 bg-blue-500 text-white py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors"
              >
                홈으로
              </button>
              <button
                onClick={() => alert("영수증 출력")}
                className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                영수증
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="text-6xl mb-4">❌</div>
            <h1 className="text-2xl font-bold text-gray-800 mb-4">승인 오류</h1>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-left">
              <p className="text-red-700 text-sm">{state.error}</p>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6 text-left">
              <div className="flex justify-between py-1">
                <span className="text-gray-600">주문번호:</span>
                <span className="font-medium">{orderId}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-gray-600">결제키:</span>
                <span className="font-medium text-xs">{paymentKey}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-gray-600">요청ID:</span>
                <span className="font-medium text-xs">{requestId}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => (window.location.href = `/pay/${requestId}`)}
                className="flex-1 bg-blue-500 text-white py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors"
              >
                다시 시도
              </button>
              <button
                onClick={() => (window.location.href = "/")}
                className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                홈으로
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
