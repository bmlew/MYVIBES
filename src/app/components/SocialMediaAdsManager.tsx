import React, { useState, useEffect } from 'react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Card } from '@/app/components/ui/card';
import { Plus, X, Video, ExternalLink, Clock, CheckCircle, XCircle, Eye, MousePointerClick, Trash2 } from 'lucide-react';
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

interface SocialMediaAdsManagerProps {
  businessId: string;
  businessName: string;
}

export function SocialMediaAdsManager({ businessId, businessName }: SocialMediaAdsManagerProps) {
  const [ads, setAds] = useState<SocialMediaAd[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  const [formData, setFormData] = useState({
    platform: 'instagram' as 'tiktok' | 'instagram' | 'facebook' | 'google',
    video_url: '',
    title: '',
    description: '',
    thumbnail_url: ''
  });

  useEffect(() => {
    loadAds();
  }, [businessId]);

  const loadAds = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-175b2872/ads/business/${businessId}`,
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
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAd = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.video_url || !formData.title) {
      alert('Please fill in video URL and title');
      return;
    }

    try {
      setSubmitting(true);

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-175b2872/ads/submit`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            business_id: businessId,
            business_name: businessName,
            ...formData
          })
        }
      );

      if (response.ok) {
        loadAds();
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error submitting ad:', error);
      alert('Failed to submit ad');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAd = async (adId: string) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-175b2872/ads/${adId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`
          }
        }
      );

      if (response.ok) {
        loadAds();
      }
    } catch (error) {
      console.error('Error deleting ad:', error);
      alert('Failed to delete ad');
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('Image must be less than 2MB');
      return;
    }

    try {
      setUploadingImage(true);

      // Convert to base64
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setFormData({ ...formData, thumbnail_url: base64String });
        setThumbnailPreview(base64String);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemoveThumbnail = () => {
    setFormData({ ...formData, thumbnail_url: '' });
    setThumbnailPreview(null);
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

  const getStatusBadge = (status: string) => {
    if (status === 'approved') {
      return <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
        <CheckCircle className="w-3 h-3" />
        Approved
      </span>;
    }
    if (status === 'rejected') {
      return <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
        <XCircle className="w-3 h-3" />
        Rejected
      </span>;
    }
    return <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
      <Clock className="w-3 h-3" />
      Pending Review
    </span>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Social Media Ads</h2>
          <p className="text-sm text-gray-600 mt-1">
            Submit your TikTok, Instagram, Facebook, or Google ads to be featured on the landing page
          </p>
        </div>
        <Button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Submit New Ad
        </Button>
      </div>

      {/* Submit Form */}
      {showAddForm && (
        <Card className="p-6 border-2 border-cyan-200 bg-cyan-50/50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold">Submit Social Media Ad</h3>
            <button onClick={() => setShowAddForm(false)} className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmitAd} className="space-y-4">
            <div>
              <Label>Platform *</Label>
              <select
                value={formData.platform}
                onChange={(e) => setFormData({ ...formData, platform: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-cyan-500"
                required
              >
                <option value="instagram">📸 Instagram</option>
                <option value="tiktok">🎵 TikTok</option>
                <option value="facebook">👥 Facebook</option>
                <option value="google">🔍 Google Ads</option>
              </select>
            </div>

            <div>
              <Label>Video/Ad URL *</Label>
              <Input
                type="url"
                placeholder="https://www.instagram.com/reel/..."
                value={formData.video_url}
                onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Paste the link to your TikTok, Instagram Reel, Facebook video, or Google ad
              </p>
            </div>

            <div>
              <Label>Ad Title *</Label>
              <Input
                placeholder="e.g., Summer Special - 50% Off"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                maxLength={100}
                required
              />
            </div>

            <div>
              <Label>Description (Optional)</Label>
              <textarea
                placeholder="Brief description of your ad..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-cyan-500 min-h-[80px]"
                maxLength={300}
              />
            </div>

            <div>
              <Label>Thumbnail Image *</Label>
              
              {/* Image Preview */}
              {thumbnailPreview ? (
                <div className="relative w-full aspect-video rounded-lg overflow-hidden border-2 border-cyan-300 mb-3">
                  <img 
                    src={thumbnailPreview} 
                    alt="Thumbnail preview" 
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveThumbnail}
                    className="absolute top-2 right-2 p-2 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="block w-full aspect-video rounded-lg border-2 border-dashed border-gray-300 hover:border-cyan-500 transition-colors cursor-pointer bg-gray-50 hover:bg-cyan-50">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    required={!formData.thumbnail_url}
                  />
                  <div className="flex flex-col items-center justify-center h-full">
                    {uploadingImage ? (
                      <>
                        <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mb-3"></div>
                        <p className="text-sm text-gray-600">Uploading...</p>
                      </>
                    ) : (
                      <>
                        <Plus className="w-12 h-12 text-gray-400 mb-3" />
                        <p className="text-sm font-medium text-gray-700">Click to upload thumbnail</p>
                        <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 2MB</p>
                      </>
                    )}
                  </div>
                </label>
              )}
              <p className="text-xs text-gray-500 mt-2">
                Upload a screenshot from your video or a promotional image (required)
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white"
              >
                {submitting ? 'Submitting...' : 'Submit for Approval'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAddForm(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Ads List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading ads...</p>
        </div>
      ) : ads.length === 0 ? (
        <Card className="p-12 text-center">
          <Video className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No ads submitted yet</h3>
          <p className="text-gray-600 mb-4">
            Submit your first social media ad to get featured on the landing page!
          </p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {ads.map((ad) => (
            <Card key={ad.id} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center text-2xl flex-shrink-0">
                    {getPlatformIcon(ad.platform)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-gray-900 truncate">{ad.title}</h3>
                      {getStatusBadge(ad.status)}
                    </div>
                    <p className="text-sm text-gray-600 capitalize mb-2">{ad.platform} Ad</p>
                    {ad.description && (
                      <p className="text-sm text-gray-700 mb-2">{ad.description}</p>
                    )}
                    <a
                      href={ad.video_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-cyan-600 hover:text-cyan-700 inline-flex items-center gap-1"
                    >
                      View Ad <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteAd(ad.id)}
                  className="text-gray-400 hover:text-red-600 transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>

              {/* Stats */}
              {ad.status === 'approved' && (
                <div className="flex items-center gap-6 pt-4 border-t border-gray-200">
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

              {/* Rejection Reason */}
              {ad.status === 'rejected' && ad.rejection_reason && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm font-medium text-red-800 mb-1">Rejection Reason:</p>
                  <p className="text-sm text-red-700">{ad.rejection_reason}</p>
                </div>
              )}

              {/* Metadata */}
              <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
                <span>Submitted {new Date(ad.created_at).toLocaleDateString()}</span>
                {ad.approved_at && (
                  <span>Approved {new Date(ad.approved_at).toLocaleDateString()}</span>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default SocialMediaAdsManager;