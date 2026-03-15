import { useState, useEffect, useRef } from 'react';
import { Calendar, Clock, Users, MapPin, CheckCircle, XCircle, AlertCircle, Loader2, CalendarCheck, History, Star, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import * as api from '@/utils/api';

interface Reservation {
  id: string;
  venue_id: string;
  venue_name: string;
  venue_location?: string;
  guest_count: number;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'rejected';
  created_at: string;
}

interface MyReservationsProps {
  userId: string;
}

export function MyReservations({ userId }: MyReservationsProps) {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('upcoming');
  const prevReservationsRef = useRef<Reservation[]>([]);

  useEffect(() => {
    loadReservations();
    
    // Auto-refresh every 30 seconds to check for status updates
    const interval = setInterval(() => {
      loadReservations(true); // Silent refresh
    }, 30000); // 30 seconds
    
    return () => clearInterval(interval);
  }, [userId]);

  const loadReservations = async (silent = false) => {
    if (!silent) {
      setIsLoading(true);
    } else {
      setIsRefreshing(true);
    }
    try {
      const data = await api.get(`/reservations/user/${userId}`);
      
      // Check for status changes and notify user
      if (prevReservationsRef.current.length > 0 && silent) {
        data.forEach((newRes: Reservation) => {
          const oldRes = prevReservationsRef.current.find(r => r.id === newRes.id);
          if (oldRes && oldRes.status !== newRes.status) {
            // Status changed!
            if (newRes.status === 'confirmed') {
              toast.success('Reservation Confirmed!', {
                description: `Your table at ${newRes.venue_name} has been confirmed.`
              });
            } else if (newRes.status === 'cancelled' || newRes.status === 'rejected') {
              toast.error('Reservation Cancelled', {
                description: `Your reservation at ${newRes.venue_name} was cancelled by the venue.`
              });
            }
          }
        });
      }
      
      prevReservationsRef.current = data;
      setReservations(data);
    } catch (err) {
      console.error('Failed to load reservations:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };
  
  const handleManualRefresh = () => {
    loadReservations(true);
  };

  const getFilteredReservations = () => {
    const now = new Date();
    
    return reservations.filter(res => {
      const resDate = new Date(`${res.date}T${res.time}`);
      const isCancelled = res.status === 'cancelled' || res.status === 'rejected';
      
      if (filter === 'upcoming') {
        return resDate >= now && !isCancelled;
      } else if (filter === 'past') {
        return resDate < now || isCancelled;
      }
      return true; // all
    }).sort((a, b) => {
      // Sort by date/time descending (newest first)
      const dateA = new Date(`${a.date}T${a.time}`);
      const dateB = new Date(`${b.date}T${b.time}`);
      return dateB.getTime() - dateA.getTime();
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'cancelled':
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide";
    switch (status) {
      case 'confirmed':
        return <span className={`${baseClasses} bg-green-100 text-green-700`}>Confirmed</span>;
      case 'cancelled':
        return <span className={`${baseClasses} bg-red-100 text-red-700`}>Cancelled</span>;
      case 'rejected':
        return <span className={`${baseClasses} bg-red-100 text-red-700`}>Rejected</span>;
      default:
        return <span className={`${baseClasses} bg-yellow-100 text-yellow-700`}>Pending</span>;
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-ZA', { 
      weekday: 'short', 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatTime = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const filteredReservations = getFilteredReservations();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Refresh Button */}
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-bold text-gray-900">My Reservations</h2>
        <button
          onClick={handleManualRefresh}
          disabled={isRefreshing}
          className={`p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors ${
            isRefreshing ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          title="Refresh reservations"
        >
          <RefreshCw className={`w-5 h-5 text-gray-600 ${isRefreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>
      
      {/* Filter Tabs - Modern Design */}
      <div className="flex gap-2 bg-gray-100 rounded-xl p-1">
        <button
          onClick={() => setFilter('upcoming')}
          className={`flex-1 px-4 py-2.5 text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-2 ${
            filter === 'upcoming'
              ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <CalendarCheck className="w-4 h-4" />
          Upcoming
        </button>
        <button
          onClick={() => setFilter('past')}
          className={`flex-1 px-4 py-2.5 text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-2 ${
            filter === 'past'
              ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <History className="w-4 h-4" />
          Past
        </button>
        <button
          onClick={() => setFilter('all')}
          className={`flex-1 px-4 py-2.5 text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-2 ${
            filter === 'all'
              ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Calendar className="w-4 h-4" />
          All
        </button>
      </div>

      {/* Reservations List */}
      {filteredReservations.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            {filter === 'upcoming' ? 'No Upcoming Reservations' : 
             filter === 'past' ? 'No Past Reservations' : 
             'No Reservations Yet'}
          </h3>
          <p className="text-gray-500 text-sm">
            {filter === 'upcoming' 
              ? 'Book a table at your favorite venue to see it here!'
              : 'Your reservation history will appear here'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredReservations.map((reservation) => (
            <div
              key={reservation.id}
              className="bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 rounded-2xl p-5 hover:shadow-xl hover:border-cyan-300 transition-all"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
                    {reservation.venue_name}
                    {reservation.status === 'confirmed' && (
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    )}
                  </h3>
                  {reservation.venue_location && (
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {reservation.venue_location}
                    </p>
                  )}
                </div>
                {getStatusBadge(reservation.status)}
              </div>

              {/* Reservation Details - Card Style */}
              <div className="bg-white rounded-xl p-4 border border-gray-200 mb-3">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="w-10 h-10 bg-gradient-to-br from-cyan-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Calendar className="w-5 h-5 text-cyan-600" />
                    </div>
                    <p className="text-xs text-gray-500 mb-1">Date</p>
                    <p className="text-sm font-bold text-gray-900">
                      {formatDate(reservation.date)}
                    </p>
                  </div>
                  <div className="text-center border-x border-gray-200">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Clock className="w-5 h-5 text-purple-600" />
                    </div>
                    <p className="text-xs text-gray-500 mb-1">Time</p>
                    <p className="text-sm font-bold text-gray-900">
                      {formatTime(reservation.time)}
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Users className="w-5 h-5 text-green-600" />
                    </div>
                    <p className="text-xs text-gray-500 mb-1">Guests</p>
                    <p className="text-sm font-bold text-gray-900">
                      {reservation.guest_count}
                    </p>
                  </div>
                </div>
              </div>

              {/* Booked timestamp */}
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>
                  Booked {new Date(reservation.created_at).toLocaleDateString('en-ZA', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
                {getStatusIcon(reservation.status)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyReservations;