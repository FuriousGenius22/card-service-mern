import { useState } from "react";
import {
  CurrencyDollarIcon,
  XMarkIcon,
  ClipboardIcon,
} from "@heroicons/react/24/solid";

export default function TopUp() {
  const [amount, setAmount] = useState<number | string>("1000");
  const [showModal, setShowModal] = useState(false);

  // 🔴 This MUST come from backend in real app
  const walletAddress = "TRh3Z9sZKxP4QZ9B9v6zU3XG8qPqA8dPz1";

  const copyAddress = async () => {
    await navigator.clipboard.writeText(walletAddress);
    alert("Wallet address copied");
  };

  return (
    <div className="w-full h-full px-4 sm:px-6 py-4 sm:py-6 font-sans text-[#111827]">

      {/* TITLE */}
      <h1 className="text-2xl sm:text-3xl md:text-[33px] font-semibold mb-4 sm:mb-6">
        Deposit amount
      </h1>

      {/* INPUT */}
      <div className="border border-gray-300 rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 bg-white
                      mb-3 sm:mb-4 w-full max-w-[480px]">
        <label className="text-[#6B7280] text-xs sm:text-[12px] block mb-1 sm:mb-2">
          Amount, $
        </label>

        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full text-base sm:text-lg md:text-[18px] outline-none font-semibold"
        />
      </div>

      {/* FEES */}
      <p className="text-xs sm:text-sm md:text-[13px] text-[#374151] mb-4 sm:mb-6 leading-5 sm:leading-6 max-w-[700px]">
        From $0.01 to $50 fee $5 • From $50 to $1,000 fee 1% •{" "}
        <span className="text-green-600 font-semibold">
          Over $1,000 no commission
        </span>
      </p>

      {/* CRYPTO BLOCK */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-3 sm:p-4 mb-4 relative max-w-[900px]">

        <span
          className="absolute top-[-8px] sm:top-[-9px] right-2 sm:right-3 text-[10px] sm:text-[11px]
                     border border-green-600 px-2 py-0.5 rounded-full
                     text-green-600 bg-green-50 whitespace-nowrap"
        >
          Recommended • no commission
        </span>

        <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 rounded-full w-9 h-9 sm:w-10 sm:h-10
                            flex justify-center items-center flex-shrink-0">
              <CurrencyDollarIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>

            <div>
              <p className="text-base sm:text-lg md:text-[18px] font-semibold">
                Cryptocurrency
              </p>
              <p className="text-xs sm:text-sm md:text-[13px] text-[#4B5563]">
                via <span className="text-blue-600 underline">DV.net</span>
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 text-white rounded-md px-4 sm:px-5 py-2 
                       font-semibold text-xs sm:text-sm md:text-[14px] hover:bg-blue-700 transition w-full sm:w-auto"
          >
            Pay
          </button>
        </div>
      </div>

      {/* ================= MODAL ================= */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-4">
          <div className="bg-white w-full max-w-md rounded-xl shadow-xl p-5 relative">

            {/* Close */}
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>

            <h2 className="text-lg font-semibold mb-2">
              Top up with cryptocurrency
            </h2>

            <p className="text-sm text-gray-600 mb-4 leading-5">
              You can top up your account with cryptocurrency.
              Scan or copy your provided wallet address and fund as you want.
            </p>

            {/* Amount */}
            <div className="mb-3 text-sm">
              <span className="text-gray-500">Amount:</span>{" "}
              <span className="font-semibold">${amount}</span>
            </div>

            {/* QR Placeholder */}
            <div className="border rounded-lg p-4 flex justify-center mb-4 bg-gray-50">
              <div className="w-32 h-32 bg-gray-200 flex items-center justify-center text-xs text-gray-500">
                QR CODE
              </div>
            </div>

            {/* Address */}
            <div className="border rounded-lg p-3 flex items-center justify-between gap-2 text-sm">
              <span className="truncate">{walletAddress}</span>
              <button
                onClick={copyAddress}
                className="text-blue-600 hover:text-blue-700"
              >
                <ClipboardIcon className="w-4 h-4" />
              </button>
            </div>

            <p className="text-[12px] text-gray-500 mt-3">
              Send only <strong>USDT (TRC-20)</strong> to this address.
              Funds will be credited automatically after network confirmation.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
