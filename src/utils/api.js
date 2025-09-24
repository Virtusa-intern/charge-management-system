// src/utils/api.js - Enhanced API configuration and service functions
import axios from 'axios';

// Base API configuration
const API_BASE_URL = 'http://localhost:8080/charge-mgmt/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Request interceptor for adding auth tokens (will be used later)
api.interceptors.request.use(
  (config) => {
    // Add auth token when we implement authentication
    // const token = localStorage.getItem('authToken');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error);
    
    // Handle different error types
    if (error.code === 'ECONNABORTED') {
      console.error('Request timeout');
    } else if (error.response?.status === 401) {
      console.error('Unauthorized access');
      // Redirect to login when we implement auth
    } else if (error.response?.status >= 500) {
      console.error('Server error');
    }
    
    return Promise.reject(error);
  }
);

// API service functions
export const apiService = {
  // System health and info
  healthCheck: () => api.get('/health'),
  welcome: () => api.get('/welcome'),
  testDatabase: () => api.get('/database/test'),
  
  // Rules management - Enhanced with all endpoints
  getRules: (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.category) params.append('category', filters.category);  
    if (filters.search) params.append('search', filters.search);
    
    const queryString = params.toString();
    return api.get(`/rules${queryString ? '?' + queryString : ''}`);
  },
  
  getRuleById: (id) => api.get(`/rules/${id}`),
  getRuleByCode: (code) => api.get(`/rules/code/${code}`),
  
  createRule: (ruleData) => api.post('/rules', ruleData),
  updateRule: (id, ruleData) => api.put(`/rules/${id}`, ruleData),
  deleteRule: (id) => api.delete(`/rules/${id}`),
  
  // Rule workflow actions
  approveRule: (id) => api.post(`/rules/${id}/approve`),
  deactivateRule: (id) => api.post(`/rules/${id}/deactivate`),
  reactivateRule: (id) => api.post(`/rules/${id}/reactivate`),
  
  // Rule filtering and search
  getActiveRules: () => api.get('/rules/active'),
  getRulesByCategory: (category) => api.get(`/rules/category/${category}`),
  getPendingApprovalRules: () => api.get('/rules/pending-approval'),
  
  // Rule statistics and metadata
  getRuleStatistics: () => api.get('/rules/statistics'),
  getRuleMetadata: () => api.get('/rules/metadata'),
  
  // Rule validation
  validateRule: (ruleData) => api.post('/rules/validate', ruleData),
  
  // Bulk operations
  performBulkAction: (action, ruleIds) => api.post('/rules/bulk-action', {
    action: action,
    ruleIds: ruleIds
  }),
  
  // Charge calculation endpoints - NEW
  calculateCharges: (transactionData) => api.post('/charges/calculate', transactionData),
  testChargeCalculation: (testData) => api.post('/charges/test', testData),
  bulkCalculateCharges: (bulkData) => api.post('/charges/bulk-calculate', bulkData),
  getChargeTestScenarios: () => api.get('/charges/test-scenarios'),
  quickChargeTest: (customerCode = 'CUST001', transactionType = 'ATM_WITHDRAWAL_PARENT', amount = '1000') => 
    api.get(`/charges/quick-test?customerCode=${customerCode}&transactionType=${transactionType}&amount=${amount}`),
  simulateTransactions: (customerCode = 'CUST001', transactionCount = 5) => 
    api.post(`/charges/simulate?customerCode=${customerCode}&transactionCount=${transactionCount}`),
  validateTransaction: (transactionData) => api.post('/charges/validate', transactionData),
  getChargeStatistics: () => api.get('/charges/statistics'),
  getChargeHealth: () => api.get('/charges/health'),
  getSampleRequests: () => api.get('/charges/sample-requests'),
  
  // Legacy charge calculation methods (keeping for compatibility)
  calculateCharges: (transactionData) => api.post('/charges/calculate', transactionData),
  testExecution: (testData) => api.post('/charges/test', testData),
  
  // Settlement requests (will be implemented later)
  getSettlements: () => api.get('/settlements'),
  createSettlement: (settlementData) => api.post('/settlements', settlementData),
  
  // User management (will be implemented later)
  getUsers: () => api.get('/users'),
  createUser: (userData) => api.post('/users', userData),
  updateUser: (id, userData) => api.put(`/users/${id}`, userData),
  deleteUser: (id) => api.delete(`/users/${id}`),
};

export default api;