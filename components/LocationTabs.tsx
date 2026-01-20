// components/LocationTabs.tsx
"use client";

import { Location } from "@/types/schedule";

interface LocationTabsProps {
  selectedLocation: Location;
  onChange: (location: Location) => void;
  counts?: Record<Location, number>;
}

export default function LocationTabs({
  selectedLocation,
  onChange,
  counts,
}: LocationTabsProps) {
  const locations: Location[] = ["No.3", "Westminster"];

  return (
    <div
      className="flex gap-2 p-1 overflow-x-auto overflow-y-hidden scrollbar-hide"
      role="tablist"
      aria-label="Select location"
    >
      {locations.map((location) => {
        const count = counts?.[location];
        const showCount = count !== undefined;

        return (
          <button
            key={location}
            role="tab"
            aria-selected={selectedLocation === location}
            onClick={() => onChange(location)}
            className={`px-6 py-3 rounded-xl font-semibold whitespace-nowrap transition-all border ${
              selectedLocation === location
                ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 border-zinc-900 dark:border-zinc-100 shadow-lg scale-105"
                : "bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600 hover:shadow"
            }`}
          >
            {location}
            {showCount && (
              <span
                className={`ml-1.5 text-xs font-medium px-1.5 py-0.5 rounded-md ${
                  selectedLocation === location
                    ? "bg-white/20 dark:bg-zinc-900/20"
                    : "bg-zinc-100 dark:bg-zinc-700 text-zinc-500 dark:text-zinc-400"
                }`}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
