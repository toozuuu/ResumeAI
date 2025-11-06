import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../config/api';
import toast from 'react-hot-toast';
import {
  Upload,
  FileText,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Loader,
  Download
} from 'lucide-react';
import ResumeAnalyzer from '../components/ResumeAnalyzer';
import UserProfile from '../components/UserProfile';
import AnalysisResults from '../components/AnalysisResults';

const Dashboard = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('analyze');
  const [userProfile, setUserProfile] = useState(null);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await api.get('/api/user/profile');
      setUserProfile(response.data);
    } catch (error) {
      console.error('Error fetching profile:', error);
      // Set demo profile in demo mode
      if (error.code === 'ERR_NETWORK' || error.response?.status === 500) {
        setUserProfile({
          email: 'demo@example.com',
          subscription: 'free',
          usage_count: 0,
          remaining_analyses: 3
        });
      }
    }
  };

  const handleAnalysisComplete = (results) => {
    setAnalysisResults(results);
    fetchUserProfile(); // Refresh usage stats
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome back, {currentUser?.email}</p>
      </div>

      {/* User Stats */}
      {userProfile && (
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Subscription</p>
                <p className="text-2xl font-bold text-gray-900 capitalize">
                  {userProfile.subscription}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-primary-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Remaining Analyses</p>
                <p className="text-2xl font-bold text-gray-900">
                  {userProfile.remaining_analyses === 'Unlimited' ? (
                    <span className="text-green-600">∞</span>
                  ) : (
                    userProfile.remaining_analyses
                  )}
                </p>
              </div>
              <FileText className="h-8 w-8 text-primary-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Analyses</p>
                <p className="text-2xl font-bold text-gray-900">
                  {userProfile.usage_count}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-primary-600" />
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('analyze')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'analyze'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Analyze Resume
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'profile'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Profile & Settings
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'analyze' && (
        <ResumeAnalyzer onAnalysisComplete={handleAnalysisComplete} />
      )}

      {activeTab === 'profile' && (
        <UserProfile userProfile={userProfile} onUpdate={fetchUserProfile} />
      )}

      {/* Analysis Results */}
      {analysisResults && (
        <AnalysisResults results={analysisResults} />
      )}
    </div>
  );
};

export default Dashboard;

