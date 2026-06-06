'use client';

import { useEffect, useRef, useState } from 'react';
import type { MapplsSuggestion, SelectedPlace } from '@/types/mappls';

type Props = {
  label: string;
  placeholder: string;
  value: SelectedPlace | null;
  onSelect: (place: SelectedPlace) => void;
};

export default function LocationSearchInput({
  label,
  placeholder,
  value,
  onSelect,
}: Props) {
  const [input, setInput] = useState(value?.placeName || '');
  const [items, setItems] = useState<MapplsSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const activeRequestRef = useRef<AbortController | null>(null);
  const lastQueryRef = useRef('');

  useEffect(() => {
    setInput(value?.placeName || '');
  }, [value]);

  useEffect(() => {
    if (!input || input.trim().length < 3) {
      if (activeRequestRef.current) {
        activeRequestRef.current.abort();
        activeRequestRef.current = null;
      }
      setItems([]);
      setLoading(false);
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      const query = input.trim();

      if (query === lastQueryRef.current) {
        return;
      }

      if (activeRequestRef.current) {
        activeRequestRef.current.abort();
      }

      const controller = new AbortController();
      activeRequestRef.current = controller;

      try {
        setLoading(true);
        const res = await fetch(
          `/api/mappls/autosuggest?query=${encodeURIComponent(query)}`,
          { signal: controller.signal }
        );

        if (!res.ok) {
          setItems([]);
          return;
        }

        const data = await res.json();
        setItems(data?.suggestedLocations || []);
        lastQueryRef.current = query;
      } catch (error) {
        if ((error as Error).name === 'AbortError') {
          return;
        }
        setItems([]);
      } finally {
        if (activeRequestRef.current === controller) {
          activeRequestRef.current = null;
          setLoading(false);
        }
      }
    }, 350);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (activeRequestRef.current) {
        activeRequestRef.current.abort();
        activeRequestRef.current = null;
      }
    };
  }, [input]);

  return (
    <div className="relative">
      <label className="mb-2 block text-sm font-medium text-slate-700">
        {label}
      </label>

      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={placeholder}
        className="h-11 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm outline-none transition focus:border-slate-900"
      />

      {(loading || items.length > 0) && (
        <div className="absolute z-20 mt-2 max-h-72 w-full overflow-auto rounded-xl border border-slate-200 bg-white shadow-lg">
          {loading && (
            <div className="px-4 py-3 text-sm text-slate-500">Searching...</div>
          )}

          {!loading &&
            items.map((item) => (
              <button
                key={`${item.eLoc}-${item.placeName}`}
                type="button"
                onClick={() => {
                  const latitude = Number(item.latitude);
                  const longitude = Number(item.longitude);

                  onSelect({
                    eLoc: item.eLoc,
                    placeName: item.placeName,
                    placeAddress: item.placeAddress,
                    latitude: Number.isNaN(latitude) ? undefined : latitude,
                    longitude: Number.isNaN(longitude) ? undefined : longitude,
                  });
                  setInput(item.placeName);
                  setItems([]);
                }}
                className="w-full border-b border-slate-100 px-4 py-3 text-left hover:bg-slate-50"
              >
                <div className="text-sm font-medium text-slate-900">
                  {item.placeName}
                </div>
                <div className="mt-1 text-xs text-slate-500">
                  {item.placeAddress}
                </div>
              </button>
            ))}

          {!loading && items.length === 0 && (
            <div className="px-4 py-3 text-sm text-slate-500">No results found</div>
          )}
        </div>
      )}
    </div>
  );
}