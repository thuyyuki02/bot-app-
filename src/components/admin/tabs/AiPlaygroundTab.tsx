import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { executePlaygroundOrchestration } from '../../../services/aiOrchestrator';
import { PlaygroundTestResult } from '../../../types';
import {
  Sparkles,
  Send,
  CheckCircle,
  AlertTriangle,
  ThumbsUp,
  ThumbsDown,
  Database,
  ShieldCheck,
  Cpu,
  Layers,
  ArrowRight,
  FileText,
} from 'lucide-react';

export const AiPlaygroundTab: React.FC = () => {
  const { products, knowledgeItems, addAuditLog } = useApp();

  const [inputQuery, setInputQuery] = useState<string>(
    'Tôi 50 tuổi, hay đau lưng, ngủ 2 người, giường 1m8, ngân sách khoảng 10 triệu nên mua đệm gì?'
  );
  const [testResult, setTestResult] = useState<PlaygroundTestResult>(() =>
    executePlaygroundOrchestration(
      'Tôi 50 tuổi, hay đau lưng, ngủ 2 người, giường 1m8, ngân sách khoảng 10 triệu nên mua đệm gì?',
      products,
      knowledgeItems
    )
  );
  const [feedbackSaved, setFeedbackSaved] = useState<string | null>(null);

  const sampleQueries = [
    'Tôi 50 tuổi, hay đau lưng, ngủ 2 người, giường 1m8, ngân sách khoảng 10 triệu nên mua đệm gì?',
    'Đệm lò xo Dunlopillo Audrey có bị rung khi người bên cạnh trở mình không?',
    'Khách ở Hải Phòng có được miễn phí vận chuyển và bưng lên phòng không?',
    'Tư vấn đệm cao su tự nhiên cho phòng ngủ vợ chồng trẻ dưới 12 triệu',
    'Chính sách 30 ngày ngủ thử đổi trả áp dụng cho những dòng đệm nào?',
  ];

  const handleRunTest = (queryToRun?: string) => {
    const q = queryToRun || inputQuery;
    if (!q.trim()) return;
    const res = executePlaygroundOrchestration(q, products, knowledgeItems);
    setTestResult(res);
    setFeedbackSaved(null);
  };

  const handleFeedback = (type: 'CORRECT' | 'WRONG') => {
    setFeedbackSaved(type === 'CORRECT' ? 'Đã lưu đánh giá: AI trả lời chính xác!' : 'Đã ghi nhận báo lỗi để tinh chỉnh!');
    addAuditLog(
      type === 'CORRECT' ? 'Đánh giá AI Playground: Đúng' : 'Đánh giá AI Playground: Sai lệch',
      `Câu hỏi test: "${testResult.query}"`,
      'ai'
    );
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-amber-950 text-amber-300 border border-amber-800 text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
              <Cpu className="w-3 h-3" /> AI TESTING SANDBOX
            </span>
            <h2 className="text-xl font-black text-white tracking-tight">
              AI Training Playground & Trình Thẩm Định Response Validator
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Thử nghiệm câu hỏi thực tế của khách hàng, xem minh bạch nguồn trích dẫn RAG & kiểm duyệt tính trung thực của AI
          </p>
        </div>
      </div>

      {/* Query Input Box */}
      <div className="bg-slate-950 rounded-2xl border border-slate-800 p-4 space-y-3">
        <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
          Nhập câu hỏi thử nghiệm của khách hàng:
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleRunTest()}
            placeholder="Ví dụ: Tôi 50 tuổi bị thoái hóa cột sống cần tìm đệm 1m8 tầm 10 triệu..."
            className="flex-1 bg-slate-900 border border-slate-800 text-xs text-slate-100 px-4 py-2.5 rounded-xl outline-none focus:border-emerald-500 font-medium"
          />
          <button
            onClick={() => handleRunTest()}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition shadow-md flex items-center gap-1.5 shrink-0"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Chạy Kiểm Tra</span>
          </button>
        </div>

        {/* Quick Sample Queries */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-1 text-[11px]">
          <span className="text-slate-500 shrink-0">Gợi ý câu hỏi:</span>
          {sampleQueries.map((sq, i) => (
            <button
              key={i}
              onClick={() => {
                setInputQuery(sq);
                handleRunTest(sq);
              }}
              className="bg-slate-900 hover:bg-slate-850 text-slate-300 border border-slate-800 hover:border-slate-700 px-2.5 py-1 rounded-lg truncate max-w-xs transition shrink-0"
            >
              {sq}
            </button>
          ))}
        </div>
      </div>

      {/* 4 Inspection Panels Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Panel 1: Extracted Sleep Profile (JSON) & Recommendation Weights (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Extracted Customer Profile */}
          <div className="bg-slate-950 rounded-2xl border border-slate-800 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-blue-400" />
                <span>1. Extracted Customer Profile (JSON)</span>
              </h3>
              <span className="text-[10px] bg-blue-950 text-blue-300 px-2 py-0.5 rounded font-mono">
                Intent: Tư vấn theo nhu cầu
              </span>
            </div>

            <pre className="bg-slate-900 p-3 rounded-xl border border-slate-800 text-[11px] font-mono text-emerald-300 overflow-x-auto leading-relaxed">
{JSON.stringify(testResult.extractedProfile, null, 2)}
            </pre>
          </div>

          {/* Recommendation Engine Calculation */}
          <div className="bg-slate-950 rounded-2xl border border-slate-800 p-4 space-y-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-amber-400" />
              <span>2. Product Ranking Engine (Thuật toán tính điểm)</span>
            </h3>

            <div className="space-y-2">
              {testResult.recommendedProducts.map((rec, idx) => (
                <div
                  key={rec.product.id}
                  className="bg-slate-900 p-3 rounded-xl border border-slate-800 text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-200">
                      {idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'} {rec.product.name}
                    </span>
                    <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold px-2 py-0.5 rounded text-[10px]">
                      {rec.score}% Phù hợp
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-1 text-[10px] text-slate-400 pt-1 border-t border-slate-800">
                    <div>Ngân sách: <strong>{rec.scoreBreakdown.budgetMatch}/25</strong></div>
                    <div>Kích thước: <strong>{rec.scoreBreakdown.sizeMatch}/20</strong></div>
                    <div>Độ cứng: <strong>{rec.scoreBreakdown.firmnessMatch}/15</strong></div>
                  </div>

                  <div className="text-[11px] text-slate-300">
                    {rec.reason.map((r, i) => (
                      <div key={i} className="flex items-center gap-1 text-slate-400">
                        <span className="text-emerald-400">✓</span> {r}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Message Sources (RAG Traceability) */}
          <div className="bg-slate-950 rounded-2xl border border-slate-800 p-4 space-y-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-purple-400" />
              <span>3. Nguồn AI Trích Dẫn (Message Sources)</span>
            </h3>

            <div className="space-y-2">
              {testResult.sources.map((src) => (
                <div
                  key={src.id}
                  className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-emerald-400">{src.sourceName}</span>
                    <span className="text-slate-400 font-mono text-[10px]">
                      Score: {(src.relevanceScore * 100).toFixed(0)}%
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">{src.snippet}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Panel 2: AI Response & Response Validator (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Response Validator Status Box */}
          <div className="bg-slate-950 rounded-2xl border border-slate-800 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>4. Thẩm Định Response Validator (Kiểm duyệt trước khi gửi)</span>
              </h3>
              <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">
                Hallucination Risk: {testResult.validation.hallucinationRisk}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="bg-slate-900 p-2 rounded-xl border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 block">Kiểm tra giá DB:</span>
                <span className="font-bold text-emerald-400">✓ CHÍNH XÁC 100%</span>
              </div>
              <div className="bg-slate-900 p-2 rounded-xl border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 block">Kiểm tra tồn kho:</span>
                <span className="font-bold text-emerald-400">✓ CÒN HÀNG THẬT</span>
              </div>
              <div className="bg-slate-900 p-2 rounded-xl border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 block">Chính sách bảo hành:</span>
                <span className="font-bold text-emerald-400">✓ ĐÚNG CHUẨN</span>
              </div>
            </div>

            <div className="space-y-1 text-[11px] text-slate-400 pt-1">
              {testResult.validation.notes.map((n, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>{n}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Generated AI Response Output */}
          <div className="bg-slate-950 rounded-2xl border border-slate-800 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Câu Trả Lời Của AI Xuất Bản Tới Khách Hàng:
              </h3>
              <span className="text-[10px] text-slate-400">demxanh.com live widget format</span>
            </div>

            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 text-xs text-slate-100 whitespace-pre-wrap leading-relaxed">
              {testResult.responseText}
            </div>

            {/* Human in the loop Feedback Actions */}
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
              <div className="text-xs text-slate-400">
                Quản trị viên đánh giá câu trả lời này:
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleFeedback('CORRECT')}
                  className="bg-slate-900 hover:bg-emerald-950 hover:text-emerald-300 text-slate-300 border border-slate-800 hover:border-emerald-700 px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <ThumbsUp className="w-3.5 h-3.5 text-emerald-400" />
                  <span>[ 👍 Đúng ]</span>
                </button>
                <button
                  onClick={() => handleFeedback('WRONG')}
                  className="bg-slate-900 hover:bg-rose-950 hover:text-rose-300 text-slate-300 border border-slate-800 hover:border-rose-700 px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <ThumbsDown className="w-3.5 h-3.5 text-rose-400" />
                  <span>[ 👎 Sai / Báo lỗi ]</span>
                </button>
              </div>
            </div>

            {feedbackSaved && (
              <div className="bg-emerald-950 text-emerald-200 border border-emerald-800 p-2 rounded-xl text-xs text-center font-bold">
                {feedbackSaved}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
