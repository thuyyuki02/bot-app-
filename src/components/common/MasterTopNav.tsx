import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Globe,
  Headphones,
  Sliders,
  Smartphone,
  Monitor,
  Activity,
  Flame,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react';

export const MasterTopNav: React.FC = () => {
  const {
    activeView,
    setActiveView,
    isMobilePreview,
    setIsMobilePreview,
    isEventLoggerOpen,
    setIsEventLoggerOpen,
    leads,
    conversations,
    currentStaff,
    staffList,
    setCurrentStaff,
    resetCustomerChat,
  } = useApp();

  const hotLeadsCount = leads.filter((l) => l.score >= 80 && l.status === 'NEW').length;
  const waitingAgentCount = conversations.filter((c) => c.status === 'WAITING_AGENT').length;

  return (
    <header className="sticky top-0 z-50 bg-slate-900 border-b border-slate-800 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white font-black text-xl shadow-md shadow-emerald-500/20">
            ĐX
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base tracking-tight text-white">ĐỆM XANH</span>
              <span className="bg-emerald-500/20 text-emerald-400 text-xs px-2 py-0.5 rounded-full font-semibold border border-emerald-500/30">
                AI Platform
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              demxanh.com • Sales & Customer Service System
            </p>
          </div>
        </div>

        {/* 3 Core Interfaces Selector (CUSTOMER, STAFF, ADMIN) */}
        <nav className="flex items-center bg-slate-800/90 p-1 rounded-xl border border-slate-700">
          <button
            onClick={() => setActiveView('customer')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
              activeView === 'customer'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>Thử Nghiệm Widget (Website)</span>
          </button>

          <button
            onClick={() => setActiveView('staff')}
            className={`relative flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
              activeView === 'staff'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <Headphones className="w-4 h-4" />
            <span>Nhân Viên Showroom</span>
            {waitingAgentCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping absolute -top-1 -right-1" />
            )}
            {waitingAgentCount > 0 && (
              <span className="bg-amber-500 text-slate-950 text-[10px] px-1.5 py-0.2 rounded-full font-bold ml-1">
                {waitingAgentCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveView('admin')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
              activeView === 'admin'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Quản Trị AI & Dữ Liệu DemXanh</span>
            {hotLeadsCount > 0 && (
              <span className="bg-rose-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold ml-1 flex items-center gap-0.5">
                <Flame className="w-2.5 h-2.5 inline" /> {hotLeadsCount}
              </span>
            )}
          </button>
        </nav>

        {/* Right actions: Device preview toggle, Event log drawer, Staff selector */}
        <div className="flex items-center gap-3">
          {activeView === 'customer' && (
            <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-lg border border-slate-700">
              <button
                onClick={() => setIsMobilePreview(false)}
                title="Desktop View (Floating Widget)"
                className={`p-1.5 rounded text-xs transition ${
                  !isMobilePreview ? 'bg-slate-700 text-emerald-400' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Monitor className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsMobilePreview(true)}
                title="Mobile View (100vw × 100vh Fullscreen)"
                className={`p-1.5 rounded text-xs transition ${
                  isMobilePreview ? 'bg-slate-700 text-emerald-400' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Smartphone className="w-4 h-4" />
              </button>
            </div>
          )}

          {activeView === 'customer' && (
            <button
              onClick={resetCustomerChat}
              title="Khởi tạo phiên chat mới"
              className="hidden md:flex items-center gap-1.5 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-2.5 py-1.5 rounded-lg border border-slate-700 transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Chat</span>
            </button>
          )}

          {/* Event telemetry stream toggle */}
          <button
            onClick={() => setIsEventLoggerOpen(!isEventLoggerOpen)}
            className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border transition ${
              isEventLoggerOpen
                ? 'bg-emerald-950 text-emerald-300 border-emerald-600'
                : 'bg-slate-800 text-slate-300 hover:text-white border-slate-700'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">C13 Event Log</span>
          </button>

          {/* Current Staff Switcher */}
          <div className="relative group">
            <button className="flex items-center gap-2 bg-slate-800/80 hover:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700 text-xs">
              <img
                src={currentStaff.avatar}
                alt={currentStaff.name}
                className="w-6 h-6 rounded-full object-cover border border-emerald-400"
              />
              <span className="hidden md:block font-medium text-slate-200">
                {currentStaff.name}
              </span>
              <span className="text-[10px] text-emerald-400 bg-emerald-950 px-1 py-0.5 rounded font-mono">
                {currentStaff.role}
              </span>
            </button>

            {/* Dropdown to switch staff persona */}
            <div className="absolute right-0 top-full mt-2 w-56 bg-slate-800 rounded-xl shadow-xl border border-slate-700 p-2 hidden group-hover:block z-50">
              <div className="text-[11px] font-semibold text-slate-400 px-2 py-1 uppercase tracking-wider">
                Đổi nhân viên trực
              </div>
              {staffList.map((staff) => (
                <button
                  key={staff.id}
                  onClick={() => setCurrentStaff(staff)}
                  className={`w-full text-left flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-xs transition ${
                    currentStaff.id === staff.id
                      ? 'bg-emerald-600 text-white font-bold'
                      : 'text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <img
                    src={staff.avatar}
                    alt={staff.name}
                    className="w-5 h-5 rounded-full object-cover"
                  />
                  <div className="truncate">
                    <div className="truncate">{staff.name}</div>
                    <div className="text-[10px] text-slate-400">{staff.role}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
