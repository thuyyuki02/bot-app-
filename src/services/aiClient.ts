import { Product, KnowledgeItem } from '../types';
import { DEMXANH_REAL_CATALOG, DEMXANH_CORE_POLICIES, extractProductFromDemXanhUrl } from './crawlerService';
import { resolveContextualTargetProduct, normalizeVietnamese } from './contextResolver';

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
 * Formulates medically sound, brand-aligned answers based on crawled product data and strict context
 */
export function generateLocalDemXanhReply(
  params: AiChatRequest,
  availableCatalog?: Product[]
): AiChatResponse {
  const { message, history = [], currentPageContext = '', customerProfile, catalog } = params;
  const activeCatalog =
    catalog && catalog.length > 0
      ? catalog
      : availableCatalog && availableCatalog.length > 0
      ? availableCatalog
      : DEMXANH_REAL_CATALOG;

  // Resolve focal product with multi-tier context recognition
  const contextRes = resolveContextualTargetProduct({
    message,
    history,
    currentPageContext,
    customerProfile,
    catalog: activeCatalog,
  });

  const focalProduct = contextRes.focalProduct;
  const isFromPage = contextRes.contextType === 'page_product';
  const isFromHistory = contextRes.contextType === 'history_product';
  const lower = message.toLowerCase().trim();
  const norm = normalizeVietnamese(message);

  let replyText = '';
  let detectedIntent = contextRes.detectedIntent;
  let scoreIncrement = 10;

  // 1. Pricing, Discounts & Promotions Intent
  if (
    norm.includes('gia') ||
    norm.includes('bao nhieu') ||
    norm.includes('tien') ||
    norm.includes('khuyen mai') ||
    norm.includes('giam gia') ||
    norm.includes('uu dai')
  ) {
    detectedIntent = 'Hỏi giá & Khuyến mãi';
    scoreIncrement = 15;
    const discount = focalProduct.originalPrice - focalProduct.salePrice;
    const discountPercent = Math.round((discount / focalProduct.originalPrice) * 100);

    const contextPrefix = isFromPage
      ? `Dạ em thấy anh/chị đang xem mẫu **${focalProduct.name}** trên website demxanh.com.\n\n`
      : isFromHistory
      ? `Dạ đối với mẫu **${focalProduct.name}** mình đang quan tâm:\n\n`
      : `Dạ hiện tại mẫu **${focalProduct.name}** tại Hệ thống Đệm Xanh đang có chương trình trợ giá đặc biệt:\n\n`;

    replyText =
      contextPrefix +
      `• **Giá khuyến mãi:** ${focalProduct.salePrice.toLocaleString('vi-VN')}đ (Giá niêm yết: ${focalProduct.originalPrice.toLocaleString('vi-VN')}đ - Tiết kiệm: ${discount.toLocaleString('vi-VN')}đ, giảm ${discountPercent}%)\n` +
      `• **Độ dày:** ${focalProduct.thickness} | **Độ cứng/êm:** ${focalProduct.firmness}\n` +
      `• **Quà tặng độc quyền:** Tặng ngay combo 2 ruột gối cao cấp + ga chống thấm nước\n` +
      `• **Bảo hành:** Chính hãng ${focalProduct.warrantyYears} năm từ nhà sản xuất ${focalProduct.brand}\n` +
      `• **Đặc quyền Đệm Xanh:** 30 đêm ngủ thử đổi mới miễn phí tại nhà + Miễn phí vận chuyển tận phòng 30km.\n\n` +
      `Anh/chị đang cần đệm kích thước bao nhiêu (1m6x2m, 1m8x2m hay 2mx2m2) để em báo giá theo kích thước chính xác nhất ạ?`;
  }
  // 2. Thickness, Height, Dimensions Intent
  else if (
    norm.includes('day') ||
    norm.includes('chieu cao') ||
    norm.includes('phan') ||
    norm.includes('cm') ||
    norm.includes('kich thuoc') ||
    norm.includes('1m2') ||
    norm.includes('1m4') ||
    norm.includes('1m6') ||
    norm.includes('1m8') ||
    norm.includes('2m')
  ) {
    detectedIntent = 'Hỏi độ dày & Kích thước';
    scoreIncrement = 15;
    const sizes = (focalProduct.dimensions || ['120x200', '160x200', '180x200', '200x220']).join(', ');

    replyText =
      `Dạ mẫu **${focalProduct.name}** có các quy cách kỹ thuật chuẩn như sau:\n\n` +
      `• **Độ dày chuẩn:** **${focalProduct.thickness}** (độ dày lý tưởng giúp nâng đỡ tối đa đường cong cột sống, không gây võng lưng).\n` +
      `• **Kích thước tiêu chuẩn:** ${sizes} (Đệm Xanh nhận đặt cả kích thước lỡ khổ theo giường thực tế của khách hàng).\n` +
      `• **Chất liệu:** ${focalProduct.material}.\n\n` +
      `Giường của anh/chị hiện tại là kích thước nào để em kiểm tra kho và báo giá khuyến mãi tốt nhất tại Showroom Đệm Xanh gần mình nhất ạ?`;
  }
  // 3. Medical, Spine, Back Pain, Firmness Intent
  else if (
    norm.includes('dau lung') ||
    norm.includes('cot song') ||
    norm.includes('thoat vi') ||
    norm.includes('thoai hoa') ||
    norm.includes('cung') ||
    norm.includes('em') ||
    norm.includes('nguoi gia') ||
    norm.includes('lon tuoi')
  ) {
    detectedIntent = 'Tư vấn y khoa & Nâng đỡ lưng';
    scoreIncrement = 20;

    let medicalEvaluation = '';
    if (focalProduct.category === 'Đệm cao su' || focalProduct.name.includes('Happy Gold')) {
      medicalEvaluation = `Mẫu **${focalProduct.name}** là dòng đệm cao su thiên nhiên 100% đạt chuẩn y khoa nâng đỡ 7 vùng cơ thể. Đệm có độ phẳng vững chắc kết hợp đàn hồi tự nhiên dẻo dai, giữ cho các đốt sống thắt lưng luôn ở vị trí giải phẫu tự nhiên, không bị xẹp lún võng gây chèn ép dây thần kinh tọa.`;
    } else if (focalProduct.category === 'Đệm lò xo' || focalProduct.name.includes('Audrey')) {
      medicalEvaluation = `Mẫu **${focalProduct.name}** ứng dụng công nghệ lò xo túi liên kết NormaBlock Tây Ban Nha không mối nối, nâng đỡ hoàn hảo vùng hông và thắt lưng. Khả năng cô lập truyền động giúp người bên cạnh trở mình êm ái, bảo vệ giấc ngủ sâu liên tục.`;
    } else {
      medicalEvaluation = `Mẫu **${focalProduct.name}** có độ phẳng cao, chịu lực tốt, hỗ trợ giữ thẳng cột sống cho người thích nằm đệm vững chắc và người lớn tuổi.`;
    }

    replyText =
      `Dạ chuẩn y khoa đối với bệnh lý cột sống và đau lưng:\n\n` +
      `• **Đánh giá về mẫu ${focalProduct.name}:**\n` +
      `${medicalEvaluation}\n\n` +
      `• **Độ cứng/êm thực tế:** ${focalProduct.firmness} (${focalProduct.thickness}).\n` +
      `• **Chính sách an tâm tuyệt đối:** Đệm Xanh áp dụng **30 đêm ngủ thử miễn phí** tại nhà. Nếu nằm không quen độ cứng/êm, anh/chị được đổi sang mẫu khác hoàn toàn miễn phí!\n\n` +
      `Anh/chị thường thích nằm hơi êm hay vững lưng để em tư vấn độ dày và phiên bản phù hợp nhất ạ?`;
  }
  // 4. Warranty, Guarantee & Sleep Trial Intent
  else if (
    norm.includes('bao hanh') ||
    norm.includes('doi tra') ||
    norm.includes('ngu thu') ||
    norm.includes('chinh hang') ||
    norm.includes('xep lun')
  ) {
    detectedIntent = 'Chính sách bảo hành & Ngủ thử';
    scoreIncrement = 15;
    replyText =
      `Dạ về chính sách bảo hành mẫu **${focalProduct.name}** tại Hệ thống Đệm Xanh (demxanh.com):\n\n` +
      `• **Thời gian bảo hành:** Chính hãng **${focalProduct.warrantyYears} năm** chống xẹp lún và lỗi kỹ thuật từ nhà sản xuất ${focalProduct.brand}.\n` +
      `• **Hình thức bảo hành:** Có phiếu bảo hành điện tử chính hãng kích hoạt ngay khi nhận hàng, kỹ thuật viên hỗ trợ kiểm tra và bảo hành tận nhà.\n` +
      `• **Đặc quyền 30 Đêm Ngủ Thử:** Khách hàng được trải nghiệm ngủ thử 30 đêm tại nhà, nếu không ưng ý độ cứng/êm sẽ được đổi sang dòng đệm khác hoàn toàn miễn phí.\n` +
      `• **Cam kết chất lượng:** Hàng mới 100% nguyên đai nguyên kiện, đền tiền gấp đôi nếu phát hiện hàng không chính hãng.\n\n` +
      `Anh/chị hoàn toàn yên tâm khi mua đệm tại Hệ thống Đệm Xanh ạ!`;
  }
  // 5. Shipping & Delivery Intent
  else if (
    norm.includes('giao hang') ||
    norm.includes('van chuyen') ||
    norm.includes('ship') ||
    norm.includes('bao lau') ||
    norm.includes('ha noi') ||
    norm.includes('tphcm') ||
    norm.includes('hai phong')
  ) {
    detectedIntent = 'Chính sách vận chuyển';
    scoreIncrement = 10;
    replyText =
      `Dạ chính sách giao đệm **${focalProduct.name}** tại Hệ thống Đệm Xanh cực kỳ chu đáo và nhanh chóng:\n\n` +
      `• **Miễn phí 100% vận chuyển** trong bán kính 30km từ hệ thống Showroom Hà Nội, TP.HCM và Hải Phòng.\n` +
      `• **Hỗ trợ tận tình:** Nhân viên bưng vác, kê đệm lên tận phòng ngủ, hỗ trợ tháo bỏ đệm cũ cho gia đình.\n` +
      `• **Giao hỏa tốc 2 - 4 giờ** đối với khách hàng trong khu vực nội thành.\n` +
      `• Khách hàng ở các tỉnh xa: Gửi qua Viettel Post hoặc xe tải quen, Đệm Xanh hỗ trợ 50% cước vận chuyển.\n\n` +
      `Anh/chị đang ở địa chỉ quận/huyện nào để em kiểm tra showroom gần nhất và sắp xếp giao ngay cho mình ạ?`;
  }
  // 6. Gifts & Promotions Intent
  else if (
    norm.includes('qua') ||
    norm.includes('tang') ||
    norm.includes('goi') ||
    norm.includes('ga')
  ) {
    detectedIntent = 'Quà tặng kèm theo';
    scoreIncrement = 15;
    replyText =
      `Dạ khi đặt mua mẫu **${focalProduct.name}** hôm nay tại Hệ thống Đệm Xanh, anh/chị nhận trọn bộ quà tặng độc quyền:\n\n` +
      `🎁 **Combo 2 ruột gối cao cấp** kháng khuẩn trị giá đến 800.000đ.\n` +
      `🎁 **1 ga chống thấm** bảo vệ bề mặt đệm khỏi bụi bẩn và chất lỏng.\n` +
      `🎁 **Phiếu ưu đãi 10%** cho lần mua chăn ga gối tiếp theo.\n` +
      `🎁 Miễn phí vận chuyển 30km + 30 đêm ngủ thử đổi mới miễn phí.\n\n` +
      `Anh/chị muốn nhận hàng trong ngày hay hẹn ngày giao cụ thể để em giữ quà tặng cho mình ạ?`;
  }
  // 7. Order / Purchase / Phone Intent
  else if (
    norm.includes('mua') ||
    norm.includes('dat hang') ||
    norm.includes('chot') ||
    norm.includes('sdt') ||
    norm.includes('so dien thoai') ||
    /\b(09\d{8}|08\d{8}|03\d{8}|07\d{8})\b/.test(lower)
  ) {
    detectedIntent = 'Khách muốn đặt hàng';
    scoreIncrement = 35;
    replyText =
      `Dạ tuyệt vời ạ! Em đã lưu thông tin quan tâm của anh/chị về mẫu **${focalProduct.name}** (Giá KM: ${focalProduct.salePrice.toLocaleString('vi-VN')}đ).\n\n` +
      `Chuyên viên Showroom Đệm Xanh sẽ liên hệ ngay qua điện thoại để:\n` +
      `1. Xác nhận kích thước giường chuẩn xác.\n` +
      `2. Đóng gói combo 2 gối quà tặng chính hãng kèm đệm.\n` +
      `3. Điều phối xe giao hàng tận phòng theo khung giờ thuận tiện nhất cho anh/chị!\n\n` +
      `Hoặc anh/chị có thể gọi ngay hotline tư vấn nhanh: **0962 701 701** (miễn cước).`;
  }
  // 8. General / Contextual Greeting
  else {
    detectedIntent = 'Tư vấn chi tiết sản phẩm';
    scoreIncrement = 10;
    if (isFromPage) {
      replyText =
        `Dạ em chào anh/chị! Em thấy mình đang xem mẫu **${focalProduct.name}** trên website demxanh.com.\n\n` +
        `Thông tin tóm tắt về sản phẩm:\n` +
        `• **Giá khuyến mãi:** ${focalProduct.salePrice.toLocaleString('vi-VN')}đ (Giảm từ ${focalProduct.originalPrice.toLocaleString('vi-VN')}đ)\n` +
        `• **Độ dày:** ${focalProduct.thickness} | **Độ cứng/êm:** ${focalProduct.firmness}\n` +
        `• **Bảo hành:** ${focalProduct.warrantyYears} năm chính hãng ${focalProduct.brand}\n` +
        `• **Quà tặng:** Combo 2 gối cao cấp + Miễn phí vận chuyển 30km + 30 đêm ngủ thử tại nhà.\n\n` +
        `Anh/chị cần em tư vấn thêm về kích thước, độ êm nâng đỡ cột sống hay chính sách giao hàng của mẫu này ạ?`;
    } else {
      replyText =
        `Dạ em là Trợ lý AI tư vấn nệm độc quyền của Hệ thống Đệm Xanh (demxanh.com), hotline **0962 701 701**.\n\n` +
        `Em có thể hỗ trợ anh/chị ngay lập tức:\n` +
        `1. Báo giá khuyến mãi & thông số chi tiết của mẫu **${focalProduct.name}** (${focalProduct.salePrice.toLocaleString('vi-VN')}đ) và các dòng đệm Dunlopillo, Kim Cương, Liên Á, Sông Hồng.\n` +
        `2. Tư vấn loại đệm chuẩn y khoa phù hợp với bệnh lý đau lưng, thoái hóa cột sống.\n` +
        `3. Đăng ký chương trình 30 đêm ngủ thử đổi mới miễn phí và giao hàng hỏa tốc 2 - 4h.\n\n` +
        `Anh/chị đang cần tìm đệm cho phòng ngủ của mình hay gia đình ạ?`;
    }
  }

  return {
    text: replyText,
    source: 'demxanh_local_engine',
    detectedIntent,
    scoreIncrement,
    matchedProducts: [focalProduct, ...contextRes.relevantProducts.filter((p) => p.id !== focalProduct.id)],
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
