import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { BusinessCase, BusinessCaseResponse, LeaderboardEntry, LeaderboardResponse } from './types';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Data endpoint
app.get('/api/hello', (req, res) => {
  try {
    const dataPath = path.join(process.cwd(), '../data/data.json');
    const rawData = fs.readFileSync(dataPath, 'utf-8');
    const jsonData: BusinessCaseResponse = JSON.parse(rawData);

    const dataRows = jsonData.data.slice(0, 10).map((item: any) => ({
      id: item.id,
      name: item.name,
      code: item.code,
      type: item._entityName
    }));

    res.json({
      message: 'Hello World from Raynet API!',
      timestamp: new Date().toISOString(),
      status: 'ok',
      dataRows
    });
  } catch (error) {
    console.error('Error reading data:', error);
    res.status(500).json({
      message: 'Error reading data',
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

function getPreviousPeriod(period: string): string {
  const [year, month] = period.split('-').map(Number);
  const date = new Date(year, month - 2); // month-2 because Date months are 0-indexed and we go back 1
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function aggregateByOwner(items: BusinessCase[]): Map<number, { dealCount: number; totalValue: number; owner: BusinessCase['owner'] }> {
  const map = new Map<number, { dealCount: number; totalValue: number; owner: BusinessCase['owner'] }>();
  for (const item of items) {
    const existing = map.get(item.owner.id);
    if (existing) {
      existing.dealCount += 1;
      existing.totalValue += item.totalAmount;
    } else {
      map.set(item.owner.id, { dealCount: 1, totalValue: item.totalAmount, owner: item.owner });
    }
  }
  return map;
}

const AVATAR_MAP: Record<string, string> = {
  'rybarova.png':        '/avatars/rybarova.svg',
  'tunak.png':           '/avatars/tunak.svg',
  '986564_66073771.jpg': '/avatars/kosatka.svg',
  'sardinka.png':        '/avatars/sardinka.svg',
  'ploticova.png':       '/avatars/ploticova.svg',
  'stikova.png':         '/avatars/stikova.svg',
  'rejnok.png':          '/avatars/rejnok.svg',
  'kaprova.png':         '/avatars/kaprova.svg',
  'sumec.png':           '/avatars/sumec.svg',
  'candat.png':          '/avatars/candat.svg',
  'pstruh.png':          '/avatars/pstruh.svg',
  '1182765_99082097.jpg':'/avatars/lososova.svg',
};

// GET /api/leaderboard?period=2026-05&sortBy=value&order=desc
app.get('/api/leaderboard', (req, res) => {
  try {
    const dataPath = path.join(process.cwd(), '../data/data.json');
    const jsonData: BusinessCaseResponse = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

    const now = new Date();
    const defaultPeriod = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const period = typeof req.query.period === 'string' ? req.query.period : defaultPeriod;
    const sortBy = req.query.sortBy === 'deals' ? 'deals' : 'value';
    const order = req.query.order === 'asc' ? 'asc' : 'desc';

    const prevPeriod = getPreviousPeriod(period);

    const currentItems = jsonData.data.filter(item => item.validFrom.startsWith(period));
    const prevItems = jsonData.data.filter(item => item.validFrom.startsWith(prevPeriod));

    const currentAgg = aggregateByOwner(currentItems);
    const prevAgg = aggregateByOwner(prevItems);

    const totalValue = Array.from(currentAgg.values()).reduce((sum, e) => sum + e.totalValue, 0);

    const entries: LeaderboardEntry[] = Array.from(currentAgg.values()).map(entry => {
      const prev = prevAgg.get(entry.owner.id);
      const trend = prev && prev.totalValue > 0
        ? Math.round(((entry.totalValue - prev.totalValue) / prev.totalValue) * 100)
        : null;

      return {
        rank: 0,
        owner: {
          id: entry.owner.id,
          fullName: entry.owner.fullName,
          avatarUrl: entry.owner.photo ? (AVATAR_MAP[entry.owner.photo.fileName] ?? null) : null,
        },
        dealCount: entry.dealCount,
        totalValue: entry.totalValue,
        trend,
        share: totalValue > 0 ? Math.round((entry.totalValue / totalValue) * 100) : 0,
      };
    });

    entries.sort((a, b) => {
      const diff = sortBy === 'deals'
        ? a.dealCount - b.dealCount
        : a.totalValue - b.totalValue;
      return order === 'asc' ? diff : -diff;
    });

    entries.forEach((entry, i) => { entry.rank = i + 1; });

    const response: LeaderboardResponse = { period, sortBy, order, leaderboard: entries };
    res.json(response);
  } catch (error) {
    console.error('Error computing leaderboard:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server běží na http://localhost:${PORT}`);
  console.log(`📋 API dostupné na http://localhost:${PORT}/api/hello`);
  console.log(`📋 API dostupné na http://localhost:${PORT}/api/leaderboard`);
});

export default app;
