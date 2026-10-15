import React from 'react';
import Sidebar from './Sidebar';
import TopNavbar from './TopNavbar';
import AICopilotModal from '../components/AICopilotModal';
import ToastContainer from '../components/Toast';
import { useTheme } from '../context/ThemeContext';

export const DashboardLayout = ({ children }) => {
  const { sidebarCollapsed } = useTheme();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
          sidebarCollapsed ? 'ml-20' : 'ml-64'
        }`}
      >
        <TopNavbar />

        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Global AI Copilot Modal */}
      <AICopilotModal />

      {/* Global Toast Container */}
      <ToastContainer />
    </div>
  );
};

export default DashboardLayout;
