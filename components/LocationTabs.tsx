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
    <div className="location-tabs">
      {locations.map((location) => (
        <button
          key={location}
          className={selectedLocation === location ? 'active' : ''}
          onClick={() => onChange(location)}
        >
          {location}
        </button>
      ))}
    </div>
  );
}
