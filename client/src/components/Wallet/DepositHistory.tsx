import React, { useEffect, useState } from "react";

interface Deposit {
  _id: string;
  txHash: string;
  token: "USDT" | "USDC";
  amount: string;
  status: "pending" | "confirmed";
  blockNumber: number;
  createdAt: string; // Assuming mongoose adds this
}

export default function DepositHistory() {
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDeposits = async () => {
      try {
        setIsLoading(true);
        const res = await fetch("/api/wallet/deposits");
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || "Failed to fetch deposit history");
        }
        const data = await res.json();
        setDeposits(data.deposits);
      } catch (error: any) {
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDeposits();
  }, []);

  if (isLoading) {
    return (
      <div className="p-4 bg-white rounded-lg shadow-sm">
        <p className="text-gray-500">Loading deposit history...</p>
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
      <h3 className="text-lg font-semibold mb-3">Deposit History</h3>
      {deposits.length === 0 ? (
        <p className="text-gray-600">No deposits found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tx Hash
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Token
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {deposits.map((deposit) => (
                <tr key={deposit._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {deposit.txHash.substring(0, 10)}...
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {deposit.token}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {deposit.amount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        deposit.status === "confirmed"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {deposit.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(deposit.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
