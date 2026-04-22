import React from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";

export default function PaymentForm() {
  const { state } = useLocation();

  const payNow = async () => {
    try {
      const res = await axios.post("/payment/create-order", state);
      window.location.href =
        res.data.data.instrumentResponse.redirectInfo.url;
    } catch (err) {
      alert("Payment Failed");
    }
  };

  return (
    <div className="payment-container">
      <h2>Complete Your Payment</h2>
      <div className="payment-summary">Total Amount: ₹{state?.amount}</div>
      <button className="pay-btn" onClick={payNow}>
        Pay Securely
      </button>
    </div>
  );
}
