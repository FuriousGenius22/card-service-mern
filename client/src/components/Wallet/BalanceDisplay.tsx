import React, { useEffect, useState } from "react";

interface Balance {
  token: "USDT" | "USDC";
  amount: string;
}

export default function BalanceDisplay() {
  const [balances, setBalances] = useState<Balance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBalances = async () => {
      try {
        setIsLoading(true);
        const res = await fetch("/api/wallet/balance");
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || "Failed to fetch balances");
        }
        const data = await res.json();
        setBalances(data.balances);
      } catch (error: any) {
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBalances();
  }, []);

  if (isLoading) {
    return (
      <div className="p-4 bg-white rounded-lg shadow-sm">
        <p className="text-gray-500">Loading balances...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-white rounded-lg shadow-sm">
        <p className="text-red-500">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-white rounded-lg shadow-sm">
      <h3 className="text-lg font-semibold mb-3">Your Balances</h3>
      {balances.length === 0 ? (
        <p className="text-gray-600">No balances found.</p>
      ) : (
        <ul className="space-y-2">
          {balances.map((balance) => (
            <li key={balance.token} className="flex justify-between items-center text-sm">
              <span className="font-medium">{balance.token}:</span>
              <span>{balance.amount}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
