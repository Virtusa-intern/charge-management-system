// src/components/ChargeCalculator.js - Main charge calculation interface
import React, { useState, useEffect } from 'react';
import { apiService } from '../utils/api';

const ChargeCalculator = () => {
  const [activeTab, setActiveTab] = useState('single');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Single transaction state
  const [transactionForm, setTransactionForm] = useState({
    transactionId: '',
    customerCode: 'CUST001',
    transactionType: 'ATM_WITHDRAWAL_PARENT',
    amount: '1000',
    channel: 'ATM',
    sourceAccount: '',
    destinationAccount: ''
  });
  const [calculationResult, setCalculationResult] = useState(null);
  
  // Test scenarios state
  const [testScenarios, setTestScenarios] = useState({});
  const [selectedCustomer, setSelectedCustomer] = useState('CUST001');
  const [selectedScenarios, setSelectedScenarios] = useState([]);
  const [testResult, setTestResult] = useState(null);
  
  // Bulk calculation state
  const [bulkTransactions, setBulkTransactions] = useState([]);
  const [bulkResult, setBulkResult] = useState(null);
  
  // Statistics
  const [statistics, setStatistics] = useState({});

  // Load test scenarios on component mount
  useEffect(() => {
    fetchTestScenarios();
    fetchStatistics();
    generateTransactionId();
  }, []);

  // Generate unique transaction ID
  const generateTransactionId = () => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    setTransactionForm(prev => ({
      ...prev,
      transactionId: `TXN_${timestamp}_${random}`
    }));
  };

  // Fetch test scenarios from backend
  const fetchTestScenarios = async () => {
    try {
      const response = await apiService.getChargeTestScenarios();
      setTestScenarios(response.data.data);
    } catch (err) {
      console.error('Error fetching test scenarios:', err);
    }
  };

  // Fetch statistics
  const fetchStatistics = async () => {
    try {
      const response = await apiService.getChargeStatistics();
      setStatistics(response.data.data);
    } catch (err) {
      console.error('Error fetching statistics:', err);
    }
  };

  // Handle form input changes
  const handleFormChange = (field, value) => {
    setTransactionForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Calculate single transaction charges
  const calculateSingleTransaction = async () => {
    setLoading(true);
    setError(null);
    setCalculationResult(null);

    try {
      const response = await apiService.calculateCharges({
        ...transactionForm,
        amount: parseFloat(transactionForm.amount),
        transactionDate: new Date().toISOString()
      });

      if (response.data.success) {
        setCalculationResult(response.data.data);
      } else {
        setError(response.data.error || 'Calculation failed');
      }
    } catch (err) {
      setError('Failed to calculate charges: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  // Run test scenarios
  const runTestScenarios = async () => {
    if (selectedScenarios.length === 0) {
      setError('Please select at least one test scenario');
      return;
    }

    setLoading(true);
    setError(null);
    setTestResult(null);

    try {
      const testRequest = {
        customerCode: selectedCustomer,
        testTransactions: selectedScenarios,
        saveResults: false,
        testDescription: 'React Frontend Test'
      };

      const response = await apiService.testChargeCalculation(testRequest);

      if (response.data.success) {
        setTestResult(response.data.data);
      } else {
        setError(response.data.error || 'Test failed');
      }
    } catch (err) {
      setError('Test failed: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  // Add transaction to bulk list
  const addToBulkList = () => {
    const newTransaction = {
      ...transactionForm,
      amount: parseFloat(transactionForm.amount),
      transactionDate: new Date().toISOString()
    };

    setBulkTransactions(prev => [...prev, newTransaction]);
    generateTransactionId(); // Generate new ID for next transaction
  };

  // Remove transaction from bulk list
  const removeFromBulkList = (index) => {
    setBulkTransactions(prev => prev.filter((_, i) => i !== index));
  };

  // Process bulk calculations
  const processBulkCalculations = async () => {
    if (bulkTransactions.length === 0) {
      setError('Please add at least one transaction to bulk list');
      return;
    }

    setLoading(true);
    setError(null);
    setBulkResult(null);

    try {
      const bulkRequest = {
        transactions: bulkTransactions,
        saveResults: false,
        stopOnError: false,
        batchId: `BATCH_${Date.now()}`,
        description: 'React Frontend Bulk Test'
      };

      const response = await apiService.bulkCalculateCharges(bulkRequest);

      if (response.data.success) {
        setBulkResult(response.data.data);
      } else {
        setError(response.data.error || 'Bulk calculation failed');
      }
    } catch (err) {
      setError('Bulk calculation failed: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  // Toggle scenario selection
  const toggleScenario = (scenario) => {
    setSelectedScenarios(prev => {
      const isSelected = prev.some(s => s.transactionType === scenario.transactionType && s.amount === scenario.amount);
      if (isSelected) {
        return prev.filter(s => !(s.transactionType === scenario.transactionType && s.amount === scenario.amount));
      } else {
        return [...prev, {
          transactionType: scenario.transactionType,
          amount: scenario.amount,
          channel: scenario.channel,
          description: scenario.description
        }];
      }
    });
  };

  // Get charge amount color based on value
  const getChargeColor = (amount) => {
    if (amount === 0) return 'text-green-600';
    if (amount < 50) return 'text-yellow-600';
    if (amount < 200) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">💰 Charge Calculator</h1>
        <p className="text-gray-600">Calculate banking charges using your business rules</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <span className="text-2xl">📊</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">System Status</p>
              <p className="text-lg font-bold text-green-600">{statistics.systemStatus || 'OPERATIONAL'}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <span className="text-2xl">⚡</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Calculations Today</p>
              <p className="text-lg font-bold text-gray-900">{statistics.totalCalculationsToday || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <span className="text-2xl">💳</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Charges</p>
              <p className="text-lg font-bold text-gray-900">₹{statistics.totalChargesCalculated || '0.00'}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <span className="text-2xl">🧮</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg. Charge</p>
              <p className="text-lg font-bold text-gray-900">₹{statistics.averageChargePerTransaction || '0.00'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex">
            <button
              onClick={() => setActiveTab('single')}
              className={`px-6 py-4 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'single'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Single Calculation
            </button>
            <button
              onClick={() => setActiveTab('test')}
              className={`px-6 py-4 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'test'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Test Scenarios
            </button>
            <button
              onClick={() => setActiveTab('bulk')}
              className={`px-6 py-4 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'bulk'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Bulk Processing
            </button>
          </nav>
        </div>

        <div className="p-6">
          {/* Single Transaction Tab */}
          {activeTab === 'single' && (
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-6">Calculate Charges for Single Transaction</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Transaction Form */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Transaction ID</label>
                    <div className="flex">
                      <input
                        type="text"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={transactionForm.transactionId}
                        onChange={(e) => handleFormChange('transactionId', e.target.value)}
                      />
                      <button
                        onClick={generateTransactionId}
                        className="px-3 py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r-md hover:bg-gray-200 text-sm"
                      >
                        🔄
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Customer Code</label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={transactionForm.customerCode}
                      onChange={(e) => handleFormChange('customerCode', e.target.value)}
                    >
                      {testScenarios.sample_customers?.map(customer => (
                        <option key={customer.code} value={customer.code}>
                          {customer.code} - {customer.name} ({customer.type})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Transaction Type</label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={transactionForm.transactionType}
                      onChange={(e) => handleFormChange('transactionType', e.target.value)}
                    >
                      <option value="ATM_WITHDRAWAL_PARENT">ATM Withdrawal - Parent Bank</option>
                      <option value="ATM_WITHDRAWAL_OTHER">ATM Withdrawal - Other Bank</option>
                      <option value="FUNDS_TRANSFER">Funds Transfer</option>
                      <option value="STATEMENT_PRINT">Statement Print</option>
                      <option value="DUPLICATE_DEBIT_CARD">Duplicate Debit Card</option>
                      <option value="DUPLICATE_CREDIT_CARD">Duplicate Credit Card</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Amount (₹)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={transactionForm.amount}
                      onChange={(e) => handleFormChange('amount', e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Channel</label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={transactionForm.channel}
                      onChange={(e) => handleFormChange('channel', e.target.value)}
                    >
                      <option value="ATM">ATM</option>
                      <option value="ONLINE">Online</option>
                      <option value="BRANCH">Branch</option>
                      <option value="MOBILE">Mobile</option>
                      <option value="API">API</option>
                    </select>
                  </div>

                  <div className="flex space-x-4">
                    <button
                      onClick={calculateSingleTransaction}
                      disabled={loading}
                      className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:bg-gray-300 transition-colors"
                    >
                      {loading ? 'Calculating...' : '💰 Calculate Charges'}
                    </button>
                    <button
                      onClick={addToBulkList}
                      className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
                    >
                      ➕ Add to Bulk
                    </button>
                  </div>
                </div>

                {/* Results Display */}
                <div>
                  {error && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4 rounded">
                      <div className="flex items-center">
                        <span className="text-red-500 text-xl mr-2">❌</span>
                        <p className="text-red-700">{error}</p>
                      </div>
                    </div>
                  )}

                  {calculationResult && (
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <h4 className="text-lg font-semibold text-gray-800 mb-4">Calculation Result</h4>
                      
                      <div className="space-y-4">
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                          <span className="font-medium">Total Charges:</span>
                          <span className={`text-xl font-bold ${getChargeColor(calculationResult.totalCharges)}`}>
                            ₹{calculationResult.totalCharges}
                          </span>
                        </div>

                        {calculationResult.calculatedCharges.length > 0 ? (
                          <div>
                            <h5 className="font-medium text-gray-700 mb-2">Applied Rules:</h5>
                            <div className="space-y-2">
                              {calculationResult.calculatedCharges.map((charge, index) => (
                                <div key={index} className="border border-gray-200 rounded p-3">
                                  <div className="flex justify-between items-start mb-2">
                                    <div>
                                      <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                                        {charge.ruleCode}
                                      </span>
                                      <h6 className="font-medium text-gray-800 mt-1">{charge.ruleName}</h6>
                                    </div>
                                    <span className={`text-lg font-bold ${getChargeColor(charge.chargeAmount)}`}>
                                      ₹{charge.chargeAmount}
                                    </span>
                                  </div>
                                  <p className="text-sm text-gray-600">{charge.calculationBasis}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-4">
                            <span className="text-4xl mb-2 block">🎉</span>
                            <p className="text-green-600 font-medium">No charges applicable for this transaction!</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Test Scenarios Tab - Will continue in next artifact */}
                    {/* Test Scenarios Tab */}
                {activeTab === 'test' && (
                    <div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-6">Test Predefined Scenarios</h3>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Scenario Selection */}
                        <div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Select Customer</label>
                            <select
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={selectedCustomer}
                            onChange={(e) => setSelectedCustomer(e.target.value)}
                            >
                            {testScenarios.sample_customers?.map(customer => (
                                <option key={customer.code} value={customer.code}>
                                {customer.code} - {customer.name} ({customer.type})
                                </option>
                            ))}
                            </select>
                        </div>

                        {/* ATM Scenarios */}
                        <div className="mb-6">
                            <h4 className="font-medium text-gray-800 mb-3">🏧 ATM Scenarios</h4>
                            <div className="space-y-2">
                            {testScenarios.atm_scenarios?.map((scenario, index) => (
                                <div key={index} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                                <input
                                    type="checkbox"
                                    className="mr-3"
                                    onChange={() => toggleScenario(scenario)}
                                    checked={selectedScenarios.some(s => s.transactionType === scenario.transactionType && s.amount === scenario.amount)}
                                />
                                <div className="flex-1">
                                    <p className="font-medium">{scenario.description}</p>
                                    <p className="text-sm text-gray-600">₹{scenario.amount} via {scenario.channel}</p>
                                </div>
                                </div>
                            ))}
                            </div>
                        </div>

                        {/* Transfer Scenarios */}
                        <div className="mb-6">
                            <h4 className="font-medium text-gray-800 mb-3">💸 Transfer Scenarios</h4>
                            <div className="space-y-2">
                            {testScenarios.transfer_scenarios?.map((scenario, index) => (
                                <div key={index} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                                <input
                                    type="checkbox"
                                    className="mr-3"
                                    onChange={() => toggleScenario(scenario)}
                                    checked={selectedScenarios.some(s => s.transactionType === scenario.transactionType && s.amount === scenario.amount)}
                                />
                                <div className="flex-1">
                                    <p className="font-medium">{scenario.description}</p>
                                    <p className="text-sm text-gray-600">₹{scenario.amount} via {scenario.channel}</p>
                                </div>
                                </div>
                            ))}
                            </div>
                        </div>

                        {/* Special Scenarios */}
                        <div className="mb-6">
                            <h4 className="font-medium text-gray-800 mb-3">🎫 Special Services</h4>
                            <div className="space-y-2">
                            {testScenarios.special_scenarios?.map((scenario, index) => (
                                <div key={index} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                                <input
                                    type="checkbox"
                                    className="mr-3"
                                    onChange={() => toggleScenario(scenario)}
                                    checked={selectedScenarios.some(s => s.transactionType === scenario.transactionType && s.amount === scenario.amount)}
                                />
                                <div className="flex-1">
                                    <p className="font-medium">{scenario.description}</p>
                                    <p className="text-sm text-gray-600">₹{scenario.amount} via {scenario.channel}</p>
                                </div>
                                </div>
                            ))}
                            </div>
                        </div>

                        <button
                            onClick={runTestScenarios}
                            disabled={loading || selectedScenarios.length === 0}
                            className="w-full bg-purple-500 text-white py-3 px-4 rounded-md hover:bg-purple-600 disabled:bg-gray-300 transition-colors"
                        >
                            {loading ? 'Running Tests...' : `🧪 Run ${selectedScenarios.length} Tests`}
                        </button>
                        </div>

                        {/* Test Results */}
                        <div>
                        {error && (
                            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4 rounded">
                            <div className="flex items-center">
                                <span className="text-red-500 text-xl mr-2">❌</span>
                                <p className="text-red-700">{error}</p>
                            </div>
                            </div>
                        )}

                        {testResult && (
                            <div className="bg-white border border-gray-200 rounded-lg p-4">
                            <h4 className="text-lg font-semibold text-gray-800 mb-4">Test Results</h4>
                            
                            {/* Summary */}
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                                <h5 className="font-medium text-blue-800 mb-2">Summary</h5>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-blue-600">Customer:</span> {testResult.customerName}
                                </div>
                                <div>
                                    <span className="text-blue-600">Type:</span> {testResult.customerType}
                                </div>
                                <div>
                                    <span className="text-blue-600">Tests:</span> {testResult.totalTransactionsTested}
                                </div>
                                <div>
                                    <span className="text-blue-600">With Charges:</span> {testResult.transactionsWithCharges}
                                </div>
                                </div>
                                <div className="mt-3 pt-3 border-t border-blue-200">
                                <div className="flex justify-between items-center">
                                    <span className="font-medium text-blue-800">Total Charges:</span>
                                    <span className={`text-xl font-bold ${getChargeColor(testResult.totalChargesAcrossAllTransactions)}`}>
                                    ₹{testResult.totalChargesAcrossAllTransactions}
                                    </span>
                                </div>
                                </div>
                            </div>

                            {/* Individual Test Results */}
                            <div className="space-y-3 max-h-96 overflow-y-auto">
                                {testResult.transactionResults?.map((result, index) => (
                                <div key={index} className="border border-gray-200 rounded-lg p-3">
                                    <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <h6 className="font-medium text-gray-800">{result.description}</h6>
                                        <p className="text-sm text-gray-600">
                                        {result.transactionType} - ₹{result.transactionAmount} via {result.channel}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <span className={`text-lg font-bold ${getChargeColor(result.totalChargeForTransaction)}`}>
                                        ₹{result.totalChargeForTransaction}
                                        </span>
                                        <p className="text-xs text-gray-500">{result.rulesApplied} rule(s)</p>
                                    </div>
                                    </div>
                                    
                                    {result.applicableCharges?.length > 0 && (
                                    <div className="mt-2 pt-2 border-t border-gray-100">
                                        <div className="space-y-1">
                                        {result.applicableCharges.map((charge, chargeIndex) => (
                                            <div key={chargeIndex} className="flex justify-between items-center text-sm">
                                            <span className="text-gray-600">{charge.ruleCode}: {charge.ruleName}</span>
                                            <span className={`font-medium ${getChargeColor(charge.chargeAmount)}`}>
                                                ₹{charge.chargeAmount}
                                            </span>
                                            </div>
                                        ))}
                                        </div>
                                    </div>
                                    )}
                                </div>
                                ))}
                            </div>
                            </div>
                        )}
                        </div>
                    </div>
                    </div>
                )}

                {/* Bulk Processing Tab */}
                {activeTab === 'bulk' && (
                    <div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-6">Bulk Transaction Processing</h3>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Bulk Transaction List */}
                        <div>
                        <div className="flex justify-between items-center mb-4">
                            <h4 className="font-medium text-gray-800">Transaction Queue ({bulkTransactions.length})</h4>
                            <button
                            onClick={() => setBulkTransactions([])}
                            className="text-red-500 hover:text-red-700 text-sm"
                            disabled={bulkTransactions.length === 0}
                            >
                            🗑️ Clear All
                            </button>
                        </div>

                        {bulkTransactions.length === 0 ? (
                            <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                            <span className="text-4xl mb-2 block">📋</span>
                            <p className="text-gray-500">No transactions in queue</p>
                            <p className="text-sm text-gray-400">Add transactions from the Single Calculation tab</p>
                            </div>
                        ) : (
                            <div className="space-y-2 max-h-64 overflow-y-auto">
                            {bulkTransactions.map((transaction, index) => (
                                <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                                <div>
                                    <p className="font-medium text-gray-800">{transaction.transactionType}</p>
                                    <p className="text-sm text-gray-600">
                                    {transaction.customerCode} - ₹{transaction.amount} via {transaction.channel}
                                    </p>
                                </div>
                                <button
                                    onClick={() => removeFromBulkList(index)}
                                    className="text-red-500 hover:text-red-700 ml-2"
                                >
                                    ❌
                                </button>
                                </div>
                            ))}
                            </div>
                        )}

                        <div className="mt-4">
                            <button
                            onClick={processBulkCalculations}
                            disabled={loading || bulkTransactions.length === 0}
                            className="w-full bg-green-500 text-white py-3 px-4 rounded-md hover:bg-green-600 disabled:bg-gray-300 transition-colors"
                            >
                            {loading ? 'Processing...' : `⚡ Process ${bulkTransactions.length} Transactions`}
                            </button>
                        </div>
                        </div>

                        {/* Bulk Results */}
                        <div>
                        {error && (
                            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4 rounded">
                            <div className="flex items-center">
                                <span className="text-red-500 text-xl mr-2">❌</span>
                                <p className="text-red-700">{error}</p>
                            </div>
                            </div>
                        )}

                        {bulkResult && (
                            <div className="bg-white border border-gray-200 rounded-lg p-4">
                            <h4 className="text-lg font-semibold text-gray-800 mb-4">Bulk Processing Results</h4>
                            
                            {/* Processing Summary */}
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                                <h5 className="font-medium text-green-800 mb-3">Processing Summary</h5>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-green-600">Total Transactions:</span> {bulkResult.totalTransactions}
                                </div>
                                <div>
                                    <span className="text-green-600">Successful:</span> {bulkResult.successfulCalculations}
                                </div>
                                <div>
                                    <span className="text-green-600">Failed:</span> {bulkResult.failedCalculations}
                                </div>
                                <div>
                                    <span className="text-green-600">Processing Time:</span> {bulkResult.processingTimeMs}ms
                                </div>
                                </div>
                                <div className="mt-3 pt-3 border-t border-green-200">
                                <div className="flex justify-between items-center">
                                    <span className="font-medium text-green-800">Total Charges Calculated:</span>
                                    <span className={`text-xl font-bold ${getChargeColor(bulkResult.totalChargesCalculated)}`}>
                                    ₹{bulkResult.totalChargesCalculated}
                                    </span>
                                </div>
                                </div>
                            </div>

                            {/* Transaction Type Breakdown */}
                            {Object.keys(bulkResult.transactionTypeCount || {}).length > 0 && (
                                <div className="mb-4">
                                <h5 className="font-medium text-gray-800 mb-2">Transaction Types</h5>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    {Object.entries(bulkResult.transactionTypeCount).map(([type, count]) => (
                                    <div key={type} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                                        <span className="text-gray-600">{type}:</span>
                                        <span className="font-medium">{count}</span>
                                    </div>
                                    ))}
                                </div>
                                </div>
                            )}

                            {/* Charges by Rule Breakdown */}
                            {Object.keys(bulkResult.chargesByRule || {}).length > 0 && (
                                <div className="mb-4">
                                <h5 className="font-medium text-gray-800 mb-2">Charges by Rule</h5>
                                <div className="space-y-1 text-sm max-h-32 overflow-y-auto">
                                    {Object.entries(bulkResult.chargesByRule).map(([ruleCode, amount]) => (
                                    <div key={ruleCode} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                                        <span className="text-gray-600 font-mono">{ruleCode}:</span>
                                        <span className={`font-medium ${getChargeColor(amount)}`}>₹{amount}</span>
                                    </div>
                                    ))}
                                </div>
                                </div>
                            )}

                            {/* Error Details */}
                            {Object.keys(bulkResult.errors || {}).length > 0 && (
                                <div>
                                <h5 className="font-medium text-red-800 mb-2">Failed Transactions</h5>
                                <div className="space-y-1 text-sm max-h-32 overflow-y-auto">
                                    {Object.entries(bulkResult.errors).map(([transactionId, error]) => (
                                    <div key={transactionId} className="p-2 bg-red-50 border border-red-200 rounded">
                                        <div className="font-mono text-xs text-gray-600">{transactionId}</div>
                                        <div className="text-red-600">{error}</div>
                                    </div>
                                    ))}
                                </div>
                                </div>
                            )}
                            </div>
                        )}
                        </div>
                    </div>
                    </div>
                )}
                </div>
            </div>
            </div>
            );
        };


export default ChargeCalculator;