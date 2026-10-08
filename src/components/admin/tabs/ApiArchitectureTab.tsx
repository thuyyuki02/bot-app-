import React, { useState } from 'react';
import { API_ENDPOINTS } from '../../../data/schemaDefinitions';
import { ApiEndpointDefinition } from '../../../types';
import { Code, Copy, Check, Play, Send, CheckCircle, ExternalLink, Globe } from 'lucide-react';

export const ApiArchitectureTab: React.FC = () => {
  const [selectedEndpoint, setSelectedEndpoint] = useState<ApiEndpointDefinition>(API_ENDPOINTS[0]);
  const [copiedCurl, setCopiedCurl] = useState<boolean>(false);
  const [testResponse, setTestResponse] = useState<any>(null);
  const [isRunning, setIsRunning] = useState<boolean>(false);

  const handleCopyCurl = (curl: string) => {
    navigator.clipboard.writeText(curl);
    setCopiedCurl(true);
    setTimeout(() => setCopiedCurl(false), 2000);
  };

  const handleRunMockCall = () => {
    setIsRunning(true);
    setTimeout(() => {
      setTestResponse(selectedEndpoint.responseBody);
      setIsRunning(false);
    }, 400);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto w-full">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-blue-950 text-blue-400 border border-blue-800 text-[10px] font-bold px-2 py-0.5 rounded">
              RESTful + SSE STREAMING API
            </span>
            <h2 className="text-xl font-black text-white tracking-tight">
              Đặc Tả API Gateway & Kiến Trúc Endpoint /api/v1/...
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Dành cho Backend (NestJS) và Frontend (Widget / Dashboard). Hỗ trợ chuẩn versioning, schema JSON và cURL.
          </p>
        </div>
      </div>

      {/* Main 2-Column Explorer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Endpoint List */}
        <div className="lg:col-span-4 bg-slate-950 rounded-2xl border border-slate-800 p-3 space-y-2">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-2 py-1">
            Danh sách Endpoint ({API_ENDPOINTS.length})
          </div>

          <div className="space-y-1.5">
            {API_ENDPOINTS.map((ep) => {
              const isSelected = selectedEndpoint.path === ep.path && selectedEndpoint.method === ep.method;
              return (
                <div
                  key={ep.method + ep.path}
                  onClick={() => {
                    setSelectedEndpoint(ep);
                    setTestResponse(null);
                  }}
                  className={`p-3 rounded-xl cursor-pointer transition border text-xs flex flex-col gap-1 ${
                    isSelected
                      ? 'bg-slate-900 border-blue-500 text-white shadow-md'
                      : 'bg-slate-950/60 border-slate-850 text-slate-300 hover:border-slate-700 hover:bg-slate-900/40'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded ${
                        ep.method === 'POST'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : 'bg-blue-950 text-blue-400 border border-blue-800'
                      }`}
                    >
                      {ep.method}
                    </span>
                    <span className="font-mono text-slate-200 font-semibold truncate">
                      {ep.path}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-1">{ep.summary}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Endpoint Inspector */}
        <div className="lg:col-span-8 bg-slate-950 rounded-2xl border border-slate-800 p-5 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <span
                className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                  selectedEndpoint.method === 'POST'
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                    : 'bg-blue-950 text-blue-400 border border-blue-800'
                }`}
              >
                {selectedEndpoint.method}
              </span>
              <span className="font-mono text-sm font-bold text-white">
                {selectedEndpoint.path}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleCopyCurl(selectedEndpoint.curlExample)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs px-2.5 py-1.5 rounded-lg border border-slate-700 flex items-center gap-1.5 transition"
              >
                {copiedCurl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCurl ? 'Đã copy' : 'Copy cURL'}</span>
              </button>
              <button
                onClick={handleRunMockCall}
                disabled={isRunning}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition shadow-md"
              >
                <Play className="w-3.5 h-3.5" />
                <span>{isRunning ? 'Đang gửi...' : 'Test Request'}</span>
              </button>
            </div>
          </div>

          <p className="text-xs text-slate-300">{selectedEndpoint.description}</p>

          {/* Request Payload */}
          {selectedEndpoint.requestBody && (
            <div className="space-y-1.5">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Request Body (application/json):
              </h4>
              <pre className="bg-slate-900 p-3 rounded-xl border border-slate-800 text-[11px] font-mono text-emerald-300 overflow-x-auto leading-relaxed">
{JSON.stringify(selectedEndpoint.requestBody, null, 2)}
              </pre>
            </div>
          )}

          {/* Response Payload */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Response Output 200 OK:
              </h4>
              {testResponse && (
                <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded font-mono font-bold">
                  Status: 200 OK (38ms)
                </span>
              )}
            </div>
            <pre className="bg-slate-900 p-3 rounded-xl border border-slate-800 text-[11px] font-mono text-cyan-300 overflow-x-auto leading-relaxed">
{JSON.stringify(testResponse || selectedEndpoint.responseBody, null, 2)}
            </pre>
          </div>

          {/* cURL Example */}
          <div className="space-y-1.5">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              cURL CLI Command:
            </h4>
            <pre className="bg-slate-900 p-3 rounded-xl border border-slate-800 text-[11px] font-mono text-slate-400 overflow-x-auto leading-relaxed">
{selectedEndpoint.curlExample}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
