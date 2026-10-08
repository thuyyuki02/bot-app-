import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { MasterTopNav } from './components/common/MasterTopNav';
import { EventLoggerDrawer } from './components/common/EventLoggerDrawer';
import { CustomerWebsiteSimulator } from './components/customer/CustomerWebsiteSimulator';
import { StaffWorkspace } from './components/staff/StaffWorkspace';
import { AdminPlatform } from './components/admin/AdminPlatform';
import { ChatWidget } from './components/customer/ChatWidget';

const MainAppContent: React.FC = () => {
  const { activeView } = useApp();
  const isEmbed =
    typeof window !== 'undefined' &&
    (new URLSearchParams(window.location.search).get('embed') === 'true' ||
      new URLSearchParams(window.location.search).get('mode') === 'widget');

  if (isEmbed) {
    return (
      <div className="w-screen h-screen overflow-hidden bg-transparent">
        <ChatWidget isEmbed={true} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      {/* Top Master Switcher Bar */}
      <MasterTopNav />

      {/* Primary Dynamic View */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {activeView === 'customer' && <CustomerWebsiteSimulator />}
        {activeView === 'staff' && <StaffWorkspace />}
        {activeView === 'admin' && <AdminPlatform />}
      </main>

      {/* C13 Live Event Stream Inspector Drawer */}
      <EventLoggerDrawer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}
