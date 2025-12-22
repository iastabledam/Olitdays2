
import React, { useState } from 'react';
import { Reservation, Property } from '../types';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Filter, X, Search, Check } from 'lucide-react';

// --- OTA ICONS & STYLES ---
const PlatformIcon = ({ platform }: { platform: string }) => {
  if (platform === 'Airbnb') {
    return (
      <svg className="w-4 h-4 mr-1.5 text-[#FF5A5F] fill-current" viewBox="0 0 24 24">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.55 16.27c-1.12.87-2.73 1.25-4.55 1.25-1.82 0-3.43-.38-4.55-1.25-.34-.26-.55-.66-.55-1.1 0-1.15 1.41-1.88 2.62-2.3 1.05-.36 1.77-.92 1.77-1.87 0-1.38-1.12-2.5-2.5-2.5-1.38 0-2.5 1.12-2.5 2.5 0 .34.07.66.19.95.14.33-.11.7-.47.7h-.06c-.34 0-.64-.26-.7-.6-.17-.66-.26-1.36-.26-2.09 0-4.69 3.13-8.5 7-8.5s7 3.81 7 8.5c0 .73-.09 1.43-.26 2.09-.06.34-.36.6-.7.6h-.06c-.36 0-.61-.37-.47-.7.12-.29.19-.61.19-.95 0-1.38-1.12-2.5-2.5-2.5-1.38 0-2.5 1.12-2.5 2.5 0 .95.73 1.51 1.77 1.87 1.21.42 2.62 1.15 2.62 2.3 0 .44-.21.84-.55 1.1z" />
      </svg>
    );
  }
  if (platform === 'Booking') {
    return (
      <svg className="w-4 h-4 mr-1.5 text-[#003580] fill-current" viewBox="0 0 24 24">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5.46 13.91c-.48.45-1.18.7-2.1.75-.15.01-.3.01-.45.01-1.28 0-2.28-.31-2.99-.93-.71-.62-1.07-1.49-1.07-2.61 0-1.14.35-2.02 1.05-2.64.7-.62 1.68-.93 2.94-.93.38 0 .74.03 1.08.09.91.17 1.57.57 1.99 1.19l-1.36 1.24c-.18-.3-.46-.5-.84-.61-.25-.07-.52-.1-.81-.1-.66 0-1.17.18-1.52.54-.35.36-.53.86-.53 1.49 0 .61.17 1.08.52 1.42.34.33.85.5 1.53.5.34 0 .65-.05.93-.15.28-.1.52-.28.71-.54l1.37 1.1c-.57.77-1.3 1.18-2.2 1.23zm1.69-6.3h-1.68v5.6h1.68v-5.6z" />
      </svg>
    );
  }
  // Direct / Other
  return (
    <svg className="w-4 h-4 mr-1.5 text-emerald-600 fill-current" viewBox="0 0 24 24">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9v-2h2v2zm0-4H9V7h2v5z" />
    </svg>
  );
};

interface PlanningViewProps {
  properties: Property[];
  reservations: Reservation[];
  selectedPropertyId?: string | null;
  onClearFilter?: () => void;
  onSelectProperty?: (id: string) => void;
}

export const PlanningView: React.FC<PlanningViewProps> = ({ 
  properties, 
  reservations, 
  selectedPropertyId, 
  onClearFilter, 
  onSelectProperty 
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterSearch, setFilterSearch] = useState('');

  // Filter properties based on selection (for the calendar view)
  const visibleProperties = selectedPropertyId 
    ? properties.filter(p => p.id === selectedPropertyId) 
    : properties;

  // Filter properties for the dropdown list
  const filteredDropdownProperties = properties.filter(p => 
    p.name.toLowerCase().includes(filterSearch.toLowerCase())
  );

  // --- HELPERS ---

  // Generate days for the view (e.g. 15 days window or full month)
  // Let's do a 30-day sliding window for better visibility
  const getDaysArray = () => {
    const days = [];
    const start = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1); // Start of month
    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    
    for (let i = 0; i < daysInMonth; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      days.push(d);
    }
    return days;
  };

  const days = getDaysArray();
  const cellWidth = 140; // px width per day

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  // Check if a reservation is visible in the current month
  const isReservationVisible = (res: any) => {
    const resStart = new Date(res.startDate);
    const resEnd = new Date(res.endDate);
    const viewStart = days[0];
    const viewEnd = days[days.length - 1];

    return (resStart <= viewEnd && resEnd >= viewStart);
  };

  // Calculate position and width of the reservation bar
  const getReservationStyle = (res: any) => {
    const resStart = new Date(res.startDate);
    const resEnd = new Date(res.endDate);
    const viewStart = days[0];
    
    // Calculate start offset (in days) relative to view start
    let startOffset = Math.ceil((resStart.getTime() - viewStart.getTime()) / (1000 * 60 * 60 * 24));
    
    // Calculate duration in days
    let duration = Math.ceil((resEnd.getTime() - resStart.getTime()) / (1000 * 60 * 60 * 24));
    
    // Adjust if starting before view
    if (startOffset < 0) {
      duration += startOffset; // Reduce duration by the days cut off
      startOffset = 0;
    }

    // Adjust visual width to be slightly smaller than the cell grid for spacing
    const width = duration * cellWidth - 4; // -4 for margin
    const left = startOffset * cellWidth + 2; // +2 for margin

    // Color logic
    let bgColor = 'bg-gray-100 border-gray-200';
    if (res.platform === 'Airbnb') bgColor = 'bg-rose-50 border-rose-200 text-rose-900';
    if (res.platform === 'Booking') bgColor = 'bg-blue-50 border-blue-200 text-blue-900';
    if (res.platform === 'Direct') bgColor = 'bg-emerald-50 border-emerald-200 text-emerald-900';

    return {
      left: `${left}px`,
      width: `${Math.max(width, cellWidth - 4)}px`, // Min width 1 day
      styleClass: bgColor
    };
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      
      {/* HEADER: Controls */}
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-white z-20">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-bold text-gray-800 flex items-center">
            <CalendarIcon className="w-6 h-6 mr-2 text-indigo-600" />
            Planning des Réservations
          </h1>
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button onClick={handlePrevMonth} className="p-1 hover:bg-white rounded shadow-sm transition"><ChevronLeft className="w-5 h-5 text-gray-600"/></button>
            <span className="px-4 text-sm font-semibold text-gray-900 min-w-[140px] text-center">
              {currentDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
            </span>
            <button onClick={handleNextMonth} className="p-1 hover:bg-white rounded shadow-sm transition"><ChevronRight className="w-5 h-5 text-gray-600"/></button>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          {selectedPropertyId && (
            <div className="flex items-center bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-lg text-sm mr-4 border border-indigo-100">
              <span className="font-semibold mr-2">
                Filtré: {properties.find(p => p.id === selectedPropertyId)?.name}
              </span>
              <button onClick={onClearFilter} className="hover:bg-indigo-200 rounded-full p-0.5 transition">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          <div className="flex items-center text-xs space-x-3 text-gray-500 mr-4">
            <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-[#FF5A5F] mr-1"></span>Airbnb</span>
            <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-[#003580] mr-1"></span>Booking</span>
            <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-emerald-500 mr-1"></span>Direct</span>
          </div>
          
          {/* Custom Filter Dropdown */}
          <div className="relative">
            <button 
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={`flex items-center px-3 py-2 border rounded-lg text-sm transition-colors ${
                    isFilterOpen || selectedPropertyId ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                }`}
            >
                <Filter className="w-4 h-4 mr-2" />
                {selectedPropertyId ? 'Filtres actifs' : 'Filtrer'}
            </button>

            {isFilterOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-gray-100 z-50 p-2 animate-in fade-in zoom-in-95 duration-200">
                    <div className="relative mb-2">
                        <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                        <input 
                            type="text" 
                            placeholder="Rechercher un bien..." 
                            className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
                            value={filterSearch}
                            onChange={(e) => setFilterSearch(e.target.value)}
                            autoFocus
                        />
                    </div>
                    <div className="max-h-60 overflow-y-auto space-y-1">
                        <button 
                            onClick={() => {
                                onClearFilter?.();
                                setIsFilterOpen(false);
                            }}
                            className="w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-gray-50 flex items-center justify-between group"
                        >
                            <span className="font-medium text-gray-600 group-hover:text-gray-900">Tout voir</span>
                            {!selectedPropertyId && <Check className="w-4 h-4 text-indigo-600" />}
                        </button>
                        {filteredDropdownProperties.map(p => (
                             <button 
                                key={p.id}
                                onClick={() => {
                                    onSelectProperty?.(p.id);
                                    setIsFilterOpen(false);
                                }}
                                className="w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-gray-50 flex items-center justify-between group"
                            >
                                <span className={`truncate ${selectedPropertyId === p.id ? 'font-bold text-indigo-700' : 'text-gray-700'}`}>
                                    {p.name}
                                </span>
                                {selectedPropertyId === p.id && <Check className="w-4 h-4 text-indigo-600" />}
                            </button>
                        ))}
                    </div>
                </div>
            )}
          </div>
        </div>
      </div>

      {/* CALENDAR BODY */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* LEFT COLUMN: Properties */}
        <div className="w-64 flex-shrink-0 border-r border-gray-200 bg-white z-10 shadow-[4px_0_10px_-5px_rgba(0,0,0,0.1)]">
           {/* Spacer for header date row */}
           <div className="h-12 border-b border-gray-200 bg-gray-50 flex items-center px-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">
             Logements ({visibleProperties.length})
           </div>
           
           {/* Property List */}
           <div className="overflow-y-hidden">
             {visibleProperties.map(prop => (
               <div key={prop.id} className="h-24 border-b border-gray-100 px-4 flex flex-col justify-center hover:bg-gray-50 transition-colors group">
                 <h3 className="font-bold text-gray-800 text-sm truncate">{prop.name}</h3>
                 <p className="text-xs text-gray-500 truncate">{prop.address}</p>
                 <div className="mt-2 flex items-center">
                    <span className={`w-2 h-2 rounded-full mr-2 ${prop.status === 'active' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                    <span className="text-[10px] uppercase font-bold text-gray-400">{prop.status}</span>
                 </div>
               </div>
             ))}
           </div>
        </div>

        {/* RIGHT AREA: Timeline Grid */}
        <div className="flex-1 overflow-x-auto overflow-y-auto bg-white relative">
          
          {/* Days Header */}
          <div className="flex border-b border-gray-200 sticky top-0 bg-white z-10" style={{ width: `${days.length * cellWidth}px` }}>
            {days.map((day, i) => {
              const isWeekend = day.getDay() === 0 || day.getDay() === 6;
              const isToday = day.toDateString() === new Date().toDateString();
              return (
                <div 
                  key={i} 
                  className={`flex-shrink-0 border-r border-gray-100 h-12 flex flex-col items-center justify-center text-sm ${isWeekend ? 'bg-gray-50' : ''} ${isToday ? 'bg-indigo-50' : ''}`}
                  style={{ width: `${cellWidth}px` }}
                >
                  <span className={`text-xs font-medium ${isToday ? 'text-indigo-600' : 'text-gray-400'}`}>
                    {day.toLocaleDateString('fr-FR', { weekday: 'short' })}
                  </span>
                  <span className={`font-bold ${isToday ? 'text-indigo-700' : 'text-gray-700'}`}>
                    {day.getDate()}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Grid Body */}
          <div style={{ width: `${days.length * cellWidth}px` }}>
            {visibleProperties.map(prop => {
              // Get reservations for this property
              const propReservations = reservations.filter(r => r.propertyId === prop.id && isReservationVisible(r));

              return (
                <div key={prop.id} className="h-24 border-b border-gray-100 relative flex hover:bg-gray-50/50">
                  {/* Grid Lines Background */}
                  {days.map((day, i) => {
                     const isWeekend = day.getDay() === 0 || day.getDay() === 6;
                     return (
                      <div 
                        key={i} 
                        className={`flex-shrink-0 border-r border-gray-100 h-full ${isWeekend ? 'bg-gray-50/50' : ''}`}
                        style={{ width: `${cellWidth}px` }}
                      ></div>
                    );
                  })}

                  {/* Reservation Bars */}
                  {propReservations.map(res => {
                    const { left, width, styleClass } = getReservationStyle(res);
                    return (
                      <div
                        key={res.id}
                        className={`absolute top-2 bottom-2 rounded-lg border shadow-sm px-3 flex flex-col justify-center cursor-pointer hover:shadow-md transition-all hover:-translate-y-0.5 z-0 ${styleClass}`}
                        style={{ left, width }}
                        title={`${res.guestName} (${res.platform})`}
                      >
                         <div className="flex items-center mb-0.5">
                            <PlatformIcon platform={res.platform} />
                            <span className="text-xs font-bold uppercase tracking-wider opacity-75">{res.platform}</span>
                         </div>
                         <div className="font-bold text-sm truncate leading-tight">
                           {res.guestName}
                         </div>
                         <div className="text-[10px] opacity-80 mt-0.5 truncate">
                           {new Date(res.startDate).getDate()} - {new Date(res.endDate).toLocaleDateString('fr-FR', {day: 'numeric', month: 'short'})}
                         </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>

        </div>
      </div>
    </div>
  );
};
