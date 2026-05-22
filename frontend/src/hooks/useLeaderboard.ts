import { useState, useEffect } from 'react';

export interface LeaderboardOwner {
  id: number;
  fullName: string;
  avatarUrl: string | null;
}

export interface LeaderboardEntry {
  rank: number;
  owner: LeaderboardOwner;
  dealCount: number;
  totalValue: number;
  trend: number | null;
  share: number;
}

export interface LeaderboardFilters {
  period: string;
  ownerIds: number[];
  regions: string[];
}

export function useLeaderboard(filters: LeaderboardFilters) {
  const [data, setData] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams({ period: filters.period });
    if (filters.ownerIds.length > 0) params.set('ownerId', filters.ownerIds.join(','));
    if (filters.regions.length > 0)  params.set('region',  filters.regions.join(','));

    setLoading(true);
    fetch(`/api/leaderboard?${params}`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch leaderboard');
        return res.json();
      })
      .then(result => { setData(result.leaderboard); setLoading(false); })
      .catch(err => { setError(err.message); setLoading(false); });
  }, [filters.period, filters.ownerIds.join(','), filters.regions.join(',')]);

  return { data, loading, error };
}
