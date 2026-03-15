import React, { useState, useEffect } from 'react';
import { Button } from '@/app/components/ui/button';
import { Card } from '@/app/components/ui/card';
import { Calendar, Clock, Users, Mail, Phone, CheckCircle, XCircle, AlertCircle, Eye, Filter } from 'lucide-react';
import { projectId, publicAnonKey } from '/utils/supabase/info';

interface Reservation {
  id: string;
  business_id: string;
  user_name: string;
  user_email: string;
  user_mobile: string;
  party_size: number;
  reservation_date: string;
  reservation_time: string;
  special_requests?: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'rejected';
  created_at: string;
  confirmed_at?: string;
  rejected_at?: string;
  rejection_reason?: string;
  estimated_value: number;
}

interface ReservationsManagerProps {
  businessId: string;
  businessName: string;
}

export function ReservationsManager({ businessId, businessName }: ReservationsManagerProps) {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'upcoming' | 'past' | 'rejected'>('all');
  const [processing, setProcessing] = useState<string | null>(null);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    loadReservations();
  }, [businessId]);

  const loadReservations = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-175b2872/analytics/reservations`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        // Filter by business
        const businessReservations = data.reservations.filter(
          (r: Reservation) => r.business_id === businessId
        );
        setReservations(businessReservations);
      }
    } catch (error) {
      console.error('Error loading reservations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmReservation = async (reservation: Reservation) => {
    try {
      setProcessing(reservation.id);

      const url = `https://${projectId}.supabase.co/functions/v1/make-server-175b2872/kv/reservation/${reservation.id}/confirm`;
      console.log('✅ Confirming reservation:', { url, reservationId: reservation.id, businessName });

      // Update reservation status
      const response = await fetch(url, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          business_name: businessName
        })
      });

      console.log('📡 Response status:', response.status, response.statusText);

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Confirmation successful:', data);
        alert('Reservation confirmed successfully!');
        loadReservations();
      } else {
        const errorText = await response.text();
        console.error('❌ Server error:', response.status, errorText);
        alert(`Failed to confirm reservation: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error('❌ Error confirming reservation:', error);
      console.error('❌ Error type:', error.constructor.name);
      console.error('❌ Error message:', error.message);
      alert(`Failed to confirm reservation: ${error.message}`);
    } finally {
      setProcessing(null);
    }
  };

  const handleRejectReservation = async (reservation: Reservation) => {
    if (!rejectionReason.trim()) {
      alert('Please enter a reason for rejection');
      return;
    }

    try {
      setProcessing(reservation.id);

      const url = `https://${projectId}.supabase.co/functions/v1/make-server-175b2872/kv/reservation/${reservation.id}/reject`;
      console.log('🔄 Rejecting reservation:', { url, reservationId: reservation.id, businessName });

      const response = await fetch(url, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          business_name: businessName,
          reason: rejectionReason
        })
      });

      console.log('📡 Response status:', response.status, response.statusText);

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Rejection successful:', data);
        alert('Reservation rejected successfully');
        setShowRejectModal(false);
        setRejectionReason('');
        setSelectedReservation(null);
        loadReservations();
      } else {
        const errorText = await response.text();
        console.error('❌ Server error:', response.status, errorText);
        alert(`Failed to reject reservation: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error('❌ Error rejecting reservation:', error);
      console.error('❌ Error type:', error.constructor.name);
      console.error('❌ Error message:', error.message);
      alert(`Failed to reject reservation: ${error.message}`);
    } finally {
      setProcessing(null);
    }
  };

  const getFilteredReservations = () => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    
    return reservations.filter(reservation => {
      const reservationDate = reservation.reservation_date;
      const isPastDate = reservationDate < today;
      
      if (filter === 'all') {
        // For 'all' filter, hide past pending reservations (they should be handled separately)
        if (isPastDate && reservation.status === 'pending') return false;
        return true;
      }
      if (filter === 'pending') {
        // Only show pending reservations for today or future dates
        return reservation.status === 'pending' && !isPastDate;
      }
      if (filter === 'confirmed') return reservation.status === 'confirmed';
      if (filter === 'rejected') return reservation.status === 'rejected';
      if (filter === 'upcoming') {
        return (reservation.status === 'confirmed' || reservation.status === 'pending') && reservationDate >= today;
      }
      if (filter === 'past') {
        return reservation.status === 'completed' || reservation.status === 'cancelled' || isPastDate;
      }
      return true;
    }).sort((a, b) => {
      // Sort by date and time
      const dateTimeA = new Date(`${a.reservation_date}T${a.reservation_time}`).getTime();
      const dateTimeB = new Date(`${b.reservation_date}T${b.reservation_time}`).getTime();
      return dateTimeB - dateTimeA;
    });
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: AlertCircle, label: 'Pending' },
      confirmed: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle, label: 'Confirmed' },
      completed: { bg: 'bg-blue-100', text: 'text-blue-800', icon: CheckCircle, label: 'Completed' },
      cancelled: { bg: 'bg-gray-100', text: 'text-gray-800', icon: XCircle, label: 'Cancelled' },
      rejected: { bg: 'bg-red-100', text: 'text-red-800', icon: XCircle, label: 'Rejected' }
    };
    const badge = badges[status as keyof typeof badges] || badges.pending;
    const Icon = badge.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 ${badge.bg} ${badge.text} text-sm font-medium rounded-full`}>
        <Icon className="w-4 h-4" />
        {badge.label}
      </span>
    );
  };

  const filteredReservations = getFilteredReservations();
  const today = new Date().toISOString().split('T')[0];
  const pendingCount = reservations.filter(r => r.status === 'pending' && r.reservation_date >= today).length;
  const confirmedCount = reservations.filter(r => r.status === 'confirmed').length;
  const rejectedCount = reservations.filter(r => r.status === 'rejected').length;
  const upcomingCount = reservations.filter(r => {
    return (r.status === 'confirmed' || r.status === 'pending') && r.reservation_date >= today;
  }).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Reservations</h2>
          <p className="text-sm text-gray-600 mt-1">
            Manage customer bookings and confirm reservations
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="p-4">
          <div className="text-2xl font-bold text-gray-900">{reservations.length}</div>
          <div className="text-sm text-gray-600">Total Reservations</div>
        </Card>
        <Card className="p-4 border-2 border-yellow-200 bg-yellow-50">
          <div className="text-2xl font-bold text-yellow-600">{pendingCount}</div>
          <div className="text-sm text-gray-600">Pending Approval</div>
        </Card>
        <Card className="p-4 border-2 border-green-200 bg-green-50">
          <div className="text-2xl font-bold text-green-600">{confirmedCount}</div>
          <div className="text-sm text-gray-600">Confirmed</div>
        </Card>
        <Card className="p-4 border-2 border-red-200 bg-red-50">
          <div className="text-2xl font-bold text-red-600">{rejectedCount}</div>
          <div className="text-sm text-gray-600">Rejected</div>
        </Card>
        <Card className="p-4 border-2 border-cyan-200 bg-cyan-50">
          <div className="text-2xl font-bold text-cyan-600">{upcomingCount}</div>
          <div className="text-sm text-gray-600">Upcoming</div>
        </Card>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        <Button
          onClick={() => setFilter('all')}
          variant={filter === 'all' ? 'default' : 'outline'}
          className={filter === 'all' ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white' : ''}
        >
          All ({reservations.length})
        </Button>
        <Button
          onClick={() => setFilter('pending')}
          variant={filter === 'pending' ? 'default' : 'outline'}
          className={filter === 'pending' ? 'bg-yellow-500 hover:bg-yellow-600 text-white' : ''}
        >
          <AlertCircle className="w-4 h-4 mr-2" />
          Pending ({pendingCount})
        </Button>
        <Button
          onClick={() => setFilter('confirmed')}
          variant={filter === 'confirmed' ? 'default' : 'outline'}
          className={filter === 'confirmed' ? 'bg-green-500 hover:bg-green-600 text-white' : ''}
        >
          <CheckCircle className="w-4 h-4 mr-2" />
          Confirmed ({confirmedCount})
        </Button>
        <Button
          onClick={() => setFilter('upcoming')}
          variant={filter === 'upcoming' ? 'default' : 'outline'}
          className={filter === 'upcoming' ? 'bg-cyan-500 hover:bg-cyan-600 text-white' : ''}
        >
          <Calendar className="w-4 h-4 mr-2" />
          Upcoming ({upcomingCount})
        </Button>
        <Button
          onClick={() => setFilter('rejected')}
          variant={filter === 'rejected' ? 'default' : 'outline'}
          className={filter === 'rejected' ? 'bg-red-500 hover:bg-red-600 text-white' : ''}
        >
          <XCircle className="w-4 h-4 mr-2" />
          Rejected ({rejectedCount})
        </Button>
        <Button
          onClick={() => setFilter('past')}
          variant={filter === 'past' ? 'default' : 'outline'}
        >
          Past
        </Button>
      </div>

      {/* Reservations List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading reservations...</p>
        </div>
      ) : filteredReservations.length === 0 ? (
        <Card className="p-12 text-center">
          <Calendar className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No reservations found</h3>
          <p className="text-gray-600">
            {filter === 'pending' && 'No pending reservations at the moment'}
            {filter === 'confirmed' && 'No confirmed reservations'}
            {filter === 'rejected' && 'No rejected reservations'}
            {filter === 'upcoming' && 'No upcoming reservations'}
            {filter === 'past' && 'No past reservations'}
            {filter === 'all' && 'No reservations yet'}
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredReservations.map((reservation) => (
            <Card 
              key={reservation.id} 
              className={`p-6 ${
                reservation.status === 'pending' ? 'border-2 border-yellow-300 bg-yellow-50/30' : ''
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-gray-900">{reservation.user_name}</h3>
                    {getStatusBadge(reservation.status)}
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="w-4 h-4 text-cyan-500" />
                      <span>{new Date(reservation.reservation_date + 'T12:00:00').toLocaleDateString('en-ZA', { 
                        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
                      })}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock className="w-4 h-4 text-cyan-500" />
                      <span>{reservation.reservation_time}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Users className="w-4 h-4 text-cyan-500" />
                      <span>{reservation.party_size} {reservation.party_size === 1 ? 'guest' : 'guests'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Mail className="w-4 h-4 text-cyan-500" />
                      <span>{reservation.user_email || reservation.customerEmail}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Phone className="w-4 h-4 text-cyan-500" />
                      <span>{reservation.user_mobile || reservation.customerPhone || reservation.customer_phone || 'Not provided'}</span>
                    </div>
                  </div>

                  {reservation.special_requests && (
                    <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm font-medium text-blue-900 mb-1">Special Requests:</p>
                      <p className="text-sm text-blue-700">{reservation.special_requests}</p>
                    </div>
                  )}

                  {reservation.status === 'rejected' && reservation.rejection_reason && (
                    <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm font-medium text-red-900 mb-1">Rejection Reason:</p>
                      <p className="text-sm text-red-700">{reservation.rejection_reason}</p>
                      {reservation.rejected_at && (
                        <p className="text-xs text-red-600 mt-2">Rejected on {new Date(reservation.rejected_at).toLocaleString()}</p>
                      )}
                    </div>
                  )}
                </div>

                <div className="text-right ml-4">
                  <p className="text-2xl font-bold text-cyan-600">R{reservation.estimated_value}</p>
                  <p className="text-xs text-gray-500 mt-1">Est. Value</p>
                </div>
              </div>

              {/* Actions for Pending Reservations */}
              {reservation.status === 'pending' && (
                <div className="flex gap-3 mt-4 pt-4 border-t border-gray-200">
                  <Button
                    onClick={() => handleConfirmReservation(reservation)}
                    disabled={processing === reservation.id}
                    className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    {processing === reservation.id ? 'Confirming...' : 'Confirm Booking'}
                  </Button>
                  <Button
                    onClick={() => {
                      setSelectedReservation(reservation);
                      setShowRejectModal(true);
                    }}
                    disabled={processing === reservation.id}
                    variant="outline"
                    className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject
                  </Button>
                </div>
              )}

              {/* Confirmed Info */}
              {reservation.confirmed_at && (
                <div className="mt-4 pt-4 border-t border-gray-200 text-xs text-gray-500">
                  Confirmed on {new Date(reservation.confirmed_at).toLocaleString()}
                </div>
              )}

              {/* Created Info */}
              <div className="mt-2 text-xs text-gray-500">
                Booked on {new Date(reservation.created_at).toLocaleString()}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedReservation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="p-6 w-96 max-w-md mx-4">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Reject Reservation</h3>
            <p className="text-sm text-gray-600 mb-4">
              Enter the reason for rejecting the reservation:
            </p>
            <textarea
              className="w-full p-2 border border-gray-300 rounded mb-4 min-h-[100px]"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g., Fully booked for that time slot"
            />
            <div className="flex gap-3">
              <Button
                onClick={() => handleRejectReservation(selectedReservation)}
                disabled={processing === selectedReservation.id}
                className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white"
              >
                <XCircle className="w-4 h-4 mr-2" />
                {processing === selectedReservation.id ? 'Rejecting...' : 'Reject'}
              </Button>
              <Button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectionReason('');
                  setSelectedReservation(null);
                }}
                variant="outline"
                className="flex-1 border-gray-300 text-gray-600 hover:bg-gray-50"
                disabled={processing === selectedReservation.id}
              >
                Cancel
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

export default ReservationsManager;