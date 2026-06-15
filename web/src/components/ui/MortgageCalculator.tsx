import { useMemo, useState } from "react";

function MortgageCalculator({ defaultPrice }: { defaultPrice?: number } = {}) {
  const initialPrice = defaultPrice && defaultPrice > 0 ? defaultPrice : 700_000;
  const [price, setPrice] = useState(initialPrice);
  const [deposit, setDeposit] = useState(Math.round(initialPrice * 0.2));
  const [interest, setInterest] = useState(5.79);
  const [years, setYears] = useState(30);
  const [months, setMonths] = useState(0);
  const [frequency, setFrequency] = useState<"monthly" | "fortnightly">("monthly");

  const loanAmount = useMemo(() => {
    return Math.max(price - deposit, 0);
  }, [price, deposit]);

  const payment = useMemo(() => {
    if (loanAmount <= 0) return 0;
    const paymentsPerYear = frequency === "monthly" ? 12 : 26;
    const totalYears = years + months / 12;
    const ratePerPeriod = interest / 100 / paymentsPerYear;
    const totalPayments = totalYears * paymentsPerYear;

    if (ratePerPeriod === 0) {
      return loanAmount / totalPayments;
    }

    return (
      (loanAmount *
        ratePerPeriod *
        Math.pow(1 + ratePerPeriod, totalPayments)) /
      (Math.pow(1 + ratePerPeriod, totalPayments) - 1)
    );
  }, [loanAmount, interest, years, months, frequency]);

  return (
    <div>
      <div className="bg-white rounded-2xl shadow-card p-4 sm:p-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">
          What will my mortgage repayments be?
        </h1>

        {/* Top row - Property price, Deposit, Interest */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <InputBlock
            label="Property price"
            value={price}
            onChange={setPrice}
            max={5000000}
            step={10000}
            prefix="$"
          />
          <InputBlock
            label="My deposit"
            value={deposit}
            onChange={setDeposit}
            max={price}
            step={5000}
            prefix="$"
          />
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-3">
              Interest %p.a.
            </label>
            <input
              type="number"
              value={interest}
              onChange={(e) => setInterest(Number(e.target.value))}
              step="0.01"
              className="w-full border border-gray-300 rounded px-4 py-2.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="mt-3">
              <a href="#" className="text-sm text-blue-600 hover:underline">
                Compare the latest rates
              </a>
            </div>
          </div>
        </div>

        {/* Bottom row - Loan term and Payment frequency */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Loan term */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-3">
              Loan term
            </label>
            <div className="flex gap-3">
              <div className="flex-1">
                <input
                  type="number"
                  value={years}
                  onChange={(e) =>
                    setYears(Math.max(0, Number(e.target.value)))
                  }
                  className="w-full border border-gray-300 rounded px-4 py-2.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="text-center text-sm text-gray-500 mt-1">
                  Years
                </div>
              </div>
              <div className="flex-1">
                <input
                  type="number"
                  value={months}
                  onChange={(e) =>
                    setMonths(Math.max(0, Math.min(11, Number(e.target.value))))
                  }
                  className="w-full border border-gray-300 rounded px-4 py-2.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="text-center text-sm text-gray-500 mt-1">
                  Months
                </div>
              </div>
            </div>
          </div>

          {/* Payment frequency */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-3">
              Payment frequency
            </label>
            <div className="flex gap-3">
              <button
                onClick={() => setFrequency("monthly")}
                className={`flex-1 py-2.5 px-4 rounded border font-medium transition-colors ${
                  frequency === "monthly"
                    ? "bg-white border-gray-800 text-gray-800"
                    : "bg-white border-gray-300 text-gray-600 hover:border-gray-400"
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setFrequency("fortnightly")}
                className={`flex-1 py-2.5 px-4 rounded border font-medium transition-colors ${
                  frequency === "fortnightly"
                    ? "bg-white border-gray-800 text-gray-800"
                    : "bg-white border-gray-300 text-gray-600 hover:border-gray-400"
                }`}
              >
                Fortnightly
              </button>
            </div>
          </div>
        </div>

        {/* Result */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mt-6 pt-6 border-t border-gray-200">
          <a href="#" onClick={(e) => e.preventDefault()} className="text-sm text-primary-600 hover:underline">
            Compare the latest rates
          </a>
          <div className="text-right">
            <div className="text-3xl md:text-4xl font-bold text-gray-900">
              ${payment.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </div>
            <div className="text-sm text-gray-500 mt-1">/ {frequency === 'monthly' ? 'month' : 'fortnight'}</div>
          </div>
        </div>

        {/* Partner bank strip */}
        <div className="mt-6 rounded-xl bg-gray-50 border border-gray-200 p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#0061AA] text-white font-bold text-sm">
              ANZ
            </span>
            <span className="text-sm text-gray-600">Chat to a partner bank about your next home loan.</span>
          </div>
          <a
            href="#"
            onClick={(e) => e.preventDefault()}
            className="text-sm font-medium text-primary-600 hover:underline whitespace-nowrap"
          >
            Visit ANZ Home Loans ↗
          </a>
        </div>

        <p className="mt-4 text-xs text-gray-500">
          The home loan repayments calculator is not provided by ANZ Bank New Zealand Limited ("ANZ"). ANZ does not warrant its
          accuracy or completeness. This calculator is intended as a guide only and the default interest rate is based on
          floating rates.
        </p>
      </div>
    </div>
  );
}

interface InputBlockProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  max: number;
  step?: number;
  prefix?: string;
}

function InputBlock({ label, value, onChange, max, step = 1, prefix = "" }: InputBlockProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-600 mb-3">
        {label}
      </label>
      <div className="relative">
        {prefix && (
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-800">
            {prefix}
          </span>
        )}
        <input
          type="text"
          value={value.toLocaleString()}
          onChange={(e) => {
            const num = Number(e.target.value.replace(/,/g, ""));
            if (!isNaN(num)) onChange(num);
          }}
          className={`w-full border border-gray-300 rounded px-4 py-2.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            prefix ? "pl-8" : ""
          }`}
        />
      </div>
      <input
        type="range"
        min="0"
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        step={step}
        className="w-full mt-3 accent-green-600"
        style={{
          background: `linear-gradient(to right, #16a34a 0%, #16a34a ${
            (value / max) * 100
          }%, #d1d5db ${(value / max) * 100}%, #d1d5db 100%)`,
        }}
      />
    </div>
  );
}

export default MortgageCalculator;
