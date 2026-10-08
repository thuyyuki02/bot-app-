import React from 'react';
import { useApp } from '../../context/AppContext';
import { X, Activity, Terminal, Shield, Zap } from 'lucide-react';

export const EventLoggerDrawer: React.FC = () => {
  const { isEventLoggerOpen, setIsEventLoggerOpen, events, currentPage } = useApp();

  if (!isEventLoggerOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-96 md:w-[480px] bg-slate-950 text-slate-200 z-50 shadow-2xl border-l border-slate-800 flex flex-col font-mono text-xs transition-transform duration-300">
      {/* Header */}
      <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-emerald-400" />
          <h3 className="font-bold text-slate-100 tracking-wide text-sm">
            C13 — Live Customer Chat Events
          </h3>
        </div>
        <button
          onClick={() => setIsEventLoggerOpen(false)}
          className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Context bar */}
      <div className="bg-slate-900/60 px-4 py-2 border-b border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
        <div className="truncate">
          <span className="text-emerald-400 font-semibold">Active Context:</span>{' '}
          {currentPage}
        </div>
        <div className="flex items-center gap-1 text-emerald-400">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          Streaming
        </div>
      </div>

      {/* Event list */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
        {events.length === 0 ? (
          <div className="text-center py-16 text-slate-500">
            <Activity className="w-8 h-8 mx-auto mb-2 opacity-40 text-emerald-400" />
            <p>Chưa có sự kiện nào được ghi nhận.</p>
            <p className="text-[11px] mt-1">Gửi tin nhắn hoặc thao tác trên chatbot để xem telemetry stream!</p>
          </div>
        ) : (
          events.map((evt) => (
            <div
              key={evt.id}
              className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 hover:border-slate-700 transition"
            >
              <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                <span className="text-emerald-400 font-bold">[{evt.timestamp}]</span>
                <span
                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                    evt.sender === 'customer'
                      ? 'bg-blue-950 text-blue-300 border border-blue-800'
                      : evt.sender === 'ai'
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      : 'bg-purple-950 text-purple-300 border border-purple-800'
                  }`}
                >
                  {evt.sender.toUpperCase()}
                </span>
              </div>

              <div className="text-slate-200 text-xs my-1 break-words">
                "{evt.message}"
              </div>

              <div className="grid grid-cols-2 gap-1 text-[10px] text-slate-400 pt-1 border-t border-slate-800/80 mt-1.5">
                <div>
                  <span className="text-slate-500">Intent:</span>{' '}
                  <span className="text-amber-300">{evt.intent}</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-500">Lead Score:</span>{' '}
                  <span
                    className={`font-bold ${
                      evt.lead_score >= 80
                        ? 'text-rose-400'
                        : evt.lead_score >= 50
                        ? 'text-amber-400'
                        : 'text-emerald-400'
                    }`}
                  >
                    {evt.lead_score} / 100
                  </span>
                </div>
                <div className="truncate col-span-2 text-slate-500">
                  <span>URL:</span> {evt.page_url}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer Info */}
      <div className="p-3 bg-slate-900 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
        <span>Tổng sự kiện: {events.length}</span>
        <span className="text-slate-500">demxanh.com telemetry</span>
      </div>
    </div>
  );
};
