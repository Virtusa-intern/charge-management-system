// src/components/RulesManagement.js - Main rules management component
import React, { useState, useEffect } from 'react';
import { apiService } from '../utils/api';

const RulesManagement = () => {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [statistics, setStatistics] = useState({});
  const [filters, setFilters] = useState({
    status: '',
    category: '',
    search: ''
  });
  const [metadata, setMetadata] = useState({});

  // Fetch rules data - FIXED FILTERING LOGIC
  const fetchRules = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiService.getRules(filters);
      setRules(response.data.data);
      
      // Also fetch statistics
      const statsResponse = await apiService.getRuleStatistics();
      setStatistics(statsResponse.data.data);
      
    } catch (err) {
      setError('Failed to fetch rules: ' + err.message);
      console.error('Error fetching rules:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch metadata for dropdowns
  const fetchMetadata = async () => {
    try {
      const response = await apiService.getRuleMetadata();
      setMetadata(response.data.data);
    } catch (err) {
      console.error('Error fetching metadata:', err);
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchRules();
    fetchMetadata();
  }, []);

  // FIXED: Refetch when filters change - Now properly handles all filters
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchRules();
    }, 300); // Debounce search
    
    return () => clearTimeout(timeoutId);
  }, [filters]); // This will trigger whenever ANY filter changes

  // Handle filter changes
  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Clear filters
  const clearFilters = () => {
    setFilters({
      status: '',
      category: '',
      search: ''
    });
  };

  // Handle rule actions
  const handleRuleAction = async (ruleId, action) => {
    try {
      let response;
      switch (action) {
        case 'approve':
          response = await apiService.approveRule(ruleId);
          break;
        case 'deactivate':
          response = await apiService.deactivateRule(ruleId);
          break;
        case 'reactivate':
          response = await apiService.reactivateRule(ruleId);
          break;
        case 'delete':
          if (window.confirm('Are you sure you want to delete this rule?')) {
            response = await apiService.deleteRule(ruleId);
          } else {
            return;
          }
          break;
        default:
          return;
      }
      
      // Refresh rules after action
      fetchRules();
      
      // Show success message (you can implement toast notifications)
      console.log('Action completed:', response.data.message);
      
    } catch (err) {
      setError(`Failed to ${action} rule: ` + err.message);
      console.error(`Error ${action} rule:`, err);
    }
  };

  // Get status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800';
      case 'DRAFT': return 'bg-yellow-100 text-yellow-800';
      case 'INACTIVE': return 'bg-gray-100 text-gray-800';
      case 'ARCHIVED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get available actions for a rule based on its status
  const getAvailableActions = (rule) => {
    const actions = [];
    
    switch (rule.status) {
      case 'DRAFT':
        actions.push({ label: 'Approve', action: 'approve', color: 'text-green-600 hover:text-green-800' });
        actions.push({ label: 'Delete', action: 'delete', color: 'text-red-600 hover:text-red-800' });
        break;
      case 'ACTIVE':
        actions.push({ label: 'Deactivate', action: 'deactivate', color: 'text-orange-600 hover:text-orange-800' });
        break;
      case 'INACTIVE':
        actions.push({ label: 'Reactivate', action: 'reactivate', color: 'text-blue-600 hover:text-blue-800' });
        break;
    }
    
    return actions;
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Rules Management</h1>
        <p className="text-gray-600">Manage banking charge rules and their lifecycle</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <span className="text-2xl">📊</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Rules</p>
              <p className="text-2xl font-bold text-gray-900">{statistics.totalRules || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <span className="text-2xl">✅</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active</p>
              <p className="text-2xl font-bold text-green-600">{statistics.activeRules || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <span className="text-2xl">📝</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Draft</p>
              <p className="text-2xl font-bold text-yellow-600">{statistics.draftRules || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-gray-100 rounded-lg">
              <span className="text-2xl">⏸️</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Inactive</p>
              <p className="text-2xl font-bold text-gray-600">{statistics.inactiveRules || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <span className="text-2xl">🗄️</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Archived</p>
              <p className="text-2xl font-bold text-red-600">{statistics.archivedRules || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <input
              type="text"
              placeholder="Search by name or code..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <option value="">All Statuses</option>
              {metadata.statuses?.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
            >
              <option value="">All Categories</option>
              {metadata.categories?.map(category => (
                <option key={category} value={category}>{category.replace('_', ' ')}</option>
              ))}
            </select>
          </div>

          {/* Actions */}
          <div className="flex items-end">
            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors mr-2"
            >
              Clear Filters
            </button>
            <button
              onClick={fetchRules}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <div className="flex">
            <span className="text-red-500 text-xl mr-2">❌</span>
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="inline-flex items-center">
            <svg className="animate-spin h-8 w-8 text-blue-600 mr-3" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
            </svg>
            <span className="text-gray-600 font-medium">Loading rules...</span>
          </div>
        </div>
      )}

      {/* Rules Table */}
      {!loading && (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rule Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rule Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fee Value
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
                {rules.map((rule) => (
                  <tr key={rule.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-mono text-sm font-medium text-gray-900">
                        {rule.ruleCode}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{rule.ruleName}</div>
                      <div className="text-sm text-gray-500">{rule.activityType}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">
                        {rule.category?.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">
                        {rule.feeType === 'PERCENTAGE' ? `${rule.feeValue}%` : `₹${rule.feeValue}`}
                      </span>
                      <div className="text-xs text-gray-500">{rule.feeType}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(rule.status)}`}>
                        {rule.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {rule.createdAt ? new Date(rule.createdAt).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        {getAvailableActions(rule).map((actionItem, index) => (
                          <button
                            key={index}
                            onClick={() => handleRuleAction(rule.id, actionItem.action)}
                            className={`${actionItem.color} hover:underline font-medium transition-colors`}
                          >
                            {actionItem.label}
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {!loading && rules.length === 0 && (
            <div className="text-center py-12">
              <span className="text-6xl mb-4 block">📋</span>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No rules found</h3>
              <p className="text-gray-500">
                {filters.search || filters.status || filters.category 
                  ? 'Try adjusting your filters to see more results.'
                  : 'Get started by creating your first charge rule.'}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RulesManagement;