import { useEffect, useRef, useState } from "react";
import { FilterState } from "../../types";
import { locationHierarchy } from "../../data/mockListings";

interface RefinePanelProps {
  filters: FilterState;
  total: number;
  onApply: (partial: Partial<FilterState>) => void;
  onClose: () => void;
}

type Section = "location" | "price" | "bedrooms" | "bathrooms" | "parking";

const SALE_PRICE_OPTIONS = [
  { value: "", label: "Any" },
  { value: "100000", label: "$100,000" },
  { value: "200000", label: "$200,000" },
  { value: "300000", label: "$300,000" },
  { value: "400000", label: "$400,000" },
  { value: "500000", label: "$500,000" },
  { value: "600000", label: "$600,000" },
  { value: "700000", label: "$700,000" },
  { value: "800000", label: "$800,000" },
  { value: "900000", label: "$900,000" },
  { value: "1000000", label: "$1,000,000" },
  { value: "1500000", label: "$1,500,000" },
  { value: "2000000", label: "$2,000,000" },
  { value: "3000000", label: "$3,000,000" },
  { value: "5000000", label: "$5,000,000+" },
];

const RENT_PRICE_OPTIONS = [
  { value: "", label: "Any" },
  { value: "100", label: "$100 /wk" },
  { value: "200", label: "$200 /wk" },
  { value: "300", label: "$300 /wk" },
  { value: "400", label: "$400 /wk" },
  { value: "500", label: "$500 /wk" },
  { value: "600", label: "$600 /wk" },
  { value: "700", label: "$700 /wk" },
  { value: "800", label: "$800 /wk" },
  { value: "1000", label: "$1,000 /wk" },
  { value: "1200", label: "$1,200 /wk" },
  { value: "1500", label: "$1,500 /wk" },
  { value: "2000", label: "$2,000+ /wk" },
];

const COUNT_OPTIONS = (max: number) => [
  { value: "", label: "Any" },
  ...Array.from({ length: max }, (_, i) => ({
    value: String(i + 1),
    label: `${i + 1}+`,
  })),
];

function ChevronRight() {
  return (
    <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  );
}
function Plus() {
  return (
    <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  );
}
function Minus() {
  return (
    <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
    </svg>
  );
}

export function RefinePanel({ filters, total, onApply, onClose }: RefinePanelProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState<Section | null>(null);

  // local draft state — only commit on "View results"
  const [draft, setDraft] = useState<Partial<FilterState>>({
    region: filters.region,
    district: filters.district,
    suburb: filters.suburb,
    minPrice: filters.minPrice,
    maxPrice: filters.maxPrice,
    minBedrooms: filters.minBedrooms,
    minBathrooms: filters.minBathrooms,
    minParking: filters.minParking,
  });

  const isRent = filters.listingType === "RENT";
  const PRICE_OPTIONS = isRent ? RENT_PRICE_OPTIONS : SALE_PRICE_OPTIONS;
  const priceLabel = isRent ? "Weekly rent" : "Price";

  const toggle = (s: Section) => setOpen((o) => (o === s ? null : s));

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  const set = (key: keyof FilterState, value: any) =>
    setDraft((d) => ({ ...d, [key]: value || undefined }));

  const availableDistricts = draft.region
    ? Object.keys(locationHierarchy[draft.region as keyof typeof locationHierarchy] || {})
    : [];

  const availableSuburbs =
    draft.region && draft.district
      ? (locationHierarchy[draft.region as keyof typeof locationHierarchy] as Record<string, string[]>)?.[draft.district] || []
      : [];

  const handleApply = () => {
    onApply(draft);
    onClose();
  };

  const SectionRow = ({
    id,
    label,
    icon,
    summary,
    children,
  }: {
    id: Section;
    label: string;
    icon: React.ReactNode;
    summary?: string;
    children: React.ReactNode;
  }) => (
    <div className="border-t border-gray-100">
      <button
        onClick={() => toggle(id)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-primary-600 font-semibold text-base">{label}</span>
          {summary && <span className="text-xs text-gray-400 ml-1">({summary})</span>}
        </div>
        {open === id ? <Minus /> : icon}
      </button>
      {open === id && (
        <div className="px-5 pb-4 bg-gray-50">{children}</div>
      )}
    </div>
  );

  return (
    <div
      ref={ref}
      className="absolute left-0 top-full mt-2 w-[420px] max-w-[95vw] bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <h2 className="text-xl font-bold text-gray-900">Refine search</h2>
        <button onClick={onClose} className="p-1 rounded hover:bg-gray-100 transition-colors">
          <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Location */}
      <SectionRow id="location" label="Location" icon={<ChevronRight />}
        summary={draft.region ? [draft.region, draft.district, draft.suburb].filter(Boolean).join(", ") : undefined}>
        <div className="space-y-2 pt-1">
          <select
            value={draft.region || ""}
            onChange={(e) => {
              setDraft((d) => ({ ...d, region: e.target.value || undefined, district: undefined, suburb: undefined }));
            }}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
          >
            <option value="">All New Zealand</option>
            {Object.keys(locationHierarchy).map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
          {availableDistricts.length > 0 && (
            <select
              value={draft.district || ""}
              onChange={(e) => setDraft((d) => ({ ...d, district: e.target.value || undefined, suburb: undefined }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
            >
              <option value="">All districts</option>
              {availableDistricts.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          )}
          {availableSuburbs.length > 0 && (
            <select
              value={draft.suburb || ""}
              onChange={(e) => set("suburb", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
            >
              <option value="">All suburbs</option>
              {availableSuburbs.map((s: string) => <option key={s} value={s}>{s}</option>)}
            </select>
          )}
        </div>
      </SectionRow>

      {/* Price / Weekly rent */}
      <SectionRow id="price" label={priceLabel} icon={<Plus />}
        summary={draft.minPrice || draft.maxPrice
          ? `$${(draft.minPrice || 0).toLocaleString()}${isRent ? "/wk" : ""} – ${draft.maxPrice ? "$" + draft.maxPrice.toLocaleString() + (isRent ? "/wk" : "") : "Any"}`
          : undefined}>
        <div className="flex items-center gap-3 pt-1">
          <select
            value={draft.minPrice?.toString() || ""}
            onChange={(e) => set("minPrice", e.target.value ? Number(e.target.value) : undefined)}
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
          >
            {PRICE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <span className="text-gray-400 text-sm">–</span>
          <select
            value={draft.maxPrice?.toString() || ""}
            onChange={(e) => set("maxPrice", e.target.value ? Number(e.target.value) : undefined)}
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
          >
            {PRICE_OPTIONS.filter((o) => !o.value || !draft.minPrice || Number(o.value) > draft.minPrice).map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </SectionRow>

      {/* Bedrooms */}
      <SectionRow id="bedrooms" label="Bedrooms" icon={<Plus />}
        summary={draft.minBedrooms ? `${draft.minBedrooms}+` : undefined}>
        <div className="flex flex-wrap gap-2 pt-1">
          {COUNT_OPTIONS(6).map((o) => (
            <button
              key={o.value}
              onClick={() => set("minBedrooms", o.value ? Number(o.value) : undefined)}
              className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                (draft.minBedrooms?.toString() || "") === o.value
                  ? "bg-primary-600 text-white border-primary-600"
                  : "bg-white text-gray-700 border-gray-300 hover:border-primary-400"
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
      </SectionRow>

      {/* Bathrooms */}
      <SectionRow id="bathrooms" label="Bathrooms" icon={<Plus />}
        summary={draft.minBathrooms ? `${draft.minBathrooms}+` : undefined}>
        <div className="flex flex-wrap gap-2 pt-1">
          {COUNT_OPTIONS(5).map((o) => (
            <button
              key={o.value}
              onClick={() => set("minBathrooms", o.value ? Number(o.value) : undefined)}
              className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                (draft.minBathrooms?.toString() || "") === o.value
                  ? "bg-primary-600 text-white border-primary-600"
                  : "bg-white text-gray-700 border-gray-300 hover:border-primary-400"
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
      </SectionRow>

      {/* Parking */}
      <SectionRow id="parking" label="Parking" icon={<Plus />}
        summary={draft.minParking ? `${draft.minParking}+` : undefined}>
        <div className="flex flex-wrap gap-2 pt-1">
          {COUNT_OPTIONS(4).map((o) => (
            <button
              key={o.value}
              onClick={() => set("minParking", o.value ? Number(o.value) : undefined)}
              className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                (draft.minParking?.toString() || "") === o.value
                  ? "bg-primary-600 text-white border-primary-600"
                  : "bg-white text-gray-700 border-gray-300 hover:border-primary-400"
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
      </SectionRow>

      {/* Footer — View results */}
      <div className="p-4 border-t border-gray-100 bg-white">
        <button
          onClick={handleApply}
          className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-lg text-base transition-colors"
        >
          View {total.toLocaleString()} results
        </button>
      </div>
    </div>
  );
}
