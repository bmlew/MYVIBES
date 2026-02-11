import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { ExternalLink, Eye, TrendingUp, Video, X, Play } from 'lucide-react';
import { projectId, publicAnonKey } from '/utils/supabase/info';
const exampleImage = 'https://images.unsplash.com/photo-1615234404856-e19b0a45f760?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2NrdGFpbHMlMjBzdW5zZXQlMjBiYXJ8ZW58MXx8fHwxNzcwODEwNzY2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral';

const MOCK_ADS: SocialMediaAd[] = [
  {
    id: 'mock-1',
    business_id: 'biz-1',
    business_name: 'The Velvet Lounge',
    platform: 'instagram',
    video_url: '',
    title: 'Summer Sunset Sessions 🍹',
    description: 'Join us every Friday for the best sunset views in the city. Half price cocktails 5-7pm!',
    thumbnail_url: exampleImage,
    status: 'approved',
    approved_at: new Date().toISOString(),
    views: 1250,
    clicks: 85
  },
  {
    id: 'mock-2',
    business_id: 'biz-2',
    business_name: 'Urban Burger Co.',
    platform: 'tiktok',
    video_url: 'https://assets.mixkit.co/videos/preview/mixkit-friends-eating-burgers-at-a-restaurant-4636-large.mp4',
    title: 'POV: You found the best burger in town 🍔',
    description: 'Tag a friend who owes you this burger!',
    thumbnail_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=600',
    status: 'approved',
    approved_at: new Date().toISOString(),
    views: 8500,
    clicks: 420
  },
  {
    id: 'mock-3',
    business_id: 'biz-3',
    business_name: 'Neon Nights Club',
    platform: 'facebook',
    video_url: '',
    title: 'DJ Snake Live This Saturday! 🎧',
    description: 'Limited early bird tickets available now. Don\'t miss out!',
    thumbnail_url: 'https://images.unsplash.com/photo-1574391884720-2e41ca0b7b11?auto=format&fit=crop&q=80&w=600',
    status: 'approved',
    approved_at: new Date().toISOString(),
    views: 3200,
    clicks: 150
  },
  {
    id: 'mock-4',
    business_id: 'biz-4',
    business_name: 'Zen Spa & Wellness',
    platform: 'google',
    video_url: '',
    title: 'Weekend Relaxation Package',
    description: 'Book a couples massage and get a complimentary champagne lunch.',
    thumbnail_url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=600',
    status: 'approved',
    approved_at: new Date().toISOString(),
    views: 980,
    clicks: 45
  }
];

interface SocialMediaAd {
  id: string;
  business_id: string;
  business_name: string;
  platform: 'tiktok' | 'instagram' | 'facebook' | 'google';
  video_url: string;
  title: string;
  description: string;
  thumbnail_url?: string;
  status: 'approved';
  approved_at: string;
  views: number;
  clicks: number;
}

export function SocialMediaAdsGallery() {
  const [ads, setAds] = useState<SocialMediaAd[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAd, setSelectedAd] = useState<SocialMediaAd | null>(null);

  useEffect(() => {
    loadApprovedAds();
  }, []);

  const loadApprovedAds = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-175b2872/ads/approved`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.ads && data.ads.length > 0) {
          setAds(data.ads);
        } else {
          setAds(MOCK_ADS);
        }
      } else {
        setAds(MOCK_ADS);
      }
    } catch (error) {
      console.error('Error loading approved ads:', error);
      setAds(MOCK_ADS);
    } finally {
      setLoading(false);
    }
  };

  const trackView = async (adId: string) => {
    try {
      await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-175b2872/ads/${adId}/view`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`
          }
        }
      );
    } catch (error) {
      console.error('Error tracking view:', error);
    }
  };

  const trackClick = async (adId: string) => {
    try {
      await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-175b2872/ads/${adId}/click`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`
          }
        }
      );
    } catch (error) {
      console.error('Error tracking click:', error);
    }
  };

  const handleAdClick = (ad: SocialMediaAd) => {
    trackView(ad.id);
    setSelectedAd(ad);
  };

  const handleVisitAd = (ad: SocialMediaAd) => {
    trackClick(ad.id);
    window.open(ad.video_url, '_blank', 'noopener,noreferrer');
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

  const getPlatformColor = (platform: string) => {
    const colors: Record<string, string> = {
      tiktok: 'from-black to-cyan-500',
      instagram: 'from-purple-500 via-pink-500 to-orange-500',
      facebook: 'from-blue-600 to-blue-400',
      google: 'from-blue-500 to-green-500'
    };
    return colors[platform] || 'from-cyan-500 to-blue-600';
  };

  const isVideoFile = (url: string) => {
    if (!url) return false;
    return url.match(/\.(mp4|mov|webm)(\?|$)/i) || url.includes('/storage/v1/object/sign/');
  };

  if (loading) {
    return (
      <section className="py-12 sm:py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading featured content...</p>
          </div>
        </div>
      </section>
    );
  }

  if (ads.length === 0) {
    return null; // Don't show section if no ads
  }

  return (
    <>
      <section id="social-media-feed" className="py-12 sm:py-16 bg-gradient-to-br from-gray-50 to-cyan-50">
        <div className="max-w-7xl mx-auto px-4">
          {/* Section Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-4 py-2 rounded-full mb-4 shadow-md">
              <Video className="w-5 h-5" />
              <span className="font-semibold">Live Feed</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Social Media Spotlight
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover trending campaigns, exclusive reels, and approved media highlights from our partners.
            </p>
          </div>

          {/* Ads Grid - Instagram/TikTok Style */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {ads.slice(0, 8).map((ad) => (
              <div
                key={ad.id}
                onClick={() => handleAdClick(ad)}
                className="group cursor-pointer"
              >
                <div className="relative rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                  {/* Thumbnail Image or Gradient Background */}
                  {ad.thumbnail_url ? (
                    <div className="relative aspect-[3/4] overflow-hidden">
                      <img
                        src={ad.thumbnail_url}
                        alt={ad.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Fallback to gradient if image fails to load
                          e.currentTarget.style.display = 'none';
                          const colors = getPlatformColor(ad.platform).split(' ');
                          e.currentTarget.parentElement!.classList.add('bg-gradient-to-br', ...colors);
                        }}
                      />
                      {/* Play Overlay */}
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                        <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center transform group-hover:scale-110 transition-transform">
                          <Play className="w-8 h-8 text-gray-900 ml-1" fill="currentColor" />
                        </div>
                      </div>
                    </div>
                  ) : isVideoFile(ad.video_url) ? (
                    <div className="relative aspect-[3/4] overflow-hidden bg-black">
                      <video 
                         src={ad.video_url} 
                         className="w-full h-full object-cover opacity-80"
                         muted
                         loop
                         onMouseOver={(e) => e.currentTarget.play()}
                         onMouseOut={(e) => {
                           e.currentTarget.pause();
                           e.currentTarget.currentTime = 0;
                         }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                         <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center">
                          <Play className="w-8 h-8 text-gray-900 ml-1" fill="currentColor" />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className={`relative aspect-[3/4] bg-gradient-to-br ${getPlatformColor(ad.platform)} flex items-center justify-center`}>
                      <div className="text-center p-6">
                        <div className="text-6xl mb-4">{getPlatformIcon(ad.platform)}</div>
                        <Video className="w-12 h-12 text-white/80 mx-auto" />
                      </div>
                      {/* Play Overlay */}
                      <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                        <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center transform group-hover:scale-110 transition-transform">
                          <Play className="w-8 h-8 text-gray-900 ml-1" fill="currentColor" />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Platform Badge */}
                  <div className="absolute top-3 left-3">
                    <div className={`px-3 py-1 rounded-full bg-gradient-to-r ${getPlatformColor(ad.platform)} text-white text-xs font-bold flex items-center gap-1 shadow-lg`}>
                      <span>{getPlatformIcon(ad.platform)}</span>
                      <span>{ad.platform.toUpperCase()}</span>
                    </div>
                  </div>

                  {/* Content Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4">
                    <h3 className="text-white font-bold text-lg mb-1 line-clamp-2">
                      {ad.title}
                    </h3>
                    <p className="text-white/90 text-sm">{ad.business_name}</p>
                    <div className="flex items-center gap-3 mt-2 text-white/80 text-xs">
                      <div className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        <span>{ad.views}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* View All Button */}
          {ads.length > 8 && (
            <div className="text-center mt-12">
              <Button
                onClick={() => {
                  const element = document.getElementById('all-ads-section');
                  element?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-8 py-6 text-lg shadow-lg hover:shadow-xl transition-all"
              >
                View All Campaigns
                <TrendingUp className="w-5 h-5 ml-2" />
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Modal for Selected Ad */}
      {selectedAd && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedAd(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-2xl w-full overflow-hidden relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedAd(null)}
              className="absolute top-4 right-4 z-10 p-2 bg-white/90 hover:bg-white rounded-full transition-colors shadow-lg"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Media Content */}
            {isVideoFile(selectedAd.video_url) ? (
              <div className="relative aspect-video overflow-hidden bg-black">
                <video 
                  src={selectedAd.video_url} 
                  controls 
                  className="w-full h-full"
                  poster={selectedAd.thumbnail_url}
                  autoPlay
                />
              </div>
            ) : selectedAd.thumbnail_url ? (
              <div className="relative aspect-video overflow-hidden bg-gray-100">
                <img
                  src={selectedAd.thumbnail_url}
                  alt={selectedAd.title}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className={`relative aspect-video bg-gradient-to-br ${getPlatformColor(selectedAd.platform)} flex items-center justify-center`}>
                <div className="text-8xl">{getPlatformIcon(selectedAd.platform)}</div>
              </div>
            )}

            <div className="p-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{selectedAd.title}</h3>
                  <p className="text-gray-600 mb-1">{selectedAd.business_name}</p>
                  <span className={`inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r ${getPlatformColor(selectedAd.platform)} text-white text-xs font-semibold rounded-full`}>
                    <span>{getPlatformIcon(selectedAd.platform)}</span>
                    {selectedAd.platform.charAt(0).toUpperCase() + selectedAd.platform.slice(1)}
                  </span>
                </div>
              </div>

              {selectedAd.description && (
                <p className="text-gray-700 mb-6">{selectedAd.description}</p>
              )}

              <div className="flex items-center gap-4 mb-6 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  <span>{selectedAd.views} views</span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  <span>{selectedAd.clicks} clicks</span>
                </div>
              </div>

              <Button
                onClick={() => handleVisitAd(selectedAd)}
                className={`w-full bg-gradient-to-r ${getPlatformColor(selectedAd.platform)} text-white text-lg py-6 hover:shadow-xl`}
              >
                <Play className="w-5 h-5 mr-2" fill="currentColor" />
                Watch on {selectedAd.platform.charAt(0).toUpperCase() + selectedAd.platform.slice(1)}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* All Ads Section (if more than 8) */}
      {ads.length > 8 && (
        <section id="all-ads-section" className="py-12 sm:py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8 text-center">
              All Social Media Campaigns
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {ads.slice(8).map((ad) => (
                <div
                  key={ad.id}
                  onClick={() => handleAdClick(ad)}
                  className="group cursor-pointer"
                >
                  <div className="relative rounded-xl overflow-hidden shadow hover:shadow-lg transition-shadow">
                    {ad.thumbnail_url ? (
                      <div className="relative aspect-[3/4]">
                        <img
                          src={ad.thumbnail_url}
                          alt={ad.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors"></div>
                      </div>
                    ) : (
                      <div className={`aspect-[3/4] bg-gradient-to-br ${getPlatformColor(ad.platform)} flex items-center justify-center`}>
                        <div className="text-4xl">{getPlatformIcon(ad.platform)}</div>
                      </div>
                    )}
                    <div className="absolute top-2 left-2">
                      <div className={`px-2 py-0.5 rounded-full bg-gradient-to-r ${getPlatformColor(ad.platform)} text-white text-[10px] font-bold`}>
                        {ad.platform.toUpperCase()}
                      </div>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                      <p className="text-white text-xs font-semibold line-clamp-2">{ad.title}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}

export default SocialMediaAdsGallery;
