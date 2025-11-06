import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User, CreditCard, LogOut } from 'lucide-react';

const UserProfile = ({ userProfile, onUpdate }) => {
  const navigate = useNavigate();

  const handleUpgrade = () => {
    navigate('/pricing');
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Profile & Settings</h2>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email
          </label>
          <input
            type="email"
            value={userProfile?.email || ''}
            disabled
            className="w-full border border-gray-300 rounded-lg p-3 bg-gray-50 text-gray-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Subscription Tier
          </label>
          <div className="flex items-center justify-between">
            <span className="text-lg font-semibold text-gray-900 capitalize">
              {userProfile?.subscription || 'Free'}
            </span>
            {userProfile?.subscription === 'free' && (
              <button
                onClick={handleUpgrade}
                className="bg-primary-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-700 transition"
              >
                Upgrade
              </button>
            )}
          </div>
        </div>

        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Usage Statistics</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Total Analyses</p>
              <p className="text-2xl font-bold text-gray-900">
                {userProfile?.usage_count || 0}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Remaining This Month</p>
              <p className="text-2xl font-bold text-gray-900">
                {userProfile?.remaining_analyses === 'Unlimited' ? (
                  <span className="text-green-600">∞</span>
                ) : (
                  userProfile?.remaining_analyses || 0
                )}
              </p>
            </div>
          </div>
        </div>

        {userProfile?.subscription !== 'free' && (
          <div className="border-t pt-6">
            <button className="flex items-center space-x-2 text-gray-700 hover:text-gray-900">
              <CreditCard className="h-5 w-5" />
              <span>Manage Subscription</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;

