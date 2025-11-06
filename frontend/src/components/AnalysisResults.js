import React, { useState } from 'react';
import { TrendingUp, AlertCircle, CheckCircle, Copy, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import CoverLetterGenerator from './CoverLetterGenerator';

const AnalysisResults = ({ results }) => {
  const [showCoverLetter, setShowCoverLetter] = useState(false);

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBg = (score) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  return (
    <div className="mt-8 space-y-6">
      {/* Match Score */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-2xl font-bold text-gray-900">Match Score</h3>
          <div className={`text-4xl font-bold ${getScoreColor(results.match_score)}`}>
            {results.match_score.toFixed(1)}%
          </div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4">
          <div
            className={`h-4 rounded-full transition-all ${getScoreBg(results.match_score)} ${getScoreColor(results.match_score)}`}
            style={{ width: `${results.match_score}%` }}
          ></div>
        </div>
      </div>

      {/* Keywords */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center space-x-2 mb-4">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <h3 className="text-xl font-bold text-gray-900">Keywords Present</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {results.keywords_present.length > 0 ? (
              results.keywords_present.map((keyword, index) => (
                <span
                  key={index}
                  className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm"
                >
                  {keyword}
                </span>
              ))
            ) : (
              <p className="text-gray-500">No keywords found</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center space-x-2 mb-4">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <h3 className="text-xl font-bold text-gray-900">Missing Keywords</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {results.keywords_missing.length > 0 ? (
              results.keywords_missing.map((keyword, index) => (
                <span
                  key={index}
                  className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm"
                >
                  {keyword}
                </span>
              ))
            ) : (
              <p className="text-gray-500">No missing keywords!</p>
            )}
          </div>
        </div>
      </div>

      {/* Suggestions */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center space-x-2 mb-4">
          <TrendingUp className="h-5 w-5 text-primary-600" />
          <h3 className="text-xl font-bold text-gray-900">Improvement Suggestions</h3>
        </div>
        <ul className="space-y-3">
          {results.suggestions.map((suggestion, index) => (
            <li key={index} className="flex items-start space-x-3">
              <span className="flex-shrink-0 w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-sm font-semibold">
                {index + 1}
              </span>
              <p className="text-gray-700">{suggestion}</p>
            </li>
          ))}
        </ul>
      </div>

      {/* Rewritten Sections */}
      {results.rewritten_sections && Object.keys(results.rewritten_sections).length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">AI-Rewritten Sections</h3>
          <div className="space-y-4">
            {Object.entries(results.rewritten_sections).map(([section, content]) => (
              <div key={section} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-gray-900 capitalize">{section}</h4>
                  <button
                    onClick={() => copyToClipboard(content)}
                    className="text-primary-600 hover:text-primary-700 text-sm flex items-center space-x-1"
                  >
                    <Copy className="h-4 w-4" />
                    <span>Copy</span>
                  </button>
                </div>
                <p className="text-gray-700 whitespace-pre-wrap">{content}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Cover Letter Generator */}
      {results.resume_text && results.job_description && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-900">Cover Letter</h3>
            <button
              onClick={() => setShowCoverLetter(!showCoverLetter)}
              className="text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              {showCoverLetter ? 'Hide' : 'Generate Cover Letter'}
            </button>
          </div>
          {showCoverLetter && (
            <CoverLetterGenerator
              resumeText={results.resume_text}
              jobDescription={results.job_description}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default AnalysisResults;

