import { useState, useEffect } from 'react';
import { Calendar, Clock, Users, MapPin, CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react';
import * as api from '@/utils/api';

interface Reservation {
  id: string;
  venue_id: string;
  venue_name: string;
  venue_location?: string;
  guest_count: number;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  created_at: string;
}

interface MyReservationsProps {
  userId: string;
}

export function MyReservations({ userId }: MyReservationsProps) {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('upcoming');

  useEffect(() => {
    loadReservations();
  }, [userId]);

  const loadReservations = async () => {
    setIsLoading(true);
    try {
      const data = await api.get(`/reservations/user/${userId}`);
      setReservations(data);
    } catch (err) {
      console.error('Failed to load reservations:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getFilteredReservations = () => {
    const now = new Date();
    
    return reservations.filter(res => {
      const resDate = new Date(`${res.date}T${res.time}`);
      
      if (filter === 'upcoming') {
        return resDate >= now && res.status !== 'cancelled';
      } else if (filter === 'past') {
        return resDate < now || res.status === 'cancelled';
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
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide";
    switch (status) {
      case 'confirmed':
        return <span className={`${baseClasses} bg-green-100 text-green-700`}>Confirmed</span>;
      case 'cancelled':
        return <span className={`${baseClasses} bg-red-100 text-red-700`}>Cancelled</span>;
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
      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setFilter('upcoming')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            filter === 'upcoming'
              ? 'border-cyan-500 text-cyan-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Upcoming
        </button>
        <button
          onClick={() => setFilter('past')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            filter === 'past'
              ? 'border-cyan-500 text-cyan-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Past
        </button>
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            filter === 'all'
              ? 'border-cyan-500 text-cyan-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          All
        </button>
      </div>

      {/* Reservations List */}
      {filteredReservations.length === 0 ? (
        <div className="text-center py-12">
          <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
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
        <div className="space-y-4">
          {filteredReservations.map((reservation) => (
            <div
              key={reservation.id}
              className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 mb-1">
                    {reservation.venue_name}
                  </h3>
                  {reservation.venue_location && (
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {reservation.venue_location}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(reservation.status)}
                  {getStatusBadge(reservation.status)}
                </div>
              </div>

              {/* Reservation Details */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-cyan-500" />
                  <div>
                    <p className="text-xs text-gray-500">Date</p>
                    <p className="text-sm font-medium text-gray-900">
                      {formatDate(reservation.date)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-cyan-500" />
                  <div>
                    <p className="text-xs text-gray-500">Time</p>
                    <p className="text-sm font-medium text-gray-900">
                      {formatTime(reservation.time)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-cyan-500" />
                  <div>
                    <p className="text-xs text-gray-500">Guests</p>
                    <p className="text-sm font-medium text-gray-900">
                      {reservation.guest_count} {reservation.guest_count === 1 ? 'person' : 'people'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Booked timestamp */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-400">
                  Booked on {new Date(reservation.created_at).toLocaleDateString('en-ZA', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
