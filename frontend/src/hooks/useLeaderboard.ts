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

export interface LeaderboardResponse {
  period: string;
  sortBy: 'value' | 'deals';
  order: 'asc' | 'desc';
  leaderboard: LeaderboardEntry[];
}

export function useLeaderboard(period?: string) {
  const [data, setData] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = period ? `?period=${period}` : '';
    fetch(`/api/leaderboard${params}`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch leaderboard');
        return res.json() as Promise<LeaderboardResponse>;
      })
      .then(result => {
        setData(result.leaderboard);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [period]);

  return { data, loading, error };
}
