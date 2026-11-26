import React from 'react';
import { 
  Maximize2, 
  Home, 
  Droplets, 
  DoorClosed, 
  Bath, 
  IndianRupee,
  Layers
} from 'lucide-react';
import type { Property } from '../../types';
import { 
  formatTotalPriceINR, 
  formatSizeMeasurement, 
  formatBorewell 
} from '../../utils/formatters';

interface PropertySpecificationsProps {
  property: Property;
}

interface SpecItemConfig {
  id: string;
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const PropertySpecifications: React.FC<PropertySpecificationsProps> = ({ property }) => {
  const specs = property.specifications;
  const category = property.category;

  if (!specs) {
    return null;
  }

  // Determine allowed and available specifications based on property category
  const isLandPlot = category === 'land-plots';

  const specItems: SpecItemConfig[] = [];

  // 1. Plot Size (Applicable to Residential, Land & Plots, Commercial)
  const formattedPlotSize = formatSizeMeasurement(specs.plotSize);
  if (formattedPlotSize) {
    specItems.push({
      id: 'plot-size',
      label: 'Plot Size',
      value: formattedPlotSize,
      icon: Maximize2
    });
  }

  // 2. Building Size (Applicable to Residential and Commercial; NOT applicable to Land & Plots)
  if (!isLandPlot) {
    const formattedBuildingSize = formatSizeMeasurement(specs.buildingSize);
    if (formattedBuildingSize) {
      specItems.push({
        id: 'building-size',
        label: 'Building Size',
        value: formattedBuildingSize,
        icon: Home
      });
    }
  }

  // 3. Borewell (Applicable to all categories if available)
  const formattedBorewell = formatBorewell(specs.borewell);
  if (formattedBorewell !== null) {
    specItems.push({
      id: 'borewell',
      label: 'Borewell',
      value: formattedBorewell,
      icon: Droplets
    });
  }

  // 4. Number of Rooms (Applicable to Residential and Commercial if available; NOT Land & Plots)
  if (!isLandPlot && specs.numberOfRooms !== undefined && specs.numberOfRooms !== null && specs.numberOfRooms !== '') {
    const roomsVal = typeof specs.numberOfRooms === 'number'
      ? `${specs.numberOfRooms} ${specs.numberOfRooms === 1 ? 'Room' : 'Rooms'}`
      : String(specs.numberOfRooms);
    specItems.push({
      id: 'rooms-count',
      label: 'Number of Rooms',
      value: roomsVal,
      icon: DoorClosed
    });
  }

  // 5. Number of Toilets (Applicable to Residential and Commercial if available; NOT Land & Plots)
  if (!isLandPlot && specs.numberOfToilets !== undefined && specs.numberOfToilets !== null && specs.numberOfToilets !== '') {
    const toiletsVal = typeof specs.numberOfToilets === 'number'
      ? `${specs.numberOfToilets} ${specs.numberOfToilets === 1 ? 'Toilet' : 'Toilets'}`
      : String(specs.numberOfToilets);
    specItems.push({
      id: 'toilets-count',
      label: 'Number of Toilets',
      value: toiletsVal,
      icon: Bath
    });
  }

  // 6. Total Price (Applicable to all categories if provided; Never price per sq.ft)
  const formattedTotalPrice = formatTotalPriceINR(specs.totalPrice);

  // If no specifications at all are available, hide the section
  if (specItems.length === 0 && !formattedTotalPrice) {
    return null;
  }

  return (
    <section 
      aria-label="Property Specifications" 
      className="bg-white border border-[#E5E1D8] p-6 sm:p-8 space-y-6 shadow-sm"
    >
      {/* Section Header */}
      <div className="border-b border-[#E5E1D8] pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-2">
        <div className="space-y-1">
          <span className="text-xs uppercase tracking-[0.25em] text-[#C5A46D] font-bold">
            Key Specifications
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#142C38]">
            Property Specifications
          </h2>
        </div>
        
        <span className="text-[11px] font-mono uppercase tracking-wider text-[#C5A46D] bg-[#142C38] px-2.5 py-1 self-start sm:self-auto">
          {property.propertyTypeDisplay || property.categoryDisplay}
        </span>
      </div>

      {/* Specifications 2-Column Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
        {specItems.map(item => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              className="bg-[#F7F5F0] border border-[#E5E1D8] p-4 flex items-center justify-between gap-3 hover:border-[#C5A46D]/60 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 bg-[#142C38] text-[#C5A46D] flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-xs uppercase tracking-wider text-[#242424]/70 font-semibold">
                  {item.label}
                </span>
              </div>

              <span className="font-serif sm:font-sans text-base sm:text-lg font-bold text-[#142C38] text-right">
                {item.value}
              </span>
            </div>
          );
        })}

        {/* Total Price Specification (Highlighted Visual Emphasis) */}
        {formattedTotalPrice && (
          <div className="sm:col-span-2 bg-[#142C38] text-[#F7F5F0] border-2 border-[#C5A46D] p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md mt-2">
            <div className="space-y-1">
              <div className="flex items-center space-x-2 text-[#C5A46D]">
                <IndianRupee className="w-4 h-4" />
                <span className="text-xs uppercase tracking-[0.25em] font-bold">
                  Total Price
                </span>
              </div>
              <p className="text-xs text-[#F7F5F0]/70 font-light">
                Complete property acquisition price (Indian Rupees)
              </p>
            </div>

            <div className="text-left sm:text-right">
              <span className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-[#F7F5F0] tracking-tight">
                {formattedTotalPrice}
              </span>
              <p className="text-[11px] text-[#C5A46D] font-mono mt-0.5">
                [Demonstration Value]
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Demonstration Verification Reminder */}
      <div className="pt-2 border-t border-[#E5E1D8]/80 text-[11px] text-[#242424]/60 flex items-center space-x-2">
        <Layers className="w-3.5 h-3.5 text-[#C5A46D] shrink-0" />
        <span>
          Specifications shown are demonstration values. Actual plot extents, building measurements, borewell depths, and final total pricing should be verified directly prior to decision-making.
        </span>
      </div>
    </section>
  );
};
