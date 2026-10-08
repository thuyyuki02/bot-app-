import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Conversation, StaffMember } from '../../types';
import {
  Search,
  Filter,
  Flame,
  CheckCircle2,
  Clock,
  Send,
  UserCheck,
  Phone,
  MapPin,
  FileText,
  Plus,
  Headphones,
  ChevronRight,
  Shield,
  ArrowRight,
  Sparkles,
  AlertCircle,
  Smartphone,
  Globe,
  ExternalLink,
} from 'lucide-react';

export const StaffWorkspace: React.FC = () => {
  const {
    conversations,
    currentStaff,
    sendAgentMessage,
    takeoverConversation,
    addInternalNote,
    leads,
  } = useApp();

  const [selectedConvId, setSelectedConvId] = useState<string>(
    conversations[0]?.id || 'conv-01'
  );
  const [activeFilterTab, setActiveFilterTab] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [agentInputText, setAgentInputText] = useState<string>('');
  const [newInternalNote, setNewInternalNote] = useState<string>('');
  const [mobileTab, setMobileTab] = useState<'queue' | 'chat' | 'info'>('chat');

  // Filter conversations
  const filteredConversations = conversations.filter((c) => {
    const matchesSearch =
      c.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.customerPhone && c.customerPhone.includes(searchTerm)) ||
      (c.intent && c.intent.toLowerCase().includes(searchTerm.toLowerCase()));

    if (!matchesSearch) return false;

    if (activeFilterTab === 'waiting') return c.status === 'WAITING_AGENT';
    if (activeFilterTab === 'human') return c.status === 'HUMAN_ACTIVE';
    if (activeFilterTab === 'ai') return c.status === 'AI_ACTIVE';
    if (activeFilterTab === 'hot') return c.leadTier === 'HOT';
    return true;
  });

  const activeConv =
    conversations.find((c) => c.id === selectedConvId) || conversations[0];

  const handleSendAgentText = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!agentInputText.trim() || !activeConv) return;
    sendAgentMessage(activeConv.id, agentInputText.trim());
    setAgentInputText('');
  };

  const handleCannedScript = (text: string) => {
    if (!activeConv) return;
    sendAgentMessage(activeConv.id, text);
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInternalNote.trim() || !activeConv) return;
    addInternalNote(activeConv.id, newInternalNote.trim());
    setNewInternalNote('');
  };

  return (
    <div className="flex-1 bg-slate-900 text-slate-100 flex flex-col h-[calc(100vh-64px)] overflow-hidden">
      {/* Staff Bar Top */}
      <div className="bg-slate-950 border-b border-slate-800 px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="font-bold text-sm text-slate-100 tracking-tight">
              Bàn làm việc Nhân viên Tư vấn & CSKH
            </span>
          </div>
          <span className="bg-slate-800 text-slate-400 text-xs px-2.5 py-0.5 rounded-full hidden sm:inline">
            Đang trực: <strong className="text-emerald-400">{currentStaff.name}</strong> ({currentStaff.role})
          </span>
        </div>

        {/* Mobile View Switcher */}
        <div className="flex md:hidden bg-slate-800 p-0.5 rounded-lg text-xs">
          <button
            onClick={() => setMobileTab('queue')}
            className={`px-2.5 py-1 rounded font-semibold ${
              mobileTab === 'queue' ? 'bg-emerald-600 text-white' : 'text-slate-400'
            }`}
          >
            Hàng đợi ({filteredConversations.length})
          </button>
          <button
            onClick={() => setMobileTab('chat')}
            className={`px-2.5 py-1 rounded font-semibold ${
              mobileTab === 'chat' ? 'bg-emerald-600 text-white' : 'text-slate-400'
            }`}
          >
            Chat
          </button>
          <button
            onClick={() => setMobileTab('info')}
            className={`px-2.5 py-1 rounded font-semibold ${
              mobileTab === 'info' ? 'bg-emerald-600 text-white' : 'text-slate-400'
            }`}
          >
            Khách
          </button>
        </div>
      </div>

      {/* Main 3-Column Layout (Queue / Chat / Customer Profile) */}
      <div className="flex-1 flex overflow-hidden">
        {/* COLUMN 1: Conversations Queue */}
        <div
          className={`w-full md:w-80 lg:w-96 border-r border-slate-800 bg-slate-950/80 flex flex-col ${
            mobileTab === 'queue' ? 'flex' : 'hidden md:flex'
          }`}
        >
          {/* Search & Tabs */}
          <div className="p-3 border-b border-slate-800 space-y-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Tìm khách hàng, số điện thoại..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 pl-8 pr-3 py-2 rounded-xl outline-none focus:border-emerald-500"
              />
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 overflow-x-auto text-[11px] font-semibold text-slate-400">
              {[
                { id: 'all', label: 'Tất cả' },
                { id: 'waiting', label: 'Chờ nhận' },
                { id: 'human', label: 'Đang chat' },
                { id: 'ai', label: 'AI bot' },
                { id: 'hot', label: '🔥 Hot' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveFilterTab(tab.id)}
                  className={`px-2.5 py-1 rounded-lg whitespace-nowrap transition ${
                    activeFilterTab === tab.id
                      ? 'bg-slate-800 text-white font-bold'
                      : 'hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Queue List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-850">
            {filteredConversations.length === 0 ? (
              <div className="text-center py-16 text-slate-500 text-xs">
                Không tìm thấy cuộc trò chuyện nào.
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const isSelected = activeConv?.id === conv.id;
                const lastMsg = conv.messages[conv.messages.length - 1];
                return (
                  <div
                    key={conv.id}
                    onClick={() => {
                      setSelectedConvId(conv.id);
                      setMobileTab('chat');
                    }}
                    className={`p-3 cursor-pointer transition flex flex-col gap-1.5 ${
                      isSelected
                        ? 'bg-slate-800/90 border-l-4 border-emerald-500'
                        : 'hover:bg-slate-900/60'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="font-bold text-xs text-slate-200 truncate">
                          {conv.customerName}
                        </span>
                        {conv.leadTier === 'HOT' && (
                          <span className="text-[10px] bg-rose-950 text-rose-400 border border-rose-800 px-1 rounded flex items-center gap-0.5 font-bold">
                            <Flame className="w-2.5 h-2.5 fill-rose-500" /> HOT
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-500 shrink-0">
                        {new Date(conv.lastMessageTime).toLocaleTimeString('vi-VN', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    <div className="text-xs text-slate-400 line-clamp-1 break-words">
                      {lastMsg?.text || 'Bắt đầu cuộc trò chuyện'}
                    </div>

                    {conv.currentProduct && (
                      <div className="flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-900/60 truncate font-medium">
                        <Globe className="w-2.5 h-2.5 shrink-0 text-emerald-400" />
                        <span className="truncate">Đang xem: {conv.currentProduct}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
                      <span className="text-slate-400 truncate max-w-[140px]">
                        {conv.intent || 'Tư vấn đệm'}
                      </span>
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                          conv.status === 'WAITING_AGENT'
                            ? 'bg-amber-950 text-amber-400 border border-amber-800'
                            : conv.status === 'HUMAN_ACTIVE'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {conv.status === 'WAITING_AGENT'
                          ? 'Chờ nhân viên'
                          : conv.status === 'HUMAN_ACTIVE'
                          ? 'Đang tư vấn'
                          : 'AI tự động'}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* COLUMN 2: Real-time Chat Takeover & Messaging */}
        <div
          className={`flex-1 flex flex-col bg-slate-900 ${
            mobileTab === 'chat' ? 'flex' : 'hidden md:flex'
          }`}
        >
          {activeConv ? (
            <>
              {/* Chat Header */}
              <div className="p-3.5 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-sm text-emerald-400">
                    {activeConv.customerName.slice(0, 1)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-sm text-white">{activeConv.customerName}</h3>
                      {activeConv.customerPhone && (
                        <span className="text-xs font-mono text-emerald-400 font-semibold">
                          📱 {activeConv.customerPhone}
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-2">
                      <span>Đang xem: {activeConv.currentPage}</span>
                      <span>•</span>
                      <span>Điểm tiềm năng: </span>
                      <span
                        className={`font-bold ${
                          activeConv.leadScore >= 80 ? 'text-rose-400' : 'text-amber-400'
                        }`}
                      >
                        {activeConv.leadScore}/100
                      </span>
                    </div>
                  </div>
                </div>

                {/* Takeover & Actions */}
                <div className="flex items-center gap-2">
                  {activeConv.status !== 'HUMAN_ACTIVE' ? (
                    <button
                      onClick={() => takeoverConversation(activeConv.id, currentStaff)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3 py-1.5 rounded-xl shadow-md transition flex items-center gap-1.5"
                    >
                      <UserCheck className="w-4 h-4" />
                      <span>Nhận chat (Takeover)</span>
                    </button>
                  ) : (
                    <span className="bg-emerald-950 text-emerald-300 border border-emerald-700 text-xs px-3 py-1 rounded-xl font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Bạn đang trực tiếp hỗ trợ</span>
                    </span>
                  )}

                  <button
                    onClick={() => {
                      const tel = activeConv.customerPhone || '18001051';
                      window.open(`tel:${tel}`);
                    }}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs px-2.5 py-1.5 rounded-xl border border-slate-700 flex items-center gap-1"
                  >
                    <Phone className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="hidden sm:inline">Gọi điện</span>
                  </button>
                </div>
              </div>

              {/* Chat Messages Log */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-900/60">
                {activeConv.messages.map((m) => (
                  <div key={m.id} className="space-y-1">
                    <div
                      className={`flex gap-2 text-xs ${
                        m.sender === 'agent'
                          ? 'justify-end'
                          : m.sender === 'customer'
                          ? 'justify-start'
                          : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-[75%] rounded-2xl p-3 leading-relaxed ${
                          m.sender === 'agent'
                            ? 'bg-emerald-600 text-white rounded-br-xs'
                            : m.sender === 'customer'
                            ? 'bg-blue-900/80 text-white rounded-bl-xs border border-blue-700/50'
                            : m.sender === 'system'
                            ? 'bg-amber-950 text-amber-200 border border-amber-800 rounded-xl w-full text-center'
                            : 'bg-slate-800 text-slate-200 rounded-bl-xs border border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between text-[10px] mb-1 opacity-70">
                          <span className="font-bold">
                            {m.sender === 'agent'
                              ? `Nhân viên: ${m.senderName || 'Bạn'}`
                              : m.sender === 'customer'
                              ? activeConv.customerName
                              : 'Trợ lý AI Đệm Xanh'}
                          </span>
                          <span>
                            {new Date(m.timestamp).toLocaleTimeString('vi-VN', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        <div className="whitespace-pre-wrap">{m.text}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Canned Responses / Sales Scripts Accordion */}
              <div className="bg-slate-950/70 p-2 border-t border-slate-800 text-xs">
                <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>Kịch bản tư vấn nhanh (Click để gửi ngay):</span>
                </div>
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                  <button
                    onClick={() =>
                      handleCannedScript(
                        'Dạ em Toàn chào anh/chị! Dòng đệm lò xo Dunlopillo Audrey chuẩn công nghệ Normablock Tây Ban Nha đang có sẵn tại kho Cầu Giấy, em giữ quà tặng 2 ruột gối cao cấp và giao hỏa tốc trong 2h tới nhé ạ!'
                      )
                    }
                    className="whitespace-nowrap bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 px-2.5 py-1 rounded-lg transition"
                  >
                    🎁 Báo giá + Tặng quà
                  </button>
                  <button
                    onClick={() =>
                      handleCannedScript(
                        'Em mời anh/chị ghé qua Showroom Đệm Xanh để trải nghiệm nằm thử 15 phút. Showroom có chỗ đỗ ô tô miễn phí và mở cửa tới 21h30 ạ!'
                      )
                    }
                    className="whitespace-nowrap bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 px-2.5 py-1 rounded-lg transition"
                  >
                    📍 Mời thử đệm Showroom
                  </button>
                  <button
                    onClick={() =>
                      handleCannedScript(
                        'Dạ Đệm Xanh áp dụng chính sách 30 Đêm Ngủ Thử Miễn Phí. Nếu cảm thấy không phù hợp độ cứng thắt lưng, bên em hỗ trợ đổi mẫu khác 100% không mất phí ạ!'
                      )
                    }
                    className="whitespace-nowrap bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 px-2.5 py-1 rounded-lg transition"
                  >
                    🛡️ Cam kết 30 đêm ngủ thử
                  </button>
                  <button
                    onClick={() =>
                      handleCannedScript(
                        'Dạ Đệm Xanh miễn phí 100% vận chuyển và bưng vác lên tận giường phòng ngủ của anh/chị ạ!'
                      )
                    }
                    className="whitespace-nowrap bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 px-2.5 py-1 rounded-lg transition"
                  >
                    🚚 Freeship & Bưng tận phòng
                  </button>
                </div>
              </div>

              {/* Staff Input Bar */}
              <form
                onSubmit={handleSendAgentText}
                className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2"
              >
                <input
                  type="text"
                  placeholder="Nhập tin nhắn trả lời khách (sẽ hiển thị trực tiếp trên widget website)..."
                  value={agentInputText}
                  onChange={(e) => setAgentInputText(e.target.value)}
                  className="flex-1 bg-slate-900 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 px-3.5 py-2.5 rounded-xl outline-none focus:border-emerald-500"
                />
                <button
                  type="submit"
                  disabled={!agentInputText.trim()}
                  className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition shadow-md"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Gửi tin</span>
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-500 text-xs">
              Chọn cuộc trò chuyện bên trái để bắt đầu tư vấn.
            </div>
          )}
        </div>

        {/* COLUMN 3: Customer Profile & Lead Drawer */}
        <div
          className={`w-full md:w-72 lg:w-80 border-l border-slate-800 bg-slate-950/90 flex flex-col p-4 space-y-4 overflow-y-auto ${
            mobileTab === 'info' ? 'flex' : 'hidden lg:flex'
          }`}
        >
          {activeConv ? (
            <>
              {/* Profile Card */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Hồ sơ khách hàng
                </h4>
                <div className="bg-slate-900 p-3 rounded-2xl border border-slate-800 space-y-2 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Họ tên:</span>
                    <span className="font-bold text-slate-100 text-sm">
                      {activeConv.customerName}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Số điện thoại:</span>
                    <span className="font-mono text-emerald-400 font-bold">
                      {activeConv.customerPhone || 'Chưa cung cấp SĐT'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Khu vực:</span>
                    <span className="text-slate-200">
                      {activeConv.customerArea || 'Chưa rõ (Đang ở website)'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Trạng thái Lead:</span>
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold mt-0.5 ${
                        activeConv.leadTier === 'HOT'
                          ? 'bg-rose-950 text-rose-300 border border-rose-800'
                          : 'bg-amber-950 text-amber-300 border border-amber-800'
                      }`}
                    >
                      {activeConv.leadTier === 'HOT' ? '🔥 HOT LEAD (Mua ngay)' : '🟡 TIỀM NĂNG'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Trang & Sản phẩm khách đang xem trên demxanh.com */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span>Trang Khách Đang Xem</span>
                  <span className="text-[10px] text-emerald-400 font-mono font-normal">demxanh.com</span>
                </h4>
                <div className="bg-slate-900 p-3 rounded-2xl border border-slate-800 space-y-1.5 text-xs">
                  <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                    <Globe className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{activeConv.currentProduct || 'Trang chủ Đệm Xanh'}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 pt-0.5">
                    <a
                      href={
                        activeConv.currentPage.startsWith('http')
                          ? activeConv.currentPage
                          : `https://demxanh.com${activeConv.currentPage}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-cyan-400 hover:text-cyan-300 underline inline-flex items-center gap-1 font-mono break-all text-[10px]"
                    >
                      <span>
                        {activeConv.currentPage.startsWith('http')
                          ? activeConv.currentPage
                          : `https://demxanh.com${activeConv.currentPage}`}
                      </span>
                      <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                    </a>
                  </div>
                </div>
              </div>

              {/* AI Identified Preferences */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  AI Profile Nhu Cầu
                </h4>
                <div className="bg-slate-900 p-3 rounded-2xl border border-slate-800 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Đối tượng:</span>
                    <span className="font-semibold text-slate-200">
                      {activeConv.consultationData?.target || 'Bản thân / Vợ chồng'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Kích thước:</span>
                    <span className="font-semibold text-slate-200">
                      {activeConv.consultationData?.size || '1m8 × 2m'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Ngân sách:</span>
                    <span className="font-semibold text-emerald-400">
                      {activeConv.consultationData?.budget || '10–20 triệu'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Độ cứng:</span>
                    <span className="font-semibold text-slate-200">
                      {activeConv.consultationData?.firmness || 'Trung bình'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Internal Notes */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Ghi chú nội bộ ({activeConv.internalNotes?.length || 0})
                </h4>

                <form onSubmit={handleAddNote} className="space-y-2 mb-3">
                  <textarea
                    rows={2}
                    placeholder="Thêm ghi chú khách này..."
                    value={newInternalNote}
                    onChange={(e) => setNewInternalNote(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 text-xs text-slate-200 p-2 rounded-xl outline-none focus:border-emerald-500"
                  />
                  <button
                    type="submit"
                    disabled={!newInternalNote.trim()}
                    className="w-full bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Lưu ghi chú</span>
                  </button>
                </form>

                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {(activeConv.internalNotes || []).map((note) => (
                    <div
                      key={note.id}
                      className="bg-slate-900/80 p-2 rounded-xl border border-slate-800 text-xs"
                    >
                      <div className="flex justify-between text-[10px] text-slate-500 mb-0.5">
                        <span className="font-bold text-slate-400">{note.author}</span>
                        <span>{note.time}</span>
                      </div>
                      <p className="text-slate-300">{note.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
};
