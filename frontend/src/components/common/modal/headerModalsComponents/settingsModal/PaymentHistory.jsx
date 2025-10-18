import React from 'react';

const PaymentHistory = () => {
  const payments = ['2023-10-25', '2023-09-25', '2023-08-25'];

  return (
    <section className="setting-section">
      <h2>Payments</h2>
      <p>Review your payment history.</p>
      <table className="payment-history">
        <thead>
          <tr><th>Date</th><th>Description</th><th>Amount</th></tr>
        </thead>
        <tbody>
          {payments.map(date => (
            <tr key={date}>
              <td>{date}</td>
              <td>Monthly Subscription</td>
              <td>$9.99</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
};

export default PaymentHistory;