import React, { useState } from 'react';
import { Upload, Link as LinkIcon, Loader, FileText } from 'lucide-react';
import api from '../config/api';
import toast from 'react-hot-toast';

const ResumeAnalyzer = ({ onAnalysisComplete }) => {
  const [resumeText, setResumeText] = useState('');
  const [jobUrl, setJobUrl] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await api.post('/api/upload-resume', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setResumeText(response.data.resume_text);
      toast.success('Resume uploaded successfully!');
    } catch (error) {
      toast.error('Error uploading resume: ' + (error.response?.data?.detail || error.message));
    } finally {
      setUploading(false);
    }
  };

  const handleAnalyze = async () => {
    if (!resumeText.trim()) {
      toast.error('Please provide your resume');
      return;
    }

    if (!jobUrl.trim() && !jobDescription.trim()) {
      toast.error('Please provide a job URL or job description');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/api/analyze', {
        resume_text: resumeText,
        job_url: jobUrl || null,
        job_description: jobDescription || null,
      });

      toast.success('Analysis complete!');
      onAnalysisComplete(response.data);
    } catch (error) {
      toast.error('Error analyzing resume: ' + (error.response?.data?.detail || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Analyze Your Resume</h2>

      {/* Resume Input */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Resume Text
        </label>
        <div className="flex space-x-2 mb-2">
          <label className="flex-1 cursor-pointer">
            <input
              type="file"
              accept=".pdf,.doc,.docx,.txt"
              onChange={handleFileUpload}
              className="hidden"
            />
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-primary-500 transition">
              {uploading ? (
                <Loader className="h-6 w-6 animate-spin mx-auto text-primary-600" />
              ) : (
                <>
                  <Upload className="h-6 w-6 mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600">Upload Resume (PDF, DOCX, TXT)</p>
                </>
              )}
            </div>
          </label>
        </div>
        <textarea
          value={resumeText}
          onChange={(e) => setResumeText(e.target.value)}
          placeholder="Or paste your resume text here..."
          className="w-full border border-gray-300 rounded-lg p-4 h-48 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
      </div>

      {/* Job Description Input */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Job Description
        </label>
        <div className="mb-2">
          <div className="flex items-center space-x-2 mb-2">
            <LinkIcon className="h-5 w-5 text-gray-400" />
            <input
              type="url"
              value={jobUrl}
              onChange={(e) => setJobUrl(e.target.value)}
              placeholder="Paste job posting URL (LinkedIn, Indeed, etc.)"
              className="flex-1 border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <p className="text-sm text-gray-500 mb-2">OR</p>
        </div>
        <textarea
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          placeholder="Paste job description here..."
          className="w-full border border-gray-300 rounded-lg p-4 h-32 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
      </div>

      <button
        onClick={handleAnalyze}
        disabled={loading || !resumeText.trim() || (!jobUrl.trim() && !jobDescription.trim())}
        className="w-full bg-primary-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition flex items-center justify-center space-x-2"
      >
        {loading ? (
          <>
            <Loader className="h-5 w-5 animate-spin" />
            <span>Analyzing...</span>
          </>
        ) : (
          <>
            <FileText className="h-5 w-5" />
            <span>Analyze Resume</span>
          </>
        )}
      </button>
    </div>
  );
};

export default ResumeAnalyzer;

