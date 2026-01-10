import React, { useMemo, useState, useRef, useEffect } from "react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";

const PRESETS = [20, 50, 100, 200, 500, 1000, 10000];

interface Cryptocurrency {
  id: string;
  name: string;
  network: string;
  fullName: string;
  }

const CRYPTOCURRENCIES: Cryptocurrency[] = [
  {
    id: "usdt-bsc",
    name: "USDT",
    network: "BSC (BEP-20)",
    fullName: "Tether USD (BSC)",
  },
  {
    id: "usdt-polygon",
    name: "USDT",
    network: "Polygon",
    fullName: "Tether USD (Polygon)",
  },
];

export default function TopUp() {
  const [amount, setAmount] = useState<string | number>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCrypto, setSelectedCrypto] = useState<Cryptocurrency | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [paymentInfo, setPaymentInfo] = useState<{ paymentId: string; payAddress: string; payCurrency: string } | null>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

  const numericAmount = useMemo(() => {
    const n = typeof amount === "string" ? parseFloat(amount || "0") : amount;
    return isNaN(n as number) ? 0 : Math.max(0, n as number);
  }, [amount]);

  const setSparkle = (
    e: React.MouseEvent<HTMLButtonElement | HTMLDivElement, MouseEvent>
  ) => {
    const target = e.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    target.style.setProperty("--x", `${x}px`);
    target.style.setProperty("--y", `${y}px`);
  };

  const handlePreset = (v: number) => setAmount(v);

  const handlePay = async () => {
    if (!selectedCrypto) {
      setError("Please select a cryptocurrency");
      return;
    }

    if (numericAmount <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Map UI selection to NOWPayments pay_currency
      const mapPayCurrency = (id: string) => {
        if (id === "usdt-bsc") return "usdtbsc";
        if (id === "usdt-polygon") return "usdtpolygon"; // verify if supported
        return id;
      };

      const response = await fetch("/api/payment/create-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          priceAmount: numericAmount,
          payCurrency: mapPayCurrency(selectedCrypto.id),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to create payment. Please try again.");
      }

      const data = await response.json();
      setPaymentInfo({ paymentId: data.paymentId, payAddress: data.payAddress, payCurrency: data.payCurrency });
    } catch (err: any) {
      setError(err.message || "An error occurred. Please try again.");
      console.error("Payment error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-[10vh] w-full h-full px-4 sm:px-6 py-6 font-sans text-slate-900 bg-gradient-to-br from-slate-50 via-white to-slate-100">
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        {/* LEFT: Quick amounts + input */}
        <div className="relative rounded-2xl p-5 bg-white/80 backdrop-blur border border-slate-200 shadow-[0_10px_40px_rgba(2,6,23,0.06)] overflow-hidden">
          <div
            className="pointer-events-none absolute inset-0 rounded-2xl"
            style={{
              background:
                "radial-gradient(1200px 300px at -10% -20%, rgba(99,102,241,0.12), transparent 60%), radial-gradient(800px 200px at 120% 120%, rgba(244,63,94,0.10), transparent 60%)",
            }}
          />

          <div className="relative">
            <p className="text-sm text-slate-600 mb-3">Quick amounts</p>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {PRESETS.map((v) => {
                const displayValue = v >= 1000 ? (v === 1000 ? "1K" : "10K") : `$${v}`;
                return (
                <button
                  key={v}
                  onMouseMove={setSparkle}
                  onClick={() => handlePreset(v)}
                  className={`group relative overflow-hidden rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 select-none active:scale-[0.98]
                    ${numericAmount === v
                      ? "bg-gradient-to-r from-indigo-600 to-fuchsia-600 text-white shadow-[0_0_18px_rgba(99,102,241,0.55)]"
                      : "bg-white text-slate-800 border border-slate-200 hover:border-indigo-300"}
                  `}
                  style={{
                    backgroundPosition: "center",
                  }}
                >
                    <span className="relative z-10 drop-shadow-[0_0_8px_rgba(255,255,255,0.35)]">{displayValue}</span>
                  <span
                    aria-hidden
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{
                      background:
                        "radial-gradient(140px 60px at var(--x,50%) var(--y,50%), rgba(250,204,21,0.35), transparent 60%)",
                    }}
                  />
                  </button>
                );
              })}
            </div>

            {/* Cryptocurrency Dropdown */}
            <div className="mt-6">
              <label className="text-slate-600 text-xs block mb-2">Cryptocurrency</label>
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  onMouseMove={setSparkle}
                  className="group relative w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm transition-all hover:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-left">
                      {selectedCrypto ? (
                        <>
                          <div className="text-sm font-semibold text-slate-900">{selectedCrypto.name}</div>
                          <div className="text-xs text-slate-500">{selectedCrypto.network}</div>
                        </>
                      ) : (
                        <div className="text-sm font-semibold text-slate-500">Select cryptocurrency</div>
                      )}
                    </div>
                  </div>
                  <ChevronDownIcon
                    className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${
                      isDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute z-50 w-full bottom-full mb-2 bg-white rounded-2xl border border-slate-200 shadow-[0_10px_40px_rgba(2,6,23,0.15)] overflow-hidden max-h-96 overflow-y-auto">
                    <div className="py-2">
                      {CRYPTOCURRENCIES.map((crypto) => (
                        <button
                          key={crypto.id}
                          type="button"
                          onClick={() => {
                            setSelectedCrypto(crypto);
                            setIsDropdownOpen(false);
                          }}
                          className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-slate-50 transition-colors ${
                            selectedCrypto?.id === crypto.id ? "bg-indigo-50" : ""
                          }`}
                        >
                          <div className="flex-1 text-left">
                            <div className="text-sm font-semibold text-slate-900">{crypto.name}</div>
                            <div className="text-xs text-slate-500">{crypto.network}</div>
                          </div>
                          {selectedCrypto?.id === crypto.id && (
                            <div className="flex-shrink-0 w-2 h-2 rounded-full bg-indigo-600"></div>
                          )}
                </button>
              ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Amount Input */}
            <div className="mt-6">
              <label className="text-slate-600 text-xs block mb-2">Amount, $</label>
              <div
                className="group relative rounded-2xl border border-slate-200 bg-white pl-4 pr-3 py-3 shadow-sm transition-all hover:border-indigo-300"
                onMouseMove={setSparkle}
              >
                <input
                  type="number"
                  min={0}
                  step={0.01}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full text-lg font-bold outline-none bg-transparent tracking-wide placeholder:text-slate-400"
                  placeholder="Enter custom amount"
                />
                <div
                  className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-active:opacity-100 transition"
                  style={{
                    boxShadow:
                      "inset 0 0 0 0 rgba(0,0,0,0), 0 0 0 0 rgba(0,0,0,0)",
                    background:
                      "radial-gradient(220px 90px at var(--x,50%) var(--y,50%), rgba(99,102,241,0.10), transparent 60%)",
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: Big Pay button */}
        <div className="relative flex items-center justify-center rounded-2xl bg-slate-900 text-white p-6 overflow-hidden">
          <div className="absolute -inset-1 bg-gradient-to-br from-indigo-600 via-fuchsia-600 to-rose-600 opacity-40 blur-3xl" />
          <div className="relative w-full max-w-md text-center">
            <div className="mb-6">
              <p className="text-slate-300 text-sm">Amount to pay</p>
              <p className="text-4xl sm:text-5xl font-extrabold tracking-tight">${numericAmount.toFixed(2)}</p>
              <p className="mt-2 text-sm text-slate-300">
                {selectedCrypto ? `Selected: ${selectedCrypto.name}` : "No crypto selected"}
              </p>
            </div>

            <button
              onMouseMove={setSparkle}
              onClick={handlePay}
              disabled={!selectedCrypto || numericAmount <= 0 || isLoading}
              className="group relative w-full rounded-2xl px-8 py-5 text-xl font-extrabold tracking-wide transition-all
                disabled:cursor-not-allowed disabled:opacity-60 active:scale-[0.98]
                bg-gradient-to-r from-amber-400 via-rose-400 to-fuchsia-500 text-slate-900 shadow-[0_10px_30px_rgba(251,191,36,0.35)]
                hover:shadow-[0_20px_60px_rgba(244,63,94,0.45)]"
              style={{
                textShadow: "0 0 10px rgba(255,255,255,0.35)",
                boxShadow: "0 0 24px rgba(244,63,94,0.45), inset 0 0 18px rgba(255,255,255,0.15)",
              }}
            >
              <span className="relative z-10 drop-shadow-[0_0_8px_rgba(255,255,255,0.65)]">
                {isLoading ? "Processing..." : "Pay"}
              </span>
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{
                  background:
                    "radial-gradient(220px 100px at var(--x,50%) var(--y,50%), rgba(255,255,255,0.35), transparent 60%)",
                }}
              />
            </button>

            {error && (
              <p className="mt-4 text-red-400 text-sm font-medium">{error}</p>
            )}
            {!error && (
              <p className="mt-4 text-slate-300 text-xs">
                {isLoading ? "Creating payment..." : paymentInfo ? "Payment created. See address below." : "Press to proceed with payment"}
              </p>
            )}

            {paymentInfo && (
              <div className="mt-6 text-left bg-white/10 rounded-xl p-4">
                <p className="text-sm text-slate-200 mb-1">Send your payment to:</p>
                <p className="font-mono break-all text-amber-300">{paymentInfo.payAddress}</p>
                <p className="mt-2 text-xs text-slate-300">Currency: {paymentInfo.payCurrency?.toUpperCase()}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
