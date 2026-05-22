import { useState, useRef, useEffect } from 'react';
import { LeaderboardFilters } from '../../hooks/useLeaderboard';
import { FilterOptions } from '../../hooks/useFilters';

const CZECH_MONTHS = [
  'Leden', 'Únor', 'Březen', 'Duben', 'Máj', 'Červen',
  'Červenec', 'Srpen', 'Září', 'Říjen', 'Listopad', 'Prosinec',
];

function formatPeriodLabel(period: string): string {
  if (/^\d{4}$/.test(period)) return `Rok ${period}`;
  const [year, month] = period.split('-').map(Number);
  return `${CZECH_MONTHS[month - 1]} ${year}`;
}

function generateMonthOptions() {
  const now = new Date();
  const options = [];
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = i === 0 ? 'Tento měsíc' : i === 1 ? 'Minulý měsíc' : formatPeriodLabel(value);
    options.push({ value, label });
  }
  return options;
}

const DEFAULT_PERIOD = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
const MONTH_OPTIONS = generateMonthOptions();

interface MultiSelectDropdownProps {
  label: string;
  options: { value: string; label: string }[];
  selected: string[];
  onChange: (values: string[]) => void;
}

function MultiSelectDropdown({ label, options, selected, onChange }: MultiSelectDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const toggle = (value: string) => {
    onChange(selected.includes(value) ? selected.filter(v => v !== value) : [...selected, value]);
  };

  const isActive = selected.length > 0;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className={`flex items-center gap-1 rounded-md border px-4 py-2 text-sm font-semibold ${
          isActive
            ? 'border-teal-600 bg-teal-600 text-white'
            : 'border-slate-300 bg-white text-slate-700'
        }`}
      >
        {label}
        {isActive && <span className="ml-1 rounded-full bg-white/30 px-1.5 text-xs">{selected.length}</span>}
        <span className="ml-1 text-xs opacity-60">▾</span>
      </button>

      {open && (
        <div className="absolute left-0 top-full z-20 mt-1 min-w-48 rounded-md border border-slate-200 bg-white shadow-lg">
          {options.map(opt => (
            <label key={opt.value} className="flex cursor-pointer items-center gap-2 px-4 py-2 text-sm hover:bg-slate-50">
              <input
                type="checkbox"
                checked={selected.includes(opt.value)}
                onChange={() => toggle(opt.value)}
                className="accent-teal-600"
              />
              {opt.label}
            </label>
          ))}
          {selected.length > 0 && (
            <button
              onClick={() => { onChange([]); setOpen(false); }}
              className="w-full border-t border-slate-100 px-4 py-2 text-left text-xs font-medium text-teal-600 hover:bg-slate-50"
            >
              Zrušit výběr
            </button>
          )}
        </div>
      )}
    </div>
  );
}

interface LeaderboardFiltersBarProps {
  filters: LeaderboardFilters;
  options: FilterOptions;
  onChange: (filters: LeaderboardFilters) => void;
}

export function LeaderboardFiltersBar({ filters, options, onChange }: LeaderboardFiltersBarProps) {
  const isFiltered =
    filters.period !== DEFAULT_PERIOD ||
    filters.ownerIds.length > 0 ||
    filters.regions.length > 0;

  const set = (partial: Partial<LeaderboardFilters>) => onChange({ ...filters, ...partial });

  const clearAll = () => onChange({ period: DEFAULT_PERIOD, ownerIds: [], regions: [] });

  const ownerOptions = options.owners.map(o => ({ value: String(o.id), label: o.fullName }));
  const regionOptions = options.regions.map(r => ({ value: r, label: r }));

  const activeChips: { label: string; clear: () => void }[] = [
    { label: formatPeriodLabel(filters.period), clear: () => set({ period: DEFAULT_PERIOD }) },
    ...filters.ownerIds.map(id => ({
      label: options.owners.find(o => o.id === id)?.fullName ?? String(id),
      clear: () => set({ ownerIds: filters.ownerIds.filter(x => x !== id) }),
    })),
    ...filters.regions.map(r => ({
      label: r,
      clear: () => set({ regions: filters.regions.filter(x => x !== r) }),
    })),
  ];

  return (
    <div className="border-b border-slate-200 bg-white px-6 py-5">
      <h1 className="text-3xl font-bold text-slate-950">Žebříček obchodníků</h1>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <select
          value={filters.period}
          onChange={e => set({ period: e.target.value })}
          className="rounded-md border border-teal-600 bg-teal-600 px-4 py-2 text-sm font-semibold text-white"
        >
          {MONTH_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
          <option value={String(new Date().getFullYear())}>Tento rok</option>
        </select>

        <MultiSelectDropdown
          label="Obchodník"
          options={ownerOptions}
          selected={filters.ownerIds.map(String)}
          onChange={vals => set({ ownerIds: vals.map(Number) })}
        />

        <MultiSelectDropdown
          label="Region"
          options={regionOptions}
          selected={filters.regions}
          onChange={vals => set({ regions: vals })}
        />

      </div>

      {isFiltered && (
        <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
          <span className="rounded-md bg-teal-600 px-3 py-1.5 font-semibold text-white">Filtrováno</span>

          {activeChips.map(chip => (
            <span key={chip.label} className="flex items-center gap-1 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-slate-700">
              {chip.label}
              <button onClick={chip.clear} className="text-slate-400 hover:text-slate-700">×</button>
            </span>
          ))}

          <button onClick={clearAll} className="font-medium text-teal-600">× Vyčistit filtry</button>
        </div>
      )}
    </div>
  );
}
