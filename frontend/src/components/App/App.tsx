import { useState } from 'react';
import { DataTable } from '../DataTable/DataTable';
import { Sidebar } from '../Sidebar/Sidebar';
import { useLeaderboard, LeaderboardFilters } from '../../hooks/useLeaderboard';
import { useFilters } from '../../hooks/useFilters';
import './App.css';
import { LeaderboardFiltersBar } from '../LeaderboardFilters/LeaderboardFilters.tsx';
import { LeaderboardCards } from '../LeaderboardCards/LeaderboardCards.tsx';

const DEFAULT_PERIOD = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;

function App() {
  const [filters, setFilters] = useState<LeaderboardFilters>({
    period: DEFAULT_PERIOD,
    ownerIds: [],
    regions: [],
  });

  const { data, loading, error } = useLeaderboard(filters);
  const filterOptions = useFilters();

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-container">
        <LeaderboardFiltersBar
          filters={filters}
          options={filterOptions}
          onChange={setFilters}
        />

        {loading && <p className="p-6">Načítám data...</p>}
        {error && <p className="p-6 text-red-600">{error}</p>}

        {!loading && !error && (
          <>
            <LeaderboardCards data={data} />
            <div className="px-6 pb-6">
              <DataTable data={data.slice(6)} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default App;
