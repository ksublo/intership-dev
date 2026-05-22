import { useState, useEffect } from 'react';

export interface FilterOptions {
  owners: { id: number; fullName: string }[];
  regions: string[];
}

export function useFilters() {
  const [options, setOptions] = useState<FilterOptions>({ owners: [], regions: [] });

  useEffect(() => {
    fetch('/api/filters')
      .then(res => res.json())
      .then(setOptions)
      .catch(() => {});
  }, []);

  return options;
}
