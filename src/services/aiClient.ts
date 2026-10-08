import { Product, KnowledgeItem } from '../types';
import { DEMXANH_REAL_CATALOG, DEMXANH_CORE_POLICIES, extractProductFromDemXanhUrl } from './crawlerService';

export interface AiChatRequest {
  message: string;
  history?: Array<{ sender: string; text: string }>;
  systemPrompt?: string;
  currentPageContext?: string;
  customerProfile?: any;
  catalog?: Product[];
}

export interface AiChatResponse {
  text: string;
  source: 'gemini' | 'demxanh_server' | 'demxanh_local_engine';
  detectedIntent?: string;
  scoreIncrement?: number;
  matchedProducts?: Product[];
}

/**
 * Intelligent Client-Side Consultation Engine for DemXanh.com
 * Formulates medically sound, brand-aligned answers based on crawled product data
 */
export function generateLocalDemXanhReply(
  params: AiChatRequest,
  availableCatalog?: Product[]
): AiChatResponse {
  const { message, currentPageContext = '', catalog } = params;
  const activeCatalog = (catalog && catalog.length > 0 ? catalog : availableCatalog && availableCatalog.length > 0 ? availableCatalog : DEMXANH_REAL_CATALOG);
  const lower = message.toLowerCase().trim();
  const contextLower = (currentPageContext || '').toLowerCase();

  // 1. Identify product from current URL context or message
  let matchedProduct: Product | undefined;

  // Check if viewing specific product URL/page
  matchedProduct = activeCatalog.find(
    (p) =>
      contextLower.includes(p.name.toLowerCase()) ||
      contextLower.includes(p.sku.toLowerCase()) ||
      (p.url && contextLower.includes(p.url.toLowerCase())) ||
      (contextLower.includes('audrey') && p.id.includes('audrey')) ||
      (contextLower.includes('happy-gold') && p.id.includes('happygold')) ||
      (contextLower.includes('classic') && p.id.includes('classic'))
  );

  // If not in context, check in customer question
  if (!matchedProduct) {
    matchedProduct = activeCatalog.find(
      (p) =>
        lower.includes(p.name.toLowerCase()) ||
        lower.includes(p.brand.toLowerCase()) ||
        lower.includes(p.sku.toLowerCase()) ||
        (lower.includes('audrey') && p.id.includes('audrey')) ||
        (lower.includes('happy gold') && p.id.includes('happygold')) ||
        (lower.includes('classic') && p.id.includes('classic')) ||
        (lower.includes('sông hồng') && p.brand.toLowerCase().includes('sông hồng')) ||
        (lower.includes('kim cương') && p.brand.toLowerCase().includes('kim cương')) ||
        (lower.includes('dunlopillo') && p.brand.toLowerCase().includes('dunlopillo'))
    );
  }

  // Fallback top product if general
  const primaryProduct = matchedProduct || activeCatalog[0];

  let replyText = '';
  let detectedIntent = 'Tư vấn đệm';
  let scoreIncrement = 10;

  // 2. Intent analysis & response creation
  if (lower.includes('giá') || lower.includes('bao nhiêu') || lower.includes('tiền') || lower.includes('triệu')) {
    detectedIntent = 'Hỏi giá & Khuyến mãi';
    scoreIncrement = 15;
    if (primaryProduct) {
      const discount = primaryProduct.originalPrice - primaryProduct.salePrice;
      const discountPercent = Math.round((discount / primaryProduct.originalPrice) * 100);
      replyText = `Dạ hiện tại mẫu **${primaryProduct.name}** tại Hệ thống Đệm Xanh đang được trợ giá đặc biệt:\n\n` +
        `• **Giá khuyến mãi:** ${primaryProduct.salePrice.toLocaleString('vi-VN')}đ (Giá niêm yết: ${primaryProduct.originalPrice.toLocaleString('vi-VN')}đ - Giảm ${discountPercent}%)\n` +
        `• **Quà tặng độc quyền:** Tặng ngay combo 2 ruột gối cao cấp + ga chống thấm nước\n` +
        `• **Bảo hành:** Chính hãng ${primaryProduct.warrantyYears} năm, cam kết hàng mới 100%\n` +
        `• **Đặc quyền:** 30 đêm ngủ thử đổi mới miễn phí + Miễn phí vận chuyển tận phòng 30km.\n\n` +
        `Anh/chị đang cần kích thước giường bao nhiêu (1m6x2m, 1m8x2m hay 2mx2m2) để em chốt giá ưu đãi chuẩn nhất ạ?`;
    } else {
      replyText = `Dạ hiện tại Đệm Xanh (demxanh.com) đang có chương trình trợ giá từ 15% - 25% cho tất cả các dòng đệm lò xo Dunlopillo, cao su Kim Cương và Liên Á, kèm quà tặng combo 2 gối cao cấp trị giá 1.800.000đ. Anh/chị đang quan tâm đệm kích thước bao nhiêu để em gửi báo giá chi tiết ạ?`;
    }
  } else if (
    lower.includes('đau lưng') ||
    lower.includes('cột sống') ||
    lower.includes('thoát vị') ||
    lower.includes('thoái hóa') ||
    lower.includes('người già') ||
    lower.includes('lớn tuổi')
  ) {
    detectedIntent = 'Tư vấn y khoa / Đau lưng';
    scoreIncrement = 20;
    replyText = `Dạ đối với người bị đau thắt lưng, thoái hóa cột sống hoặc người lớn tuổi, lời khuyên chuẩn y khoa là **tuyệt đối không nằm đệm quá lún võng** (làm cong vẹo cột sống) và **không nằm phản gỗ quá cứng** (gây cấn ép huyệt đạo vùng thắt lưng).\n\n` +
      `Tại Đệm Xanh, 2 dòng sản phẩm đạt chuẩn nâng đỡ y khoa tốt nhất là:\n` +
      `1. **Đệm cao su thiên nhiên Kim Cương Happy Gold** (6.517.000đ): 100% mủ cao su tự nhiên, nâng đỡ chuẩn 7 vùng cơ thể, độ đàn hồi vững chắc, bảo hành 12 năm.\n` +
      `2. **Đệm lò xo Dunlopillo Audrey** (7.935.000đ): Công nghệ lò xo túi liên kết NormaBlock Tây Ban Nha không mối nối, nâng đỡ cột sống thẳng tự nhiên khi nằm ngửa lẫn nằm nghiêng.\n\n` +
      `Cả 2 mẫu đều được áp dụng **30 đêm ngủ thử miễn phí** tại nhà. Anh/chị thường thích nằm hơi êm hay vững lưng để em chọn mẫu phù hợp nhất ạ?`;
  } else if (
    lower.includes('giao hàng') ||
    lower.includes('vận chuyển') ||
    lower.includes('ship') ||
    lower.includes('bao lâu')
  ) {
    detectedIntent = 'Chính sách vận chuyển';
    scoreIncrement = 10;
    replyText = `Dạ chính sách giao hàng tại Đệm Xanh (demxanh.com) cực kỳ nhanh chóng và an tâm:\n\n` +
      `• **Miễn phí 100% cước vận chuyển** và hỗ trợ bưng vác kê đệm lên tận phòng ngủ trong bán kính 30km từ hệ thống Showroom Hà Nội, TP.HCM và Hải Phòng.\n` +
      `• **Giao hỏa tốc 2 - 4 giờ** đối với khu vực nội thành.\n` +
      `• Đơn các tỉnh thành khác giao qua bưu điện/chành xe uy tín, Đệm Xanh trợ giá 50% phí ship.\n\n` +
      `Anh/chị đang ở quận/huyện nào để em kiểm tra thời gian giao đệm nhanh nhất ạ?`;
  } else if (
    lower.includes('bảo hành') ||
    lower.includes('đổi trả') ||
    lower.includes('ngủ thử') ||
    lower.includes('chính hãng')
  ) {
    detectedIntent = 'Chính sách bảo hành & Ngủ thử';
    scoreIncrement = 15;
    replyText = `Dạ Đệm Xanh cam kết 100% sản phẩm là hàng chính hãng từ các thương hiệu hàng đầu (đền 200% nếu phát hiện hàng giả):\n\n` +
      `• **Bảo hành tận nhà:** Từ 5 đến 12 năm tùy dòng đệm (có phiếu bảo hành & kích hoạt điện tử chính hãng).\n` +
      `• **30 Đêm Ngủ Thử Miễn Phí:** Khách hàng được trải nghiệm ngủ thử 30 ngày tại nhà, nếu không phù hợp độ cứng/êm sẽ được đổi sang mẫu đệm khác hoàn toàn miễn phí.\n` +
      `Anh/chị có thể hoàn toàn yên tâm khi mua đệm tại Hệ thống Đệm Xanh ạ!`;
  } else if (
    lower.includes('mua') ||
    lower.includes('đặt hàng') ||
    lower.includes('chốt') ||
    lower.includes('sđt') ||
    lower.includes('số điện thoại') ||
    /\b(09\d{8}|08\d{8}|03\d{8}|07\d{8})\b/.test(lower)
  ) {
    detectedIntent = 'Khách muốn đặt hàng';
    scoreIncrement = 35;
    replyText = `Dạ tuyệt vời ạ! Em đã ghi nhận nhu cầu của anh/chị về mẫu **${primaryProduct.name}**.\n\n` +
      `Chuyên viên tư vấn của Showroom Đệm Xanh sẽ liên hệ ngay qua điện thoại để xác nhận kích thước đệm, chuẩn bị combo quà tặng 2 ruột gối và sắp xếp lịch giao đệm miễn phí tận nhà theo giờ thuận tiện nhất cho anh/chị ạ!\n\n` +
      `Hoặc anh/chị có thể gọi ngay hotline tư vấn nhanh: **0962 701 701** (miễn cước).`;
  } else if (
    lower.includes('kích thước') ||
    lower.includes('1m6') ||
    lower.includes('1m8') ||
    lower.includes('2m') ||
    lower.includes('dày') ||
    lower.includes('chiều cao')
  ) {
    detectedIntent = 'Hỏi kích thước & Quy cách';
    scoreIncrement = 15;
    replyText = `Dạ mẫu **${primaryProduct.name}** có đầy đủ các quy cách chuẩn phổ biến:\n\n` +
      `• Kích thước: 1m2x2m, 1m4x2m, 1m6x2m, 1m8x2m và 2mx2m2 (Đệm Xanh nhận đặt cả kích thước lỡ khổ theo yêu cầu).\n` +
      `• Độ dày chuẩn: ${primaryProduct.thickness || '10cm - 25cm'}.\n` +
      `• Chất liệu: ${primaryProduct.material}.\n\n` +
      `Giường của anh/chị hiện tại đang là kích thước nào để em báo giá chuẩn và kiểm tra tồn kho tại showroom gần mình nhất nhé!`;
  } else {
    // Context-aware generic answer
    if (matchedProduct) {
      replyText = `Dạ em chào anh/chị! Em thấy mình đang xem mẫu **${matchedProduct.name}** (${matchedProduct.salePrice.toLocaleString('vi-VN')}đ) tại Đệm Xanh.\n\n` +
        `Mẫu này sở hữu các ưu điểm vượt trội:\n` +
        `• ${matchedProduct.features.slice(0, 2).join('\n• ')}\n` +
        `• Bảo hành chính hãng ${matchedProduct.warrantyYears} năm, tặng kèm 2 ruột gối cao cấp và miễn phí vận chuyển 30km.\n\n` +
        `Anh/chị cần em hỗ trợ tư vấn về kích thước, bảng giá hay độ cứng/độ êm của đệm ạ?`;
    } else {
      replyText = `Dạ em là trợ lý tư vấn AI của Hệ thống Đệm Xanh (demxanh.com), hotline **0962 701 701**.\n\n` +
        `Em có thể hỗ trợ anh/chị ngay lập tức về:\n` +
        `1. Báo giá khuyến mãi & quà tặng các dòng đệm lò xo Dunlopillo, cao su Kim Cương, Liên Á, đệm bông ép Sông Hồng.\n` +
        `2. Tư vấn loại đệm phù hợp với thể trạng lưng (đau thắt lưng, thoái hóa cột sống, người cao tuổi).\n` +
        `3. Chính sách miễn phí giao hàng 30km và chương trình 30 đêm ngủ thử đổi mới.\n\n` +
        `Anh/chị đang tìm đệm cho phòng ngủ của mình hay người thân ạ?`;
    }
  }

  return {
    text: replyText,
    source: 'demxanh_local_engine',
    detectedIntent,
    scoreIncrement,
    matchedProducts: primaryProduct ? [primaryProduct] : [],
  };
}

/**
 * Robust AI Chat Dispatcher
 * Calls backend API with timeout and safely falls back to local DemXanh AI consultation engine
 * Never throws "Unexpected end of JSON input"
 */
export async function askDemXanhAI(
  params: AiChatRequest,
  activeCatalog?: Product[]
): Promise<AiChatResponse> {
  // Try server-side Gemini endpoint first
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6500);

    const res = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (res.ok) {
      const rawText = await res.text();
      if (rawText && rawText.trim().length > 0) {
        try {
          const data = JSON.parse(rawText);
          if (data && data.text && typeof data.text === 'string' && data.text.trim().length > 0) {
            return {
              text: data.text,
              source: data.source || 'gemini',
              detectedIntent: data.detectedIntent,
              scoreIncrement: data.scoreIncrement,
            };
          }
        } catch {
          // JSON parse failed, fall through to fallback
        }
      }
    }
  } catch (err: any) {
    // Network error or timeout, safely fall back
  }

  // Graceful, seamless fallback
  return generateLocalDemXanhReply(params, activeCatalog);
}

/**
 * Robust Crawler / Scraper Helper
 * Never fails with JSON parse errors
 */
export async function scrapeDemXanhProduct(url: string): Promise<{
  success: boolean;
  product: Product;
  source: 'live_fetch' | 'knowledge_database';
  message: string;
}> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const res = await fetch('/api/crawler/scrape', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: url.trim() }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (res.ok) {
      const rawText = await res.text();
      if (rawText && rawText.trim().length > 0) {
        try {
          const data = JSON.parse(rawText);
          if (data && data.product) {
            return data;
          }
        } catch {}
      }
    }
  } catch {}

  // Fallback to client-side extractor
  const product = extractProductFromDemXanhUrl(url);
  return {
    success: true,
    product,
    source: 'knowledge_database',
    message: `Đã nạp và cấu hình dữ liệu sản phẩm "${product.name}" (${product.salePrice.toLocaleString('vi-VN')}đ) vào AI Đệm Xanh.`,
  };
}
