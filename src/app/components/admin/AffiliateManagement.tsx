import React, { useState, useEffect } from 'react';
import { Users, Link, Copy, Check, Download, Edit2, RefreshCw, Search, DollarSign, Building, User, Send, Smartphone } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card } from '../ui/card';
import { toast } from 'sonner';
import { projectId, publicAnonKey } from '/utils/supabase/info';
import { getReferralLink, getBusinessReferralLink, getCustomerReferralLink } from '/src/config/app';

interface Affiliate {
  id: string;
  name: string;
  email: string;
  phone: string;
  code: string;
  status: string;
  total_referrals: number;
  total_customer_referrals: number;
  total_business_referrals: number;
  total_earnings: number;
  pending_balance: number;
  paid_earnings: number;
  joined_at: string;
  bank_details?: {
    bank_name: string;
    account_number: string;
    branch_code: string;
  };
}

interface CopiedState {
  [key: string]: boolean;
}

export function AffiliateManagement() {
  const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingCode, setEditingCode] = useState<string | null>(null);
  const [newCode, setNewCode] = useState('');
  const [copiedLinks, setCopiedLinks] = useState<CopiedState>({});
  const [selectedAffiliates, setSelectedAffiliates] = useState<Set<string>>(new Set());
  const [sending, setSending] = useState(false);

  const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-175b2872`;

  const fetchAffiliates = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/affiliates`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to fetch affiliates');

      const data = await response.json();
      setAffiliates(data.affiliates || []);
    } catch (error) {
      console.error('Error fetching affiliates:', error);
      toast.error('Failed to load affiliates');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAffiliates();
  }, []);

  const handleCopyLink = (code: string) => {
    const link = getReferralLink(code);
    
    // Try modern clipboard API first, with fallback
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(link)
        .then(() => {
          setCopiedLinks({ ...copiedLinks, [code]: true });
          toast.success('Referral link copied!');
          setTimeout(() => {
            setCopiedLinks({ ...copiedLinks, [code]: false });
          }, 2000);
        })
        .catch(() => {
          // Fallback to legacy method
          fallbackCopyTextToClipboard(link);
          setCopiedLinks({ ...copiedLinks, [code]: true });
          toast.success('Referral link copied!');
          setTimeout(() => {
            setCopiedLinks({ ...copiedLinks, [code]: false });
          }, 2000);
        });
    } else {
      // Use fallback directly
      fallbackCopyTextToClipboard(link);
      setCopiedLinks({ ...copiedLinks, [code]: true });
      toast.success('Referral link copied!');
      setTimeout(() => {
        setCopiedLinks({ ...copiedLinks, [code]: false });
      }, 2000);
    }
  };

  const fallbackCopyTextToClipboard = (text: string) => {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.top = '0';
    textArea.style.left = '0';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
    } catch (err) {
      console.error('Fallback: Oops, unable to copy', err);
    }
    document.body.removeChild(textArea);
  };

  const handleUpdateCode = async (affiliateId: string, oldCode: string) => {
    if (!newCode.trim()) {
      toast.error('Please enter a new code');
      return;
    }

    const upperCode = newCode.toUpperCase().trim();
    
    // Check if code already exists
    if (affiliates.some(a => a.code === upperCode && a.id !== affiliateId)) {
      toast.error('This code is already in use');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/affiliates/update-code`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          affiliate_id: affiliateId,
          new_code: upperCode
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update code');
      }

      toast.success(`Code updated from ${oldCode} to ${upperCode}`);
      setEditingCode(null);
      setNewCode('');
      await fetchAffiliates();
    } catch (error: any) {
      console.error('Error updating code:', error);
      toast.error(error.message || 'Failed to update code');
    }
  };

  const exportAffiliateLinks = () => {
    const csvContent = [
      ['Name', 'Email', 'Code', 'Referral Link', 'Business Referrals', 'Customer Referrals', 'Total Earnings'].join(','),
      ...filteredAffiliates.map(aff => [
        aff.name,
        aff.email,
        aff.code,
        getReferralLink(aff.code),
        aff.total_business_referrals || 0,
        aff.total_customer_referrals || 0,
        `R${aff.total_earnings.toFixed(2)}`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `myvibes-affiliate-links-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    toast.success('Affiliate links exported!');
  };

  const filteredAffiliates = affiliates.filter(aff =>
    aff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    aff.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    aff.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: affiliates.length,
    active: affiliates.filter(a => a.total_referrals > 0).length,
    totalEarnings: affiliates.reduce((sum, a) => sum + a.total_earnings, 0),
    totalReferrals: affiliates.reduce((sum, a) => sum + a.total_referrals, 0),
    businessReferrals: affiliates.reduce((sum, a) => sum + (a.total_business_referrals || 0), 0),
    customerReferrals: affiliates.reduce((sum, a) => sum + (a.total_customer_referrals || 0), 0)
  };

  const handleSelectAffiliate = (id: string) => {
    const newSet = new Set(selectedAffiliates);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedAffiliates(newSet);
  };

  const handleSelectAll = () => {
    if (selectedAffiliates.size === filteredAffiliates.length) {
      setSelectedAffiliates(new Set());
    } else {
      setSelectedAffiliates(new Set(filteredAffiliates.map(a => a.id)));
    }
  };

  const handleSendMessage = () => {
    setSending(true);
    const selectedAffiliateIds = Array.from(selectedAffiliates);
    const selectedAffiliatesList = affiliates.filter(a => selectedAffiliateIds.includes(a.id));

    // Create a formatted message with all selected affiliates
    const messages = selectedAffiliatesList.map(affiliate => {
      const link = getReferralLink(affiliate.code);
      return `Hi ${affiliate.name}! Your MYVIBES partner referral link is: ${link}`;
    }).join('\n\n---\n\n');

    // Try modern clipboard API first, with fallback
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(messages)
        .then(() => {
          setSending(false);
          toast.success(`${selectedAffiliates.size} message${selectedAffiliates.size > 1 ? 's' : ''} copied to clipboard!`);
          setSelectedAffiliates(new Set());
        })
        .catch(() => {
          fallbackCopyTextToClipboard(messages);
          setSending(false);
          toast.success(`${selectedAffiliates.size} message${selectedAffiliates.size > 1 ? 's' : ''} copied to clipboard!`);
          setSelectedAffiliates(new Set());
        });
    } else {
      fallbackCopyTextToClipboard(messages);
      setSending(false);
      toast.success(`${selectedAffiliates.size} message${selectedAffiliates.size > 1 ? 's' : ''} copied to clipboard!`);
      setSelectedAffiliates(new Set());
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Affiliate Management</h1>
          <p className="text-gray-600 mt-1">Manage partner referral codes and links</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchAffiliates} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={exportAffiliateLinks}>
            <Download className="w-4 h-4 mr-2" />
            Export Links
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="text-sm text-gray-600">Total Partners</div>
              <div className="text-2xl font-bold">{stats.total}</div>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Users className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <div className="text-sm text-gray-600">Active Partners</div>
              <div className="text-2xl font-bold">{stats.active}</div>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Link className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <div className="text-sm text-gray-600">Total Referrals</div>
              <div className="text-2xl font-bold">{stats.totalReferrals}</div>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Building className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <div className="text-sm text-gray-600">Business Refs</div>
              <div className="text-2xl font-bold">{stats.businessReferrals}</div>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <User className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <div className="text-sm text-gray-600">Customer Refs</div>
              <div className="text-2xl font-bold">{stats.customerReferrals}</div>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <DollarSign className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <div className="text-sm text-gray-600">Total Earnings</div>
              <div className="text-2xl font-bold">R{stats.totalEarnings.toFixed(0)}</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Search and Actions Bar */}
      <div className="flex gap-2 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            type="text"
            placeholder="Search by name, email, or code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        {selectedAffiliates.size > 0 && (
          <Button 
            onClick={handleSendMessage}
            disabled={sending}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
          >
            <Send className="w-4 h-4 mr-2" />
            Copy {selectedAffiliates.size} Message{selectedAffiliates.size > 1 ? 's' : ''}
          </Button>
        )}
      </div>

      {/* Affiliates Table */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading affiliates...</p>
        </div>
      ) : filteredAffiliates.length === 0 ? (
        <Card className="p-12 text-center">
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600">No affiliates found</h3>
          <p className="text-gray-500 mt-2">
            {searchTerm ? 'Try a different search term' : 'Affiliates will appear here once they register'}
          </p>
        </Card>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedAffiliates.size === filteredAffiliates.length && filteredAffiliates.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Partner</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Referral Link</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Referrals</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Earnings</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredAffiliates.map((affiliate) => {
                  const link = getReferralLink(affiliate.code);
                  const isEditing = editingCode === affiliate.id;

                  return (
                    <tr key={affiliate.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedAffiliates.has(affiliate.id)}
                          onChange={() => handleSelectAffiliate(affiliate.id)}
                          className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-gray-900">{affiliate.name}</div>
                          <div className="text-sm text-gray-500">{affiliate.email}</div>
                          <div className="text-xs text-gray-400">{affiliate.phone}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {isEditing ? (
                          <div className="flex items-center gap-2">
                            <Input
                              type="text"
                              value={newCode}
                              onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                              placeholder={affiliate.code}
                              className="w-32"
                              autoFocus
                            />
                            <Button
                              size="sm"
                              onClick={() => handleUpdateCode(affiliate.id, affiliate.code)}
                            >
                              Save
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setEditingCode(null);
                                setNewCode('');
                              }}
                            >
                              Cancel
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-semibold text-purple-600">
                              {affiliate.code}
                            </span>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setEditingCode(affiliate.id);
                                setNewCode(affiliate.code);
                              }}
                            >
                              <Edit2 className="w-3 h-3" />
                            </Button>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-2">
                          {/* Business Link */}
                          <div className="flex items-center gap-2">
                            <Building className="w-3 h-3 text-blue-600" />
                            <code className="text-xs bg-blue-50 px-2 py-1 rounded truncate max-w-[200px]">
                              {getBusinessReferralLink(affiliate.code)}
                            </code>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                const link = getBusinessReferralLink(affiliate.code);
                                if (navigator.clipboard && navigator.clipboard.writeText) {
                                  navigator.clipboard.writeText(link)
                                    .then(() => toast.success('Business link copied!'))
                                    .catch(() => {
                                      fallbackCopyTextToClipboard(link);
                                      toast.success('Business link copied!');
                                    });
                                } else {
                                  fallbackCopyTextToClipboard(link);
                                  toast.success('Business link copied!');
                                }
                              }}
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                          </div>
                          {/* Customer Link */}
                          <div className="flex items-center gap-2">
                            <Smartphone className="w-3 h-3 text-pink-600" />
                            <code className="text-xs bg-pink-50 px-2 py-1 rounded truncate max-w-[200px]">
                              {getCustomerReferralLink(affiliate.code)}
                            </code>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                const link = getCustomerReferralLink(affiliate.code);
                                if (navigator.clipboard && navigator.clipboard.writeText) {
                                  navigator.clipboard.writeText(link)
                                    .then(() => toast.success('Customer link copied!'))
                                    .catch(() => {
                                      fallbackCopyTextToClipboard(link);
                                      toast.success('Customer link copied!');
                                    });
                                } else {
                                  fallbackCopyTextToClipboard(link);
                                  toast.success('Customer link copied!');
                                }
                              }}
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <div className="font-medium">{affiliate.total_referrals} total</div>
                          <div className="text-gray-500">
                            {affiliate.total_business_referrals || 0} business / {affiliate.total_customer_referrals || 0} customer
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <div className="font-medium">R{affiliate.total_earnings.toFixed(2)}</div>
                          <div className="text-gray-500">
                            R{affiliate.pending_balance.toFixed(2)} pending
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          affiliate.status === 'approved' 
                            ? 'bg-green-100 text-green-800' 
                            : affiliate.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {affiliate.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              const message = `Hi ${affiliate.name}! Your MYVIBES partner referral link is: ${link}`;
                              if (navigator.clipboard && navigator.clipboard.writeText) {
                                navigator.clipboard.writeText(message)
                                  .then(() => toast.success('Message copied to clipboard'))
                                  .catch(() => {
                                    fallbackCopyTextToClipboard(message);
                                    toast.success('Message copied to clipboard');
                                  });
                              } else {
                                fallbackCopyTextToClipboard(message);
                                toast.success('Message copied to clipboard');
                              }
                            }}
                          >
                            Copy Message
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}