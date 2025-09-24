import React, { useState } from 'react';
import HealthCheck from './components/HealthCheck';
import RulesManagement from './components/RulesManagement';
import ChargeCalculator from './components/ChargeCalculator';
import UserManagement from './components/UserManagement';
import SettlementRequests from './components/SettlementRequests';
import TestExecution from './components/TestExecution';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [user] = useState({ username: 'admin', role: 'ADMIN' }); // Mock user for now

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', component: HealthCheck, icon: '🏠' },
    { id: 'rules', label: 'Rules Management', component: RulesManagement, icon: '⚙️' },
    { id: 'charges', label: 'Charge Calculator', component: ChargeCalculator, icon: '💰' },
    { id: 'test', label: 'Test Execution', component: TestExecution, icon: '🧪' },
    { id: 'settlements', label: 'Settlements', component: SettlementRequests, icon: '📊' },
    { id: 'users', label: 'User Management', component: UserManagement, icon: '👥' },
  ];

  const renderActiveComponent = () => {
    const activeTabData = tabs.find(tab => tab.id === activeTab);
    if (activeTabData && activeTabData.component) {
      const Component = activeTabData.component;
      return <Component user={user} />;
    }
    
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <span className="text-6xl mb-4 block">🚧</span>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">Coming Soon</h3>
          <p className="text-gray-600">
            This feature will be implemented in the next phase of development.
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-xl">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                🏦 Charge Management System
              </h1>
              <p className="text-lg md:text-xl opacity-90 font-light">
                Centralized Banking Charge Processing Platform
              </p>
            </div>
            <div className="flex space-x-2">
              <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium border border-white/30">
                v1.0.0
              </span>
              <span className="bg-green-500/80 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium border border-green-400/30">
                All Features Complete
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex space-x-8 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors whitespace-nowrap flex items-center ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="py-8">
        {renderActiveComponent()}
      </main>
      

      {/* Footer */}
      <footer className="bg-gray-800 text-white text-center py-4 mt-auto">
        <p className="text-sm opacity-80">
          &copy; 2024 Charge Management System 
        </p>
      </footer>
    </div>
  );
}

export default App;