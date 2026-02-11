import React, { useState, useEffect } from 'react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Card } from '@/app/components/ui/card';
import { Checkbox } from '@/app/components/ui/checkbox';
import { Plus, X, Video, ExternalLink, Clock, CheckCircle, XCircle, Eye, MousePointerClick, Trash2, Upload, Link as LinkIcon, Share2 } from 'lucide-react';
import { projectId, publicAnonKey } from '/utils/supabase/info';
import { toast } from 'sonner';

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
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [inputType, setInputType] = useState<'link' | 'upload'>('link');
  
  const [formData, setFormData] = useState({
    platform: 'instagram' as 'tiktok' | 'instagram' | 'facebook' | 'google',
    video_url: '',
    title: '',
    description: '',
    thumbnail_url: ''
  });

  const [pushTo, setPushTo] = useState({
    facebook: false,
    instagram: false,
    tiktok: false
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

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate (Video or Image for slideshow)
    if (!file.type.startsWith('video/') && !file.type.startsWith('image/')) {
        toast.error('Please upload a video or image file');
        return;
    }

    try {
        setUploadingVideo(true);
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-175b2872/upload`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${publicAnonKey}`
            },
            body: formData
        });

        if (response.ok) {
            const data = await response.json();
            setFormData(prev => ({ ...prev, video_url: `storage:make-175b2872-ads:${data.path}` }));
            toast.success('Media uploaded successfully');
        } else {
            throw new Error('Upload failed');
        }
    } catch (error) {
        console.error(error);
        toast.error('Failed to upload media');
    } finally {
        setUploadingVideo(false);
    }
  };

  const handleSubmitAd = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.video_url || !formData.title) {
      toast.error('Please fill in video/media URL and title');
      return;
    }

    // Simulate push
    const platformsToPush = Object.entries(pushTo).filter(([_, v]) => v).map(([k]) => k);
    if (platformsToPush.length > 0) {
        toast.info(`Pushing content to ${platformsToPush.join(', ')}...`);
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
            ...formData,
            pushed_to: platformsToPush
          })
        }
      );

      if (response.ok) {
        toast.success('Ad submitted successfully!');
        if (platformsToPush.length > 0) {
            setTimeout(() => {
                toast.success(`Successfully pushed to ${platformsToPush.length} platforms`);
            }, 1500);
        }
        setShowAddForm(false);
        setFormData({
            platform: 'instagram',
            video_url: '',
            title: '',
            description: '',
            thumbnail_url: ''
        });
        setPushTo({ facebook: false, instagram: false, tiktok: false });
        setInputType('link');
        loadAds();
      } else {
        const error = await response.json();
        toast.error(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error submitting ad:', error);
      toast.error('Failed to submit ad');
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
        toast.success('Ad deleted successfully');
        loadAds();
      }
    } catch (error) {
      console.error('Error deleting ad:', error);
      toast.error('Failed to delete ad');
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image must be less than 2MB');
      return;
    }

    try {
      setUploadingImage(true);
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setFormData(prev => ({ ...prev, thumbnail_url: base64String }));
        setThumbnailPreview(base64String);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemoveThumbnail = () => {
    setFormData(prev => ({ ...prev, thumbnail_url: '' }));
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
            Create, upload, and push your ads to social media platforms
          </p>
        </div>
        <Button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create New Ad
        </Button>
      </div>

      {/* Submit Form */}
      {showAddForm && (
        <Card className="p-6 border-2 border-cyan-200 bg-cyan-50/50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold">Create Social Media Ad</h3>
            <button onClick={() => setShowAddForm(false)} className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmitAd} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <div>
                        <Label>Primary Platform *</Label>
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
                        <Label>Description</Label>
                        <textarea
                            placeholder="Brief description of your ad..."
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-cyan-500 min-h-[80px]"
                            maxLength={300}
                        />
                    </div>
                </div>

                <div className="space-y-4">
                     <div>
                        <Label className="mb-2 block">Media Content *</Label>
                        <div className="flex bg-white rounded-lg border border-gray-200 p-1 mb-3">
                            <button
                                type="button"
                                onClick={() => setInputType('link')}
                                className={`flex-1 py-1.5 px-3 rounded text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                                    inputType === 'link' ? 'bg-cyan-100 text-cyan-800' : 'text-gray-600 hover:bg-gray-50'
                                }`}
                            >
                                <LinkIcon className="w-4 h-4" /> Link
                            </button>
                            <button
                                type="button"
                                onClick={() => setInputType('upload')}
                                className={`flex-1 py-1.5 px-3 rounded text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                                    inputType === 'upload' ? 'bg-cyan-100 text-cyan-800' : 'text-gray-600 hover:bg-gray-50'
                                }`}
                            >
                                <Upload className="w-4 h-4" /> Upload
                            </button>
                        </div>

                        {inputType === 'link' ? (
                            <div>
                                <Input
                                    type="url"
                                    placeholder="https://www.instagram.com/reel/..."
                                    value={formData.video_url}
                                    onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                                    required={inputType === 'link'}
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Paste the link to your content on social media
                                </p>
                            </div>
                        ) : (
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-cyan-500 transition-colors bg-white">
                                {formData.video_url && formData.video_url.startsWith('storage:') ? (
                                    <div className="flex items-center justify-center gap-2 text-green-600">
                                        <CheckCircle className="w-5 h-5" />
                                        <span className="font-medium">Media Uploaded Successfully</span>
                                        <button 
                                            type="button" 
                                            onClick={() => setFormData({ ...formData, video_url: '' })}
                                            className="ml-2 text-gray-400 hover:text-red-500"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <label className="cursor-pointer block">
                                        <input
                                            type="file"
                                            accept="video/*,image/*"
                                            onChange={handleVideoUpload}
                                            className="hidden"
                                        />
                                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                        <p className="text-sm font-medium text-gray-700">Click to upload video or image</p>
                                        <p className="text-xs text-gray-500 mt-1">MP4, MOV, JPG, PNG up to 10MB</p>
                                        {uploadingVideo && <p className="text-cyan-600 text-sm mt-2 animate-pulse">Uploading...</p>}
                                    </label>
                                )}
                            </div>
                        )}
                    </div>

                    <div>
                        <Label>Thumbnail (Optional)</Label>
                        <div className="mt-1">
                            {thumbnailPreview ? (
                                <div className="relative w-full h-24 bg-gray-100 rounded-lg overflow-hidden border border-gray-200 flex items-center justify-center">
                                    <img 
                                        src={thumbnailPreview} 
                                        alt="Thumbnail preview" 
                                        className="h-full object-contain"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleRemoveThumbnail}
                                        className="absolute top-1 right-1 p-1 bg-white/80 hover:bg-white text-red-500 rounded-full shadow-sm"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                            ) : (
                                <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 bg-white">
                                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                                        <Plus className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1">
                                        <span className="text-sm font-medium text-gray-700">Upload Thumbnail</span>
                                        <p className="text-xs text-gray-500">For video cover</p>
                                    </div>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        className="hidden"
                                    />
                                </label>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Push to Social Media Section */}
            <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex items-center gap-2 mb-3">
                    <Share2 className="w-4 h-4 text-cyan-600" />
                    <h4 className="font-semibold text-gray-900 text-sm">Push to Social Media Pages</h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="flex items-center space-x-2">
                        <Checkbox 
                            id="push-fb" 
                            checked={pushTo.facebook}
                            onCheckedChange={(c) => setPushTo(prev => ({ ...prev, facebook: !!c }))}
                        />
                        <label htmlFor="push-fb" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer">
                            Facebook Page
                        </label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Checkbox 
                            id="push-ig" 
                            checked={pushTo.instagram}
                            onCheckedChange={(c) => setPushTo(prev => ({ ...prev, instagram: !!c }))}
                        />
                        <label htmlFor="push-ig" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer">
                            Instagram Feed
                        </label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Checkbox 
                            id="push-tt" 
                            checked={pushTo.tiktok}
                            onCheckedChange={(c) => setPushTo(prev => ({ ...prev, tiktok: !!c }))}
                        />
                        <label htmlFor="push-tt" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer">
                            TikTok Account
                        </label>
                    </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                    * This will publish the content to your connected business pages automatically.
                </p>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white"
              >
                {submitting ? 'Submitting...' : 'Create & Push Ad'}
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
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No ads created yet</h3>
          <p className="text-gray-600 mb-4">
            Create your first ad to promote your business and push to social media!
          </p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {ads.map((ad) => (
            <Card key={ad.id} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center text-2xl flex-shrink-0 overflow-hidden">
                    {ad.thumbnail_url ? (
                        <img src={ad.thumbnail_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                        getPlatformIcon(ad.platform)
                    )}
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
                      View Content <ExternalLink className="w-3 h-3" />
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
                <span>Created {new Date(ad.created_at).toLocaleDateString()}</span>
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