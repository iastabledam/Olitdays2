
import React, { useState, useEffect } from 'react';
import { Reservation, Property } from '../types';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Filter, X, Search, Check } from 'lucide-react';

// --- OTA ICONS & STYLES ---
const PlatformIcon = ({ platform }: { platform: string }) => {
  if (platform === 'Airbnb') {
    return (
      <img 
        src="https://img.icons8.com/color/96/airbnb.png" 
        alt="Airbnb" 
        className="w-6 h-6"
        title="Airbnb"
      />
    );
  }
  if (platform === 'Booking') {
    return (
      <div className="w-6 h-6 bg-[#003580] rounded flex items-center justify-center shadow-sm shrink-0" title="Booking.com">
         <span className="text-white font-bold text-xs leading-none font-sans pt-[1px]">B.</span>
      </div>
    );
  }
  if (platform === 'Vrbo') {
    return (
      <img 
        src="https://upload.wikimedia.org/wikipedia/commons/c/cb/Vrbo_logo.svg" 
        alt="Vrbo" 
        className="h-4 w-auto object-contain"
        title="Vrbo"
      />
    );
  }
  // Direct / Other
  return (
    <div className="flex items-center justify-center w-6 h-6 bg-emerald-200 rounded-full text-emerald-800 font-bold text-[10px] border border-emerald-300 shadow-sm" title="Direct">
       <span className="mb-[1px]">D</span>
    </div>
  );
};

interface PlanningViewProps {
  properties: Property[];
  reservations: Reservation[];
  selectedPropertyId?: string | null;
  onClearFilter?: () => void;
  onSelectProperty?: (id: string) => void;
  onReservationClick?: (reservation: Reservation) => void;
}

export const PlanningView: React.FC<PlanningViewProps> = ({ 
  properties, 
  reservations, 
  selectedPropertyId, 
  onClearFilter, 
  onSelectProperty,
  onReservationClick
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterSearch, setFilterSearch] = useState('');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Handle Resize for responsive layout
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Filter properties based on selection (for the calendar view)
  const visibleProperties = selectedPropertyId 
    ? properties.filter(p => p.id === selectedPropertyId) 
    : properties;

  // Filter properties for the dropdown list
  const filteredDropdownProperties = properties.filter(p => 
    p.name.toLowerCase().includes(filterSearch.toLowerCase())
  );

  // --- HELPERS ---

  // Generate days for the view
  // Fixed window of 30 days centered around Today (starting 2 days prior)
  const getDaysArray = () => {
    const days = [];
    // Start 2 days before the 'currentDate' pointer to allow seeing immediate past context
    const start = new Date(currentDate);
    start.setDate(start.getDate() - 2);
    
    // Generate 30 days view
    for (let i = 0; i < 30; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      days.push(d);
    }
    return days;
  };

  const days = getDaysArray();
  
  // RESPONSIVE DIMENSIONS
  const cellWidth = isMobile ? 60 : 140; // Smaller cells on mobile
  const leftColumnWidth = isMobile ? 110 : 260; // Narrower column on mobile

  const handlePrevPeriod = () => {
    // Move back by 7 days
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentDate(newDate);
  };

  const handleNextPeriod = () => {
    // Move forward by 7 days
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentDate(newDate);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Check if a reservation is visible in the current view window
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
    if (res.platform === 'Vrbo') bgColor = 'bg-sky-50 border-sky-200 text-sky-900';

    return {
      left: `${left}px`,
      width: `${Math.max(width, cellWidth - 4)}px`, // Min width 1 day
      styleClass: bgColor
    };
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      
      {/* HEADER: Controls */}
      <div className="px-4 md:px-6 py-4 border-b border-gray-200 flex flex-col md:flex-row justify-between items-start md:items-center bg-white z-50 relative gap-3 md:gap-0">
        <div className="flex items-center justify-between w-full md:w-auto space-x-4">
          <h1 className="text-xl font-bold text-gray-800 flex items-center">
            <CalendarIcon className="w-6 h-6 mr-2 text-indigo-600" />
            <span className="hidden md:inline">Planning</span>
          </h1>
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button onClick={handlePrevPeriod} className="p-1 hover:bg-white rounded shadow-sm transition"><ChevronLeft className="w-5 h-5 text-gray-600"/></button>
            <button onClick={handleToday} className="px-3 md:px-4 text-xs md:text-sm font-semibold text-gray-900 hover:bg-white rounded transition mx-1">
              {isMobile ? 'Auj.' : "Aujourd'hui"}
            </button>
            <button onClick={handleNextPeriod} className="p-1 hover:bg-white rounded shadow-sm transition"><ChevronRight className="w-5 h-5 text-gray-600"/></button>
          </div>
          <span className="text-xs md:text-sm text-gray-500 font-medium whitespace-nowrap">
              {days[2].toLocaleDateString('fr-FR', { month: isMobile ? 'short' : 'long', year: 'numeric' })}
          </span>
        </div>
        
        <div className="flex items-center w-full md:w-auto justify-between md:justify-end space-x-3">
          {/* Selected Filter Badge */}
          {selectedPropertyId && (
            <div className="flex items-center bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-lg text-xs md:text-sm mr-auto md:mr-4 border border-indigo-100 max-w-[150px]">
              <span className="font-semibold mr-2 truncate">
                {properties.find(p => p.id === selectedPropertyId)?.name}
              </span>
              <button onClick={onClearFilter} className="hover:bg-indigo-200 rounded-full p-0.5 transition shrink-0">
                <X className="w-3 h-3 md:w-4 md:h-4" />
              </button>
            </div>
          )}

          {/* Legend - Hidden on Mobile */}
          <div className="hidden md:flex items-center text-xs space-x-3 text-gray-500 mr-4">
            <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-[#FF5A5F] mr-1"></span>Airbnb</span>
            <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-[#003580] mr-1"></span>Booking</span>
            <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-emerald-500 mr-1"></span>Direct</span>
          </div>
          
          {/* Custom Filter Dropdown */}
          <div className="relative">
            <button 
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={`flex items-center px-3 py-2 border rounded-lg text-xs md:text-sm transition-colors ${
                    isFilterOpen || selectedPropertyId ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                }`}
            >
                <Filter className="w-4 h-4 mr-2" />
                {selectedPropertyId ? 'Filtres' : 'Filtrer'}
            </button>

            {isFilterOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-gray-100 z-50 p-2 animate-in fade-in zoom-in-95 duration-200">
                    <div className="relative mb-2">
                        <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                        <input 
                            type="text" 
                            placeholder="Rechercher un bien..." 
                            className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
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

      {/* CALENDAR BODY - Single Scroll Container */}
      <div className="flex-1 overflow-auto relative">
        <div className="min-w-max">
            
            {/* HEADER ROW */}
            <div className="flex sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
                {/* Top-Left Corner (Sticky Left & Top) */}
                <div 
                    className="flex-shrink-0 sticky left-0 z-40 bg-gray-50 border-r border-gray-200 flex items-center px-4 font-semibold text-gray-500 text-xs uppercase tracking-wider"
                    style={{ width: `${leftColumnWidth}px`, height: '48px' }}
                >
                    Logements ({visibleProperties.length})
                </div>

                {/* Timeline Dates (Sticky Top) */}
                <div className="flex">
                    {days.map((day, i) => {
                        const isWeekend = day.getDay() === 0 || day.getDay() === 6;
                        const isToday = day.toDateString() === new Date().toDateString();
                        return (
                            <div 
                                key={i} 
                                className={`flex-shrink-0 border-r border-gray-100 flex flex-col items-center justify-center text-sm ${isWeekend ? 'bg-gray-50' : 'bg-white'} ${isToday ? 'bg-indigo-50' : ''}`}
                                style={{ width: `${cellWidth}px`, height: '48px' }}
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
            </div>

            {/* DATA ROWS */}
            <div>
                {visibleProperties.map(prop => {
                    const propReservations = reservations.filter(r => r.propertyId === prop.id && isReservationVisible(r));

                    return (
                        <div key={prop.id} className="flex h-24 border-b border-gray-100 group hover:bg-gray-50/30 transition-colors">
                            
                            {/* Left Column: Property Info (Sticky Left) */}
                            <div 
                                className="flex-shrink-0 sticky left-0 z-20 bg-white border-r border-gray-200 px-4 flex flex-col justify-center group-hover:bg-gray-50 transition-colors shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]"
                                style={{ width: `${leftColumnWidth}px` }}
                            >
                                <h3 className="font-bold text-gray-800 text-sm truncate" title={prop.name}>{prop.name}</h3>
                                {!isMobile && (
                                  <>
                                    <p className="text-xs text-gray-500 truncate">{prop.address}</p>
                                    <div className="mt-2 flex items-center">
                                        <span className={`w-2 h-2 rounded-full mr-2 ${prop.status === 'active' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                        <span className="text-[10px] uppercase font-bold text-gray-400">{prop.status}</span>
                                    </div>
                                  </>
                                )}
                                {isMobile && (
                                   <div className={`mt-1 h-1 w-full rounded-full ${prop.status === 'active' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                )}
                            </div>

                            {/* Right Column: Timeline Grid */}
                            <div className="flex relative" style={{ width: `${days.length * cellWidth}px` }}>
                                {/* Background Grid Lines */}
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

                                {/* Reservations */}
                                {propReservations.map(res => {
                                    const { left, width, styleClass } = getReservationStyle(res);
                                    return (
                                        <div
                                            key={res.id}
                                            className={`absolute top-2 bottom-2 rounded-lg border shadow-sm px-2 md:px-3 flex flex-col justify-center cursor-pointer hover:shadow-md transition-all hover:-translate-y-0.5 z-10 ${styleClass}`}
                                            style={{ left, width }}
                                            onClick={(e) => { e.stopPropagation(); onReservationClick?.(res); }}
                                            title={`${res.guestName} (${res.platform})`}
                                        >
                                            <div className="flex items-center mb-0.5 md:mb-1">
                                                <PlatformIcon platform={res.platform} />
                                            </div>
                                            {/* Show Name only if width allows (simple heuristic) */}
                                            {parseInt(width) > 40 && (
                                                <>
                                                    <div className="font-bold text-xs md:text-sm truncate leading-tight">
                                                        {res.guestName}
                                                    </div>
                                                    {!isMobile && (
                                                        <div className="text-[10px] opacity-80 mt-0.5 truncate">
                                                            {new Date(res.startDate).getDate()} - {new Date(res.endDate).toLocaleDateString('fr-FR', {day: 'numeric', month: 'short'})}
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
      </div>
    </div>
  );
};
