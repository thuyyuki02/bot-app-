export type AppView = 'customer' | 'staff' | 'admin';

export type ConversationStatus = 
  | 'NEW'
  | 'AI_ACTIVE'
  | 'WAITING_CUSTOMER'
  | 'WAITING_AGENT'
  | 'HUMAN_ACTIVE'
  | 'RESOLVED'
  | 'CLOSED';

export type LeadStatus = 
  | 'NEW'
  | 'CONTACTED'
  | 'QUALIFIED'
  | 'NEGOTIATING'
  | 'WON'
  | 'LOST';

export type LeadScoreTier = 'HOT' | 'WARM' | 'NORMAL';

export interface Product {
  id: string;
  name: string;
  brand: 'Dunlopillo' | 'Liên Á' | 'Kim Cương' | 'Vạn Thành' | 'Oyasumi' | 'Everon' | 'Song Hồng' | 'Olympia';
  category: 'Đệm lò xo' | 'Đệm cao su' | 'Đệm foam' | 'Đệm bông ép';
  sku: string;
  originalPrice: number;
  salePrice: number;
  stock: number;
  rating: number;
  reviewCount: number;
  thickness: string;
  dimensions: string[];
  firmness: 'Êm mềm' | 'Trung bình' | 'Cứng';
  material: string;
  warrantyYears: number;
  image: string;
  features: string[];
  description: string;
  aiSettings: {
    aiEnabled: boolean;
    suitableFor: ('Bản thân' | 'Vợ/chồng' | 'Người lớn tuổi' | 'Trẻ em' | 'Khách sạn')[];
    temperature: 'Mát mẻ' | 'Trung bình' | 'Ấm';
    bestFor: string[];
  };
}

export interface ConsultationAnswers {
  target?: string;
  size?: string;
  budget?: string;
  firmness?: string;
  priorities?: string[];
}

export interface ChatMessage {
  id: string;
  sender: 'customer' | 'ai' | 'agent' | 'system';
  senderName?: string;
  senderAvatar?: string;
  text: string;
  timestamp: number;
  type?: 
    | 'text'
    | 'product_cards'
    | 'comparison'
    | 'consultation_step'
    | 'consultation_result'
    | 'lead_form'
    | 'handoff'
    | 'feedback'
    | 'end';
  payload?: any;
}

export interface Conversation {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone?: string;
  customerArea?: string;
  status: ConversationStatus;
  leadScore: number;
  leadTier: LeadScoreTier;
  assignedAgent?: {
    id: string;
    name: string;
    avatar: string;
  };
  currentPage: string;
  pageType: 'home' | 'product' | 'cart' | 'policy';
  currentProduct?: string;
  messages: ChatMessage[];
  consultationData?: ConsultationAnswers;
  internalNotes: {
    id: string;
    author: string;
    text: string;
    time: string;
  }[];
  lastMessageTime: number;
  channel: string;
  intent?: string;
}

export interface Lead {
  id: string;
  conversationId: string;
  customerName: string;
  phone: string;
  area: string;
  preferredCallTime: string;
  productInterest: string;
  budget: string;
  score: number;
  status: LeadStatus;
  assignedTo: string;
  createdAt: string;
  notes: string;
}

export interface KnowledgeItem {
  id: string;
  title: string;
  category: 'FAQ' | 'Products' | 'Policies' | 'Brands' | 'Delivery' | 'Warranty' | 'Return' | 'Sales Scripts';
  content: string;
  tags: string[];
  priority: number;
  status: 'Draft' | 'Published';
  aiVisibility: {
    customer: boolean;
    staff: boolean;
  };
  updatedAt: string;
}

export interface AIConfig {
  botName: string;
  personality: string;
  language: string;
  responseStyle: string;
  temperature: number;
  model: string;
  systemPrompt: string;
}

export interface BusinessRule {
  id: string;
  name: string;
  trigger: string;
  condition: string;
  action: string;
  fallback: string;
  enabled: boolean;
}

export interface RecommendationWeights {
  priceMatch: number;
  customerNeed: number;
  productSuitability: number;
  promotion: number;
  stockAvailability: number;
  brandPreference: number;
  doNotRecommendOutOfStock: boolean;
  preferActivePromotion: boolean;
  maxProducts: number;
  showCheaperAlternative: boolean;
  showPremiumAlternative: boolean;
}

export interface ChatbotAppearance {
  botName: string;
  subtitle: string;
  welcomeMessage: string;
  position: 'left' | 'right';
  bubbleSize: 'small' | 'medium' | 'large';
  showBadge: boolean;
  showProactiveMessage: boolean;
  proactiveDelaySec: number;
  proactiveMessage: string;
}

export interface QuickReply {
  id: string;
  title: string;
  icon: string;
  actionType: 'consultation' | 'budget' | 'promotions' | 'delivery' | 'human_handoff' | 'custom';
  enabled: boolean;
}

export interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: 'SUPER ADMIN' | 'ADMIN' | 'SALES MANAGER' | 'SALES' | 'CSKH' | 'CONTENT' | 'ANALYST';
  status: 'online' | 'busy' | 'offline';
  activeChats: number;
  avatar: string;
  phone: string;
}

export interface AuditLogEntry {
  id: string;
  author: string;
  action: string;
  detail: string;
  timestamp: string;
  type: 'ai' | 'product' | 'lead' | 'system';
}

export interface FailedQuestion {
  id: string;
  question: string;
  occurrences: number;
  lastAsked: string;
  status: 'unresolved' | 'added_to_kb';
}

export interface CustomerProfileSchema {
  id?: string;
  customerId?: string;
  mattress_size?: string;
  budget_min?: number;
  budget_max?: number;
  firmness_preference?: string;
  sleeper_count?: number;
  age_group?: string;
  purpose?: string;
  special_needs?: string;
}

export interface MessageSource {
  id: string;
  sourceType: 'product' | 'knowledge_chunk' | 'policy' | 'inventory';
  sourceId: string;
  sourceName: string;
  relevanceScore: number;
  snippet: string;
}

export interface ValidationResult {
  passed: boolean;
  priceCheckPassed: boolean;
  inventoryCheckPassed: boolean;
  policyCheckPassed: boolean;
  hallucinationRisk: 'LOW' | 'MEDIUM' | 'HIGH';
  notes: string[];
}

export interface PlaygroundTestResult {
  id: string;
  query: string;
  extractedProfile: CustomerProfileSchema;
  recommendedProducts: {
    product: Product;
    score: number;
    scoreBreakdown: {
      budgetMatch: number;
      sizeMatch: number;
      firmnessMatch: number;
      purposeMatch: number;
      stockMatch: number;
    };
    reason: string[];
  }[];
  sources: MessageSource[];
  validation: ValidationResult;
  responseText: string;
  userFeedback?: 'CORRECT' | 'WRONG';
  feedbackNote?: string;
}

export interface DatabaseTableDefinition {
  name: string;
  group: 'AUTH' | 'CATALOG' | 'CUSTOMER' | 'CHAT' | 'AI KNOWLEDGE' | 'SALES' | 'ANALYTICS' | 'SYSTEM';
  description: string;
  columns: {
    name: string;
    type: string;
    nullable: boolean;
    isPrimary?: boolean;
    isForeign?: boolean;
    foreignRef?: string;
    description: string;
  }[];
  sqlDDL: string;
}

export interface ChatEventLog {
  id: string;
  conversation_id: string;
  customer_id: string;
  session_id: string;
  page_url: string;
  product_id?: string;
  message: string;
  message_type: string;
  sender: string;
  timestamp: string;
  intent: string;
  lead_score: number;
}

export interface ApiEndpointDefinition {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  summary: string;
  description: string;
  requestBody?: any;
  responseBody: any;
  curlExample: string;
}



