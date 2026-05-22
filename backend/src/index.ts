import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { BusinessCase, BusinessCaseResponse, LeaderboardEntry, LeaderboardResponse } from './types';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const AVATAR_MAP: Record<string, string> = {
  'rybarova.png':         '/avatars/rybarova.svg',
  'tunak.png':            '/avatars/tunak.svg',
  '986564_66073771.jpg':  '/avatars/kosatka.svg',
  'sardinka.png':         '/avatars/sardinka.svg',
  'ploticova.png':        '/avatars/ploticova.svg',
  'stikova.png':          '/avatars/stikova.svg',
  'rejnok.png':           '/avatars/rejnok.svg',
  'kaprova.png':          '/avatars/kaprova.svg',
  'sumec.png':            '/avatars/sumec.svg',
  'candat.png':           '/avatars/candat.svg',
  'pstruh.png':           '/avatars/pstruh.svg',
  '1182765_99082097.jpg': '/avatars/lososova.svg',
};


function loadData(): BusinessCaseResponse {
  const dataPath = path.join(process.cwd(), '../data/data.json');
  return JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
}

function getPreviousPeriod(period: string): string {
  const [year, month] = period.split('-').map(Number);
  const date = new Date(year, month - 2);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function aggregateByOwner(items: BusinessCase[]) {
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

// GET /api/filters — returns available filter options
app.get('/api/filters', (req, res) => {
  try {
    const jsonData = loadData();

    const ownersMap = new Map<number, string>();
    const regionsSet = new Set<string>();

    jsonData.data.forEach(item => {
      ownersMap.set(item.owner.id, item.owner.fullName);
      const territory = item.company?.primaryAddress?.territory;
      if (territory) regionsSet.add(territory.code01);
    });

    res.json({
      owners: Array.from(ownersMap.entries())
        .map(([id, fullName]) => ({ id, fullName }))
        .sort((a, b) => a.fullName.localeCompare(b.fullName, 'cs')),
      regions: [...regionsSet].sort((a, b) => a.localeCompare(b, 'cs')),
    });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// GET /api/leaderboard?period=2026-05&sortBy=value&order=desc&ownerId=40&region=...&team=...
app.get('/api/leaderboard', (req, res) => {
  try {
    const jsonData = loadData();

    const now = new Date();
    const defaultPeriod = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const period   = typeof req.query.period  === 'string' ? req.query.period  : defaultPeriod;
    const sortBy   = req.query.sortBy === 'deals' ? 'deals' : 'value';
    const order    = req.query.order  === 'asc'   ? 'asc'   : 'desc';
    const ownerIds = typeof req.query.ownerId === 'string'
      ? req.query.ownerId.split(',').map(Number).filter(Boolean)
      : [];
    const regions  = typeof req.query.region === 'string'
      ? req.query.region.split(',').filter(Boolean)
      : [];
    const prevPeriod = getPreviousPeriod(period);

    const applyFilters = (items: BusinessCase[]) => items.filter(item => {
      if (ownerIds.length > 0 && !ownerIds.includes(item.owner.id)) return false;
      if (regions.length > 0) {
        const territory = item.company?.primaryAddress?.territory?.code01;
        if (!territory || !regions.includes(territory)) return false;
      }
      return true;
    });

    const currentItems = applyFilters(jsonData.data.filter(item => item.validFrom.startsWith(period)));
    const prevItems    = applyFilters(jsonData.data.filter(item => item.validFrom.startsWith(prevPeriod)));

    const currentAgg = aggregateByOwner(currentItems);
    const prevAgg    = aggregateByOwner(prevItems);

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
      const diff = sortBy === 'deals' ? a.dealCount - b.dealCount : a.totalValue - b.totalValue;
      return order === 'asc' ? diff : -diff;
    });

    entries.forEach((entry, i) => { entry.rank = i + 1; });

    const response: LeaderboardResponse = { period, sortBy, order, leaderboard: entries };
    res.json(response);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

app.get('/api/hello', (req, res) => {
  try {
    const jsonData = loadData();
    const dataRows = jsonData.data.slice(0, 10).map((item: any) => ({
      id: item.id, name: item.name, code: item.code, type: item._entityName,
    }));
    res.json({ message: 'Hello World from Raynet API!', timestamp: new Date().toISOString(), status: 'ok', dataRows });
  } catch (error) {
    res.status(500).json({ message: 'Error reading data', status: 'error', error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server běží na http://localhost:${PORT}`);
});

export default app;
