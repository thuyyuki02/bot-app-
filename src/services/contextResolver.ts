import { Product } from '../types';
import { DEMXANH_REAL_CATALOG } from './crawlerService';

export interface ContextResolveInput {
  message: string;
  history?: Array<{ sender: string; text: string }>;
  currentPageContext?: string;
  customerProfile?: any;
  catalog?: Product[];
}

export interface ContextResolveResult {
  focalProduct: Product;
  contextType: 'page_product' | 'history_product' | 'explicit_message' | 'intent_fallback';
  pageProduct?: Product;
  historyProduct?: Product;
  explanation: string;
  detectedIntent: string;
  relevantProducts: Product[];
  suggestedChips: string[];
}

/**
 * Remove Vietnamese accents and normalize for fuzzy matching
 */
export function normalizeVietnamese(str: string): string {
  if (!str) return '';
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd')
    .trim();
}

/**
 * Match a text against a product in catalog by SKU, name tokens, slug, brand
 */
export function matchProductInText(text: string, catalog: Product[]): Product | undefined {
  if (!text) return undefined;
  const norm = normalizeVietnamese(text);
  const rawLower = text.toLowerCase();

  // 1. Direct SKU match
  for (const p of catalog) {
    if (p.sku && norm.includes(normalizeVietnamese(p.sku))) return p;
    if (p.id && norm.includes(normalizeVietnamese(p.id.replace('dx-prod-', '')))) return p;
  }

  // 2. Specific product keywords
  const specialKeywords: Array<{ keywords: string[]; idSnippet: string }> = [
    { keywords: ['audrey', 'dunlopillo audrey', 'normablock'], idSnippet: 'audrey' },
    { keywords: ['happy gold', 'happygold', 'cao su kim cuong'], idSnippet: 'happygold' },
    { keywords: ['lien a classic', 'liena classic', 'cao su lien a'], idSnippet: 'classic' },
    { keywords: ['song hong the he 3', 'song hong the he ba', 'song hong gap 2', 'dem bong ep song hong'], idSnippet: 'thehe3' },
    { keywords: ['dunlopillo evita', 'evita', 'euro top'], idSnippet: 'evita' },
    { keywords: ['olympia massage', 'olympia 4 mua', 'bon mua olympia'], idSnippet: 'massage' },
    { keywords: ['van thanh standard', 'cao su van thanh'], idSnippet: 'vanthanh' },
  ];

  for (const item of specialKeywords) {
    if (item.keywords.some((kw) => norm.includes(normalizeVietnamese(kw)))) {
      const match = catalog.find((p) => p.id.toLowerCase().includes(item.idSnippet));
      if (match) return match;
    }
  }

  // 3. Name or Slug inclusion
  for (const p of catalog) {
    const normName = normalizeVietnamese(p.name);
    if (norm.includes(normName)) return p;

    // Check slug from name
    const slug = normName.replace(/[^a-z0-9]/g, '-');
    if (norm.includes(slug)) return p;

    // Check URL if defined
    if (p.url && norm.includes(normalizeVietnamese(p.url))) return p;
  }

  // 4. Token multi-match (brand + product name key token)
  for (const p of catalog) {
    const normBrand = normalizeVietnamese(p.brand);
    const tokens = normalizeVietnamese(p.name)
      .split(/\s+/)
      .filter((w) => w.length > 2 && !['dem', 'lo', 'xo', 'cao', 'su', 'bong', 'ep', 'thien', 'nhien'].includes(w));

    if (norm.includes(normBrand) && tokens.some((t) => norm.includes(t))) {
      return p;
    }
  }

  return undefined;
}

/**
 * Intelligent Multi-tier Context Resolver
 * Accurately determines:
 * 1. The product on the page currently viewed by customer on demxanh.com
 * 2. The ongoing product in the conversation history
 * 3. Whether customer is referring to "this product" (mẫu này, đệm này, giá bao nhiêu...)
 */
export function resolveContextualTargetProduct(input: ContextResolveInput): ContextResolveResult {
  const { message, history = [], currentPageContext = '', catalog = DEMXANH_REAL_CATALOG } = input;
  const activeCatalog = catalog.length > 0 ? catalog : DEMXANH_REAL_CATALOG;
  const normMsg = normalizeVietnamese(message);

  // --- Step 1: Detect Current Page Product ---
  const pageProduct = matchProductInText(currentPageContext, activeCatalog);

  // --- Step 2: Detect History Product (from recent conversation) ---
  let historyProduct: Product | undefined;
  if (history && history.length > 0) {
    // Scan backwards from newest message
    for (let i = history.length - 1; i >= 0; i--) {
      const hText = history[i]?.text || '';
      const matched = matchProductInText(hText, activeCatalog);
      if (matched) {
        historyProduct = matched;
        break;
      }
    }
  }

  // --- Step 3: Detect Explicit Product in current message ---
  const explicitMessageProduct = matchProductInText(message, activeCatalog);

  // --- Step 4: Check if customer is asking a referential / contextual question ---
  const isDemonstrativeOrAttributeQuestion =
    normMsg.includes('nay') || // mẫu này, đệm này, cái này, link này
    normMsg.includes('gia') || // giá bao nhiêu, có đắt không
    normMsg.includes('bao nhieu') ||
    normMsg.includes('tien') ||
    normMsg.includes('khuyen mai') ||
    normMsg.includes('qua tang') ||
    normMsg.includes('qua') ||
    normMsg.includes('bao hanh') ||
    normMsg.includes('day') || // dày mấy phân
    normMsg.includes('phan') ||
    normMsg.includes('cm') ||
    normMsg.includes('cung') || // nằm có cứng không, có êm không
    normMsg.includes('em') ||
    normMsg.includes('dau lung') || // nằm đỡ đau lưng không
    normMsg.includes('kich thuoc') ||
    normMsg.includes('1m6') ||
    normMsg.includes('1m8') ||
    normMsg.includes('2m') ||
    normMsg.includes('giao') ||
    normMsg.includes('ship') ||
    normMsg.includes('ngu thu') ||
    normMsg.includes('cho toi xem') ||
    normMsg.includes('thong so');

  // --- Step 5: Resolve Primary Focal Product ---
  let focalProduct: Product;
  let contextType: ContextResolveResult['contextType'];
  let explanation = '';

  // If user explicitly asks about a product, honor that choice
  if (explicitMessageProduct && (!pageProduct || explicitMessageProduct.id !== pageProduct.id)) {
    // Check if user specifically switched to another product
    focalProduct = explicitMessageProduct;
    contextType = 'explicit_message';
    explanation = `Khách hàng chủ động nhắc đích danh mẫu "${focalProduct.name}" trong tin nhắn.`;
  } else if (pageProduct && (isDemonstrativeOrAttributeQuestion || !explicitMessageProduct)) {
    // Customer is looking at this page on demxanh.com and asks "this" or asks attributes
    focalProduct = pageProduct;
    contextType = 'page_product';
    explanation = `Khách hàng ĐANG XEM TRỰC TIẾP mẫu "${focalProduct.name}" trên trang web demxanh.com. Mọi câu hỏi "này/giá/bảo hành/độ dày/đau lưng" đều quy về mẫu này.`;
  } else if (historyProduct && isDemonstrativeOrAttributeQuestion) {
    // Customer continues the chat about the product previously discussed
    focalProduct = historyProduct;
    contextType = 'history_product';
    explanation = `Khách hàng ĐANG HỎI TIẾP về mẫu "${focalProduct.name}" đã thảo luận trong lịch sử hội thoại.`;
  } else if (pageProduct) {
    focalProduct = pageProduct;
    contextType = 'page_product';
    explanation = `Khách hàng đang ở trên trang "${pageProduct.name}".`;
  } else if (historyProduct) {
    focalProduct = historyProduct;
    contextType = 'history_product';
    explanation = `Mẫu sản phẩm gần nhất trong ngữ cảnh hội thoại là "${historyProduct.name}".`;
  } else if (explicitMessageProduct) {
    focalProduct = explicitMessageProduct;
    contextType = 'explicit_message';
    explanation = `Khách hàng hỏi về "${focalProduct.name}".`;
  } else {
    // Fallback based on health or general intent
    if (normMsg.includes('dau lung') || normMsg.includes('cot song') || normMsg.includes('thoat vi')) {
      focalProduct = activeCatalog.find((p) => p.id.includes('happygold')) || activeCatalog[0];
    } else {
      focalProduct = activeCatalog[0];
    }
    contextType = 'intent_fallback';
    explanation = `Ngữ cảnh chung: Đề xuất mẫu tiêu biểu phù hợp nhất "${focalProduct.name}".`;
  }

  // --- Step 6: Detect Specific Intent ---
  let detectedIntent = 'Tư vấn thông số đệm';
  if (normMsg.includes('gia') || normMsg.includes('bao nhieu') || normMsg.includes('tien') || normMsg.includes('khuyen mai')) {
    detectedIntent = 'Hỏi giá & Khuyến mãi';
  } else if (normMsg.includes('dau lung') || normMsg.includes('cot song') || normMsg.includes('thoat vi') || normMsg.includes('nguoi gia')) {
    detectedIntent = 'Tư vấn y khoa & Nâng đỡ cột sống';
  } else if (normMsg.includes('day') || normMsg.includes('chieu cao') || normMsg.includes('phan') || normMsg.includes('cm') || normMsg.includes('kich thuoc')) {
    detectedIntent = 'Hỏi độ dày & Kích thước';
  } else if (normMsg.includes('bao hanh') || normMsg.includes('ngu thu') || normMsg.includes('chinh hang') || normMsg.includes('doi tra')) {
    detectedIntent = 'Chính sách bảo hành & Ngủ thử';
  } else if (normMsg.includes('giao') || normMsg.includes('ship') || normMsg.includes('van chuyen')) {
    detectedIntent = 'Chính sách vận chuyển';
  } else if (normMsg.includes('mua') || normMsg.includes('dat hang') || normMsg.includes('chot') || normMsg.includes('sdt')) {
    detectedIntent = 'Đặt hàng & Chốt đơn';
  }

  // --- Step 7: Relevant Products list (Focal product at index 0) ---
  const relevantProducts = [
    focalProduct,
    ...activeCatalog.filter((p) => p.id !== focalProduct.id).slice(0, 3),
  ];

  // --- Step 8: Contextual Suggestion Chips ---
  const suggestedChips = [
    `💰 Giá khuyến mãi ${focalProduct.name.split(' ')[0]}?`,
    `📏 Độ dày ${focalProduct.thickness} & Kích thước?`,
    `🩺 Nằm có êm, đỡ đau lưng không?`,
    `🛡️ Bảo hành ${focalProduct.warrantyYears} năm & Ngủ thử?`,
    `🚚 Miễn phí giao hàng 30km?`,
  ];

  return {
    focalProduct,
    contextType,
    pageProduct,
    historyProduct,
    explanation,
    detectedIntent,
    relevantProducts,
    suggestedChips,
  };
}
