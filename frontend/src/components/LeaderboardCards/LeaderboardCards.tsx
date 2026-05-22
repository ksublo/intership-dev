import type { LeaderboardEntry } from '../../hooks/useLeaderboard.ts';

interface LeaderboardCardsProps {
    data: LeaderboardEntry[];
}

export function LeaderboardCards({ data }: LeaderboardCardsProps) {
    const topEntries = data.slice(0, 6);

    return (
        <section className="px-6 py-6">
            <div className="mb-5 flex items-center gap-2 text-sm font-semibold text-slate-700">
                <span className="text-teal-600">🏆</span>
                Pořadí obchodníků
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3 xl:grid-cols-6">
                {topEntries.map((entry) => (
                    <LeaderboardCard key={entry.owner.id} entry={entry} />
                ))}
            </div>
        </section>
    );
}

interface LeaderboardCardProps {
    entry: LeaderboardEntry;
}

function LeaderboardCard({ entry }: LeaderboardCardProps) {
    const isPositiveTrend = entry.trend !== null && entry.trend >= 0;
    const variant = getCardVariant(entry.rank);

    return (
        <article
            className={`overflow-hidden rounded-xl border bg-white shadow-sm ${variant.border}`}
        >
            <header
                className={`flex items-center justify-between px-4 py-3 text-sm font-bold ${variant.header}`}
            >
                <span>{getMedal(entry.rank)} {entry.rank}. MÍSTO</span>

                {entry.trend !== null && (
                    <span
                        className={`rounded-md px-2 py-1 text-xs ${
                            isPositiveTrend
                                ? 'bg-emerald-50 text-emerald-600'
                                : 'bg-red-50 text-red-600'
                        }`}
                    >
            {isPositiveTrend ? '↗ +' : '↘ '}
                        {entry.trend} %
          </span>
                )}
            </header>

            <div className={`px-4 py-5 text-center ${variant.body}`}>
                <Avatar owner={entry.owner} size="large" />

                <div className="mt-4 font-semibold text-slate-950">
                    {entry.owner.fullName}
                </div>

                <div className="mt-4 grid grid-cols-2 overflow-hidden rounded-md border border-slate-200 bg-white">
                    <div className="border-r border-slate-200 px-3 py-3">
                        <div className={`text-xl font-bold ${variant.metric}`}>
                            {entry.dealCount}
                        </div>
                        <div className="text-xs text-slate-400">dealů</div>
                    </div>

                    <div className="px-3 py-3">
                        <div className="text-sm font-semibold text-slate-900">
                            {formatCurrency(entry.totalValue)}
                        </div>
                        <div className="text-xs text-slate-400">Kč</div>
                    </div>
                </div>
            </div>
        </article>
    );
}

function Avatar({
                    owner,
                    size,
                }: {
    owner: LeaderboardEntry['owner'];
    size: 'large' | 'small';
}) {
    const sizeClass = size === 'large' ? 'h-14 w-14' : 'h-10 w-10';

    if (owner.avatarUrl) {
        return (
            <img
                src={owner.avatarUrl}
                alt={owner.fullName}
                className={`mx-auto rounded-full object-cover ${sizeClass}`}
            />
        );
    }

    return (
        <div
            className={`mx-auto flex items-center justify-center rounded-full bg-cyan-100 font-semibold text-cyan-700 ${sizeClass}`}
        >
            {getInitials(owner.fullName)}
        </div>
    );
}

function getCardVariant(rank: number) {
    if (rank === 1) {
        return {
            border: 'border-orange-400',
            header: 'bg-orange-500 text-white',
            body: 'bg-orange-50',
            metric: 'text-orange-500',
        };
    }

    if (rank === 2) {
        return {
            border: 'border-slate-400',
            header: 'bg-slate-400 text-white',
            body: 'bg-slate-50',
            metric: 'text-slate-500',
        };
    }

    if (rank === 3) {
        return {
            border: 'border-orange-400',
            header: 'bg-orange-400 text-white',
            body: 'bg-orange-50',
            metric: 'text-orange-600',
        };
    }

    return {
        border: 'border-slate-200',
        header: 'bg-slate-50 text-slate-500',
        body: 'bg-white',
        metric: 'text-teal-600',
    };
}

function getMedal(rank: number): string {
    if (rank === 1) return '🏆';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return '';
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
        maximumFractionDigits: 0,
    }).format(value);
}
