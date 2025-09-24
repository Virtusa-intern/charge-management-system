import React, { useState, useEffect } from 'react';
import { apiService } from '../utils/api';

const TestExecution = () => {
  const [testSuites, setTestSuites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [testResults, setTestResults] = useState(null);
  const [selectedSuite, setSelectedSuite] = useState('');
  const [customTest, setCustomTest] = useState({
    name: '',
    description: '',
    customerCode: 'CUST001',
    transactions: []
  });
  const [showCustomForm, setShowCustomForm] = useState(false);

  const predefinedSuites = [
    {
      id: 'comprehensive',
      name: 'Comprehensive Test Suite',
      description: 'Tests all rule categories with multiple scenarios',
      customerTypes: ['RETAIL', 'CORPORATE'],
      estimatedDuration: '2-3 minutes'
    },
    {
      id: 'atm_scenarios',
      name: 'ATM Transaction Tests',
      description: 'Focus on ATM withdrawal charges',
      customerTypes: ['RETAIL'],
      estimatedDuration: '1 minute'
    },
    {
      id: 'funds_transfer',
      name: 'Funds Transfer Tests',
      description: 'Various funds transfer scenarios',
      customerTypes: ['RETAIL', 'CORPORATE'],
      estimatedDuration: '1-2 minutes'
    },
    {
      id: 'special_services',
      name: 'Special Services Tests',
      description: 'Card replacement, statement printing etc.',
      customerTypes: ['RETAIL'],
      estimatedDuration: '30 seconds'
    },
    {
      id: 'edge_cases',
      name: 'Edge Case Tests',
      description: 'Boundary conditions and special scenarios',
      customerTypes: ['RETAIL', 'CORPORATE'],
      estimatedDuration: '1 minute'
    }
  ];

  useEffect(() => {
    setTestSuites(predefinedSuites);
  }, []);

  const runTestSuite = async (suiteId) => {
    setLoading(true);
    setError(null);
    setTestResults(null);

    try {
      const testRequest = {
        testSuiteId: suiteId,
        runAll: true,
        saveResults: true,
        generateReport: true,
        timestamp: new Date().toISOString()
      };

      const response = await apiService.testChargeCalculation(testRequest);
      
      if (response.data.success) {
        setTestResults(response.data.data);
      } else {
        setError(response.data.error || 'Test execution failed');
      }
    } catch (err) {
      setError('Test execution failed: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  const runQuickTest = async () => {
    setLoading(true);
    setError(null);
    setTestResults(null);

    try {
      const response = await apiService.quickChargeTest();
      
      if (response.data.success) {
        setTestResults({
          testSuiteName: 'Quick Test',
          totalTests: 1,
          passedTests: response.data.data.totalCharges >= 0 ? 1 : 0,
          failedTests: response.data.data.totalCharges >= 0 ? 0 : 1,
          executionTime: '< 1s',
          results: [response.data.data]
        });
      } else {
        setError('Quick test failed');
      }
    } catch (err) {
      setError('Quick test failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const addTransactionToCustomTest = () => {
    setCustomTest({
      ...customTest,
      transactions: [...customTest.transactions, {
        transactionType: 'ATM_WITHDRAWAL_PARENT',
        amount: 1000,
        channel: 'ATM',
        description: 'Custom test transaction'
      }]
    });
  };

  const removeTransactionFromCustomTest = (index) => {
    setCustomTest({
      ...customTest,
      transactions: customTest.transactions.filter((_, i) => i !== index)
    });
  };

  const runCustomTest = async () => {
    if (customTest.transactions.length === 0) {
      setError('Please add at least one transaction to the custom test');
      return;
    }

    setLoading(true);
    setError(null);
    setTestResults(null);

    try {
      const testRequest = {
        customerCode: customTest.customerCode,
        testTransactions: customTest.transactions,
        saveResults: false,
        testDescription: customTest.description || 'Custom Test Suite'
      };

      const response = await apiService.testChargeCalculation(testRequest);
      
      if (response.data.success) {
        setTestResults(response.data.data);
        setShowCustomForm(false);
      } else {
        setError(response.data.error || 'Custom test failed');
      }
    } catch (err) {
      setError('Custom test failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const getResultColor = (passed, total) => {
    const percentage = (passed / total) * 100;
    if (percentage === 100) return 'text-green-600';
    if (percentage >= 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatDuration = (ms) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Test Execution</h1>
        <p className="text-gray-600">Run comprehensive tests on your charge calculation rules</p>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <div className="flex">
            <span className="text-red-500 text-xl mr-2">×</span>
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
        <div className="flex flex-wrap gap-4">
          <button
            onClick={runQuickTest}
            disabled={loading}
            className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 disabled:bg-gray-300 transition-colors"
          >
            {loading ? 'Running...' : '⚡ Quick Test'}
          </button>
          
          <button
            onClick={() => runTestSuite('comprehensive')}
            disabled={loading}
            className="bg-purple-500 text-white px-6 py-2 rounded-md hover:bg-purple-600 disabled:bg-gray-300 transition-colors"
          >
            {loading ? 'Running...' : '🧪 Run All Tests'}
          </button>
          
          <button
            onClick={() => setShowCustomForm(!showCustomForm)}
            className="bg-green-500 text-white px-6 py-2 rounded-md hover:bg-green-600 transition-colors"
          >
            ➕ Custom Test
          </button>
        </div>
      </div>

      {/* Custom Test Form */}
      {showCustomForm && (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Create Custom Test</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Test Name</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={customTest.name}
                onChange={(e) => setCustomTest({...customTest, name: e.target.value})}
                placeholder="My Custom Test"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Customer Code</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={customTest.customerCode}
                onChange={(e) => setCustomTest({...customTest, customerCode: e.target.value})}
              >
                <option value="CUST001">CUST001 - John Doe (Retail)</option>
                <option value="CUST002">CUST002 - Jane Smith (Corporate)</option>
                <option value="CUST003">CUST003 - Bob Wilson (Premium)</option>
              </select>
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="2"
              value={customTest.description}
              onChange={(e) => setCustomTest({...customTest, description: e.target.value})}
              placeholder="Describe what this test verifies..."
            />
          </div>

          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">Test Transactions</label>
              <button
                onClick={addTransactionToCustomTest}
                className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
              >
                Add Transaction
              </button>
            </div>
            
            {customTest.transactions.length > 0 ? (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {customTest.transactions.map((transaction, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded">
                    <div>
                      <span className="font-medium">{transaction.transactionType}</span>
                      <span className="text-gray-600 ml-2">₹{transaction.amount} via {transaction.channel}</span>
                    </div>
                    <button
                      onClick={() => removeTransactionFromCustomTest(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded">
                <p className="text-gray-500">No transactions added yet</p>
              </div>
            )}
          </div>

          <div className="flex space-x-4">
            <button
              onClick={runCustomTest}
              disabled={loading || customTest.transactions.length === 0}
              className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 disabled:bg-gray-300"
            >
              {loading ? 'Running...' : 'Run Custom Test'}
            </button>
            
            <button
              onClick={() => setShowCustomForm(false)}
              className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Test Suites */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 mb-6">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">Predefined Test Suites</h3>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {testSuites.map((suite) => (
              <div key={suite.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <h4 className="font-semibold text-gray-800 mb-2">{suite.name}</h4>
                <p className="text-sm text-gray-600 mb-3">{suite.description}</p>
                
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Customer Types:</span>
                    <span className="text-gray-700">{suite.customerTypes.join(', ')}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Duration:</span>
                    <span className="text-gray-700">{suite.estimatedDuration}</span>
                  </div>
                </div>
                
                <button
                  onClick={() => runTestSuite(suite.id)}
                  disabled={loading}
                  className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:bg-gray-300 transition-colors text-sm"
                >
                  {loading ? 'Running...' : 'Run Test Suite'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Test Results */}
      {testResults && (
        <div className="bg-white rounded-lg shadow-md border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">Test Results</h3>
          </div>
          
          <div className="p-6">
            {/* Results Summary */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h4 className="font-semibold text-blue-800 mb-3">Execution Summary</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-blue-600">Suite:</span> {testResults.testSuiteName || 'Custom Test'}
                </div>
                <div>
                  <span className="text-blue-600">Total Tests:</span> {testResults.totalTransactionsTested || testResults.totalTests}
                </div>
                <div>
                  <span className="text-blue-600">Passed:</span> 
                  <span className={`ml-1 font-semibold ${getResultColor(testResults.transactionsWithCharges || testResults.passedTests, testResults.totalTransactionsTested || testResults.totalTests)}`}>
                    {testResults.transactionsWithCharges || testResults.passedTests}
                  </span>
                </div>
                <div>
                  <span className="text-blue-600">Duration:</span> {testResults.executionTime || formatDuration(testResults.processingTimeMs)}
                </div>
              </div>
              
              {testResults.totalChargesAcrossAllTransactions && (
                <div className="mt-3 pt-3 border-t border-blue-200">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-blue-800">Total Charges Calculated:</span>
                    <span className="text-xl font-bold text-blue-900">
                      ₹{testResults.totalChargesAcrossAllTransactions}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Individual Results */}
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {(testResults.transactionResults || testResults.results || []).map((result, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h5 className="font-medium text-gray-800">
                        {result.description || `Test ${index + 1}`}
                      </h5>
                      <p className="text-sm text-gray-600">
                        {result.transactionType} - ₹{result.transactionAmount || result.amount} via {result.channel}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`text-lg font-bold ${result.totalChargeForTransaction >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        ₹{result.totalChargeForTransaction || result.totalCharges || '0.00'}
                      </span>
                      <p className="text-xs text-gray-500">
                        {result.rulesApplied || result.calculatedCharges?.length || 0} rule(s) applied
                      </p>
                    </div>
                  </div>
                  
                  {(result.applicableCharges || result.calculatedCharges)?.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-gray-100">
                      <div className="space-y-1">
                        {(result.applicableCharges || result.calculatedCharges).map((charge, chargeIndex) => (
                          <div key={chargeIndex} className="flex justify-between items-center text-sm">
                            <span className="text-gray-600">{charge.ruleCode}: {charge.ruleName}</span>
                            <span className="font-medium text-gray-800">₹{charge.chargeAmount}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div className="text-center py-12">
          <div className="inline-flex items-center">
            <svg className="animate-spin h-8 w-8 text-blue-600 mr-3" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
            </svg>
            <span className="text-gray-600 font-medium">Running tests...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestExecution;