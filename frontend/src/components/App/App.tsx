import { useState } from 'react';
import { DataTable } from '../DataTable/DataTable';
import { Sidebar } from '../Sidebar/Sidebar';
import { useLeaderboard } from '../../hooks/useLeaderboard';
import './App.css';
import {LeaderboardFilters} from "../LeaderboardCards/LeaderboardFilters.tsx";
import {LeaderboardCards} from "../LeaderboardFilters/LeaderboardCards.tsx";

function App() {
    const [period, setPeriod] = useState('2026-05');
    const { data, loading, error } = useLeaderboard(period);

    return (
        <div className="app-container">
            <Sidebar />

            <div className="main-container">
                <LeaderboardFilters
                    period={period}
                    onPeriodChange={setPeriod}
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
