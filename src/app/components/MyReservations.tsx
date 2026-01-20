import { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Calendar, Clock, Users, MapPin, Phone, Mail, CheckCircle, XCircle, AlertCircle, Trash2 } from 'lucide-react';
import * as api from '@/utils/api';

interface Reservation {
  id: string;
  business_id: string;
  business_name: string;
  business_logo?: string;
  business_address?: string;
  business_city?: string;
  user_name: string;
  user_email: string;
  user_mobile: string;
  party_size: number;
  reservation_date: string;
  reservation_time: string;
  special_requests?: string;
  status: 'pending' | 'confirmed' | 'rejected';
  created_at: string;
  confirmed_at?: string;
  rejected_at?: string;
  rejection_reason?: string;
}

interface MyReservationsProps {
  userId: string;
  onClose: () => void;
  onViewBusiness?: (businessId: string) => void;
}

export function MyReservations({ userId, onClose, onViewBusiness }: MyReservationsProps) {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('upcoming');

  const loadReservations = useCallback(async () => {
    if (!userId || userId === 'guest') {
      setLoading(false);
      setReservations([]);
      return;
    }

    try {
      setLoading(true);
      const data = await api.getUserReservations(userId);
      setReservations(data.reservations || []);
    } catch (error) {
      console.error('Failed to load reservations:', error);
      setReservations([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadReservations();
  }, [loadReservations]);

  const handleCancelReservation = async (reservationId: string) => {
    if (!confirm('Are you sure you want to cancel this reservation?')) return;

    try {
      const success = await api.cancelReservation(reservationId, userId);
      if (success) {
        // Remove from list
        setReservations(reservations.filter(r => r.id !== reservationId));
        alert('✅ Reservation cancelled successfully');
      } else {
        alert('❌ Failed to cancel reservation. Please contact the venue directly.');
      }
    } catch (error) {
      console.error('Failed to cancel reservation:', error);
      alert('❌ Failed to cancel reservation. Please try again.');
    }
  };

  const filteredReservations = reservations.filter(reservation => {
    const reservationDateTime = new Date(`${reservation.reservation_date}T${reservation.reservation_time}`);
    const now = new Date();

    if (filter === 'upcoming') {
      return reservationDateTime >= now;
    } else if (filter === 'past') {
      return reservationDateTime < now;
    }
    return true;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'pending':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      confirmed: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      pending: 'bg-yellow-100 text-yellow-800'
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${styles[status as keyof typeof styles]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    // Add time to avoid timezone issues with date-only strings
    const date = new Date(dateString + 'T12:00:00');
    return date.toLocaleDateString('en-ZA', { 
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    return timeString.substring(0, 5); // HH:MM format
  };

  return (
    <div className="h-full bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white p-4 shadow-lg flex-shrink-0">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="p-1">
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h2 className="text-xl font-bold">My Reservations</h2>
              <p className="text-xs opacity-90">{filteredReservations.length} reservation{filteredReservations.length !== 1 ? 's' : ''}</p>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'all'
                ? 'bg-white text-blue-600'
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
          >
            All ({reservations.length})
          </button>
          <button
            onClick={() => setFilter('upcoming')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'upcoming'
                ? 'bg-white text-blue-600'
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
          >
            Upcoming
          </button>
          <button
            onClick={() => setFilter('past')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'past'
                ? 'bg-white text-blue-600'
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
          >
            Past
          </button>
        </div>
      </div>

      {/* Reservations List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-2 animate-pulse" />
              <p className="text-gray-500">Loading reservations...</p>
            </div>
          </div>
        ) : filteredReservations.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center p-6">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-700 mb-2">
                {filter === 'upcoming' ? 'No upcoming reservations' : filter === 'past' ? 'No past reservations' : 'No reservations yet'}
              </h3>
              <p className="text-sm text-gray-500">
                {filter === 'upcoming' 
                  ? 'Book a table at your favorite venue to see it here!'
                  : 'Your reservation history will appear here.'}
              </p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredReservations.map((reservation) => {
              const reservationDateTime = new Date(`${reservation.reservation_date}T${reservation.reservation_time}`);
              const isPast = reservationDateTime < new Date();
              const canCancel = !isPast && reservation.status === 'confirmed';

              return (
                <div
                  key={reservation.id}
                  className="p-4 bg-white hover:bg-gray-50 transition-colors"
                >
                  <div className="flex gap-3">
                    {/* Business Logo */}
                    <div className="flex-shrink-0">
                      {reservation.business_logo ? (
                        <img
                          src={reservation.business_logo}
                          alt={reservation.business_name}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                          <span className="text-white text-2xl font-bold">
                            {reservation.business_name.charAt(0)}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Reservation Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 
                          className="font-bold text-lg cursor-pointer hover:text-cyan-600 transition-colors"
                          onClick={() => onViewBusiness && onViewBusiness(reservation.business_id)}
                        >
                          {reservation.business_name}
                        </h3>
                        {getStatusBadge(reservation.status)}
                      </div>

                      {/* Date, Time, Party Size */}
                      <div className="space-y-1 mb-3">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(reservation.reservation_date)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Clock className="w-4 h-4" />
                          <span>{formatTime(reservation.reservation_time)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Users className="w-4 h-4" />
                          <span>{reservation.party_size} {reservation.party_size === 1 ? 'person' : 'people'}</span>
                        </div>
                      </div>

                      {/* Special Requests */}
                      {reservation.special_requests && (
                        <div className="bg-gray-50 p-2 rounded text-xs text-gray-600 mb-2">
                          <strong>Note:</strong> {reservation.special_requests}
                        </div>
                      )}

                      {/* Rejection Reason */}
                      {reservation.status === 'rejected' && reservation.rejection_reason && (
                        <div className="bg-red-50 border border-red-200 p-2 rounded text-xs text-red-700 mb-2">
                          <strong>Rejection reason:</strong> {reservation.rejection_reason}
                        </div>
                      )}

                      {/* Contact Info */}
                      {reservation.business_address && (
                        <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                          <MapPin className="w-3 h-3" />
                          <span>{reservation.business_address}, {reservation.business_city}</span>
                        </div>
                      )}

                      {/* Status Info */}
                      <div className="flex items-center gap-2 mt-2">
                        {getStatusIcon(reservation.status)}
                        <span className="text-xs text-gray-500">
                          {reservation.status === 'confirmed' && reservation.confirmed_at && (
                            `Confirmed on ${new Date(reservation.confirmed_at).toLocaleDateString()}`
                          )}
                          {reservation.status === 'rejected' && reservation.rejected_at && (
                            `Rejected on ${new Date(reservation.rejected_at).toLocaleDateString()}`
                          )}
                          {reservation.status === 'pending' && (
                            'Awaiting confirmation from venue'
                          )}
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={() => onViewBusiness && onViewBusiness(reservation.business_id)}
                          className="flex-1 bg-cyan-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-cyan-700 transition-colors"
                        >
                          View Venue
                        </button>
                        {canCancel && (
                          <button
                            onClick={() => handleCancelReservation(reservation.id)}
                            className="px-3 py-2 bg-red-100 text-red-600 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors flex items-center gap-1"
                          >
                            <Trash2 className="w-4 h-4" />
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}