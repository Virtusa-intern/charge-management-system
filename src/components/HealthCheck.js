// src/components/HealthCheck.js - Component to test backend connectivity with Tailwind CSS
import React, { useState, useEffect } from 'react';
import { apiService } from '../utils/api';

const HealthCheck = () => {
  const [healthData, setHealthData] = useState(null);
  const [welcomeData, setWelcomeData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastChecked, setLastChecked] = useState(null);

  // Function to fetch health data
  const fetchHealthData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [healthResponse, welcomeResponse] = await Promise.all([
        apiService.healthCheck(),
        apiService.welcome()
      ]);
      
      setHealthData(healthResponse.data);
      setWelcomeData(welcomeResponse.data);
      setLastChecked(new Date().toLocaleString());
      
      console.log('✅ Backend connection successful');
      console.log('Health data:', healthResponse.data);
      console.log('Welcome data:', welcomeResponse.data);
      
    } catch (err) {
      setError(err.message || 'Failed to connect to backend');
      console.error('❌ Backend connection failed:', err);
    } finally {
      setLoading(false);
    }
  };

  // Auto-fetch on component mount
  useEffect(() => {
    fetchHealthData();
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="card overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">🔗 Backend Connection Test</h2>
            <button 
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                loading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-green-500 hover:bg-green-600 hover:shadow-md hover:-translate-y-0.5'
              }`}
              onClick={fetchHealthData}
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                  Checking...
                </span>
              ) : '🔄 Refresh'}
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          {/* Error Alert */}
          {error && (
            <div className="alert-error mb-6">
              <div className="flex items-start">
                <span className="text-red-500 text-xl mr-2">❌</span>
                <div>
                  <strong className="font-semibold">Connection Failed:</strong>
                  <p className="mt-1">{error}</p>
                  <div className="mt-3 text-sm space-y-1">
                    <p>Make sure your Spring Boot backend is running on port 8080</p>
                    <p className="font-mono text-xs bg-red-100 p-2 rounded">
                      Backend URL: http://localhost:8080/charge-mgmt/api
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Success Alert and Data */}
          {healthData && !error && (
            <>
              <div className="alert-success mb-6">
                <div className="flex items-center">
                  <span className="text-green-500 text-xl mr-2">✅</span>
                  <div>
                    <strong className="font-semibold">Backend Connected Successfully!</strong>
                    {lastChecked && (
                      <small className="block text-green-600 mt-1">
                        Last checked: {lastChecked}
                      </small>
                    )}
                  </div>
                </div>
              </div>

              {/* Health Check Data */}
              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  🏥 Health Check Response
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-600">Status:</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                        healthData.status === 'UP' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {healthData.status}
                      </span>
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-600">Service:</span>
                      <span className="text-gray-800 text-sm text-right">
                        {healthData.service}
                      </span>
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-600">Version:</span>
                      <span className="text-gray-800 font-mono">{healthData.version}</span>
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-600">Timestamp:</span>
                      <span className="text-gray-800 text-sm text-right">
                        {new Date(healthData.timestamp).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Welcome Data */}
              {welcomeData && (
                <div className="bg-blue-50 rounded-lg p-6 mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    👋 Welcome Message Response
                  </h3>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="bg-white p-4 rounded-lg border border-blue-200">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                        <span className="font-medium text-gray-600 mb-2 sm:mb-0">Message:</span>
                        <span className="text-gray-800">{welcomeData.message}</span>
                      </div>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-blue-200">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                        <span className="font-medium text-gray-600 mb-2 sm:mb-0">Description:</span>
                        <span className="text-gray-800 text-right">{welcomeData.description}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Connection Details */}
              <div className="bg-green-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  📊 Connection Details
                </h3>
                <div className="bg-white p-4 rounded-lg border border-green-200 space-y-2">
                  <div className="flex justify-between items-center py-1">
                    <span className="font-medium text-gray-600">Backend URL:</span>
                    <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                      http://localhost:8080/charge-mgmt
                    </code>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="font-medium text-gray-600">Frontend URL:</span>
                    <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                      http://localhost:3000
                    </code>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="font-medium text-gray-600">API Communication:</span>
                    <span className="text-green-600 font-medium">✅ Working</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="font-medium text-gray-600">CORS Status:</span>
                    <span className="text-green-600 font-medium">✅ Configured</span>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Loading State */}
          {loading && !healthData && !error && (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                <svg className="animate-spin h-8 w-8 text-blue-600" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                </svg>
              </div>
              <p className="text-gray-600 font-medium">Connecting to backend server...</p>
              <p className="text-gray-500 text-sm mt-1">Please wait while we establish connection</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HealthCheck;