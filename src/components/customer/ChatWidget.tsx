import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { Product, ConsultationAnswers } from '../../types';
import {
  MessageSquare,
  X,
  Minus,
  Send,
  RotateCcw,
  Sparkles,
  Check,
  Star,
  PhoneCall,
  UserCheck,
  ChevronRight,
  ArrowRight,
  ShieldCheck,
  Truck,
  Eye,
  Layers,
  HelpCircle,
  ThumbsUp,
  Flame,
} from 'lucide-react';

export const ChatWidget: React.FC<{ isEmbed?: boolean }> = ({ isEmbed = false }) => {
  const {
    appearance,
    conversations,
    activeCustomerConvId,
    sendCustomerMessage,
    submitConsultationAnswers,
    submitLead,
    submitFeedback,
    resetCustomerChat,
    products,
    currentPage,
    currentPageTitle,
    setCurrentPage,
    isMobilePreview,
    takeoverConversation,
    staffList,
  } = useApp();

  const [isOpen, setIsOpen] = useState<boolean>(true);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [inputText, setInputText] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);

  // Listen for parent page context when embedded in external website (demxanh.com)
  useEffect(() => {
    // 1. Parse initial context from URL query params
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      const urlParam = searchParams.get('pageUrl');
      const prodParam = searchParams.get('productName') || searchParams.get('title');
      if (urlParam) {
        setCurrentPage(urlParam, prodParam || undefined);
      }
      // Request fresh context from host page if needed
      try {
        window.parent.postMessage({ type: 'DX_REQUEST_PAGE_CONTEXT' }, '*');
      } catch (e) {}
    }

    // 2. Real-time updates from parent window (demxanh.com) via postMessage
    const handleMsg = (e: MessageEvent) => {
      if (e.data?.type === 'DX_PAGE_VIEW' && e.data.pageUrl) {
        setCurrentPage(e.data.pageUrl, e.data.productName || e.data.pageTitle);
      }
    };
    window.addEventListener('message', handleMsg);
    return () => window.removeEventListener('message', handleMsg);
  }, [setCurrentPage]);

  // Proactive greeting bubble state
  const [showProactiveBubble, setShowProactiveBubble] = useState<boolean>(false);

  // Consultation flow state (C05)
  const [isConsultationActive, setIsConsultationActive] = useState<boolean>(false);
  const [consultStep, setConsultStep] = useState<number>(1);
  const [consultAnswers, setConsultAnswers] = useState<ConsultationAnswers>({
    priorities: [],
  });

  // Comparison modal state (C04)
  const [comparisonProducts, setComparisonProducts] = useState<Product[] | null>(null);

  // Lead form modal state (C07)
  const [showLeadModal, setShowLeadModal] = useState<boolean>(false);
  const [leadFormData, setLeadFormData] = useState({
    name: '',
    phone: '',
    area: 'Hà Nội',
    preferredTime: 'Trong giờ hành chính (9h - 17h)',
    productInterest: '',
  });
  const [leadPhoneError, setLeadPhoneError] = useState<string>('');

  // Feedback state (C09)
  const [feedbackRating, setFeedbackRating] = useState<number>(5);
  const [feedbackComment, setFeedbackComment] = useState<string>('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Current active conversation
  const currentConv = conversations.find((c) => c.id === activeCustomerConvId) || conversations[0];
  const messages = currentConv?.messages || [];

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isConsultationActive, isTyping]);

  // Proactive trigger (C22)
  useEffect(() => {
    if (appearance.showProactiveMessage && !isOpen) {
      const timer = setTimeout(() => {
        setShowProactiveBubble(true);
      }, appearance.proactiveDelaySec * 1000);
      return () => clearTimeout(timer);
    }
  }, [appearance.showProactiveMessage, appearance.proactiveDelaySec, isOpen]);

  // Send message handler
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || isTyping) return;

    const userText = inputText.trim();
    setInputText('');
    setIsTyping(true);

    try {
      await sendCustomerMessage(userText);
    } finally {
      setIsTyping(false);
    }
  };

  // Quick reply chip click
  const handleQuickReply = async (type: string) => {
    if (type === 'consultation') {
      setIsConsultationActive(true);
      setConsultStep(1);
      setConsultAnswers({ priorities: [] });
    } else if (type === 'budget') {
      await sendCustomerMessage('Tư vấn cho tôi các dòng đệm theo ngân sách từ 5 đến 10 triệu.');
    } else if (type === 'promotions') {
      await sendCustomerMessage('Đệm Xanh đang có những chương trình khuyến mãi và quà tặng gì trong tháng này?');
    } else if (type === 'delivery') {
      await sendCustomerMessage('Chính sách giao hàng và lắp đặt đệm tại nhà như thế nào?');
    } else if (type === 'human_handoff') {
      await sendCustomerMessage('Tôi muốn kết nối với nhân viên tư vấn bán hàng trực tiếp.');
      // Auto assign staff for demo responsiveness
      setTimeout(() => {
        takeoverConversation(currentConv.id, staffList[0]);
      }, 1200);
    }
  };

  // 5-step consultation navigation
  const handleStepAnswer = (key: keyof ConsultationAnswers, value: any) => {
    const updated = { ...consultAnswers, [key]: value };
    setConsultAnswers(updated);

    if (consultStep < 5) {
      setConsultStep(consultStep + 1);
    } else {
      // Step 5 finished -> Submit to engine
      setIsConsultationActive(false);
      submitConsultationAnswers(updated);
    }
  };

  const handlePriorityToggle = (item: string) => {
    const current = consultAnswers.priorities || [];
    const exists = current.includes(item);
    const updated = exists ? current.filter((x) => x !== item) : [...current, item];
    setConsultAnswers({ ...consultAnswers, priorities: updated });
  };

  // Lead phone validation
  const validateVietnamesePhone = (phone: string) => {
    const regex = /^(03|05|07|08|09)\d{8}$/;
    return regex.test(phone.replace(/\s+/g, ''));
  };

  const handleLeadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateVietnamesePhone(leadFormData.phone)) {
      setLeadPhoneError('Số điện thoại không hợp lệ (Vui lòng nhập 10 số bắt đầu bằng 09, 03, 07, 08, 05).');
      return;
    }
    setLeadPhoneError('');
    submitLead({
      customerName: leadFormData.name || 'Khách hàng',
      phone: leadFormData.phone,
      area: leadFormData.area,
      preferredCallTime: leadFormData.preferredTime,
      productInterest: leadFormData.productInterest || 'Tư vấn đệm theo ngân sách',
    });
    setShowLeadModal(false);
  };

  // Trigger comparison (C04)
  const openComparisonModal = (prodA: Product, prodB?: Product) => {
    const secondProd = prodB || products.find((p) => p.id !== prodA.id) || products[1];
    setComparisonProducts([prodA, secondProd]);
  };

  return (
    <>
      {/* C01: Chat Bubble Icon (when widget closed) */}
      {!isOpen && (
        <div
          className={`fixed z-40 flex flex-col items-end gap-2 transition-all duration-300 ${
            appearance.position === 'left' ? 'left-6' : 'right-6'
          } bottom-6`}
        >
          {/* Proactive tooltip / Badge */}
          {appearance.showBadge && (
            <div
              onClick={() => {
                setIsOpen(true);
                setShowProactiveBubble(false);
              }}
              className="bg-white text-slate-800 px-3.5 py-2 rounded-2xl shadow-xl border border-emerald-100 flex items-center gap-2 cursor-pointer hover:shadow-2xl transition hover:scale-105 animate-bounce max-w-xs"
            >
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-semibold text-emerald-900">
                {showProactiveBubble ? appearance.proactiveMessage : 'Tư vấn chọn đệm chuẩn y khoa ✨'}
              </span>
            </div>
          )}

          {/* Bubble Button */}
          <button
            onClick={() => {
              setIsOpen(true);
              setShowProactiveBubble(false);
            }}
            className={`rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-xl hover:shadow-emerald-500/40 hover:scale-110 transition-transform duration-200 flex items-center justify-center relative ${
              appearance.bubbleSize === 'large'
                ? 'w-16 h-16'
                : appearance.bubbleSize === 'small'
                ? 'w-12 h-12'
                : 'w-14 h-14'
            }`}
          >
            <MessageSquare className="w-7 h-7" />
            <span className="absolute top-0 right-0 w-4 h-4 bg-emerald-400 border-2 border-white rounded-full"></span>
          </button>
        </div>
      )}

      {/* C02 / C11: Chat Window */}
      {isOpen && (
        <div
          className={`fixed z-40 bg-white shadow-2xl flex flex-col border border-slate-200 transition-all duration-300 ${
            isEmbed
              ? 'inset-0 w-full h-full rounded-none overflow-hidden'
              : isMobilePreview
              ? 'inset-0 w-full h-full rounded-none'
              : `bottom-6 ${
                  appearance.position === 'left' ? 'left-6' : 'right-6'
                } w-[420px] max-w-[calc(100vw-32px)] h-[620px] max-h-[calc(100vh-80px)] rounded-3xl overflow-hidden`
          }`}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-600 p-3.5 text-white flex items-center justify-between shadow-md">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white font-bold border border-white/30">
                  <Sparkles className="w-5 h-5 text-amber-300" />
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-emerald-700 rounded-full"></span>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-sm tracking-tight">{appearance.botName}</h3>
                  <span className="bg-emerald-400/20 text-emerald-200 text-[10px] px-1.5 py-0.2 rounded-full font-medium border border-emerald-400/30">
                    Online
                  </span>
                </div>
                <p className="text-[11px] text-emerald-100 font-normal">
                  {currentConv.assignedAgent
                    ? `Đã kết nối: ${currentConv.assignedAgent.name}`
                    : appearance.subtitle}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={resetCustomerChat}
                title="Làm mới cuộc trò chuyện"
                className="p-1.5 text-emerald-100 hover:text-white hover:bg-white/10 rounded-lg transition"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  if (isEmbed) {
                    try {
                      window.parent.postMessage({ type: 'DX_CLOSE_WIDGET' }, '*');
                    } catch (e) {}
                  } else {
                    setIsMinimized(!isMinimized);
                  }
                }}
                title="Thu nhỏ"
                className="p-1.5 text-emerald-100 hover:text-white hover:bg-white/10 rounded-lg transition"
              >
                <Minus className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  if (isEmbed) {
                    try {
                      window.parent.postMessage({ type: 'DX_CLOSE_WIDGET' }, '*');
                    } catch (e) {}
                  } else {
                    setIsOpen(false);
                  }
                }}
                title="Đóng chat"
                className="p-1.5 text-emerald-100 hover:text-white hover:bg-white/10 rounded-lg transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Minimized view */}
          {isMinimized ? (
            <div className="p-4 bg-slate-50 flex items-center justify-between">
              <span className="text-xs text-slate-600 font-medium">Cuộc hội thoại đã thu nhỏ</span>
              <button
                onClick={() => setIsMinimized(false)}
                className="text-xs text-emerald-700 font-bold hover:underline"
              >
                Mở lại
              </button>
            </div>
          ) : (
            <>
              {/* C12 Context awareness banner: Tự động nhận diện link sản phẩm đang xem */}
              <div className="bg-emerald-50/95 px-3.5 py-2 border-b border-emerald-100 text-[11px] text-emerald-800 flex items-center justify-between gap-2 shadow-xs">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 animate-pulse"></span>
                  <span className="font-semibold text-emerald-900 shrink-0">Đang xem:</span>
                  <span
                    title={currentPageTitle || currentPage}
                    className="truncate max-w-[200px] text-emerald-950 font-bold"
                  >
                    {currentPageTitle ||
                      currentPage
                        .replace(/^https?:\/\/[^/]+/i, '')
                        .replace(/\.html?/i, '')
                        .replace(/^[/-]+/, '')
                        .replace(/[-_]/g, ' ') ||
                      'Trang chủ'}
                  </span>
                </div>
                <button
                  onClick={() =>
                    sendCustomerMessage(
                      `Tư vấn giúp tôi mẫu đệm ${currentPageTitle || 'sản phẩm này'} (link: ${currentPage}) với ạ!`
                    )
                  }
                  className="text-[10px] bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-2.5 py-1 rounded-full transition shrink-0 shadow-xs flex items-center gap-1"
                >
                  <span>Hỏi mẫu này</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>

              {/* Chat Body & Messages */}
              <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5 bg-slate-50/50">
                {/* Quick replies bar (C02 / C21) */}
                <div className="flex flex-wrap gap-1.5 pt-1 pb-2">
                  <button
                    onClick={() => handleQuickReply('consultation')}
                    className="text-[11px] bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-200 hover:border-emerald-400 px-2.5 py-1 rounded-full font-medium transition shadow-xs flex items-center gap-1"
                  >
                    <span>🛏</span> Chọn đệm phù hợp (5 câu)
                  </button>
                  <button
                    onClick={() => handleQuickReply('budget')}
                    className="text-[11px] bg-white hover:bg-emerald-50 text-slate-700 border border-slate-200 hover:border-emerald-300 px-2.5 py-1 rounded-full font-medium transition shadow-xs"
                  >
                    💰 Theo ngân sách
                  </button>
                  <button
                    onClick={() => handleQuickReply('promotions')}
                    className="text-[11px] bg-white hover:bg-emerald-50 text-slate-700 border border-slate-200 hover:border-emerald-300 px-2.5 py-1 rounded-full font-medium transition shadow-xs"
                  >
                    🔥 Khuyến mãi
                  </button>
                  <button
                    onClick={() => handleQuickReply('delivery')}
                    className="text-[11px] bg-white hover:bg-emerald-50 text-slate-700 border border-slate-200 hover:border-emerald-300 px-2.5 py-1 rounded-full font-medium transition shadow-xs"
                  >
                    🚚 Giao hàng
                  </button>
                  <button
                    onClick={() => handleQuickReply('human_handoff')}
                    className="text-[11px] bg-white hover:bg-emerald-50 text-slate-700 border border-slate-200 hover:border-emerald-300 px-2.5 py-1 rounded-full font-medium transition shadow-xs"
                  >
                    👨‍💼 Gặp nhân viên
                  </button>
                </div>

                {/* Messages stream */}
                {messages.map((msg) => (
                  <div key={msg.id} className="space-y-2">
                    {/* System / Handoff message */}
                    {msg.sender === 'system' || msg.type === 'handoff' ? (
                      <div className="bg-amber-50 text-amber-900 border border-amber-200 rounded-xl p-2.5 text-xs text-center flex items-center justify-center gap-1.5 shadow-xs">
                        <UserCheck className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>{msg.text}</span>
                      </div>
                    ) : (
                      <div
                        className={`flex gap-2.5 ${
                          msg.sender === 'customer' ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        {msg.sender !== 'customer' && (
                          <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs mt-0.5">
                            {msg.sender === 'agent' ? 'NV' : 'AI'}
                          </div>
                        )}

                        <div
                          className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${
                            msg.sender === 'customer'
                              ? 'bg-emerald-600 text-white rounded-br-xs shadow-md'
                              : 'bg-white text-slate-800 rounded-bl-xs shadow-sm border border-slate-200/80'
                          }`}
                        >
                          {msg.senderName && (
                            <div className="font-bold text-[11px] text-emerald-800 mb-1 flex items-center gap-1">
                              <span>{msg.senderName}</span>
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            </div>
                          )}

                          <div className="whitespace-pre-wrap">{msg.text}</div>

                          {/* C06: Consultation Result cards rendered inside payload */}
                          {msg.type === 'consultation_result' && msg.payload?.topRecommendations && (
                            <div className="mt-3 pt-3 border-t border-slate-100 space-y-2.5">
                              {msg.payload.topRecommendations.map(
                                (rec: { product: Product; matchPercent: number }, idx: number) => (
                                  <div
                                    key={rec.product.id}
                                    className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 hover:border-emerald-300 transition"
                                  >
                                    <div className="flex gap-2">
                                      <img
                                        src={rec.product.image}
                                        alt={rec.product.name}
                                        className="w-16 h-16 rounded-lg object-cover shrink-0"
                                      />
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                                            {idx === 0 ? '🥇 Lựa chọn số 1' : idx === 1 ? '🥈 Lựa chọn 2' : '🥉 Lựa chọn 3'}
                                          </span>
                                          <span className="bg-emerald-100 text-emerald-800 font-bold text-[10px] px-1.5 py-0.5 rounded-full">
                                            {rec.matchPercent}% Phù hợp
                                          </span>
                                        </div>
                                        <h4 className="font-bold text-xs text-slate-900 truncate mt-0.5">
                                          {rec.product.name}
                                        </h4>
                                        <div className="flex items-center gap-2 mt-1">
                                          <span className="font-extrabold text-rose-600 text-xs">
                                            {rec.product.salePrice.toLocaleString('vi-VN')}đ
                                          </span>
                                          <span className="text-[10px] line-through text-slate-400">
                                            {rec.product.originalPrice.toLocaleString('vi-VN')}đ
                                          </span>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Action buttons (C03) */}
                                    <div className="grid grid-cols-3 gap-1.5 mt-2 pt-2 border-t border-slate-200/60 text-[11px]">
                                      <button
                                        onClick={() => {
                                          setCurrentPage(`/dem-${rec.product.sku.toLowerCase()}`);
                                          sendCustomerMessage(`Cho tôi xem thông số chi tiết của ${rec.product.name}`);
                                        }}
                                        className="bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 py-1 rounded-md text-center font-medium"
                                      >
                                        Xem chi tiết
                                      </button>
                                      <button
                                        onClick={() => openComparisonModal(rec.product)}
                                        className="bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 py-1 rounded-md text-center font-medium"
                                      >
                                        So sánh
                                      </button>
                                      <button
                                        onClick={() => {
                                          setLeadFormData((prev) => ({
                                            ...prev,
                                            productInterest: `${rec.product.name} (${rec.product.salePrice.toLocaleString('vi-VN')}đ)`,
                                          }));
                                          setShowLeadModal(true);
                                        }}
                                        className="bg-emerald-600 hover:bg-emerald-700 text-white py-1 rounded-md text-center font-bold"
                                      >
                                        Mua ngay
                                      </button>
                                    </div>
                                  </div>
                                )
                              )}

                              {/* Action prompt: Contact staff */}
                              <div className="text-center pt-1">
                                <button
                                  onClick={() => setShowLeadModal(true)}
                                  className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold py-2 rounded-xl text-xs shadow-md transition flex items-center justify-center gap-1.5"
                                >
                                  <PhoneCall className="w-3.5 h-3.5" />
                                  <span>Đăng ký tư vấn trực tiếp & Giữ quà tặng</span>
                                </button>
                              </div>
                            </div>
                          )}

                          <div className="text-[9px] text-right mt-1 opacity-60">
                            {new Date(msg.timestamp).toLocaleTimeString('vi-VN', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {/* Typing indicator */}
                {isTyping && (
                  <div className="flex gap-2 items-center text-xs text-slate-500 bg-white p-2.5 rounded-2xl w-24 border border-slate-200">
                    <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-bounce"></span>
                    <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-bounce delay-150"></span>
                    <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-bounce delay-300"></span>
                  </div>
                )}

                {/* C05: Interactive 5-Step Smart Consultation Panel */}
                {isConsultationActive && (
                  <div className="bg-white p-3.5 rounded-2xl border-2 border-emerald-500 shadow-lg space-y-3">
                    <div className="flex items-center justify-between border-b pb-2">
                      <div className="flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-emerald-600" />
                        <span className="font-bold text-xs text-slate-800">
                          Tư vấn thông minh (Bước {consultStep}/5)
                        </span>
                      </div>
                      <button
                        onClick={() => setIsConsultationActive(false)}
                        className="text-slate-400 hover:text-slate-600 text-xs"
                      >
                        Hủy
                      </button>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-emerald-600 h-1.5 transition-all duration-300"
                        style={{ width: `${(consultStep / 5) * 100}%` }}
                      ></div>
                    </div>

                    {/* Step 1: Who is it for? */}
                    {consultStep === 1 && (
                      <div className="space-y-2">
                        <p className="font-semibold text-xs text-slate-800">
                          1. Anh/chị mua đệm cho ai nằm ạ?
                        </p>
                        <div className="grid grid-cols-2 gap-1.5">
                          {['Bản thân', 'Vợ/chồng', 'Trẻ em', 'Người lớn tuổi', 'Khách sạn'].map((opt) => (
                            <button
                              key={opt}
                              onClick={() => handleStepAnswer('target', opt)}
                              className="text-xs p-2 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50 text-slate-700 font-medium text-left transition"
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Step 2: Bed Size */}
                    {consultStep === 2 && (
                      <div className="space-y-2">
                        <p className="font-semibold text-xs text-slate-800">
                          2. Kích thước giường của anh/chị?
                        </p>
                        <div className="grid grid-cols-2 gap-1.5">
                          {['1m2 × 2m', '1m4 × 2m', '1m6 × 2m', '1m8 × 2m', '2m × 2m', 'Kích thước khác'].map(
                            (opt) => (
                              <button
                                key={opt}
                                onClick={() => handleStepAnswer('size', opt)}
                                className="text-xs p-2 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50 text-slate-700 font-medium text-left transition"
                              >
                                {opt}
                              </button>
                            )
                          )}
                        </div>
                      </div>
                    )}

                    {/* Step 3: Budget */}
                    {consultStep === 3 && (
                      <div className="space-y-2">
                        <p className="font-semibold text-xs text-slate-800">
                          3. Ngân sách dự kiến cho chiếc đệm?
                        </p>
                        <div className="space-y-1.5">
                          {[
                            'Dưới 3 triệu',
                            '3–5 triệu',
                            '5–10 triệu',
                            '10–20 triệu',
                            'Trên 20 triệu',
                          ].map((opt) => (
                            <button
                              key={opt}
                              onClick={() => handleStepAnswer('budget', opt)}
                              className="w-full text-xs p-2 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50 text-slate-700 font-medium text-left transition flex items-center justify-between"
                            >
                              <span>{opt}</span>
                              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Step 4: Desired Firmness */}
                    {consultStep === 4 && (
                      <div className="space-y-2">
                        <p className="font-semibold text-xs text-slate-800">
                          4. Độ cứng mong muốn khi nằm?
                        </p>
                        <div className="grid grid-cols-2 gap-1.5">
                          {['Êm mềm', 'Trung bình', 'Cứng', 'Chưa biết'].map((opt) => (
                            <button
                              key={opt}
                              onClick={() => handleStepAnswer('firmness', opt)}
                              className="text-xs p-2.5 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50 text-slate-700 font-medium text-left transition"
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Step 5: Priorities Multi-select */}
                    {consultStep === 5 && (
                      <div className="space-y-2.5">
                        <p className="font-semibold text-xs text-slate-800">
                          5. Anh/chị ưu tiên tiêu chí nào nhất? (Chọn nhiều)
                        </p>
                        <div className="grid grid-cols-2 gap-1.5">
                          {[
                            'Nâng đỡ tốt',
                            'Thoáng mát',
                            'Êm ái',
                            'Không rung',
                            'Bền',
                            'Giá tốt',
                            'Thương hiệu',
                          ].map((opt) => {
                            const selected = consultAnswers.priorities?.includes(opt);
                            return (
                              <button
                                key={opt}
                                onClick={() => handlePriorityToggle(opt)}
                                className={`text-xs p-2 rounded-xl border text-left font-medium transition flex items-center justify-between ${
                                  selected
                                    ? 'bg-emerald-600 text-white border-emerald-600'
                                    : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                                }`}
                              >
                                <span>{opt}</span>
                                {selected && <Check className="w-3 h-3 text-white" />}
                              </button>
                            );
                          })}
                        </div>

                        <button
                          onClick={() => {
                            setIsConsultationActive(false);
                            submitConsultationAnswers(consultAnswers);
                          }}
                          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-xl text-xs font-bold shadow-md transition"
                        >
                          Xem kết quả đề xuất ({consultAnswers.priorities?.length || 0} tiêu chí) &gt;
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* C09 / C10: Feedback & End Conversation Bar */}
                {messages.length > 3 && !feedbackSubmitted && (
                  <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs space-y-2 mt-2">
                    <p className="text-[11px] font-semibold text-slate-700 text-center">
                      Anh/chị thấy buổi tư vấn hôm nay thế nào?
                    </p>
                    <div className="flex justify-center gap-3 text-lg">
                      {[
                        { emoji: '😡', val: 1 },
                        { emoji: '😕', val: 2 },
                        { emoji: '😐', val: 3 },
                        { emoji: '🙂', val: 4 },
                        { emoji: '🤩', val: 5 },
                      ].map((item) => (
                        <button
                          key={item.val}
                          onClick={() => setFeedbackRating(item.val)}
                          className={`p-1 rounded-lg hover:scale-125 transition ${
                            feedbackRating === item.val ? 'bg-amber-100 scale-110' : ''
                          }`}
                        >
                          {item.emoji}
                        </button>
                      ))}
                    </div>
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        value={feedbackComment}
                        onChange={(e) => setFeedbackComment(e.target.value)}
                        placeholder="Góp ý thêm cho Đệm Xanh..."
                        className="flex-1 text-[11px] px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg outline-none"
                      />
                      <button
                        onClick={() => {
                          submitFeedback(feedbackRating, feedbackComment);
                          setFeedbackSubmitted(true);
                        }}
                        className="bg-emerald-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg"
                      >
                        Gửi
                      </button>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Message Input Bar */}
              <form
                onSubmit={handleSendMessage}
                className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
              >
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Nhập câu hỏi (Ví dụ: đệm lò xo nào đỡ đau lưng?)..."
                  className="flex-1 bg-slate-50 hover:bg-slate-100 focus:bg-white text-xs text-slate-800 placeholder-slate-400 px-3.5 py-2.5 rounded-full border border-slate-200 focus:border-emerald-500 outline-none transition"
                />

                <button
                  type="submit"
                  disabled={!inputText.trim() || isTyping}
                  className="w-9 h-9 rounded-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white flex items-center justify-center shrink-0 shadow-md transition"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </>
          )}
        </div>
      )}

      {/* C04: Product Comparison Matrix Modal */}
      {comparisonProducts && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-5 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-base text-slate-800">
                  C04 — So sánh chi tiết đệm
                </h3>
              </div>
              <button
                onClick={() => setComparisonProducts(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 text-slate-500 w-28">Tiêu chí</th>
                    {comparisonProducts.map((p) => (
                      <th key={p.id} className="text-left py-2 font-bold text-slate-900">
                        {p.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="py-2 text-slate-500 font-medium">Hình ảnh</td>
                    {comparisonProducts.map((p) => (
                      <td key={p.id} className="py-2">
                        <img
                          src={p.image}
                          alt={p.name}
                          className="w-16 h-12 object-cover rounded-lg"
                        />
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-2 text-slate-500 font-medium">Chủng loại</td>
                    {comparisonProducts.map((p) => (
                      <td key={p.id} className="py-2 font-semibold text-slate-800">
                        {p.category}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-2 text-slate-500 font-medium">Độ dày</td>
                    {comparisonProducts.map((p) => (
                      <td key={p.id} className="py-2">
                        {p.thickness}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-2 text-slate-500 font-medium">Độ cứng</td>
                    {comparisonProducts.map((p) => (
                      <td key={p.id} className="py-2">
                        <span className="bg-slate-100 px-2 py-0.5 rounded font-medium">
                          {p.firmness}
                        </span>
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-2 text-slate-500 font-medium">Giá khuyến mãi</td>
                    {comparisonProducts.map((p) => (
                      <td key={p.id} className="py-2 font-bold text-rose-600 text-sm">
                        {p.salePrice.toLocaleString('vi-VN')}đ
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-2 text-slate-500 font-medium">Bảo hành</td>
                    {comparisonProducts.map((p) => (
                      <td key={p.id} className="py-2 text-emerald-700 font-semibold">
                        {p.warrantyYears} năm chính hãng
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-2 text-slate-500 font-medium">Phù hợp nhất</td>
                    {comparisonProducts.map((p) => (
                      <td key={p.id} className="py-2 text-slate-600">
                        {p.aiSettings.suitableFor.join(', ')}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              {comparisonProducts.map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    setLeadFormData((prev) => ({
                      ...prev,
                      productInterest: `${p.name} (${p.salePrice.toLocaleString('vi-VN')}đ)`,
                    }));
                    setComparisonProducts(null);
                    setShowLeadModal(true);
                  }}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl text-xs transition"
                >
                  Chọn {p.brand} ({p.salePrice.toLocaleString('vi-VN')}đ)
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* C07: Lead Capture Form Modal */}
      {showLeadModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">
                  C07 — Thu thập Lead
                </span>
                <h3 className="font-bold text-base text-slate-900">
                  Nhận Báo Giá & Đặt Lịch Thử Đệm
                </h3>
              </div>
              <button
                onClick={() => setShowLeadModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Để nhân viên Đệm Xanh liên hệ hỗ trợ báo giá chiết khấu tốt nhất và giữ quà tặng combo
              1.800.000đ, anh/chị vui lòng để lại thông tin:
            </p>

            <form onSubmit={handleLeadSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Họ và tên anh/chị:
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Nguyễn Văn An"
                  value={leadFormData.name}
                  onChange={(e) => setLeadFormData({ ...leadFormData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Số điện thoại nhận tư vấn (10 số):
                </label>
                <input
                  type="tel"
                  required
                  placeholder="09xxxxxxxx / 03xxxxxxxx / 08xxxxxxxx"
                  value={leadFormData.phone}
                  onChange={(e) => {
                    setLeadFormData({ ...leadFormData, phone: e.target.value });
                    setLeadPhoneError('');
                  }}
                  className={`w-full px-3 py-2 bg-slate-50 border rounded-xl outline-none ${
                    leadPhoneError ? 'border-rose-500' : 'border-slate-200 focus:border-emerald-500'
                  }`}
                />
                {leadPhoneError && (
                  <p className="text-[11px] text-rose-500 mt-1">{leadPhoneError}</p>
                )}
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Khu vực giao hàng / Showroom gần nhất:
                </label>
                <select
                  value={leadFormData.area}
                  onChange={(e) => setLeadFormData({ ...leadFormData, area: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-500"
                >
                  <option value="Hà Nội">Hà Nội (Giao trong 2 giờ)</option>
                  <option value="TP. Hồ Chí Minh">TP. Hồ Chí Minh</option>
                  <option value="Hải Phòng">Hải Phòng</option>
                  <option value="Quảng Ninh">Quảng Ninh</option>
                  <option value="Đà Nẵng">Đà Nẵng</option>
                  <option value="Tỉnh thành khác">Tỉnh thành khác</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Thời gian tiện nhận cuộc gọi:
                </label>
                <select
                  value={leadFormData.preferredTime}
                  onChange={(e) =>
                    setLeadFormData({ ...leadFormData, preferredTime: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-500"
                >
                  <option value="Càng sớm càng tốt (Ngay bây giờ)">Càng sớm càng tốt</option>
                  <option value="Trong giờ hành chính (9h - 17h)">
                    Trong giờ hành chính (9h - 17h)
                  </option>
                  <option value="Buổi tối sau 18h">Buổi tối sau 18h</option>
                  <option value="Cuối tuần">Thứ 7 hoặc Chủ Nhật</option>
                </select>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl text-xs shadow-md transition flex items-center justify-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Xác nhận gửi thông tin</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
