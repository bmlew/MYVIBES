import React from 'react';
import { X, UserPlus, Edit2, AlertTriangle, Mail, Phone as PhoneIcon, CreditCard, Code } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

interface Affiliate {
  id: string;
  name: string;
  email: string;
  phone: string;
  code: string;
  status: string;
  bank_details?: {
    bank_name: string;
    account_number: string;
    branch_code: string;
  };
}

interface CreateModalProps {
  show: boolean;
  onClose: () => void;
  newAffiliate: {
    name: string;
    email: string;
    phone: string;
    code: string;
    bank_name: string;
    account_number: string;
    branch_code: string;
  };
  setNewAffiliate: React.Dispatch<React.SetStateAction<{
    name: string;
    email: string;
    phone: string;
    code: string;
    bank_name: string;
    account_number: string;
    branch_code: string;
  }>>;
  onCreate: () => void;
  creating: boolean;
}

interface EditModalProps {
  show: boolean;
  onClose: () => void;
  editForm: {
    name: string;
    email: string;
    phone: string;
    status: string;
    bank_name: string;
    account_number: string;
    branch_code: string;
  };
  setEditForm: React.Dispatch<React.SetStateAction<{
    name: string;
    email: string;
    phone: string;
    status: string;
    bank_name: string;
    account_number: string;
    branch_code: string;
  }>>;
  onUpdate: () => void;
  updating: boolean;
  affiliate: Affiliate | null;
}

interface DeleteModalProps {
  show: boolean;
  onClose: () => void;
  onDelete: () => void;
  deleting: boolean;
  affiliate: Affiliate | null;
}

export function CreateAffiliateModal({ show, onClose, newAffiliate, setNewAffiliate, onCreate, creating }: CreateModalProps) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-500 p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                <UserPlus className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Add New Affiliate</h2>
                <p className="text-purple-100 text-sm mt-1">Create a new partner account</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Required Fields */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    type="text"
                    value={newAffiliate.name}
                    onChange={(e) => setNewAffiliate({ ...newAffiliate, name: e.target.value })}
                    placeholder="John Doe"
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    type="email"
                    value={newAffiliate.email}
                    onChange={(e) => setNewAffiliate({ ...newAffiliate, email: e.target.value })}
                    placeholder="john@example.com"
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <PhoneIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    type="tel"
                    value={newAffiliate.phone}
                    onChange={(e) => setNewAffiliate({ ...newAffiliate, phone: e.target.value })}
                    placeholder="+27 XX XXX XXXX"
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Referral Code (Optional)
                </label>
                <div className="relative">
                  <Code className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    type="text"
                    value={newAffiliate.code}
                    onChange={(e) => setNewAffiliate({ ...newAffiliate, code: e.target.value.toUpperCase() })}
                    placeholder="Leave empty to auto-generate"
                    className="pl-10 font-mono"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Auto-generated if left empty</p>
              </div>
            </div>
          </div>

          {/* Bank Details */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Bank Details (Optional)</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bank Name</label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    type="text"
                    value={newAffiliate.bank_name}
                    onChange={(e) => setNewAffiliate({ ...newAffiliate, bank_name: e.target.value })}
                    placeholder="FNB, Standard Bank, etc."
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Account Number</label>
                  <Input
                    type="text"
                    value={newAffiliate.account_number}
                    onChange={(e) => setNewAffiliate({ ...newAffiliate, account_number: e.target.value })}
                    placeholder="1234567890"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Branch Code</label>
                  <Input
                    type="text"
                    value={newAffiliate.branch_code}
                    onChange={(e) => setNewAffiliate({ ...newAffiliate, branch_code: e.target.value })}
                    placeholder="250655"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 p-6 rounded-b-2xl flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={creating}
          >
            Cancel
          </Button>
          <Button
            onClick={onCreate}
            disabled={creating}
            className="bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white"
          >
            {creating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Creating...
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4 mr-2" />
                Create Affiliate
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

export function EditAffiliateModal({ show, onClose, editForm, setEditForm, onUpdate, updating, affiliate }: EditModalProps) {
  if (!show || !affiliate) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                <Edit2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Edit Affiliate</h2>
                <p className="text-blue-100 text-sm mt-1">Update partner information</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Affiliate Code (Read-only) */}
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Affiliate Code</p>
                <p className="text-2xl font-bold font-mono text-purple-600">{affiliate.code}</p>
              </div>
              <Code className="w-8 h-8 text-purple-400" />
            </div>
          </div>

          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <Input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <Input
                  type="tel"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  placeholder="+27 XX XXX XXXX"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status <span className="text-red-500">*</span>
                </label>
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="approved">Approved</option>
                  <option value="pending">Pending</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>
          </div>

          {/* Bank Details */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Bank Details</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bank Name</label>
                <Input
                  type="text"
                  value={editForm.bank_name}
                  onChange={(e) => setEditForm({ ...editForm, bank_name: e.target.value })}
                  placeholder="FNB, Standard Bank, etc."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Account Number</label>
                  <Input
                    type="text"
                    value={editForm.account_number}
                    onChange={(e) => setEditForm({ ...editForm, account_number: e.target.value })}
                    placeholder="1234567890"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Branch Code</label>
                  <Input
                    type="text"
                    value={editForm.branch_code}
                    onChange={(e) => setEditForm({ ...editForm, branch_code: e.target.value })}
                    placeholder="250655"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 p-6 rounded-b-2xl flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={updating}
          >
            Cancel
          </Button>
          <Button
            onClick={onUpdate}
            disabled={updating}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
          >
            {updating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Updating...
              </>
            ) : (
              <>
                <Edit2 className="w-4 h-4 mr-2" />
                Update Affiliate
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

export function DeleteAffiliateModal({ show, onClose, onDelete, deleting, affiliate }: DeleteModalProps) {
  if (!show || !affiliate) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 p-6 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white bg-opacity-20 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Delete Affiliate</h2>
              <p className="text-red-100 text-sm mt-1">This action cannot be undone</p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-red-800 font-medium">Warning!</p>
                <p className="text-sm text-red-700 mt-1">
                  You are about to permanently delete this affiliate. All associated data including referrals and earnings will be removed.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-sm text-gray-600">Name:</span>
              <span className="font-medium text-gray-900">{affiliate.name}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-sm text-gray-600">Email:</span>
              <span className="font-medium text-gray-900">{affiliate.email}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-sm text-gray-600">Code:</span>
              <span className="font-mono font-semibold text-purple-600">{affiliate.code}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 p-6 rounded-b-2xl flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={deleting}
          >
            Cancel
          </Button>
          <Button
            onClick={onDelete}
            disabled={deleting}
            className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white"
          >
            {deleting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Deleting...
              </>
            ) : (
              <>
                <AlertTriangle className="w-4 h-4 mr-2" />
                Delete Affiliate
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
