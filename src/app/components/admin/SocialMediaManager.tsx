import React, { useState, useEffect } from 'react';
import { 
  Plus, Image as ImageIcon, Globe, Clock, CheckCircle2, Loader2, X 
} from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Card } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Input } from '@/app/components/ui/input';
import { Textarea } from '@/app/components/ui/textarea';
import { toast } from "sonner";
import { projectId, publicAnonKey } from '/utils/supabase/info';

interface Campaign {
  id: number;
  name: string;
  status: string;
  reach: number;
  clicks: number;
  spend: number;
  type: string;
  media_url?: string;
  budget?: number;
  start_date?: string;
}

export function SocialMediaManager() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    type: 'Global Promo (All Apps)',
    message: '',
    start_date: '',
    budget: '',
    media_url: ''
  });
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-175b2872`;

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/admin/campaigns`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch campaigns');
      
      const data = await response.json();
      setCampaigns(data.campaigns || []);
    } catch (err) {
      console.error('Error fetching campaigns:', err);
      toast.error('Failed to load campaigns');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateData = async () => {
    try {
      setIsGenerating(true);
      const response = await fetch(`${API_URL}/admin/generate-test-campaigns`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to generate data');
      
      const data = await response.json();
      toast.success(data.message);
      fetchCampaigns();
    } catch (err) {
      console.error('Error generating data:', err);
      toast.error('Failed to generate test data');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
      toast.error('Please upload an image or video file');
      return;
    }

    // Size limit check (10MB)
    if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
    }

    try {
      setUploadingMedia(true);
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);

      const response = await fetch(`${API_URL}/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: uploadFormData
      });

      if (!response.ok) throw new Error('Upload failed');

      const data = await response.json();
      setFormData(prev => ({ ...prev, media_url: data.full_path }));
      
      // Create local preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setMediaPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      
      toast.success('Media uploaded successfully');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload media');
    } finally {
      setUploadingMedia(false);
    }
  };

  const handleCreateCampaign = async () => {
    if (!formData.name) {
      toast.error('Please enter a campaign name');
      return;
    }

    if (!formData.media_url) {
        toast.error('Please upload creative media');
        return;
    }

    try {
      setSubmitting(true);
      const response = await fetch(`${API_URL}/admin/campaigns`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error('Failed to create campaign');

      toast.success('Campaign launched successfully');
      setShowCreate(false);
      
      // Reset form
      setFormData({
        name: '',
        type: 'Global Promo (All Apps)',
        message: '',
        start_date: '',
        budget: '',
        media_url: ''
      });
      setMediaPreview(null);
      fetchCampaigns();
    } catch (error) {
      console.error('Create campaign error:', error);
      toast.error('Failed to create campaign');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveMedia = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFormData(prev => ({ ...prev, media_url: '' }));
    setMediaPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Global Marketing & Social</h2>
          <p className="text-slate-500">Manage platform-wide campaigns and social integrations.</p>
        </div>
        <div className="flex gap-2">
           {campaigns.length === 0 && (
            <Button 
              variant="outline" 
              onClick={handleGenerateData} 
              disabled={isGenerating}
              className="gap-2 border-dashed border-cyan-500 text-cyan-600 hover:bg-cyan-50"
            >
              {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Generate Test Data
            </Button>
          )}
          <Button onClick={() => setShowCreate(true)} className="bg-cyan-600 hover:bg-cyan-700 text-white gap-2">
            <Plus className="w-4 h-4" /> Create Global Campaign
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="p-12 flex justify-center items-center text-slate-500">
          <Loader2 className="w-6 h-6 animate-spin mr-2" />
          Loading campaigns...
        </div>
      ) : campaigns.length === 0 ? (
        <div className="p-12 text-center text-slate-500 border border-dashed border-slate-300 rounded-xl">
          <p>No campaigns found.</p>
          <Button 
            variant="link" 
            onClick={handleGenerateData}
            className="mt-2 text-cyan-600"
          >
            Generate Test Data
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {campaigns.map((campaign) => (
            <Card key={campaign.id} className="p-6 border-slate-100 shadow-sm relative overflow-hidden group hover:border-cyan-200 transition-colors">
              <div className="flex justify-between items-start mb-4">
                <Badge variant="outline" className={`
                  ${campaign.status === 'Active' ? 'bg-cyan-500 text-white border-cyan-500' : 
                    campaign.status === 'Scheduled' ? 'bg-slate-900 text-white border-slate-900' : 
                    'bg-slate-900 text-white border-slate-900'}
                `}>
                  {campaign.status}
                </Badge>
                <span className="text-xs text-slate-400 font-medium">{campaign.type}</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-8 min-h-[3.5rem]">{campaign.name}</h3>
              
              <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-50">
                <div>
                  <p className="text-xs text-slate-400 mb-1">Reach</p>
                  <p className="font-bold text-slate-700">{campaign.reach.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Clicks</p>
                  <p className="font-bold text-slate-700">{campaign.clicks.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Spend</p>
                  <p className="font-bold text-slate-700">R {campaign.spend.toLocaleString()}</p>
                </div>
              </div>

              <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-cyan-500 to-blue-600 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
            </Card>
          ))}
        </div>
      )}

      {showCreate && (
        <Card className="p-6 border-slate-200 shadow-md bg-slate-50">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold">New Global Campaign</h3>
            <Button variant="ghost" size="sm" onClick={() => setShowCreate(false)}>Cancel</Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Campaign Name</label>
                <Input 
                    placeholder="e.g., Holiday Special" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Campaign Type</label>
                <select 
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md"
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                >
                  <option>Global Promo (All Apps)</option>
                  <option>System Notification</option>
                  <option>Partner Spotlight</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Message / Caption</label>
                <Textarea 
                    placeholder="Enter your message..." 
                    rows={4} 
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                />
              </div>
            </div>
            <div className="space-y-4">
              <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*,video/*"
                  onChange={handleFileChange}
              />
              <div 
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-lg h-40 flex flex-col items-center justify-center transition-all cursor-pointer relative overflow-hidden ${
                      mediaPreview ? 'border-cyan-500 bg-cyan-50' : 'border-slate-300 text-slate-400 hover:border-cyan-400 hover:bg-cyan-50'
                  }`}
              >
                {uploadingMedia ? (
                    <div className="flex flex-col items-center">
                        <Loader2 className="w-8 h-8 mb-2 animate-spin text-cyan-600" />
                        <span className="text-sm text-cyan-600">Uploading...</span>
                    </div>
                ) : mediaPreview ? (
                    <>
                        <img src={mediaPreview} alt="Preview" className="w-full h-full object-contain" />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                            <span className="text-white font-medium">Click to change</span>
                        </div>
                        <button 
                            onClick={handleRemoveMedia}
                            className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-md text-slate-700 hover:text-red-500"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </>
                ) : (
                    <>
                        <ImageIcon className="w-8 h-8 mb-2" />
                        <span className="text-sm">Upload Creative Media</span>
                    </>
                )}
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="text-sm font-medium mb-1 block">Start Date</label>
                  <Input 
                      type="date" 
                      value={formData.start_date}
                      onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                  />
                </div>
                <div className="flex-1">
                  <label className="text-sm font-medium mb-1 block">Budget (Optional)</label>
                  <Input 
                      type="number" 
                      placeholder="R 0.00" 
                      value={formData.budget}
                      onChange={(e) => setFormData({...formData, budget: e.target.value})}
                  />
                </div>
              </div>
              <Button 
                className="w-full bg-slate-900 text-white mt-2" 
                onClick={handleCreateCampaign}
                disabled={submitting || uploadingMedia}
              >
                {submitting ? (
                    <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Launching...
                    </>
                ) : 'Launch Campaign'}
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Connected Platforms Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6 border-slate-100 shadow-sm">
          <h3 className="font-bold mb-4 flex items-center gap-2 text-slate-900">
            <Globe className="w-5 h-5 text-blue-500" /> Platform Integration Status
          </h3>
          <div className="space-y-4">
            {['Meta Graph API', 'Google Ads Manager', 'TikTok for Business', 'WhatsApp Business API'].map((api, i) => (
              <div key={`api-${i}-${api}`} className="flex items-center justify-between">
                <span className="text-sm text-slate-600 font-medium">{api}</span>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 font-medium px-3 py-1">
                  Healthy
                </Badge>
              </div>
            ))}
          </div>
        </Card>
        
        <Card className="p-6 border-slate-100 shadow-sm">
          <h3 className="font-bold mb-4 flex items-center gap-2 text-slate-900">
            <Clock className="w-5 h-5 text-orange-500" /> Pending Moderation
          </h3>
          <div className="text-center py-8 text-slate-500 flex flex-col items-center justify-center h-full pb-12">
            <div className="w-16 h-16 rounded-full border-4 border-green-100 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            </div>
            <p className="font-medium text-slate-600">All content is moderated.</p>
            <p className="text-sm text-slate-400 mt-1">Good job!</p>
          </div>
        </Card>
      </div>
    </div>
  );
}