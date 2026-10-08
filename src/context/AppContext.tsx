import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  AppView,
  Product,
  Conversation,
  Lead,
  KnowledgeItem,
  AIConfig,
  BusinessRule,
  RecommendationWeights,
  ChatbotAppearance,
  QuickReply,
  StaffMember,
  AuditLogEntry,
  FailedQuestion,
  ChatEventLog,
  ChatMessage,
  ConsultationAnswers,
  LeadStatus,
} from '../types';
import {
  INITIAL_PRODUCTS,
  INITIAL_KNOWLEDGE,
  INITIAL_LEADS,
  INITIAL_STAFF,
  INITIAL_CONVERSATIONS,
  INITIAL_AI_CONFIG,
  INITIAL_BUSINESS_RULES,
  INITIAL_RECOMMENDATION_WEIGHTS,
  INITIAL_APPEARANCE,
  INITIAL_QUICK_REPLIES,
  INITIAL_AUDIT_LOGS,
  INITIAL_FAILED_QUESTIONS,
} from '../data/mockData';
import { askDemXanhAI } from '../services/aiClient';

interface AppContextType {
  // Navigation
  activeView: AppView;
  setActiveView: (view: AppView) => void;
  currentPage: string;
  currentPageTitle: string;
  setCurrentPage: (page: string, title?: string) => void;
  setCurrentPageTitle: (title: string) => void;
  isMobilePreview: boolean;
  setIsMobilePreview: (val: boolean) => void;
  isEventLoggerOpen: boolean;
  setIsEventLoggerOpen: (val: boolean) => void;

  // Data lists
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  knowledgeItems: KnowledgeItem[];
  setKnowledgeItems: React.Dispatch<React.SetStateAction<KnowledgeItem[]>>;
  conversations: Conversation[];
  leads: Lead[];
  staffList: StaffMember[];
  aiConfig: AIConfig;
  setAiConfig: React.Dispatch<React.SetStateAction<AIConfig>>;
  businessRules: BusinessRule[];
  setBusinessRules: React.Dispatch<React.SetStateAction<BusinessRule[]>>;
  recommendationWeights: RecommendationWeights;
  setRecommendationWeights: React.Dispatch<React.SetStateAction<RecommendationWeights>>;
  appearance: ChatbotAppearance;
  setAppearance: React.Dispatch<React.SetStateAction<ChatbotAppearance>>;
  quickReplies: QuickReply[];
  setQuickReplies: React.Dispatch<React.SetStateAction<QuickReply[]>>;
  auditLogs: AuditLogEntry[];
  failedQuestions: FailedQuestion[];
  events: ChatEventLog[];

  // Current session & active staff
  currentStaff: StaffMember;
  setCurrentStaff: (staff: StaffMember) => void;
  activeCustomerConvId: string;
  setActiveCustomerConvId: (id: string) => void;

  // Actions
  sendCustomerMessage: (text: string) => Promise<void>;
  sendAgentMessage: (convId: string, text: string) => void;
  takeoverConversation: (convId: string, staffMember?: StaffMember) => void;
  submitConsultationAnswers: (answers: ConsultationAnswers) => void;
  submitLead: (leadData: {
    customerName: string;
    phone: string;
    area: string;
    preferredCallTime: string;
    productInterest?: string;
  }) => void;
  submitFeedback: (rating: number, comment: string) => void;
  addInternalNote: (convId: string, text: string) => void;
  updateLeadStatus: (leadId: string, status: LeadStatus) => void;
  updateLeadNotes: (leadId: string, notes: string) => void;
  resetCustomerChat: () => void;
  toggleRule: (id: string) => void;
  addKnowledgeItem: (item: Partial<KnowledgeItem>) => void;
  updateKnowledgeItem: (item: KnowledgeItem) => void;
  addProduct: (item: Partial<Product>) => void;
  updateProduct: (item: Product) => void;
  addAuditLog: (action: string, detail: string, type: 'ai' | 'product' | 'lead' | 'system') => void;
  convertFailedQuestionToKb: (fq: FailedQuestion) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeView, setActiveView] = useState<AppView>('customer');
  const [currentPage, setCurrentPageRaw] = useState<string>('/dem-lo-xo-dunlopillo-audrey');
  const [currentPageTitle, setCurrentPageTitle] = useState<string>('Đệm lò xo Dunlopillo Audrey 25cm');
  const [isMobilePreview, setIsMobilePreview] = useState<boolean>(false);
  const [isEventLoggerOpen, setIsEventLoggerOpen] = useState<boolean>(false);

  const setCurrentPage = (page: string, title?: string) => {
    setCurrentPageRaw(page);
    let derivedTitle = title;
    if (!derivedTitle) {
      const clean = page
        .replace(/^https?:\/\/[^/]+/i, '')
        .replace(/\.html?$/i, '')
        .replace(/^[/-]+/, '')
        .replace(/[-_]/g, ' ')
        .trim();
      derivedTitle = clean
        ? clean.split(' ').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
        : 'Trang chủ Đệm Xanh';
    }
    setCurrentPageTitle(derivedTitle);

    // Sync to active customer live conversation for staff workspace
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === activeCustomerConvId || c.id === 'conv-customer-live') {
          return {
            ...c,
            currentPage: page,
            currentProduct: derivedTitle,
            pageType: page.includes('cart') ? 'cart' : page === '/' || !page ? 'home' : 'product',
          };
        }
        return c;
      })
    );
  };

  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [knowledgeItems, setKnowledgeItems] = useState<KnowledgeItem[]>(INITIAL_KNOWLEDGE);
  const [conversations, setConversations] = useState<Conversation[]>(INITIAL_CONVERSATIONS);
  const [leads, setLeads] = useState<Lead[]>(INITIAL_LEADS);
  const [staffList, setStaffList] = useState<StaffMember[]>(INITIAL_STAFF);
  const [currentStaff, setCurrentStaff] = useState<StaffMember>(INITIAL_STAFF[0]);
  const [aiConfig, setAiConfig] = useState<AIConfig>(INITIAL_AI_CONFIG);
  const [businessRules, setBusinessRules] = useState<BusinessRule[]>(INITIAL_BUSINESS_RULES);
  const [recommendationWeights, setRecommendationWeights] = useState<RecommendationWeights>(INITIAL_RECOMMENDATION_WEIGHTS);
  const [appearance, setAppearance] = useState<ChatbotAppearance>(INITIAL_APPEARANCE);
  const [quickReplies, setQuickReplies] = useState<QuickReply[]>(INITIAL_QUICK_REPLIES);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(INITIAL_AUDIT_LOGS);
  const [failedQuestions, setFailedQuestions] = useState<FailedQuestion[]>(INITIAL_FAILED_QUESTIONS);
  const [events, setEvents] = useState<ChatEventLog[]>([]);

  // Default active customer conversation
  const [activeCustomerConvId, setActiveCustomerConvId] = useState<string>('conv-customer-live');

  // Initialize live customer conversation if not present
  useEffect(() => {
    setConversations((prev) => {
      const exists = prev.find((c) => c.id === 'conv-customer-live');
      if (exists) return prev;
      const initialConv: Conversation = {
        id: 'conv-customer-live',
        customerId: 'cust-visitor-99',
        customerName: 'Khách hàng truy cập Web',
        status: 'AI_ACTIVE',
        leadScore: 25,
        leadTier: 'NORMAL',
        currentPage: '/dem-lo-xo-dunlopillo-audrey',
        pageType: 'product',
        currentProduct: 'prod-dunlopillo-audrey',
        lastMessageTime: Date.now(),
        channel: 'website',
        intent: 'Tham quan & Xem sản phẩm',
        internalNotes: [],
        messages: [
          {
            id: 'init-msg-1',
            sender: 'ai',
            text: appearance.welcomeMessage,
            timestamp: Date.now(),
          },
        ],
      };
      return [initialConv, ...prev];
    });
  }, [appearance.welcomeMessage]);

  const addAuditLog = (action: string, detail: string, type: 'ai' | 'product' | 'lead' | 'system') => {
    const newLog: AuditLogEntry = {
      id: `log-${Date.now()}`,
      author: `${currentStaff.name} (${currentStaff.role})`,
      action,
      detail,
      timestamp: new Date().toLocaleDateString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      type,
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  const logEvent = (convId: string, text: string, type: string, sender: string, intent: string, score: number) => {
    const newEvent: ChatEventLog = {
      id: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      conversation_id: convId,
      customer_id: 'cust-visitor-99',
      session_id: 'sess-dx-live',
      page_url: currentPage,
      message: text,
      message_type: type,
      sender,
      timestamp: new Date().toLocaleTimeString('vi-VN'),
      intent,
      lead_score: score,
    };
    setEvents((prev) => [newEvent, ...prev.slice(0, 49)]);
  };

  // Customer sends message
  const sendCustomerMessage = async (text: string) => {
    const convId = activeCustomerConvId;
    const now = Date.now();
    const userMsg: ChatMessage = {
      id: `msg-${now}`,
      sender: 'customer',
      text,
      timestamp: now,
      type: 'text',
    };

    let targetConv = conversations.find((c) => c.id === convId);
    let currentScore = targetConv ? targetConv.leadScore : 25;
    let currentStatus = targetConv ? targetConv.status : 'AI_ACTIVE';
    let assigned = targetConv ? targetConv.assignedAgent : undefined;

    // Append user message
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === convId) {
          return {
            ...c,
            messages: [...c.messages, userMsg],
            lastMessageTime: now,
          };
        }
        return c;
      })
    );

    logEvent(convId, text, 'text', 'customer', targetConv?.intent || 'Tư vấn', currentScore);

    // If human already taken over, do not auto reply from AI
    if (currentStatus === 'HUMAN_ACTIVE' && assigned) {
      return;
    }

    // Call AI consultation engine
    try {
      const data = await askDemXanhAI(
        {
          message: text,
          history: (targetConv?.messages || []).slice(-6),
          systemPrompt: aiConfig.systemPrompt,
          currentPageContext: `${currentPage} (Sản phẩm đang xem: ${currentPageTitle || 'Trang chủ Đệm Xanh'})`,
          customerProfile: targetConv?.consultationData,
          catalog: products,
        },
        products
      );

      const replyText = data.text || 'Dạ em có thể hỗ trợ anh/chị chọn đệm phù hợp hoặc xem ưu đãi tại showroom Đệm Xanh ạ!';
      const detectedIntent = data.detectedIntent || 'Tư vấn đệm';
      const scoreInc = data.scoreIncrement || 10;
      const newScore = Math.min(100, currentScore + scoreInc);

      const aiMsg: ChatMessage = {
        id: `ai-msg-${Date.now()}`,
        sender: 'ai',
        text: replyText,
        timestamp: Date.now(),
        type: 'text',
      };

      setConversations((prev) =>
        prev.map((c) => {
          if (c.id === convId) {
            const isHot = newScore >= 80;
            return {
              ...c,
              messages: [...c.messages, aiMsg],
              leadScore: newScore,
              leadTier: isHot ? 'HOT' : newScore >= 50 ? 'WARM' : 'NORMAL',
              intent: detectedIntent,
              status: isHot && c.status === 'AI_ACTIVE' ? 'WAITING_AGENT' : c.status,
              lastMessageTime: Date.now(),
            };
          }
          return c;
        })
      );

      logEvent(convId, replyText, 'text', 'ai', detectedIntent, newScore);

      if (newScore >= 80) {
        addAuditLog('Phát hiện Hot Lead tự động', `Khách hàng đạt điểm tiềm năng ${newScore}/100. Intent: ${detectedIntent}`, 'lead');
      }
    } catch (e) {
      console.error('Chat error:', e);
    }
  };

  // Staff sends message
  const sendAgentMessage = (convId: string, text: string) => {
    const now = Date.now();
    const agentMsg: ChatMessage = {
      id: `agent-msg-${now}`,
      sender: 'agent',
      senderName: `${currentStaff.name} (${currentStaff.role})`,
      senderAvatar: currentStaff.avatar,
      text,
      timestamp: now,
      type: 'text',
    };

    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === convId) {
          return {
            ...c,
            status: 'HUMAN_ACTIVE',
            assignedAgent: {
              id: currentStaff.id,
              name: currentStaff.name,
              avatar: currentStaff.avatar,
            },
            messages: [...c.messages, agentMsg],
            lastMessageTime: now,
          };
        }
        return c;
      })
    );

    logEvent(convId, text, 'text', 'agent', 'Tư vấn trực tiếp', 90);
    addAuditLog('Nhân viên gửi tin nhắn', `${currentStaff.name} đã phản hồi khách trong cuộc trò chuyện ${convId}`, 'system');
  };

  // Staff takeover
  const takeoverConversation = (convId: string, staffMember?: StaffMember) => {
    const staff = staffMember || currentStaff;
    const now = Date.now();
    const systemNotice: ChatMessage = {
      id: `sys-takeover-${now}`,
      sender: 'system',
      text: `✓ Nhân viên ${staff.name} (${staff.role}) đã tiếp quản cuộc trò chuyện để tư vấn chuyên sâu cho anh/chị.`,
      timestamp: now,
      type: 'handoff',
    };

    const helloNotice: ChatMessage = {
      id: `agent-hello-${now + 1}`,
      sender: 'agent',
      senderName: `${staff.name} (Đệm Xanh)`,
      senderAvatar: staff.avatar,
      text: `Em chào anh/chị ạ! Em là ${staff.name} tại Đệm Xanh. Em sẽ trực tiếp hỗ trợ mình kiểm tra size, giữ quà tặng khuyến mãi và lịch giao hàng ngay nhé!`,
      timestamp: now + 1,
      type: 'text',
    };

    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === convId) {
          return {
            ...c,
            status: 'HUMAN_ACTIVE',
            assignedAgent: {
              id: staff.id,
              name: staff.name,
              avatar: staff.avatar,
            },
            messages: [...c.messages, systemNotice, helloNotice],
            lastMessageTime: now,
          };
        }
        return c;
      })
    );

    addAuditLog('Nhân viên Takeover Chat', `${staff.name} đã tiếp quản cuộc trò chuyện ${convId}`, 'lead');
    logEvent(convId, `Takeover bởi ${staff.name}`, 'handoff', 'system', 'Human Takeover', 95);
  };

  // Smart consultation submission (C05 -> C06)
  const submitConsultationAnswers = (answers: ConsultationAnswers) => {
    const convId = activeCustomerConvId;
    const now = Date.now();

    // Calculate smart matching products based on weights and answers
    let matched = [...products].filter((p) => p.aiSettings.aiEnabled);

    // Filter or rank
    const ranked = matched.map((prod) => {
      let score = 70;
      if (answers.target && prod.aiSettings.suitableFor.includes(answers.target as any)) score += 12;
      if (answers.firmness && prod.firmness.toLowerCase().includes(answers.firmness.toLowerCase())) score += 10;
      if (answers.budget) {
        if (answers.budget === 'Dưới 3 triệu' && prod.salePrice <= 3500000) score += 15;
        if (answers.budget === '3–5 triệu' && prod.salePrice >= 2500000 && prod.salePrice <= 6000000) score += 15;
        if (answers.budget === '5–10 triệu' && prod.salePrice >= 5000000 && prod.salePrice <= 12000000) score += 15;
        if (answers.budget === '10–20 triệu' && prod.salePrice >= 10000000 && prod.salePrice <= 22000000) score += 15;
        if (answers.budget === 'Trên 20 triệu' && prod.salePrice >= 18000000) score += 15;
      }
      return { product: prod, matchPercent: Math.min(98, score) };
    });

    ranked.sort((a, b) => b.matchPercent - a.matchPercent);
    const top3 = ranked.slice(0, 3);

    const userSummaryMsg: ChatMessage = {
      id: `usr-ans-${now}`,
      sender: 'customer',
      text: `Nhu cầu của tôi: Dành cho ${answers.target || 'Bản thân'}, kích thước ${answers.size || '1m8 × 2m'}, ngân sách ${answers.budget || '5–10 triệu'}, độ cứng ${answers.firmness || 'Trung bình'}.`,
      timestamp: now,
      type: 'text',
    };

    const resultMsg: ChatMessage = {
      id: `ai-recom-${now + 500}`,
      sender: 'ai',
      text: `🎯 KẾT QUẢ TƯ VẤN THÔNG MINH\n\nDựa trên thông tin của anh/chị, em đã phân tích và đề xuất 3 mẫu đệm chuẩn y khoa tối ưu nhất từ hệ sinh thái Đệm Xanh:`,
      timestamp: now + 500,
      type: 'consultation_result',
      payload: {
        answers,
        topRecommendations: top3,
      },
    };

    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === convId) {
          return {
            ...c,
            consultationData: answers,
            leadScore: Math.max(c.leadScore, 75),
            leadTier: 'WARM',
            messages: [...c.messages, userSummaryMsg, resultMsg],
            lastMessageTime: now + 500,
          };
        }
        return c;
      })
    );

    logEvent(convId, 'Hoàn thành 5 bước tư vấn đệm', 'consultation_result', 'customer', 'Smart Consultation', 75);
    addAuditLog('Tư vấn thông minh AI', `Hoàn thành 5 câu hỏi tư vấn cho khách. Đề xuất top 3 đệm phù hợp.`, 'ai');
  };

  // Submit Lead Form (C07)
  const submitLead = (leadData: {
    customerName: string;
    phone: string;
    area: string;
    preferredCallTime: string;
    productInterest?: string;
  }) => {
    const convId = activeCustomerConvId;
    const now = Date.now();
    const newLeadId = `lead-${Date.now()}`;

    const newLead: Lead = {
      id: newLeadId,
      conversationId: convId,
      customerName: leadData.customerName,
      phone: leadData.phone,
      area: leadData.area,
      preferredCallTime: leadData.preferredCallTime || 'Càng sớm càng tốt',
      productInterest: leadData.productInterest || 'Đệm lò xo Dunlopillo Audrey / Tư vấn theo ngân sách',
      budget: '5–10 triệu',
      score: 96,
      status: 'NEW',
      assignedTo: `${currentStaff.name} (Sales)`,
      createdAt: new Date().toLocaleDateString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      notes: 'Khách hàng đăng ký tư vấn trực tiếp từ AI Widget trên website demxanh.com.',
    };

    setLeads((prev) => [newLead, ...prev]);

    const confirmMsg: ChatMessage = {
      id: `ai-lead-confirm-${now}`,
      sender: 'ai',
      text: `🎉 Cảm ơn anh/chị ${leadData.customerName}!\n\nEm đã chuyển thông tin số điện thoại (${leadData.phone}) và yêu cầu giao về khu vực ${leadData.area} tới chuyên viên Showroom Đệm Xanh. Nhân viên sẽ liên hệ với mình vào thời gian ${leadData.preferredCallTime} để áp dụng quà tặng và giao hàng miễn phí nhé!`,
      timestamp: now,
      type: 'text',
    };

    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === convId) {
          return {
            ...c,
            customerName: leadData.customerName,
            customerPhone: leadData.phone,
            customerArea: leadData.area,
            leadScore: 98,
            leadTier: 'HOT',
            status: 'WAITING_AGENT',
            messages: [...c.messages, confirmMsg],
            lastMessageTime: now,
          };
        }
        return c;
      })
    );

    logEvent(convId, `Đăng ký Lead thành công: ${leadData.customerName} - ${leadData.phone}`, 'lead_form', 'customer', 'Hot Lead Generated', 98);
    addAuditLog('🔥 Tạo Hot Lead mới từ Chatbot', `Khách: ${leadData.customerName} - SĐT: ${leadData.phone} - Khu vực: ${leadData.area}`, 'lead');
  };

  // Submit Feedback (C09)
  const submitFeedback = (rating: number, comment: string) => {
    const convId = activeCustomerConvId;
    const now = Date.now();
    const thankMsg: ChatMessage = {
      id: `fb-ack-${now}`,
      sender: 'ai',
      text: `Dạ em cảm ơn anh/chị đã đánh giá ${rating}/5 sao cho trải nghiệm tư vấn! Ý kiến "${comment || 'Hài lòng'}" giúp Đệm Xanh nâng cao chất lượng phục vụ mỗi ngày.`,
      timestamp: now,
      type: 'end',
    };

    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === convId) {
          return {
            ...c,
            status: 'RESOLVED',
            messages: [...c.messages, thankMsg],
            lastMessageTime: now,
          };
        }
        return c;
      })
    );

    logEvent(convId, `Đánh giá dịch vụ: ${rating}/5 sao - ${comment}`, 'feedback', 'customer', 'Customer Feedback', 85);
  };

  // Add internal note
  const addInternalNote = (convId: string, text: string) => {
    const newNote = {
      id: `note-${Date.now()}`,
      author: currentStaff.name,
      text,
      time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    };

    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === convId) {
          return {
            ...c,
            internalNotes: [...c.internalNotes, newNote],
          };
        }
        return c;
      })
    );

    addAuditLog('Thêm ghi chú nội bộ', `Thêm ghi chú cho cuộc hội thoại ${convId}: "${text}"`, 'system');
  };

  // Update lead status
  const updateLeadStatus = (leadId: string, status: LeadStatus) => {
    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, status } : l))
    );
    addAuditLog('Cập nhật trạng thái Lead', `Lead #${leadId} chuyển sang trạng thái ${status}`, 'lead');
  };

  const updateLeadNotes = (leadId: string, notes: string) => {
    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, notes } : l))
    );
  };

  // Reset customer chat
  const resetCustomerChat = () => {
    const newConvId = `conv-${Date.now()}`;
    const newConv: Conversation = {
      id: newConvId,
      customerId: `cust-${Date.now().toString().slice(-4)}`,
      customerName: 'Khách hàng mới',
      status: 'AI_ACTIVE',
      leadScore: 20,
      leadTier: 'NORMAL',
      currentPage,
      pageType: 'product',
      currentProduct: 'prod-dunlopillo-audrey',
      lastMessageTime: Date.now(),
      channel: 'website',
      intent: 'Bắt đầu cuộc trò chuyện mới',
      internalNotes: [],
      messages: [
        {
          id: `welcome-${Date.now()}`,
          sender: 'ai',
          text: appearance.welcomeMessage,
          timestamp: Date.now(),
        },
      ],
    };
    setConversations((prev) => [newConv, ...prev]);
    setActiveCustomerConvId(newConvId);
  };

  const toggleRule = (id: string) => {
    setBusinessRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r))
    );
    addAuditLog('Thay đổi trạng thái Rule', `Chuyển đổi trạng thái Business Rule #${id}`, 'ai');
  };

  const addKnowledgeItem = (item: Partial<KnowledgeItem>) => {
    const newItem: KnowledgeItem = {
      id: `kb-${Date.now()}`,
      title: item.title || 'Bài viết kiến thức mới',
      category: item.category || 'FAQ',
      content: item.content || '',
      tags: item.tags || ['tư vấn', 'đệm'],
      priority: item.priority || 4,
      status: item.status || 'Published',
      aiVisibility: item.aiVisibility || { customer: true, staff: true },
      updatedAt: new Date().toISOString().split('T')[0],
    };
    setKnowledgeItems((prev) => [newItem, ...prev]);
    addAuditLog('Thêm bài viết Knowledge Base', `Tạo mới: "${newItem.title}"`, 'ai');
  };

  const updateKnowledgeItem = (item: KnowledgeItem) => {
    setKnowledgeItems((prev) => prev.map((k) => (k.id === item.id ? item : k)));
    addAuditLog('Cập nhật bài viết Knowledge Base', `Chỉnh sửa: "${item.title}"`, 'ai');
  };

  const addProduct = (prod: Partial<Product>) => {
    const newP: Product = {
      id: `prod-${Date.now()}`,
      name: prod.name || 'Sản phẩm đệm mới',
      brand: prod.brand || 'Dunlopillo',
      category: prod.category || 'Đệm lò xo',
      sku: prod.sku || `SKU-${Date.now().toString().slice(-4)}`,
      originalPrice: prod.originalPrice || 10000000,
      salePrice: prod.salePrice || 8500000,
      stock: prod.stock || 20,
      rating: 4.8,
      reviewCount: 1,
      thickness: prod.thickness || '20 cm',
      dimensions: prod.dimensions || ['1m6 × 2m', '1m8 × 2m'],
      firmness: prod.firmness || 'Trung bình',
      material: prod.material || 'Chất liệu cao cấp',
      warrantyYears: prod.warrantyYears || 10,
      image: prod.image || 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=800&q=80',
      features: prod.features || ['Nâng đỡ tốt'],
      description: prod.description || 'Mô tả sản phẩm',
      aiSettings: prod.aiSettings || {
        aiEnabled: true,
        suitableFor: ['Bản thân', 'Vợ/chồng'],
        temperature: 'Mát mẻ',
        bestFor: ['Nâng đỡ cột sống tốt'],
      },
    };
    setProducts((prev) => [newP, ...prev]);
    addAuditLog('Thêm sản phẩm mới', `Thêm sản phẩm: ${newP.name}`, 'product');
  };

  const updateProduct = (item: Product) => {
    setProducts((prev) => prev.map((p) => (p.id === item.id ? item : p)));
    addAuditLog('Cập nhật sản phẩm', `Chỉnh sửa thông số / AI settings cho ${item.name}`, 'product');
  };

  const convertFailedQuestionToKb = (fq: FailedQuestion) => {
    addKnowledgeItem({
      title: `Giải đáp: ${fq.question}`,
      category: 'FAQ',
      content: `Thông tin giải đáp chính thức từ Đệm Xanh cho câu hỏi: "${fq.question}". Đệm Xanh hỗ trợ tư vấn 24/7 qua hotline 1800 1051.`,
      tags: ['faq', 'tự động bổ sung'],
      status: 'Published',
    });
    setFailedQuestions((prev) =>
      prev.map((q) => (q.id === fq.id ? { ...q, status: 'added_to_kb' } : q))
    );
    addAuditLog('Bổ sung kiến thức từ câu hỏi thất bại', `Đã chuyển đổi câu hỏi: "${fq.question}" thành bài viết Knowledge Base`, 'ai');
  };

  return (
    <AppContext.Provider
      value={{
        activeView,
        setActiveView,
        currentPage,
        currentPageTitle,
        setCurrentPage,
        setCurrentPageTitle,
        isMobilePreview,
        setIsMobilePreview,
        isEventLoggerOpen,
        setIsEventLoggerOpen,
        products,
        setProducts,
        knowledgeItems,
        setKnowledgeItems,
        conversations,
        leads,
        staffList,
        aiConfig,
        setAiConfig,
        businessRules,
        setBusinessRules,
        recommendationWeights,
        setRecommendationWeights,
        appearance,
        setAppearance,
        quickReplies,
        setQuickReplies,
        auditLogs,
        failedQuestions,
        events,
        currentStaff,
        setCurrentStaff,
        activeCustomerConvId,
        setActiveCustomerConvId,
        sendCustomerMessage,
        sendAgentMessage,
        takeoverConversation,
        submitConsultationAnswers,
        submitLead,
        submitFeedback,
        addInternalNote,
        updateLeadStatus,
        updateLeadNotes,
        resetCustomerChat,
        toggleRule,
        addKnowledgeItem,
        updateKnowledgeItem,
        addProduct,
        updateProduct,
        addAuditLog,
        convertFailedQuestionToKb,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
