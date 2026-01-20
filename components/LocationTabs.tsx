// components/LocationTabs.tsx
"use client";

import { Location } from "@/types/schedule";

interface LocationTabsProps {
  selectedLocation: Location;
  onChange: (location: Location) => void;
}

export default function LocationTabs({
  selectedLocation,
  onChange,
}: LocationTabsProps) {
  const locations: Location[] = ["No.3", "Westminster"];

  return (
    <div
      className="flex gap-2 overflow-x-auto scrollbar-hide"
      role="tablist"
      aria-label="Select location"
    >
      {locations.map((location) => (
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
        </button>
      ))}
    </div>
  );
}
