import React, { useState } from 'react';
import { Loader, Copy, Download } from 'lucide-react';
import api from '../config/api';
import toast from 'react-hot-toast';

const CoverLetterGenerator = ({ resumeText, jobDescription }) => {
  const [recipientName, setRecipientName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!resumeText || !jobDescription) {
      toast.error('Resume and job description are required');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/api/generate-cover-letter', {
        resume_text: resumeText,
        job_description: jobDescription,
        recipient_name: recipientName || null,
        company_name: companyName || null,
      });

      setCoverLetter(response.data.cover_letter);
      toast.success('Cover letter generated!');
    } catch (error) {
      toast.error('Error generating cover letter: ' + (error.response?.data?.detail || error.message));
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(coverLetter);
    toast.success('Cover letter copied!');
  };

  const downloadAsText = () => {
    const element = document.createElement('a');
    const file = new Blob([coverLetter], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = 'cover-letter.txt';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Recipient Name (Optional)
          </label>
          <input
            type="text"
            value={recipientName}
            onChange={(e) => setRecipientName(e.target.value)}
            placeholder="Hiring Manager"
            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Company Name (Optional)
          </label>
          <input
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="Company Name"
            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      </div>

      <button
        onClick={handleGenerate}
        disabled={loading}
        className="w-full bg-primary-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition flex items-center justify-center space-x-2"
      >
        {loading ? (
          <>
            <Loader className="h-5 w-5 animate-spin" />
            <span>Generating...</span>
          </>
        ) : (
          <span>Generate Cover Letter</span>
        )}
      </button>

      {coverLetter && (
        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
          <div className="flex items-center justify-end space-x-2 mb-4">
            <button
              onClick={copyToClipboard}
              className="flex items-center space-x-1 text-primary-600 hover:text-primary-700 text-sm"
            >
              <Copy className="h-4 w-4" />
              <span>Copy</span>
            </button>
            <button
              onClick={downloadAsText}
              className="flex items-center space-x-1 text-primary-600 hover:text-primary-700 text-sm"
            >
              <Download className="h-4 w-4" />
              <span>Download</span>
            </button>
          </div>
          <div className="prose max-w-none">
            <p className="text-gray-700 whitespace-pre-wrap">{coverLetter}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CoverLetterGenerator;

