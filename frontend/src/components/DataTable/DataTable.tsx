import {LeaderboardEntry} from "../../hooks/useLeaderboard.ts";


interface DataTableProps {
    data: LeaderboardEntry[];
}

export function DataTable({ data }: DataTableProps) {
    return (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <table className="w-full border-collapse">
                <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                    <th className="w-16 px-6 py-4 text-left font-semibold">#</th>

                    <th className="px-6 py-4 text-left font-semibold">
                        Obchodník
                    </th>

                    <th className="px-6 py-4 text-right font-semibold">
                        Dealy
                    </th>

                    <th className="px-6 py-4 text-right font-semibold">
                        Hodnota
                    </th>

                    <th className="px-6 py-4 text-right font-semibold">
                        Trend
                    </th>

                    <th className="px-6 py-4 text-right font-semibold">
                        Podíl
                    </th>
                </tr>
                </thead>

                <tbody>
                {data.map((entry) => {
                    const isPositiveTrend =
                        entry.trend !== null && entry.trend >= 0;

                    return (
                        <tr
                            key={entry.owner.id}
                            className="border-b border-slate-100 last:border-b-0"
                        >
                            <td className="px-6 py-5 text-slate-400">
                                {entry.rank}
                            </td>

                            <td className="px-6 py-5">
                                <div className="flex items-center gap-3">
                                    {entry.owner.photo ? (
                                        <img
                                            src={`/api/files/${entry.owner.photo.uuid}`}
                                            alt={entry.owner.fullName}
                                            className="h-11 w-11 rounded-full object-cover"
                                        />
                                    ) : (
                                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-cyan-100 font-semibold text-cyan-700">
                                            {getInitials(entry.owner.fullName)}
                                        </div>
                                    )}

                                    <span className="font-semibold text-slate-900">
                      {entry.owner.fullName}
                    </span>
                                </div>
                            </td>

                            <td className="px-6 py-5 text-right">
                  <span className="font-semibold text-slate-900">
                    {entry.dealCount}
                  </span>

                                <span className="ml-1 text-slate-400">
                    dealů
                  </span>
                            </td>

                            <td className="px-6 py-5 text-right font-semibold text-slate-900">
                                {formatCurrency(entry.totalValue)}
                            </td>

                            <td className="px-6 py-5 text-right">
                                {entry.trend !== null && (
                                    <span
                                        className={`inline-flex rounded-md px-2 py-1 text-xs font-medium ${
                                            isPositiveTrend
                                                ? 'bg-emerald-50 text-emerald-600'
                                                : 'bg-red-50 text-red-600'
                                        }`}
                                    >
                      {isPositiveTrend ? '↗ +' : '↘ '}
                                        {entry.trend} %
                    </span>
                                )}
                            </td>

                            <td className="px-6 py-5">
                                <div className="flex items-center justify-end gap-3">
                                    <div className="h-2 w-24 rounded-full bg-slate-200">
                                        <div
                                            className="h-2 rounded-full bg-cyan-600"
                                            style={{
                                                width: `${entry.share}%`,
                                            }}
                                        />
                                    </div>

                                    <span className="w-10 text-right text-slate-500">
                      {entry.share} %
                    </span>
                                </div>
                            </td>
                        </tr>
                    );
                })}
                </tbody>
            </table>
        </div>
    );
}

function getInitials(fullName: string): string {
    return fullName
        .split(' ')
        .map((part) => part[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();
}

function formatCurrency(value: number): string {
    return new Intl.NumberFormat('cs-CZ', {
        style: 'currency',
        currency: 'CZK',
        maximumFractionDigits: 0,
    }).format(value);
}
