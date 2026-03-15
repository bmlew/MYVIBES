import React, { useState, useEffect, useRef } from 'react';
import { Search, Filter, Download, MoreHorizontal, Plus, Loader2, User as UserIcon, Mail, MapPin, Phone, Calendar, CreditCard, Shield, Edit, Eye, Trash2 } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { toast } from "sonner";
import { projectId, publicAnonKey } from '/utils/supabase/info';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/app/components/ui/dialog";
import { Label } from "@/app/components/ui/label";
import { Input } from "@/app/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  joined: string;
  spend: number;
  lastActive: string;
  mobile?: string;
  city?: string;
  affiliateCode?: string;
}

// Custom Dropdown Component
function ActionMenu({ user, onView, onEdit, onSuspend, onDelete }: { user: User; onView: () => void; onEdit: () => void; onSuspend: () => void; onDelete: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  return (
    <div className="relative" ref={menuRef}>
      <Button 
        variant="ghost" 
        className="h-8 w-8 p-0 cursor-pointer hover:bg-slate-100"
        onClick={() => setIsOpen(!isOpen)}
      >
        <MoreHorizontal className="w-4 h-4" />
      </Button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-50">
          <button
            onClick={() => {
              onView();
              setIsOpen(false);
            }}
            className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50 flex items-center gap-2 text-slate-700"
          >
            <Eye className="w-4 h-4 text-slate-500" /> View Profile
          </button>
          <button
            onClick={() => {
              onEdit();
              setIsOpen(false);
            }}
            className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50 flex items-center gap-2 text-slate-700"
          >
            <Edit className="w-4 h-4 text-slate-500" /> Edit Details
          </button>
          <button
            onClick={() => {
              onSuspend();
              setIsOpen(false);
            }}
            className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 flex items-center gap-2 text-orange-600"
          >
            <Shield className="w-4 h-4" /> {user.status.toLowerCase() === 'suspended' ? 'Activate Account' : 'Suspend Account'}
          </button>
          <div className="border-t border-slate-100 my-1"></div>
          <button
            onClick={() => {
              onDelete();
              setIsOpen(false);
            }}
            className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 flex items-center gap-2 text-red-600"
          >
            <Trash2 className="w-4 h-4" /> Delete User
          </button>
        </div>
      )}
    </div>
  );
}

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal State
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isSuspendOpen, setIsSuspendOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit Form State
  const [editForm, setEditForm] = useState({ name: '', email: '', mobile: '', city: '', status: '', affiliateCode: '' });

  const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-175b2872`;

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/admin/customers`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch users');
      
      const data = await response.json();
      
      const mappedUsers = (data.customers || []).map((c: any) => ({
        id: c.id,
        name: c.name || 'Unknown',
        email: c.email || 'No Email',
        role: 'Customer',
        status: c.status || 'Active',
        joined: c.joined_at ? new Date(c.joined_at).toLocaleDateString() : 'N/A',
        spend: c.total_spend || 0,
        lastActive: c.last_active ? new Date(c.last_active).toLocaleString() : 'Never',
        mobile: c.mobile,
        city: c.city,
        affiliateCode: c.referral_code || c.affiliate_code
      }));
      
      setUsers(mappedUsers);
    } catch (err) {
      console.error('Error fetching users:', err);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateData = async () => {
    try {
      setIsGenerating(true);
      const response = await fetch(`${API_URL}/admin/generate-test-customers`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to generate data');
      
      const data = await response.json();
      toast.success(data.message);
      fetchUsers();
    } catch (err) {
      console.error('Error generating data:', err);
      toast.error('Failed to generate test data');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleView = (user: User) => {
    setSelectedUser(user);
    setIsViewOpen(true);
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setEditForm({
      name: user.name,
      email: user.email,
      mobile: user.mobile || '',
      city: user.city || '',
      status: user.status.toLowerCase(),
      affiliateCode: user.affiliateCode || ''
    });
    setIsEditOpen(true);
  };

  const handleSuspend = (user: User) => {
    setSelectedUser(user);
    setIsSuspendOpen(true);
  };

  const handleDelete = (user: User) => {
    setSelectedUser(user);
    setIsDeleteOpen(true);
  };

  const confirmUpdate = async () => {
    if (!selectedUser) return;
    
    try {
      setIsSubmitting(true);
      const response = await fetch(`${API_URL}/admin/customers/${selectedUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify(editForm)
      });

      if (!response.ok) throw new Error('Failed to update');

      toast.success('User profile updated successfully');
      setIsEditOpen(false);
      fetchUsers();
    } catch (error) {
      console.error('Update error:', error);
      toast.error('Failed to update user profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmSuspend = async () => {
    if (!selectedUser) return;
    
    // Toggle logic: if suspended -> active, else -> suspended
    const isSuspended = selectedUser.status.toLowerCase() === 'suspended';
    const newStatus = isSuspended ? 'active' : 'suspended';
    
    try {
      setIsSubmitting(true);
      const response = await fetch(`${API_URL}/admin/customers/${selectedUser.id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) throw new Error('Failed to update status');

      toast.success(`User ${newStatus === 'suspended' ? 'suspended' : 'activated'} successfully`);
      setIsSuspendOpen(false);
      fetchUsers();
    } catch (error) {
      console.error('Status update error:', error);
      toast.error('Failed to update user status');
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!selectedUser) return;
    
    try {
      setIsSubmitting(true);
      const response = await fetch(`${API_URL}/admin/customers/${selectedUser.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`
        }
      });

      if (!response.ok) throw new Error('Failed to delete');

      toast.success('User deleted successfully');
      setIsDeleteOpen(false);
      fetchUsers();
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete user');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex gap-3 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search users by name, email, or role..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>
          <Button variant="outline" className="gap-2">
            <Filter className="w-4 h-4" /> Filter
          </Button>
        </div>
        <div className="flex gap-2">
           {users.length === 0 && (
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
          <Button className="bg-slate-900 text-white hover:bg-slate-800 gap-2" onClick={() => toast.info('Export started...')}>
            <Download className="w-4 h-4" /> Export Users
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center items-center text-slate-500">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            Loading users...
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <p>No users found.</p>
            <Button 
              variant="link" 
              onClick={handleGenerateData}
              className="mt-2 text-cyan-600"
            >
              Generate Test Data
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-6 py-4 font-medium">User Profile</th>
                  <th className="px-6 py-4 font-medium">Role</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Total Spend</th>
                  <th className="px-6 py-4 font-medium">Last Active</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/50 group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 border border-slate-200">
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-medium text-slate-900">{user.name}</div>
                          <div className="text-slate-500 text-xs flex items-center gap-2">
                            <span>{user.email}</span>
                            <span className="text-slate-300">•</span>
                            <span>Joined {user.joined}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="outline" className={
                        user.role === 'Admin' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                        user.role === 'Business Owner' ? 'bg-blue-50 text-blue-700 border-blue-200' : 
                        'bg-slate-50 text-slate-600 border-slate-200'
                      }>
                        {user.role}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize
                        ${user.status.toLowerCase() === 'active' ? 'bg-green-50 text-green-700 border-green-200' : 
                          user.status.toLowerCase() === 'reviewing' ? 'bg-orange-50 text-orange-700 border-orange-200' : 
                          'bg-red-50 text-red-700 border-red-200'}`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium">
                      R {user.spend.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {user.lastActive}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <ActionMenu 
                        user={user} 
                        onView={() => handleView(user)} 
                        onEdit={() => handleEdit(user)} 
                        onSuspend={() => handleSuspend(user)}
                        onDelete={() => handleDelete(user)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* VIEW MODAL */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>User Profile</DialogTitle>
            <DialogDescription>
              Detailed information for {selectedUser?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
             <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center font-bold text-2xl text-slate-600 border border-slate-200">
                   {selectedUser?.name.charAt(0)}
                </div>
                <div>
                   <h3 className="text-lg font-bold text-slate-900">{selectedUser?.name}</h3>
                   <Badge variant={selectedUser?.status.toLowerCase() === 'active' ? 'default' : 'destructive'}>
                     {selectedUser?.status}
                   </Badge>
                </div>
             </div>

             <div className="space-y-4">
                <div className="flex items-center gap-3 text-sm">
                   <Mail className="w-4 h-4 text-slate-400" />
                   <span className="text-slate-700">{selectedUser?.email}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                   <Phone className="w-4 h-4 text-slate-400" />
                   <span className="text-slate-700">{selectedUser?.mobile || 'No mobile number'}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                   <MapPin className="w-4 h-4 text-slate-400" />
                   <span className="text-slate-700">{selectedUser?.city || 'No city provided'}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                   <Calendar className="w-4 h-4 text-slate-400" />
                   <span className="text-slate-700">Joined {selectedUser?.joined}</span>
                </div>
                 <div className="flex items-center gap-3 text-sm">
                   <CreditCard className="w-4 h-4 text-slate-400" />
                   <span className="text-slate-700">Total Spend: R {selectedUser?.spend.toLocaleString()}</span>
                </div>
             </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewOpen(false)}>Close</Button>
            <Button onClick={() => { setIsViewOpen(false); if(selectedUser) handleEdit(selectedUser); }}>Edit Profile</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* EDIT MODAL */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update profile information for {selectedUser?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Full Name</Label>
              <Input 
                id="name" 
                value={editForm.name} 
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} 
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email Address</Label>
              <Input 
                id="email" 
                value={editForm.email} 
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} 
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div className="grid gap-2">
                <Label htmlFor="mobile">Mobile</Label>
                <Input 
                  id="mobile" 
                  value={editForm.mobile} 
                  onChange={(e) => setEditForm({ ...editForm, mobile: e.target.value })} 
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="city">City</Label>
                <Input 
                  id="city" 
                  value={editForm.city} 
                  onChange={(e) => setEditForm({ ...editForm, city: e.target.value })} 
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="affiliateCode">Affiliate Code</Label>
              <Input 
                id="affiliateCode" 
                value={editForm.affiliateCode} 
                onChange={(e) => setEditForm({ ...editForm, affiliateCode: e.target.value.toUpperCase() })} 
                placeholder="Enter affiliate code if missing"
                className="uppercase"
              />
              <p className="text-xs text-gray-500">
                Use this field to add or update the customer's affiliate code if they forgot to enter it during registration.
              </p>
            </div>
            <div className="grid gap-2">
               <Label htmlFor="status">Status</Label>
               <Select 
                  value={editForm.status} 
                  onValueChange={(val) => setEditForm({ ...editForm, status: val })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                    <SelectItem value="reviewing">Reviewing</SelectItem>
                  </SelectContent>
                </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
            <Button onClick={confirmUpdate} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* SUSPEND CONFIRMATION MODAL */}
      <Dialog open={isSuspendOpen} onOpenChange={setIsSuspendOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{selectedUser?.status.toLowerCase() === 'suspended' ? 'Reactivate Account' : 'Suspend Account'}</DialogTitle>
            <DialogDescription>
              Are you sure you want to {selectedUser?.status.toLowerCase() === 'suspended' ? 'reactivate' : 'suspend'} <b>{selectedUser?.name}</b>?
              {selectedUser?.status.toLowerCase() !== 'suspended' && " This will prevent them from logging in and making purchases."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSuspendOpen(false)}>Cancel</Button>
            <Button 
              variant={selectedUser?.status.toLowerCase() === 'suspended' ? 'default' : 'destructive'} 
              onClick={confirmSuspend}
              disabled={isSubmitting}
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              {selectedUser?.status.toLowerCase() === 'suspended' ? 'Reactivate' : 'Suspend Account'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DELETE CONFIRMATION MODAL */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Account</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <b>{selectedUser?.name}</b>?
              This action is irreversible and will permanently remove the user from the system.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>Cancel</Button>
            <Button 
              variant="destructive" 
              onClick={confirmDelete}
              disabled={isSubmitting}
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Delete Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}