import React, { useState, useEffect } from 'react';
import { apiService } from '../utils/api';

const SettlementRequests = () => {
  const [settlements, setSettlements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    dateFrom: '',
    dateTo: '',
    customerCode: ''
  });
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [settlementForm, setSettlementForm] = useState({
    customerCode: '',
    accountNumber: '',
    settlementType: 'DEBIT',
    amount: '',
    description: '',
    requestedBy: ''
  });

  useEffect(() => {
    fetchSettlements();
  }, []);

  const fetchSettlements = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.getSettlements();
      setSettlements(response.data.data || []);
    } catch (err) {
      setError('Failed to fetch settlements: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSettlement = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await apiService.createSettlement({
        ...settlementForm,
        amount: parseFloat(settlementForm.amount),
        requestDate: new Date().toISOString()
      });
      
      setShowCreateForm(false);
      resetForm();
      fetchSettlements();
    } catch (err) {
      setError('Failed to create settlement: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSettlementForm({
      customerCode: '',
      accountNumber: '',
      settlementType: 'DEBIT',
      amount: '',
      description: '',
      requestedBy: ''
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'APPROVED': return 'bg-green-100 text-green-800';
      case 'PROCESSED': return 'bg-blue-100 text-blue-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSettlementTypeColor = (type) => {
    return type === 'DEBIT' ? 'text-red-600' : 'text-green-600';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Settlement Requests</h1>
        <p className="text-gray-600">Manage payment instructions for charge collections</p>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <div className="flex">
            <span className="text-red-500 text-xl mr-2">×</span>
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <span className="text-2xl">📋</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">
                {settlements.filter(s => s.status === 'PENDING').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <span className="text-2xl">✅</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Approved</p>
              <p className="text-2xl font-bold text-green-600">
                {settlements.filter(s => s.status === 'APPROVED').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <span className="text-2xl">💰</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Amount</p>
              <p className="text-lg font-bold text-blue-600">
                {formatCurrency(settlements.reduce((sum, s) => sum + (s.amount || 0), 0))}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <span className="text-2xl">🏦</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Processed</p>
              <p className="text-2xl font-bold text-purple-600">
                {settlements.filter(s => s.status === 'PROCESSED').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Create Settlement Form */}
      {showCreateForm && (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Create Settlement Request</h3>
          
          <form onSubmit={handleCreateSettlement}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Customer Code</label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={settlementForm.customerCode}
                  onChange={(e) => setSettlementForm({...settlementForm, customerCode: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Account Number</label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={settlementForm.accountNumber}
                  onChange={(e) => setSettlementForm({...settlementForm, accountNumber: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Settlement Type</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={settlementForm.settlementType}
                  onChange={(e) => setSettlementForm({...settlementForm, settlementType: e.target.value})}
                >
                  <option value="DEBIT">Debit (Charge Customer)</option>
                  <option value="CREDIT">Credit (Refund Customer)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={settlementForm.amount}
                  onChange={(e) => setSettlementForm({...settlementForm, amount: e.target.value})}
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                  value={settlementForm.description}
                  onChange={(e) => setSettlementForm({...settlementForm, description: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Requested By</label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={settlementForm.requestedBy}
                  onChange={(e) => setSettlementForm({...settlementForm, requestedBy: e.target.value})}
                />
              </div>
            </div>
            
            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:bg-gray-300"
              >
                {loading ? 'Creating...' : 'Create Settlement Request'}
              </button>
              
              <button
                type="button"
                onClick={() => {setShowCreateForm(false); resetForm();}}
                className="bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Settlements Table */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-800">Settlement Requests</h3>
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
          >
            + New Settlement
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Settlement ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {settlements.map((settlement) => (
                <tr key={settlement.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-mono text-sm font-medium text-gray-900">
                      {settlement.settlementId || settlement.id}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{settlement.customerCode}</div>
                      <div className="text-sm text-gray-500">{settlement.accountNumber}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`font-medium ${getSettlementTypeColor(settlement.settlementType)}`}>
                      {settlement.settlementType}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-lg font-bold ${getSettlementTypeColor(settlement.settlementType)}`}>
                      {formatCurrency(settlement.amount)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(settlement.status)}`}>
                      {settlement.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {settlement.createdAt ? new Date(settlement.createdAt).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-blue-600 hover:text-blue-800 mr-4">
                      View
                    </button>
                    {settlement.status === 'PENDING' && (
                      <button className="text-green-600 hover:text-green-800">
                        Approve
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {settlements.length === 0 && !loading && (
          <div className="text-center py-12">
            <span className="text-6xl mb-4 block">💰</span>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No settlement requests</h3>
            <p className="text-gray-500">Create your first settlement request to manage charge collections.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SettlementRequests;