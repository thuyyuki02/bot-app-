import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Product,
  KnowledgeItem,
  LeadStatus,
  BusinessRule,
} from '../../types';
import {
  LayoutDashboard,
  MessageSquare,
  Users,
  Package,
  BookOpen,
  Bot,
  Scale,
  SlidersHorizontal,
  Kanban,
  UserCheck,
  BarChart3,
  CheckCircle,
  Palette,
  Layers,
  Code,
  Bell,
  History,
  Search,
  Plus,
  Trash2,
  Edit,
  Save,
  RotateCcw,
  Upload,
  ExternalLink,
  Flame,
  Check,
  X,
  Sparkles,
  ArrowRight,
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Phone,
  Tag,
  AlertTriangle,
  Database,
  Network,
  Cpu,
  FolderTree,
} from 'lucide-react';
import { DatabaseSchemaTab } from './tabs/DatabaseSchemaTab';
import { AiPlaygroundTab } from './tabs/AiPlaygroundTab';
import { ApiArchitectureTab } from './tabs/ApiArchitectureTab';
import { CodeArchitectureTab } from './tabs/CodeArchitectureTab';

type AdminTab =
  | 'dashboard'
  | 'playground'
  | 'database_schema'
  | 'api_docs'
  | 'code_arch'
  | 'conversations'
  | 'customers'
  | 'products'
  | 'knowledge'
  | 'ai_config'
  | 'rules'
  | 'recommendations'
  | 'leads'
  | 'staff'
  | 'analytics'
  | 'quality'
  | 'appearance'
  | 'integrations'
  | 'audit';


export const AdminPlatform: React.FC = () => {
  const {
    products,
    setProducts,
    knowledgeItems,
    setKnowledgeItems,
    conversations,
    leads,
    updateLeadStatus,
    staffList,
    aiConfig,
    setAiConfig,
    businessRules,
    toggleRule,
    recommendationWeights,
    setRecommendationWeights,
    appearance,
    setAppearance,
    quickReplies,
    setQuickReplies,
    auditLogs,
    failedQuestions,
    convertFailedQuestionToKb,
    addKnowledgeItem,
    addProduct,
    updateProduct,
    takeoverConversation,
    currentStaff,
    addAuditLog,
  } = useApp();

  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');

  // Search and filter states
  const [productSearch, setProductSearch] = useState('');
  const [selectedProductForEdit, setSelectedProductForEdit] = useState<Product | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);

  // Knowledge base state
  const [kbCategoryFilter, setKbCategoryFilter] = useState('All');
  const [isKbModalOpen, setIsKbModalOpen] = useState(false);
  const [editingKbItem, setEditingKbItem] = useState<Partial<KnowledgeItem> | null>(null);

  // Document upload simulation state (D9)
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);

  // System Prompt notification
  const [promptSavedNotice, setPromptSavedNotice] = useState(false);

  // Quick reply new title
  const [newQuickReplyTitle, setNewQuickReplyTitle] = useState('');

  // Save AI Config handler
  const handleSaveAIConfig = (e: React.FormEvent) => {
    e.preventDefault();
    setPromptSavedNotice(true);
    addAuditLog('Cập nhật cấu hình AI & System Prompt', `Model: ${aiConfig.model}, Temp: ${aiConfig.temperature}`, 'ai');
    setTimeout(() => setPromptSavedNotice(false), 3000);
  };

  // Document upload simulation
  const handleSimulateDocUpload = () => {
    setUploadStatus('Đang tải lên và trích xuất nội dung văn bản...');
    setTimeout(() => {
      setUploadStatus('Đang bóc tách phân đoạn & khởi tạo Vector Embeddings...');
      setTimeout(() => {
        setUploadStatus('Hoàn tất! Đã lập chỉ mục 12 phân đoạn vào Knowledge Base.');
        addKnowledgeItem({
          title: 'Tài liệu hướng dẫn chọn đệm khách sạn 4-5 sao',
          category: 'Products',
          content: 'Tiêu chuẩn đệm khách sạn cao cấp: Sử dụng đệm lò xo túi độc lập dày từ 25cm - 30cm như Dunlopillo Audrey hoặc Evita, bề mặt tăng cường lớp cao su kháng khuẩn để tối ưu độ bền và trải nghiệm khách sạn.',
          tags: ['khách sạn', 'tài liệu', 'dunlopillo'],
        });
        setTimeout(() => setUploadStatus(null), 4000);
      }, 1200);
    }, 1200);
  };

  // Add new quick reply
  const handleAddQuickReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuickReplyTitle.trim()) return;
    setQuickReplies([
      ...quickReplies,
      {
        id: `qr-${Date.now()}`,
        title: newQuickReplyTitle.trim(),
        icon: 'MessageCircle',
        actionType: 'custom',
        enabled: true,
      },
    ]);
    setNewQuickReplyTitle('');
  };

  return (
    <div className="flex-1 bg-slate-900 text-slate-100 flex h-[calc(100vh-64px)] overflow-hidden">
      {/* ADMIN SIDEBAR */}
      <aside className="w-64 bg-slate-950 border-r border-slate-800 flex flex-col shrink-0">
        <div className="p-4 border-b border-slate-800 flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center font-bold text-white text-xs">
            DX
          </div>
          <div>
            <h2 className="font-extrabold text-xs text-white tracking-wide">
              AI SALES PLATFORM
            </h2>
            <p className="text-[10px] text-slate-400">Admin Control Center</p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto p-2 space-y-0.5 text-xs font-semibold">
          {[
            { id: 'dashboard', label: 'D01 Dashboard', icon: LayoutDashboard },
            { id: 'playground', label: 'AI Training Playground ★', icon: Cpu },
            { id: 'database_schema', label: 'Database Schema & DDL ★', icon: Database },
            { id: 'api_docs', label: 'API Architecture & cURL ★', icon: Network },
            { id: 'code_arch', label: 'Kiến trúc Code NestJS ★', icon: FolderTree },
            { id: 'conversations', label: 'D02 Hội thoại khách', icon: MessageSquare },
            { id: 'leads', label: 'D14 Quản lý Lead (Kanban)', icon: Kanban },
            { id: 'customers', label: 'D04 Khách hàng (CRM)', icon: Users },
            { id: 'products', label: 'D05 Sản phẩm & AI Tag', icon: Package },
            { id: 'knowledge', label: 'D07 Kiến thức (RAG KB)', icon: BookOpen },
            { id: 'ai_config', label: 'D10 AI Config & Prompt', icon: Bot },
            { id: 'rules', label: 'D12 Business Rules', icon: Scale },
            { id: 'recommendations', label: 'D13 Engine Đề xuất', icon: SlidersHorizontal },
            { id: 'analytics', label: 'D18 Báo cáo & Phễu', icon: BarChart3 },
            { id: 'quality', label: 'D19 AI Quality & Gap', icon: Sparkles },
            { id: 'staff', label: 'D16 Nhân sự & Phân quyền', icon: UserCheck },
            { id: 'appearance', label: 'D20 Giao diện Chatbot', icon: Palette },
            { id: 'integrations', label: 'D23 Tích hợp & Nhúng Web', icon: Code },
            { id: 'audit', label: 'D26 Nhật ký Audit Log', icon: History },
          ].map((item) => {

            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as AdminTab)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition ${
                  isActive
                    ? 'bg-emerald-600 text-white font-bold shadow-md shadow-emerald-900/40'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer info */}
        <div className="p-3 border-t border-slate-800 text-[11px] text-slate-400 bg-slate-950/60">
          <div className="flex items-center justify-between">
            <span>Model: Gemini 3.8</span>
            <span className="text-emerald-400 font-bold">Active</span>
          </div>
        </div>
      </aside>

      {/* ADMIN MAIN CONTENT VIEW */}
      <main className="flex-1 overflow-y-auto bg-slate-900 flex flex-col p-5 sm:p-7">
        {/* TAB 1: D01 DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6 max-w-6xl mx-auto w-full">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  D01 — Báo Cáo Tổng Quan AI Sales & Phễu Chuyển Đổi
                </h1>
                <p className="text-xs text-slate-400">
                  Thời gian thực • Tự động đồng bộ hóa trên website demxanh.com
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-xl font-medium text-slate-300">
                  Hôm nay: 08/10/2026
                </span>
              </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Tổng hội thoại Chat</span>
                  <MessageSquare className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-2xl font-black text-white">12,532</div>
                <div className="text-[11px] text-emerald-400 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> +14.2% so với tuần trước
                </div>
              </div>

              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Số Lead thu thập</span>
                  <Flame className="w-4 h-4 text-rose-500 fill-rose-500" />
                </div>
                <div className="text-2xl font-black text-rose-400">2,381</div>
                <div className="text-[11px] text-emerald-400 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> Tỷ lệ tạo Lead: 19.0%
                </div>
              </div>

              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Đơn hàng chốt thành công</span>
                  <ShoppingCart className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-2xl font-black text-white">682</div>
                <div className="text-[11px] text-amber-400 flex items-center gap-1">
                  Lead → Order: 28.6%
                </div>
              </div>

              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Doanh thu mang lại</span>
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-2xl font-black text-emerald-400">2.84 Tỷ VNĐ</div>
                <div className="text-[11px] text-slate-400">Giá trị TB: 4.16 Tr/đơn</div>
              </div>
            </div>

            {/* AI Performance Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 block">Thời gian phản hồi TB</span>
                  <span className="text-xl font-bold text-white">1.2 giây</span>
                </div>
                <div className="w-10 h-10 rounded-full bg-emerald-950 text-emerald-400 flex items-center justify-center font-bold text-xs">
                  AI
                </div>
              </div>
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 block">Tỷ lệ AI tự giải quyết</span>
                  <span className="text-xl font-bold text-emerald-400">74.2%</span>
                </div>
                <div className="w-10 h-10 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center font-bold text-xs">
                  Auto
                </div>
              </div>
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 block">Tỷ lệ Human Takeover</span>
                  <span className="text-xl font-bold text-amber-400">25.8%</span>
                </div>
                <div className="w-10 h-10 rounded-full bg-amber-950 text-amber-400 flex items-center justify-center font-bold text-xs">
                  Staff
                </div>
              </div>
            </div>

            {/* Conversion Funnel Breakdown (Section J: The Funnel) */}
            <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-sm text-white">
                    Phễu Bán Hàng Toàn Diện (AI Sales & Customer Service Funnel)
                  </h3>
                  <p className="text-xs text-slate-400">
                    Hành trình biến người ghé thăm website demxanh.com thành khách mua hàng thân thiết
                  </p>
                </div>
                <span className="text-xs text-emerald-400 font-mono">100% Funnel Tracking</span>
              </div>

              <div className="space-y-3 pt-2">
                {[
                  {
                    step: 'Website Visitor',
                    count: '65,420 lượt',
                    percent: 100,
                    color: 'bg-slate-700',
                  },
                  {
                    step: 'Mở Chat / Bắt đầu trò chuyện',
                    count: '12,532 khách (19.1%)',
                    percent: 80,
                    color: 'bg-blue-600',
                  },
                  {
                    step: 'Xác định nhu cầu (5 câu tư vấn)',
                    count: '5,840 khách (46.6%)',
                    percent: 60,
                    color: 'bg-indigo-600',
                  },
                  {
                    step: 'Đề xuất sản phẩm & Báo giá',
                    count: '4,120 khách (70.5%)',
                    percent: 45,
                    color: 'bg-purple-600',
                  },
                  {
                    step: 'Thu thập Qualified Lead (SĐT)',
                    count: '2,381 Lead (57.8%)',
                    percent: 32,
                    color: 'bg-amber-600',
                  },
                  {
                    step: 'Nhân viên chốt đơn (Order Won)',
                    count: '682 đơn hàng (28.6%)',
                    percent: 18,
                    color: 'bg-emerald-600',
                  },
                ].map((f, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-slate-200">{f.step}</span>
                      <span className="text-slate-400 font-mono">{f.count}</span>
                    </div>
                    <div className="w-full bg-slate-900 rounded-full h-3 overflow-hidden">
                      <div
                        className={`${f.color} h-3 rounded-full transition-all duration-500`}
                        style={{ width: `${f.percent}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB: PLAYGROUND */}
        {activeTab === 'playground' && <AiPlaygroundTab />}

        {/* TAB: DATABASE SCHEMA */}
        {activeTab === 'database_schema' && <DatabaseSchemaTab />}

        {/* TAB: API DOCS & TESTER */}
        {activeTab === 'api_docs' && <ApiArchitectureTab />}

        {/* TAB: CODE ARCHITECTURE */}
        {activeTab === 'code_arch' && <CodeArchitectureTab />}


        {/* TAB 2: D02-D03 CONVERSATIONS MANAGEMENT */}
        {activeTab === 'conversations' && (
          <div className="space-y-5 max-w-6xl mx-auto w-full">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-white">
                  D02 — Quản Lý Cuộc Hội Thoại & Giám Sát Thời Gian Thực
                </h2>
                <p className="text-xs text-slate-400">
                  Lọc theo trạng thái, intent và điểm lead score
                </p>
              </div>
            </div>

            <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden">
              <table className="w-full text-xs">
                <thead className="bg-slate-900 text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="text-left p-3 font-semibold">Khách hàng</th>
                    <th className="text-left p-3 font-semibold">Số điện thoại</th>
                    <th className="text-left p-3 font-semibold">Ý định (Intent)</th>
                    <th className="text-left p-3 font-semibold">Trạng thái</th>
                    <th className="text-left p-3 font-semibold">Lead Score</th>
                    <th className="text-left p-3 font-semibold">Nhân viên phụ trách</th>
                    <th className="text-right p-3 font-semibold">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850">
                  {conversations.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-900/60 transition">
                      <td className="p-3 font-bold text-slate-200">
                        {c.customerName}
                      </td>
                      <td className="p-3 font-mono text-emerald-400">
                        {c.customerPhone || 'Chưa cung cấp'}
                      </td>
                      <td className="p-3 text-slate-300">
                        {c.intent || 'Tư vấn đệm'}
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            c.status === 'HUMAN_ACTIVE'
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                              : c.status === 'WAITING_AGENT'
                              ? 'bg-amber-950 text-amber-300 border border-amber-800'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {c.status}
                        </span>
                      </td>
                      <td className="p-3">
                        <span
                          className={`font-bold ${
                            c.leadScore >= 80 ? 'text-rose-400' : 'text-amber-400'
                          }`}
                        >
                          {c.leadScore}/100
                        </span>
                      </td>
                      <td className="p-3 text-slate-300">
                        {c.assignedAgent?.name || 'AI tự động'}
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => takeoverConversation(c.id, currentStaff)}
                          className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1 rounded-lg text-[11px] font-medium"
                        >
                          Tiếp quản
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: D14-D15 LEADS MANAGEMENT (KANBAN) */}
        {activeTab === 'leads' && (
          <div className="space-y-5 max-w-6xl mx-auto w-full">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-white">
                  D14 — Quản Lý Lead Bán Hàng (Kanban Board)
                </h2>
                <p className="text-xs text-slate-400">
                  Phân loại Lead theo tiến trình từ Tiếp nhận tới Chốt đơn
                </p>
              </div>
            </div>

            {/* Kanban Columns */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {[
                { id: 'NEW', title: 'Mới nhận', color: 'border-blue-500' },
                { id: 'CONTACTED', title: 'Đã liên hệ', color: 'border-cyan-500' },
                { id: 'QUALIFIED', title: 'Đạt điều kiện', color: 'border-amber-500' },
                { id: 'NEGOTIATING', title: 'Đang đàm phán', color: 'border-purple-500' },
                { id: 'WON', title: 'Chốt đơn (Won)', color: 'border-emerald-500' },
                { id: 'LOST', title: 'Thất bại', color: 'border-rose-500' },
              ].map((col) => {
                const colLeads = leads.filter((l) => l.status === col.id);
                return (
                  <div
                    key={col.id}
                    className={`bg-slate-950 p-2.5 rounded-2xl border-t-4 ${col.color} border-slate-800 min-h-[500px] flex flex-col space-y-2.5`}
                  >
                    <div className="flex items-center justify-between px-1">
                      <span className="font-bold text-xs text-slate-200">
                        {col.title}
                      </span>
                      <span className="bg-slate-800 text-slate-400 px-1.5 py-0.2 rounded-full text-[10px] font-bold">
                        {colLeads.length}
                      </span>
                    </div>

                    <div className="flex-1 space-y-2 overflow-y-auto">
                      {colLeads.map((lead) => (
                        <div
                          key={lead.id}
                          className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-2 hover:border-slate-700 transition"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xs text-slate-100 truncate">
                              {lead.customerName}
                            </span>
                            <span className="text-[10px] bg-rose-950 text-rose-300 px-1.5 py-0.2 rounded font-bold">
                              🔥 {lead.score}
                            </span>
                          </div>

                          <div className="text-[11px] font-mono text-emerald-400">
                            📱 {lead.phone}
                          </div>

                          <div className="text-[11px] text-slate-400 line-clamp-2">
                            {lead.productInterest}
                          </div>

                          <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-800 flex justify-between">
                            <span>{lead.area}</span>
                            <span>{lead.createdAt}</span>
                          </div>

                          {/* Quick change status dropdown */}
                          <select
                            value={lead.status}
                            onChange={(e) =>
                              updateLeadStatus(lead.id, e.target.value as LeadStatus)
                            }
                            className="w-full text-[10px] bg-slate-950 border border-slate-800 rounded p-1 text-slate-300 outline-none"
                          >
                            <option value="NEW">Mới nhận</option>
                            <option value="CONTACTED">Đã liên hệ</option>
                            <option value="QUALIFIED">Đạt điều kiện</option>
                            <option value="NEGOTIATING">Đang đàm phán</option>
                            <option value="WON">Chốt đơn (Won)</option>
                            <option value="LOST">Thất bại</option>
                          </select>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 4: D05-D06 PRODUCTS CATALOG & AI ATTRIBUTES EDITOR */}
        {activeTab === 'products' && (
          <div className="space-y-5 max-w-6xl mx-auto w-full">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h2 className="text-xl font-black text-white">
                  D05 — Danh Mục Sản Phẩm & Cấu Hình AI Attributes
                </h2>
                <p className="text-xs text-slate-400">
                  Quản lý thông số độ dày, độ cứng, đối tượng phù hợp để AI đề xuất chính xác
                </p>
              </div>
              <button
                onClick={() => {
                  addProduct({
                    name: 'Đệm lò xo túi Dunlopillo mới 2026',
                    brand: 'Dunlopillo',
                    salePrice: 12500000,
                  });
                }}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition"
              >
                <Plus className="w-4 h-4" />
                <span>Thêm sản phẩm</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map((p) => (
                <div
                  key={p.id}
                  className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden p-4 space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded">
                        {p.brand}
                      </span>
                      <label className="flex items-center gap-1.5 text-xs text-slate-400 cursor-pointer">
                        <span>AI Enabled:</span>
                        <input
                          type="checkbox"
                          checked={p.aiSettings.aiEnabled}
                          onChange={(e) => {
                            updateProduct({
                              ...p,
                              aiSettings: {
                                ...p.aiSettings,
                                aiEnabled: e.target.checked,
                              },
                            });
                          }}
                          className="accent-emerald-500 rounded"
                        />
                      </label>
                    </div>

                    <h3 className="font-bold text-sm text-white line-clamp-1">
                      {p.name}
                    </h3>

                    <div className="flex items-baseline gap-2">
                      <span className="text-base font-extrabold text-rose-400">
                        {p.salePrice.toLocaleString('vi-VN')}đ
                      </span>
                      <span className="text-xs line-through text-slate-500">
                        {p.originalPrice.toLocaleString('vi-VN')}đ
                      </span>
                    </div>

                    <div className="text-xs space-y-1 pt-1 border-t border-slate-850 text-slate-400">
                      <div>
                        <strong>Độ cứng:</strong> {p.firmness} • <strong>Độ dày:</strong>{' '}
                        {p.thickness}
                      </div>
                      <div>
                        <strong>Phù hợp AI:</strong> {p.aiSettings.suitableFor.join(', ')}
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-850 flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-mono">Tồn: {p.stock} chiếc</span>
                    <button
                      onClick={() => {
                        const newName = prompt('Nhập tên sản phẩm mới:', p.name);
                        if (newName) updateProduct({ ...p, name: newName });
                      }}
                      className="text-emerald-400 hover:underline font-semibold"
                    >
                      Chỉnh sửa &gt;
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: D07-D09 KNOWLEDGE BASE & DOCUMENT IMPORTER */}
        {activeTab === 'knowledge' && (
          <div className="space-y-5 max-w-6xl mx-auto w-full">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h2 className="text-xl font-black text-white">
                  D07 — Cơ Sở Tri Thức (Knowledge Base) & Nạp Tài Liệu RAG
                </h2>
                <p className="text-xs text-slate-400">
                  Đảm bảo AI trả lời chuẩn xác chính sách vận chuyển, ngủ thử 30 ngày và không hallucinate
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleSimulateDocUpload}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs px-3.5 py-2 rounded-xl border border-slate-700 flex items-center gap-1.5 transition"
                >
                  <Upload className="w-4 h-4 text-emerald-400" />
                  <span>D09 Nạp File PDF/DOCX</span>
                </button>
                <button
                  onClick={() => {
                    const title = prompt('Tiêu đề bài viết mới:');
                    if (title) {
                      addKnowledgeItem({
                        title,
                        category: 'FAQ',
                        content: 'Nội dung kiến thức chuẩn từ Đệm Xanh.',
                      });
                    }
                  }}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition"
                >
                  <Plus className="w-4 h-4" />
                  <span>Thêm bài viết</span>
                </button>
              </div>
            </div>

            {/* Document upload status banner */}
            {uploadStatus && (
              <div className="bg-emerald-950 text-emerald-200 border border-emerald-800 p-3 rounded-2xl text-xs flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400 animate-spin" />
                <span>{uploadStatus}</span>
              </div>
            )}

            {/* KB Articles List */}
            <div className="space-y-3">
              {knowledgeItems.map((kb) => (
                <div
                  key={kb.id}
                  className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2 hover:border-slate-700 transition"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="bg-slate-800 text-slate-300 text-[10px] font-bold px-2 py-0.5 rounded">
                        {kb.category}
                      </span>
                      <h3 className="font-bold text-sm text-slate-100">{kb.title}</h3>
                    </div>
                    <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                      {kb.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">{kb.content}</p>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-850">
                    <div className="flex gap-1.5">
                      {kb.tags.map((t) => (
                        <span key={t} className="bg-slate-900 text-slate-400 px-1.5 py-0.2 rounded">
                          #{t}
                        </span>
                      ))}
                    </div>
                    <span>Cập nhật: {kb.updatedAt}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: D10-D11 AI CONFIG & SYSTEM PROMPT */}
        {activeTab === 'ai_config' && (
          <div className="space-y-5 max-w-4xl mx-auto w-full">
            <div>
              <h2 className="text-xl font-black text-white">
                D10 — Cấu Hình Trợ Lý AI & System Instructions
              </h2>
              <p className="text-xs text-slate-400">
                Thiết lập phong cách trả lời, nhiệt độ temperature và lời nhắc hệ thống
              </p>
            </div>

            {promptSavedNotice && (
              <div className="bg-emerald-950 text-emerald-200 border border-emerald-800 p-3 rounded-2xl text-xs flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span>Đã lưu cấu hình AI & System Prompt thành công!</span>
              </div>
            )}

            <form onSubmit={handleSaveAIConfig} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Tên Trợ Lý Bot:</label>
                  <input
                    type="text"
                    value={aiConfig.botName}
                    onChange={(e) => setAiConfig({ ...aiConfig, botName: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 text-xs text-slate-100 p-2.5 rounded-xl outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Mô hình AI Model:</label>
                  <select
                    value={aiConfig.model}
                    onChange={(e) => setAiConfig({ ...aiConfig, model: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 text-xs text-slate-100 p-2.5 rounded-xl outline-none focus:border-emerald-500"
                  >
                    <option value="gemini-3.8-flash">gemini-3.8-flash (Tốc độ cao, tối ưu Q&A)</option>
                    <option value="gemini-3.1-pro-preview">gemini-3.1-pro-preview</option>
                  </select>
                </div>
              </div>

              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-slate-300">Nhiệt độ sáng tạo (Temperature):</span>
                  <span className="font-mono text-emerald-400 font-bold">{aiConfig.temperature}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={aiConfig.temperature}
                  onChange={(e) =>
                    setAiConfig({ ...aiConfig, temperature: parseFloat(e.target.value) })
                  }
                  className="w-full accent-emerald-500 cursor-pointer"
                />
                <p className="text-[11px] text-slate-500">
                  Nhiệt độ 0.3 giúp AI bám sát dữ liệu giá và tồn kho của Đệm Xanh, tránh bịa đặt.
                </p>
              </div>

              {/* System Instructions Editor */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300">
                    D11 — System Instructions (Lời nhắc hệ thống):
                  </label>
                  <span className="text-[10px] text-slate-500">Markdown format</span>
                </div>
                <textarea
                  rows={10}
                  value={aiConfig.systemPrompt}
                  onChange={(e) => setAiConfig({ ...aiConfig, systemPrompt: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 text-xs text-slate-100 p-3 rounded-xl outline-none focus:border-emerald-500 font-mono leading-relaxed"
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md transition flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>Lưu cấu hình</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 7: D12 BUSINESS RULES BUILDER */}
        {activeTab === 'rules' && (
          <div className="space-y-5 max-w-4xl mx-auto w-full">
            <div>
              <h2 className="text-xl font-black text-white">
                D12 — Quy Tắc Nghiệp Vụ Tự Động (AI Business Rules)
              </h2>
              <p className="text-xs text-slate-400">
                Thiết lập logic WHEN / THEN / FALLBACK cho chatbot bán hàng
              </p>
            </div>

            <div className="space-y-3">
              {businessRules.map((rule) => (
                <div
                  key={rule.id}
                  className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-sm text-white">{rule.name}</h3>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <span className="text-xs text-slate-400">
                        {rule.enabled ? 'Đang kích hoạt' : 'Tạm tắt'}
                      </span>
                      <input
                        type="checkbox"
                        checked={rule.enabled}
                        onChange={() => toggleRule(rule.id)}
                        className="accent-emerald-500 rounded"
                      />
                    </label>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
                    <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                      <span className="text-amber-400 font-bold block text-[10px] mb-0.5">WHEN</span>
                      <span className="text-slate-300">{rule.trigger}</span>
                    </div>
                    <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                      <span className="text-emerald-400 font-bold block text-[10px] mb-0.5">THEN</span>
                      <span className="text-slate-300">{rule.action}</span>
                    </div>
                    <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                      <span className="text-slate-500 font-bold block text-[10px] mb-0.5">FALLBACK</span>
                      <span className="text-slate-300">{rule.fallback}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 8: D13 RECOMMENDATION ENGINE WEIGHTS */}
        {activeTab === 'recommendations' && (
          <div className="space-y-5 max-w-4xl mx-auto w-full">
            <div>
              <h2 className="text-xl font-black text-white">
                D13 — Thuật Toán & Trọng Số Đề Xuất (Recommendation Engine)
              </h2>
              <p className="text-xs text-slate-400">
                Điều chỉnh thanh trượt trọng số để xếp hạng sản phẩm đệm phù hợp nhất với khách
              </p>
            </div>

            <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-5">
              {[
                { key: 'customerNeed', label: 'Mức độ đáp ứng nhu cầu khách' },
                { key: 'productSuitability', label: 'Độ phù hợp thể trạng & y khoa' },
                { key: 'priceMatch', label: 'Độ khớp ngân sách dự kiến' },
                { key: 'promotion', label: 'Ưu tiên khuyến mãi & quà tặng' },
                { key: 'stockAvailability', label: 'Tồn kho sẵn tại kho gần nhất' },
                { key: 'brandPreference', label: 'Ưu tiên thương hiệu nổi tiếng' },
              ].map((item) => (
                <div key={item.key} className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-slate-200">{item.label}</span>
                    <span className="font-mono text-emerald-400 font-bold">
                      {(recommendationWeights as any)[item.key]}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={(recommendationWeights as any)[item.key]}
                    onChange={(e) =>
                      setRecommendationWeights({
                        ...recommendationWeights,
                        [item.key]: parseInt(e.target.value),
                      })
                    }
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                </div>
              ))}

              <div className="pt-4 border-t border-slate-800 space-y-2 text-xs">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={recommendationWeights.doNotRecommendOutOfStock}
                    onChange={(e) =>
                      setRecommendationWeights({
                        ...recommendationWeights,
                        doNotRecommendOutOfStock: e.target.checked,
                      })
                    }
                    className="accent-emerald-500 rounded"
                  />
                  <span>Không bao giờ đề xuất sản phẩm đã hết hàng (Stock = 0)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={recommendationWeights.showCheaperAlternative}
                    onChange={(e) =>
                      setRecommendationWeights({
                        ...recommendationWeights,
                        showCheaperAlternative: e.target.checked,
                      })
                    }
                    className="accent-emerald-500 rounded"
                  />
                  <span>Tự động kèm 01 giải pháp giá tốt hơn trong cùng phân khúc</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* TAB 9: D19 AI QUALITY & UNANSWERED QUESTIONS */}
        {activeTab === 'quality' && (
          <div className="space-y-5 max-w-4xl mx-auto w-full">
            <div>
              <h2 className="text-xl font-black text-white">
                D19 — Giám Sát Chất Lượng AI & Lỗ Hổng Kiến Thức (Knowledge Gap)
              </h2>
              <p className="text-xs text-slate-400">
                Tự động thu thập câu hỏi khách hàng mà AI chưa có dữ liệu chính xác để bổ sung
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-center">
                <span className="text-xs text-slate-400 block">Độ chính xác AI</span>
                <span className="text-2xl font-black text-emerald-400">96.2%</span>
              </div>
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-center">
                <span className="text-xs text-slate-400 block">Độ hữu ích đánh giá</span>
                <span className="text-2xl font-black text-white">93.8%</span>
              </div>
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-center">
                <span className="text-xs text-slate-400 block">Tỷ lệ Hallucination</span>
                <span className="text-2xl font-black text-rose-400">&lt; 1.1%</span>
              </div>
            </div>

            <div className="bg-slate-950 p-5 rounded-3xl border border-slate-800 space-y-3">
              <h3 className="font-bold text-xs text-slate-300 uppercase tracking-wider">
                Danh sách câu hỏi chưa có câu trả lời hoàn hảo:
              </h3>

              <div className="space-y-2">
                {failedQuestions.map((fq) => (
                  <div
                    key={fq.id}
                    className="bg-slate-900 p-3 rounded-xl border border-slate-800 flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="font-semibold text-rose-300">❌ "{fq.question}"</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Lặp lại {fq.occurrences} lần • Lần hỏi gần nhất: {fq.lastAsked}
                      </div>
                    </div>

                    {fq.status === 'added_to_kb' ? (
                      <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-1 rounded font-bold">
                        ✓ Đã bổ sung vào KB
                      </span>
                    ) : (
                      <button
                        onClick={() => convertFailedQuestionToKb(fq)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] px-3 py-1.5 rounded-xl transition shrink-0"
                      >
                        [ + Thêm vào Knowledge Base ]
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 10: D20-D22 APPEARANCE & QUICK REPLIES */}
        {activeTab === 'appearance' && (
          <div className="space-y-5 max-w-4xl mx-auto w-full">
            <div>
              <h2 className="text-xl font-black text-white">
                D20 — Tùy Biến Giao Diện Chatbot & Tin Nhắn Chủ Động
              </h2>
              <p className="text-xs text-slate-400">
                Tự do điều chỉnh vị trí, lời chào mừng và thời gian kích hoạt popup tự động
              </p>
            </div>

            <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Vị trí hiển thị:</label>
                  <select
                    value={appearance.position}
                    onChange={(e) =>
                      setAppearance({ ...appearance, position: e.target.value as any })
                    }
                    className="w-full bg-slate-900 border border-slate-800 text-xs text-slate-100 p-2.5 rounded-xl outline-none"
                  >
                    <option value="right">Bên phải (Khuyến nghị)</option>
                    <option value="left">Bên trái</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Kích thước bong bóng:</label>
                  <select
                    value={appearance.bubbleSize}
                    onChange={(e) =>
                      setAppearance({ ...appearance, bubbleSize: e.target.value as any })
                    }
                    className="w-full bg-slate-900 border border-slate-800 text-xs text-slate-100 p-2.5 rounded-xl outline-none"
                  >
                    <option value="medium">Vừa (Medium - Chuẩn)</option>
                    <option value="small">Nhỏ (Small)</option>
                    <option value="large">Lớn (Large)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Lời chào mừng đầu tiên:</label>
                <textarea
                  rows={3}
                  value={appearance.welcomeMessage}
                  onChange={(e) =>
                    setAppearance({ ...appearance, welcomeMessage: e.target.value })
                  }
                  className="w-full bg-slate-900 border border-slate-800 text-xs text-slate-100 p-2.5 rounded-xl outline-none"
                />
              </div>

              {/* D22: Proactive Chat Trigger Builder */}
              <div className="pt-3 border-t border-slate-850 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-xs text-slate-200">
                      D22 — Kích Hoạt Mời Chat Tự Động (Proactive Trigger)
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      Tự bật popup khi khách ở trang sản phẩm lâu hơn thời gian quy định
                    </p>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={appearance.showProactiveMessage}
                      onChange={(e) =>
                        setAppearance({
                          ...appearance,
                          showProactiveMessage: e.target.checked,
                        })
                      }
                      className="accent-emerald-500 rounded"
                    />
                    <span className="text-xs text-slate-300">Bật kích hoạt</span>
                  </label>
                </div>

                <div className="flex items-center gap-3 text-xs">
                  <span className="text-slate-400">Thời gian chờ trên trang:</span>
                  <input
                    type="number"
                    min="3"
                    max="60"
                    value={appearance.proactiveDelaySec}
                    onChange={(e) =>
                      setAppearance({
                        ...appearance,
                        proactiveDelaySec: parseInt(e.target.value) || 10,
                      })
                    }
                    className="bg-slate-900 border border-slate-800 text-xs text-slate-100 px-3 py-1.5 rounded-lg w-20 text-center font-bold"
                  />
                  <span className="text-slate-400">giây</span>
                </div>
              </div>
            </div>

            {/* D21 Quick Replies Editor */}
            <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-sm text-white">
                    D21 — Nút Trả Lời Nhanh (Quick Replies)
                  </h3>
                  <p className="text-xs text-slate-400">
                    Các phím tắt khách hàng bấm nhanh khi bắt đầu chat
                  </p>
                </div>
              </div>

              <form onSubmit={handleAddQuickReply} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Thêm nút mới (ví dụ: '🎁 Nhận mã giảm 500k')..."
                  value={newQuickReplyTitle}
                  onChange={(e) => setNewQuickReplyTitle(e.target.value)}
                  className="flex-1 bg-slate-900 border border-slate-800 text-xs text-slate-100 px-3 py-2 rounded-xl outline-none"
                />
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition"
                >
                  Thêm
                </button>
              </form>

              <div className="flex flex-wrap gap-2">
                {quickReplies.map((qr) => (
                  <div
                    key={qr.id}
                    className="bg-slate-900 border border-slate-800 text-slate-200 text-xs px-3 py-1.5 rounded-full flex items-center gap-2"
                  >
                    <span>{qr.title}</span>
                    <button
                      onClick={() =>
                        setQuickReplies(quickReplies.filter((x) => x.id !== qr.id))
                      }
                      className="text-slate-500 hover:text-rose-400"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 11: D23-D24 INTEGRATIONS & EMBED SCRIPT */}
        {activeTab === 'integrations' && (
          <div className="space-y-5 max-w-4xl mx-auto w-full">
            <div>
              <h2 className="text-xl font-black text-white">
                D23 — Tích Hợp Hệ Thống & Mã Nhúng Website
              </h2>
              <p className="text-xs text-slate-400">
                Kết nối Product API, CRM, Zalo OA và mã nhúng cho website demxanh.com
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { name: 'Website demxanh.com', status: 'Đã kết nối', color: 'text-emerald-400' },
                { name: 'Product Inventory API', status: 'Đã kết nối', color: 'text-emerald-400' },
                { name: 'Hệ thống Quản lý Đơn hàng', status: 'Đang đồng bộ', color: 'text-amber-400' },
                { name: 'Google Analytics 4', status: 'Đã kết nối', color: 'text-emerald-400' },
                { name: 'Zalo Official Account', status: 'Sẵn sàng tích hợp', color: 'text-slate-400' },
                { name: 'HubSpot / KiotViet CRM', status: 'Sẵn sàng tích hợp', color: 'text-slate-400' },
              ].map((item, i) => (
                <div
                  key={i}
                  className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-center justify-between text-xs"
                >
                  <span className="font-semibold text-slate-200">{item.name}</span>
                  <span className={`font-bold flex items-center gap-1 ${item.color}`}>
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>{item.status}</span>
                  </span>
                </div>
              ))}
            </div>

            {/* D24: Website Installation Widget Script */}
            <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-white">
                    D24 — Mã Nhúng Widget Đệm Xanh AI
                  </h3>
                  <p className="text-xs text-slate-400">
                    Dán đoạn mã script này vào trước thẻ &lt;/body&gt; trên demxanh.com
                  </p>
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(
                      `<script src="https://ai.demxanh.com/widget.js" data-site-id="demxanh" async></script>`
                    );
                    alert('Đã sao chép mã script nhúng vào clipboard!');
                  }}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl transition"
                >
                  Sao chép Script
                </button>
              </div>

              <pre className="bg-slate-900 p-4 rounded-2xl border border-slate-800 text-xs font-mono text-emerald-400 overflow-x-auto">
{`<script
  src="https://ai.demxanh.com/widget.js"
  data-site-id="demxanh"
  data-theme="emerald"
  async>
</script>`}
              </pre>
            </div>
          </div>
        )}

        {/* TAB 12: D26 AUDIT LOG */}
        {activeTab === 'audit' && (
          <div className="space-y-5 max-w-4xl mx-auto w-full">
            <div>
              <h2 className="text-xl font-black text-white">
                D26 — Nhật Ký Hoạt Động Hệ Thống (Audit Log)
              </h2>
              <p className="text-xs text-slate-400">
                Ghi nhận mọi thay đổi giá sản phẩm, cập nhật prompt, phân quyền và can thiệp chat
              </p>
            </div>

            <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden divide-y divide-slate-850">
              {auditLogs.map((log) => (
                <div key={log.id} className="p-3.5 hover:bg-slate-900/60 transition text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-400">{log.action}</span>
                    <span className="text-slate-500 text-[11px]">{log.timestamp}</span>
                  </div>
                  <p className="text-slate-300">{log.detail}</p>
                  <div className="text-[10px] text-slate-500">Thực hiện bởi: {log.author}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 13: D16 STAFF & PERMISSIONS */}
        {activeTab === 'staff' && (
          <div className="space-y-5 max-w-4xl mx-auto w-full">
            <div>
              <h2 className="text-xl font-black text-white">
                D16 — Quản Lý Nhân Sự & Phân Quyền (RBAC)
              </h2>
              <p className="text-xs text-slate-400">
                Đội ngũ chuyên viên tư vấn Showroom và quyền hạn truy cập
              </p>
            </div>

            <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden">
              <table className="w-full text-xs">
                <thead className="bg-slate-900 text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="text-left p-3">Nhân sự</th>
                    <th className="text-left p-3">Email</th>
                    <th className="text-left p-3">Vai trò</th>
                    <th className="text-left p-3">Trạng thái</th>
                    <th className="text-right p-3">Chat đang xử lý</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850">
                  {staffList.map((st) => (
                    <tr key={st.id}>
                      <td className="p-3 font-bold text-white flex items-center gap-2">
                        <img
                          src={st.avatar}
                          alt={st.name}
                          className="w-6 h-6 rounded-full object-cover"
                        />
                        <span>{st.name}</span>
                      </td>
                      <td className="p-3 text-slate-400">{st.email}</td>
                      <td className="p-3">
                        <span className="bg-slate-800 text-emerald-400 px-2 py-0.5 rounded font-mono text-[10px]">
                          {st.role}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className="text-emerald-400 font-semibold">● {st.status}</span>
                      </td>
                      <td className="p-3 text-right font-bold text-slate-200">
                        {st.activeChats} cuộc
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 14: D04 CUSTOMERS CRM */}
        {activeTab === 'customers' && (
          <div className="space-y-5 max-w-5xl mx-auto w-full">
            <div>
              <h2 className="text-xl font-black text-white">
                D04 — Danh Sách Khách Hàng & AI Profiles
              </h2>
              <p className="text-xs text-slate-400">
                Hồ sơ thông tin thể trạng, ngân sách và sở thích đệm tích lũy qua hội thoại
              </p>
            </div>

            <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden">
              <table className="w-full text-xs">
                <thead className="bg-slate-900 text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="text-left p-3">Khách hàng</th>
                    <th className="text-left p-3">SĐT</th>
                    <th className="text-left p-3">Phân hạng Lead</th>
                    <th className="text-left p-3">Sản phẩm quan tâm</th>
                    <th className="text-left p-3">Sở thích & Y khoa</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850">
                  {leads.map((l) => (
                    <tr key={l.id} className="hover:bg-slate-900/60">
                      <td className="p-3 font-bold text-white">{l.customerName}</td>
                      <td className="p-3 font-mono text-emerald-400">{l.phone}</td>
                      <td className="p-3">
                        <span className="bg-rose-950 text-rose-300 px-2 py-0.5 rounded text-[10px] font-bold">
                          🔥 {l.score} điểm
                        </span>
                      </td>
                      <td className="p-3 text-slate-300">{l.productInterest}</td>
                      <td className="p-3 text-slate-400">
                        {l.budget} • Khu vực {l.area}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 15: D18 ANALYTICS */}
        {activeTab === 'analytics' && (
          <div className="space-y-6 max-w-5xl mx-auto w-full">
            <div>
              <h2 className="text-xl font-black text-white">
                D18 — Phân Tích Ý Định Khách Hàng & Hiệu Quả AI
              </h2>
              <p className="text-xs text-slate-400">
                Thống kê các câu hỏi được quan tâm nhiều nhất tại Đệm Xanh
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-950 p-5 rounded-3xl border border-slate-800 space-y-3">
                <h3 className="font-bold text-xs text-slate-300 uppercase tracking-wider">
                  Top 5 Ý Định Của Khách (Intents)
                </h3>
                <div className="space-y-2">
                  {[
                    { intent: '1. Chọn đệm phù hợp thể trạng', pct: 32 },
                    { intent: '2. Hỏi giá & Khuyến mãi tháng', pct: 21 },
                    { intent: '3. Chính sách giao hàng & bưng vác', pct: 15 },
                    { intent: '4. Bảo hành & Đổi trả ngủ thử', pct: 9 },
                    { intent: '5. Đổi trả & Hỗ trợ sau bán', pct: 8 },
                  ].map((it, i) => (
                    <div key={i} className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-200">{it.intent}</span>
                        <span className="font-bold text-emerald-400">{it.pct}%</span>
                      </div>
                      <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-emerald-600 h-2 rounded-full"
                          style={{ width: `${it.pct * 2.5}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-slate-950 p-5 rounded-3xl border border-slate-800 space-y-3">
                <h3 className="font-bold text-xs text-slate-300 uppercase tracking-wider">
                  Top Sản Phẩm Được Hỏi Nhiều Nhất
                </h3>
                <div className="space-y-2.5 text-xs">
                  {products.slice(0, 4).map((p, i) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between p-2 rounded-xl bg-slate-900 border border-slate-850"
                    >
                      <div className="truncate">
                        <span className="font-bold text-white block truncate">{p.name}</span>
                        <span className="text-[10px] text-slate-500">{p.category}</span>
                      </div>
                      <span className="text-rose-400 font-bold shrink-0">
                        {p.salePrice.toLocaleString('vi-VN')}đ
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
