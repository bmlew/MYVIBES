import React, { useState, useEffect } from 'react';
import { Video, ExternalLink, CheckCircle, XCircle, Eye, MousePointerClick, Clock } from 'lucide-react';
import { projectId, publicAnonKey } from '/utils/supabase/info';

interface SocialMediaAd {
  id: string;
  business_id: string;
  business_name: string;
  platform: 'tiktok' | 'instagram' | 'facebook' | 'google';
  video_url: string;
  title: string;
  description: string;
  thumbnail_url?: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  approved_at?: string | null;
  approved_by?: string | null;
  rejected_at?: string | null;
  rejected_by?: string | null;
  rejection_reason?: string | null;
  views: number;
  clicks: number;
}

interface Business {
  id: string;
  name: string;
}

export function AdminAdsManagement({ businesses = [] }: { businesses?: Business[] }) {
  const [ads, setAds] = useState<SocialMediaAd[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [rejectingAd, setRejectingAd] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  
  // Create Ad Form State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    business_id: '',
    platform: 'instagram' as SocialMediaAd['platform'],
    video_url: '',
    title: '',
    description: '',
    thumbnail_url: ''
  });
  const [creatingAd, setCreatingAd] = useState(false);

  useEffect(() => {
    loadAds();
  }, []);

  const loadAds = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-175b2872/ads/all`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setAds(data.ads || []);
      }
    } catch (error) {
      console.error('Error loading ads:', error);
      alert(`Failed to load ads: ${error instanceof Error ? error.message : 'Network error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (adId: string) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-175b2872/ads/${adId}/approve`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            admin_name: 'Admin'
          })
        }
      );

      if (response.ok) {
        loadAds();
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('Server error approving ad:', errorData);
        alert(`Failed to approve ad: ${errorData.error || 'Server error'}`);
      }
    } catch (error) {
      console.error('Error approving ad:', error);
      alert(`Failed to approve ad: ${error instanceof Error ? error.message : 'Network error'}`);
    }
  };

  const handleReject = async (adId: string) => {
    if (!rejectionReason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-175b2872/ads/${adId}/reject`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            admin_name: 'Admin',
            reason: rejectionReason
          })
        }
      );

      if (response.ok) {
        setRejectingAd(null);
        setRejectionReason('');
        loadAds();
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('Server error rejecting ad:', errorData);
        alert(`Failed to reject ad: ${errorData.error || 'Server error'}`);
      }
    } catch (error) {
      console.error('Error rejecting ad:', error);
      alert(`Failed to reject ad: ${error instanceof Error ? error.message : 'Network error'}`);
    }
  };

  const handleCreateAd = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!createForm.business_id || !createForm.title || !createForm.video_url) {
      alert('Please fill in all required fields');
      return;
    }

    const selectedBusiness = businesses.find(b => b.id === createForm.business_id);
    if (!selectedBusiness) {
      alert('Invalid business selected');
      return;
    }

    setCreatingAd(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-175b2872/ads`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            ...createForm,
            business_name: selectedBusiness.name
          })
        }
      );

      if (response.ok) {
        setShowCreateModal(false);
        setCreateForm({
          business_id: '',
          platform: 'instagram',
          video_url: '',
          title: '',
          description: '',
          thumbnail_url: ''
        });
        loadAds();
        alert('Ad created successfully!');
      } else {
        const error = await response.json();
        alert(`Failed to create ad: ${error.error}`);
      }
    } catch (error) {
      console.error('Error creating ad:', error);
      alert('Network error while creating ad');
    } finally {
      setCreatingAd(false);
    }
  };

  const getPlatformIcon = (platform: string) => {
    const icons: Record<string, string> = {
      tiktok: '🎵',
      instagram: '📸',
      facebook: '👥',
      google: '🔍'
    };
    return icons[platform] || '📹';
  };

  const filteredAds = ads.filter(ad => {
    if (filter === 'all') return true;
    return ad.status === filter;
  });

  const pendingCount = ads.filter(ad => ad.status === 'pending').length;
  const approvedCount = ads.filter(ad => ad.status === 'approved').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-gray-900">Social Media Ads Management</h3>
          <p className="text-sm text-gray-600">Review and approve business ads for the landing page</p>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)} 
          className="px-4 py-2 rounded-lg font-medium bg-cyan-600 hover:bg-cyan-700 text-white transition-colors"
        >
          + Create Ad
        </button>
      </div>

      {/* Create Ad Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl">
            <h3 className="text-xl font-bold mb-4">Create New Ad</h3>
            <form onSubmit={handleCreateAd} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Business</label>
                <select
                  value={createForm.business_id}
                  onChange={(e) => setCreateForm({ ...createForm, business_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                  required
                >
                  <option value="">Select a business</option>
                  {businesses.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Platform</label>
                <select
                  value={createForm.platform}
                  onChange={(e) => setCreateForm({ ...createForm, platform: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                  required
                >
                  <option value="instagram">Instagram</option>
                  <option value="tiktok">TikTok</option>
                  <option value="facebook">Facebook</option>
                  <option value="google">Google</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={createForm.title}
                  onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                  placeholder="Ad Campaign Title"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={createForm.description}
                  onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                  placeholder="Ad description..."
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Video URL</label>
                <input
                  type="url"
                  value={createForm.video_url}
                  onChange={(e) => setCreateForm({ ...createForm, video_url: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                  placeholder="https://..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Thumbnail URL (Optional)</label>
                <input
                  type="url"
                  value={createForm.thumbnail_url}
                  onChange={(e) => setCreateForm({ ...createForm, thumbnail_url: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                  placeholder="https://..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  disabled={creatingAd}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingAd}
                  className="flex-1 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  {creatingAd ? 'Creating...' : 'Create Ad'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="text-2xl font-bold text-gray-900">{ads.length}</div>
          <div className="text-sm text-gray-600">Total Ads</div>
        </div>
        <div className="p-4 bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="text-2xl font-bold text-yellow-600">{pendingCount}</div>
          <div className="text-sm text-gray-600">Pending Review</div>
        </div>
        <div className="p-4 bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="text-2xl font-bold text-green-600">{approvedCount}</div>
          <div className="text-sm text-gray-600">Approved</div>
        </div>
        <div className="p-4 bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="text-2xl font-bold text-cyan-600">
            {ads.reduce((sum, ad) => sum + ad.views, 0)}
          </div>
          <div className="text-sm text-gray-600">Total Views</div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'all' 
              ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All ({ads.length})
        </button>
        <button
          onClick={() => setFilter('pending')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'pending' 
              ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Pending ({pendingCount})
        </button>
        <button
          onClick={() => setFilter('approved')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'approved' 
              ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Approved ({approvedCount})
        </button>
        <button
          onClick={() => setFilter('rejected')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'rejected' 
              ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Rejected ({ads.filter(ad => ad.status === 'rejected').length})
        </button>
      </div>

      {/* Ads List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading ads...</p>
        </div>
      ) : filteredAds.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-xl shadow-sm border border-gray-100">
          <Video className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No ads found</h3>
          <p className="text-gray-600">No ads match the selected filter</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAds.map((ad) => (
            <div key={ad.id} className={`p-6 bg-white rounded-xl shadow-sm border ${ad.status === 'pending' ? 'border-yellow-300 ring-1 ring-yellow-100' : 'border-gray-100'}`}>
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center text-3xl flex-shrink-0">
                  {getPlatformIcon(ad.platform)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-gray-900">{ad.title}</h3>
                      <p className="text-sm text-gray-600">
                        {ad.business_name} • {ad.platform.charAt(0).toUpperCase() + ad.platform.slice(1)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {ad.status === 'pending' && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-medium rounded-full">
                          <Clock className="w-4 h-4" />
                          Pending
                        </span>
                      )}
                      {ad.status === 'approved' && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                          <CheckCircle className="w-4 h-4" />
                          Approved
                        </span>
                      )}
                      {ad.status === 'rejected' && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-800 text-sm font-medium rounded-full">
                          <XCircle className="w-4 h-4" />
                          Rejected
                        </span>
                      )}
                    </div>
                  </div>

                  {ad.description && (
                    <p className="text-gray-700 mb-3">{ad.description}</p>
                  )}

                  <a
                    href={ad.video_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-cyan-600 hover:text-cyan-700 inline-flex items-center gap-1 text-sm mb-3"
                  >
                    View Ad <ExternalLink className="w-4 h-4" />
                  </a>

                  {/* Stats */}
                  {ad.status === 'approved' && (
                    <div className="flex items-center gap-6 mb-3">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Eye className="w-4 h-4" />
                        <span>{ad.views} views</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MousePointerClick className="w-4 h-4" />
                        <span>{ad.clicks} clicks</span>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  {ad.status === 'pending' && (
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleApprove(ad.id)}
                        className="flex items-center px-4 py-2 rounded-lg bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white transition-all font-medium"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Approve
                      </button>
                      <button
                        onClick={() => setRejectingAd(ad.id)}
                        className="flex items-center px-4 py-2 rounded-lg border border-red-300 text-red-600 hover:bg-red-50 transition-colors font-medium"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Reject
                      </button>
                    </div>
                  )}

                  {/* Rejection Form */}
                  {rejectingAd === ad.id && (
                    <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                      <label className="block text-sm font-medium text-red-900 mb-2">
                        Rejection Reason *
                      </label>
                      <textarea
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        placeholder="Explain why this ad is being rejected..."
                        className="w-full px-3 py-2 border border-red-300 rounded-md focus:ring-2 focus:ring-red-500 min-h-[80px] mb-3"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleReject(ad.id)}
                          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium"
                        >
                          Confirm Rejection
                        </button>
                        <button
                          onClick={() => {
                            setRejectingAd(null);
                            setRejectionReason('');
                          }}
                          className="px-4 py-2 border border-red-300 text-red-700 hover:bg-red-50 rounded-lg transition-colors font-medium"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Rejection Info */}
                  {ad.status === 'rejected' && ad.rejection_reason && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm font-medium text-red-800 mb-1">Rejection Reason:</p>
                      <p className="text-sm text-red-700">{ad.rejection_reason}</p>
                    </div>
                  )}

                  {/* Metadata */}
                  <div className="mt-4 pt-4 border-t border-gray-200 text-xs text-gray-500">
                    <span>Submitted {new Date(ad.created_at).toLocaleString()}</span>
                    {ad.approved_at && (
                      <span className="ml-4">
                        • Approved {new Date(ad.approved_at).toLocaleString()} by {ad.approved_by}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AdminAdsManagement;