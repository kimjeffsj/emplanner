// components/LocationTabs.tsx
'use client';

import { Location } from '@/types/schedule';

interface LocationTabsProps {
  selectedLocation: Location;
  onChange: (location: Location) => void;
}

export default function LocationTabs({
  selectedLocation,
  onChange,
}: LocationTabsProps) {
  const locations: Location[] = ['No.3', 'Westminster'];

  return (
    <div
      className="flex gap-2 overflow-x-auto scrollbar-hide"
      role="tablist"
      aria-label="매장 선택"
    >
      {locations.map((location) => (
        <button
          key={location}
          role="tab"
          aria-selected={selectedLocation === location}
          onClick={() => onChange(location)}
          className={`px-6 py-3 rounded-xl font-semibold whitespace-nowrap transition-all border ${
            selectedLocation === location
              ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 border-gray-900 dark:border-gray-100 shadow-lg scale-105'
              : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow'
          }`}
        >
          {location}
        </button>
      ))}
    </div>
  );
}
