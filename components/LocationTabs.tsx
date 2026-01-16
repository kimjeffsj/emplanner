// components/LocationTabs.tsx
'use client';

import { Location } from '@/types/schedule';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

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
    <Tabs
      value={selectedLocation}
      onValueChange={(value) => onChange(value as Location)}
      className="w-full"
    >
      <TabsList aria-label="매장 선택">
        {locations.map((location) => (
          <TabsTrigger key={location} value={location}>
            {location}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
