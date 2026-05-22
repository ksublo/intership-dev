interface LeaderboardFiltersProps {
    period: string;
    onPeriodChange: (period: string) => void;
}

export function LeaderboardFilters({
                                       period,
                                       onPeriodChange,
                                   }: LeaderboardFiltersProps) {
    return (
        <div className="border-b border-slate-200 bg-white px-6 py-5">
            <div className="text-sm font-medium text-slate-500">
                Seřadit dle: Hodnota dealů (sestupně)
            </div>

            <h1 className="mt-1 text-3xl font-bold text-slate-950">
                Žebříček obchodníků
            </h1>

            <div className="mt-5 flex flex-wrap items-center gap-2">
                <button className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700">
                    Mé filtry
                </button>

                <select
                    value={period}
                    onChange={(event) => onPeriodChange(event.target.value)}
                    className="rounded-md border border-teal-600 bg-teal-600 px-4 py-2 text-sm font-semibold text-white"
                >
                    <option value="2026-05">Tento měsíc</option>
                    <option value="2026-04">Minulý měsíc</option>
                    <option value="2026">Tento rok</option>
                </select>

                <button className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700">
                    Obchodník
                </button>

                <button className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700">
                    Region
                </button>

                <button className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700">
                    Tým
                </button>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
        <span className="rounded-md bg-teal-600 px-3 py-1.5 font-semibold text-white">
          Filtrováno
        </span>

                <span className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-slate-700">
          Tento měsíc: Máj 2026 ×
        </span>

                <button className="font-medium text-teal-600">
                    × Vyčistit filtry
                </button>
            </div>
        </div>
    );
}
