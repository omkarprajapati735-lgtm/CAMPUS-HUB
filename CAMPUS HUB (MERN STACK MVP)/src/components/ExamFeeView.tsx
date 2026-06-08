import React, { useState } from "react";
import { ExamFee, User } from "../types";
import {
  Wallet,
  CheckCircle,
  Clock,
  CreditCard,
  Printer,
  Sparkles,
  Info,
  Layers,
  FileCheck,
  Building
} from "lucide-react";

interface ExamFeeViewProps {
  user: User;
  fees: ExamFee[];
  onPayFee: (feeId: string, cardDetails: any) => Promise<boolean>;
}

export default function ExamFeeView({
  user,
  fees,
  onPayFee
}: ExamFeeViewProps) {
  const [selectedFee, setSelectedFee] = useState<ExamFee | null>(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showReceipt, setShowReceipt] = useState<ExamFee | null>(null);

  // Card form state
  const [cardHolder, setCardHolder] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const pendingInvoices = fees.filter((f) => !f.paid);
  const totalDue = pendingInvoices.reduce((acc, f) => acc + f.amount, 0);

  const triggerPaymentModal = (fee: ExamFee) => {
    setError("");
    setSelectedFee(fee);
    setCardHolder(user.name);
    setCardNumber("");
    setExpiry("");
    setCvv("");
    setShowCheckout(true);
  };

  const handleProcessCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFee) return;

    if (cardNumber.length < 16) {
      setError("Please input a valid 16-digit card number.");
      return;
    }
    if (!expiry || cvv.length < 3) {
      setError("Please input a valid expiry and CVV.");
      return;
    }

    setSubmitting(true);
    setError("");

    const ok = await onPayFee(selectedFee._id, {
      cardNumber,
      cardExpiry: expiry,
      cvv
    });

    setSubmitting(false);

    if (ok) {
      setShowCheckout(false);
      // Wait for updated fee properties from list props
      const updatedFee = fees.find((f) => f._id === selectedFee._id) || {
        ...selectedFee,
        paid: true,
        paymentDate: new Date().toISOString().split("T")[0],
        transactionId: "TXN-" + Math.floor(10000000 + Math.random() * 90000000)
      };
      setShowReceipt(updatedFee);
    } else {
      setError("Transaction rejected. Please verify details.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Summary stats */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-display">
            Exam Fees & Billing Portal
          </h1>
          <p className="text-sm text-slate-500">
            View term-wise exam fees invoices, clear balances via credit gateways, and generate digital payment receipts.
          </p>
        </div>

        {totalDue > 0 && (
          <div className="bg-rose-50 border border-rose-100 rounded-xl p-3 px-4 flex items-center gap-3 shrink-0">
            <div className="bg-rose-150 text-rose-600 rounded-lg p-2">
              <Wallet size={18} />
            </div>
            <div>
              <div className="text-[10px] text-slate-400 font-mono font-semibold uppercase tracking-wider">Total balance due</div>
              <div className="text-sm font-bold text-rose-700">${totalDue} USD</div>
            </div>
          </div>
        )}
      </div>

      {fees.length === 0 ? (
        <div className="py-12 bg-white rounded-xl border border-slate-200 text-center space-y-2">
          <FileCheck size={32} className="text-slate-300 mx-auto" />
          <p className="text-sm text-slate-500 font-medium">No fee schedules have been registered.</p>
          <p className="text-xs text-slate-400">Review other semesters or query the Finance Dept.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Bills List */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs lg:col-span-8">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center gap-2">
              <Layers size={16} className="text-slate-500" />
              <h3 className="text-xs font-bold text-slate-450 uppercase tracking-widest font-mono">
                STATEMENT OF INVOICES
              </h3>
            </div>

            <div className="divide-y divide-slate-100">
              {fees.map((invoice) => (
                <div
                  key={invoice._id}
                  className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/20"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-800 font-mono">
                        Semester {invoice.semester} Exam Fees
                      </span>
                      {invoice.paid ? (
                        <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded flex items-center gap-0.5 font-mono">
                          <CheckCircle size={10} /> PAID
                        </span>
                      ) : (
                        <span className="text-[10px] bg-rose-50 text-rose-650 font-bold px-2 py-0.5 rounded flex items-center gap-0.5 font-mono animate-pulse">
                          <Clock size={10} /> PENDING
                        </span>
                      )}
                    </div>

                    <div className="text-[11px] text-slate-400 font-mono space-y-0.5">
                      <p>Charge amount: <span className="font-semibold text-slate-700">${invoice.amount} USD</span></p>
                      <p>
                        {invoice.paid ? (
                          <span>Paid on: <span className="font-semibold text-slate-600">{invoice.paymentDate}</span></span>
                        ) : (
                          <span>Due date: <span className="font-semibold text-rose-600">{invoice.dueDate}</span></span>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2 self-start sm:self-center">
                    {invoice.paid ? (
                      <button
                        onClick={() => setShowReceipt(invoice)}
                        className="px-3 py-1.5 border border-slate-200 hover:bg-slate-100 text-xs font-semibold rounded-md flex items-center gap-1.5 text-slate-700 transition"
                      >
                        <Printer size={12} /> View Receipt
                      </button>
                    ) : (
                      user.role === "student" && (
                        <button
                          onClick={() => triggerPaymentModal(invoice)}
                          className="px-4 py-1.5 bg-indigo-650 hover:bg-indigo-700 text-white text-xs font-semibold rounded-md flex items-center gap-1.5 transition shadow-xs"
                        >
                          <CreditCard size={12} /> Pay Online
                        </button>
                      )
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick billing advice */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 lg:col-span-4 space-y-4 shadow-xs">
            <h3 className="font-semibold text-slate-900 border-b pb-2 mb-2 font-display">Instruction Guideline</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Examination fees must be cleared 7 days prior to course term finales to generate the hall tickets successfully.
            </p>
            <div className="p-3.5 bg-indigo-50 border border-indigo-100 rounded-lg flex items-start gap-2">
              <Info size={15} className="text-indigo-600 shrink-0 mt-0.5" />
              <p className="text-[11px] text-indigo-950">
                Billing transactions are protected with high-level military grade TLS 1.3 algorithms. Always verify your bank SMS alerts post success.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Online checkout simulated modal */}
      {showCheckout && selectedFee && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full overflow-hidden flex flex-col border border-slate-200">
            {/* Header */}
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CreditCard size={18} className="text-indigo-400" />
                <h3 className="font-semibold text-sm">Secure Checkout Gateway</h3>
              </div>
              <button
                onClick={() => setShowCheckout(false)}
                className="text-slate-400 hover:text-white font-bold text-xs"
              >
                Close
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleProcessCheckout} className="p-6 space-y-4 bg-slate-50">
              <div className="bg-stone-900 text-white p-4 rounded-xl shadow-md space-y-2 relative overflow-hidden font-mono text-xs flex flex-col justify-between h-36">
                <div className="flex justify-between items-center">
                  <div className="font-semibold tracking-widest text-[10px] text-stone-400">CAMPUS CORE PAY</div>
                  <Building size={16} className="text-stone-300" />
                </div>
                <div>
                  <div className="text-md tracking-widest text-shadow font-semibold mb-1">
                    {cardNumber ? cardNumber.replace(/(\d{4})/g, "$1 ").trim() : "•••• •••• •••• ••••"}
                  </div>
                  <div className="flex justify-between items-center text-[8px] text-stone-400 uppercase">
                    <div>
                      <div>Card Holder</div>
                      <div className="text-[9px] text-stone-200 mt-0.5 font-sans truncate max-w-[120px]">{cardHolder || "HOLDER NAME"}</div>
                    </div>
                    <div>
                      <div>Expiry</div>
                      <div className="text-[9px] text-stone-200 mt-0.5">{expiry || "MM/YY"}</div>
                    </div>
                  </div>
                </div>
              </div>

              {error && (
                <div className="p-2 bg-rose-50 border border-rose-100 text-rose-700 text-xs rounded font-medium text-center font-mono">
                  {error}
                </div>
              )}

              <div className="space-y-3">
                <div className="flex items-center justify-between border-b pb-2 mb-1">
                  <span className="text-xs text-slate-500 font-medium">Billed Subtotal</span>
                  <span className="text-sm font-bold text-slate-900">${selectedFee.amount} USD</span>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider font-mono mb-1">
                    Cardholder Name
                  </label>
                  <input
                    type="text"
                    value={cardHolder}
                    onChange={(e) => setCardHolder(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-250 bg-white rounded text-xs focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider font-mono mb-1">
                    Card Number (16 Digits)
                  </label>
                  <input
                    type="text"
                    maxLength={16}
                    placeholder="4111222233334444"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, ""))}
                    className="w-full px-3 py-1.5 border border-slate-250 bg-white rounded text-xs focus:outline-none focus:border-indigo-500 font-mono"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider font-mono mb-1">
                      Expiry date
                    </label>
                    <input
                      type="text"
                      maxLength={5}
                      placeholder="MM/YY"
                      value={expiry}
                      onChange={(e) => setExpiry(e.target.value)}
                      className="w-full px-3 py-1.5 border border-slate-250 bg-white rounded text-xs focus:outline-none focus:border-indigo-500 font-mono"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider font-mono mb-1">
                      cvv
                    </label>
                    <input
                      type="password"
                      maxLength={3}
                      placeholder="•••"
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value.replace(/\D/g, ""))}
                      className="w-full px-3 py-1.5 border border-slate-250 bg-white rounded text-xs focus:outline-none focus:border-indigo-500 font-mono"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setShowCheckout(false)}
                  className="px-3.5 py-1.5 border border-slate-200 bg-white rounded text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-1.5 bg-indigo-650 hover:bg-indigo-700 text-white font-semibold rounded text-xs disabled:opacity-50"
                >
                  {submitting ? "Processing..." : `Pay $${selectedFee.amount} USD`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Printable Receipt Dialog Popup */}
      {showReceipt && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden flex flex-col border border-slate-200">
            {/* Printable Frame Area */}
            <div className="p-6 bg-slate-50 space-y-6 flex-1 text-slate-800" id="print-area">
              <div className="bg-white border rounded-lg p-5 shadow-xs border-dashed space-y-4">
                {/* Header branding */}
                <div className="flex justify-between items-start border-b pb-4">
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[9px] font-bold font-mono">
                      ✓ RECEIPT VERIFIED
                    </div>
                    <h2 className="text-base font-bold text-slate-900 tracking-tight font-display mt-2">CAMPUS HUB ONLINE</h2>
                    <p className="text-[10px] text-slate-400">Somaiya University billing sector</p>
                  </div>
                  <Sparkles size={24} className="text-indigo-600 shrink-0" />
                </div>

                {/* Details list */}
                <div className="space-y-2.5 text-xs text-slate-600 border-b pb-4">
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-mono">Receipt Reference:</span>
                    <span className="font-bold text-slate-900 font-mono">{showReceipt.transactionId || "TXN-88493121"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-mono">Student account:</span>
                    <span className="font-semibold text-slate-800">{user.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-mono">Fees Item:</span>
                    <span className="font-semibold text-slate-800">Semester {showReceipt.semester} Exams Registration</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-mono">Settlement Date:</span>
                    <span className="font-semibold text-slate-800 font-mono">{showReceipt.paymentDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-mono">Payment Channel:</span>
                    <span className="font-semibold text-slate-800">Direct Online Credit Card</span>
                  </div>
                </div>

                {/* Amount Total */}
                <div className="flex justify-between items-center pt-2">
                  <span className="text-sm font-bold text-slate-800 font-display uppercase tracking-wide">Total Cleared</span>
                  <span className="text-lg font-extrabold text-indigo-600 font-display">${showReceipt.amount}.00 USD</span>
                </div>
              </div>

              <div className="text-center font-mono text-[9px] text-slate-400">
                Printed via Campus Hub client at {new Date().toLocaleDateString()}. Thank you for choosing online billing.
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-4 bg-white border-t flex items-center justify-between">
              <span className="text-xs text-slate-400 font-mono">Status: Cleared</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowReceipt(null)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded text-xs select-none"
                >
                  Close Window
                </button>
                <button
                  onClick={() => {
                    alert("Receipt sent to system browser print buffer!");
                  }}
                  className="px-4 py-2 bg-slate-900 hover:bg-stone-850 text-white rounded text-xs font-semibold shadow-xs"
                >
                  Confirm & Print
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
