import { GoogleGenAI } from '@google/genai';
import { DEMXANH_REAL_CATALOG, DEMXANH_CORE_POLICIES } from '../../src/services/crawlerService';
import { resolveContextualTargetProduct } from '../../src/services/contextResolver';

export default async function handler(req: any, res: any) {
  // Enable CORS for demxanh.com and other origins
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(200).json({ status: 'ok', message: 'DemXanh AI API' });
  }

  try {
    const {
      message = '',
      history = [],
      systemPrompt = '',
      currentPageContext = '',
      customerProfile = null,
      catalog = null,
    } = req.body || {};

    if (!message) {
      return res.status(200).json({
        text: 'Dạ em chào anh/chị! Em là trợ lý AI Đệm Xanh, em có thể giúp gì cho mình ạ?',
        source: 'local_engine',
      });
    }

    const activeCatalog = catalog && Array.isArray(catalog) && catalog.length > 0 ? catalog : DEMXANH_REAL_CATALOG;

    // Resolve focal product with multi-tier context awareness
    const contextRes = resolveContextualTargetProduct({
      message,
      history,
      currentPageContext,
      customerProfile,
      catalog: activeCatalog,
    });

    const focalProduct = contextRes.focalProduct;
    const isFromPage = contextRes.contextType === 'page_product';
    const contextExplanation = contextRes.explanation;

    // Check Gemini API Key if available in Vercel environment
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      try {
        const ai = new GoogleGenAI({ apiKey });

        const otherProducts = activeCatalog.filter((p: any) => p.id !== focalProduct.id).slice(0, 3);
        const productContextStr = [
          `[SẢN PHẨM TRỌNG TÂM CỦA NGỮ CẢNH HIỆN TẠI - ƯU TIÊN 1]:\n` +
            `- Tên: ${focalProduct.name} | Hãng: ${focalProduct.brand} | Giá KM: ${focalProduct.salePrice?.toLocaleString(
              'vi-VN'
            )}đ (Giá niêm yết: ${focalProduct.originalPrice?.toLocaleString('vi-VN')}đ)\n` +
            `- Độ dày: ${focalProduct.thickness} | Độ cứng/êm: ${focalProduct.firmness} | Bảo hành: ${focalProduct.warrantyYears} năm\n` +
            `- Chất liệu: ${focalProduct.material} | Kích thước: ${(focalProduct.dimensions || []).join(', ')}\n` +
            `- Tính năng: ${(focalProduct.features || []).join('; ')}`,
          ...otherProducts.map(
            (p: any) =>
              `[SẢN PHẨM THAM KHẢO]: Tên: ${p.name} | Giá KM: ${p.salePrice?.toLocaleString('vi-VN')}đ | Độ dày: ${p.thickness} | Bảo hành: ${p.warrantyYears} năm`
          ),
        ].join('\n\n');

        const contents = [
          ...history.map((h: { sender: string; text: string }) => ({
            role: h.sender === 'customer' ? 'user' : 'model',
            parts: [{ text: h.text }],
          })),
          {
            role: 'user',
            parts: [
              {
                text: `NGỮ CẢNH TRANG KHÁCH ĐANG XEM TRÊN DEMXANH.COM: "${currentPageContext}"\n` +
                  `SẢN PHẨM TRỌNG TÂM: "${focalProduct.name}"\n` +
                  `TRẠNG THÁI NGỮ CẢNH: ${contextExplanation}\n\n` +
                  `DỮ LIỆU SẢN PHẨM TỪ DEMXANH.COM:\n${productContextStr}\n\n` +
                  `CÂU HỎI CỦA KHÁCH: "${message}"`,
              },
            ],
          },
        ];

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents,
          config: {
            systemInstruction:
              systemPrompt ||
              `Bạn là trợ lý AI tư vấn nệm độc quyền của Đệm Xanh (demxanh.com), hotline 0962 701 701.
QUY TẮC BẮT BUỘC VỀ NGỮ CẢNH:
1. ĐÚNG SẢN PHẨM ĐANG XEM: Khách đang xem trang "${currentPageContext}". Sản phẩm trọng tâm là "${focalProduct.name}". Khi khách hỏi "mẫu này", "đệm này", "giá sao", "bảo hành thế nào", "dày mấy phân", "nằm đỡ đau lưng không"... bạn 100% PHẢI TRẢ LỜI VỀ "${focalProduct.name}".
2. LIÊN TỤC VỚI LỊCH SỬ CHAT: Nhớ thông tin đã trao đổi ở các tin nhắn trước.
3. CHÍNH XÁC: Báo đúng giá VNĐ, quà tặng combo 2 gối, miễn phí ship 30km, 30 đêm ngủ thử đổi mới miễn phí. Xưng "Em", gọi "Anh/Chị".`,
            temperature: 0.25,
          },
        });

        if (response.text) {
          return res.status(200).json({
            text: response.text,
            source: 'gemini',
            detectedIntent: contextRes.detectedIntent,
            scoreIncrement: 15,
            matchedProducts: [focalProduct],
          });
        }
      } catch (geminiError) {
        console.warn('Gemini error on Vercel:', geminiError);
      }
    }

    // Smart Local Fallback
    const lower = message.toLowerCase();
    let reply = '';
    if (lower.includes('giá') || lower.includes('bao nhiêu') || lower.includes('tiền')) {
      reply = `Dạ mẫu **${focalProduct.name}** tại Đệm Xanh đang có giá khuyến mãi chỉ ${focalProduct.salePrice.toLocaleString('vi-VN')}đ (giá gốc ${focalProduct.originalPrice.toLocaleString('vi-VN')}đ), tặng kèm 2 ruột gối cao cấp, bảo hành ${focalProduct.warrantyYears} năm và miễn phí vận chuyển 30km tận phòng. Anh/chị cần kích thước nào ạ?`;
    } else if (lower.includes('đau lưng') || lower.includes('cột sống')) {
      reply = `Dạ về nâng đỡ cột sống: Mẫu **${focalProduct.name}** có độ nâng đỡ ${focalProduct.firmness}, chất liệu ${focalProduct.material}. Rất tốt trong việc giữ thẳng cột sống tự nhiên khi ngủ. Đệm Xanh hỗ trợ 30 đêm ngủ thử miễn phí tại nhà để anh/chị an tâm trải nghiệm ạ!`;
    } else if (lower.includes('dày') || lower.includes('kích thước')) {
      reply = `Dạ mẫu **${focalProduct.name}** có độ dày chuẩn là **${focalProduct.thickness}**, quy cách sẵn có: ${(focalProduct.dimensions || []).join(', ')}. Giường của anh/chị là kích thước nào để em báo giá chi tiết ạ?`;
    } else if (lower.includes('bảo hành')) {
      reply = `Dạ mẫu **${focalProduct.name}** được bảo hành chính hãng ${focalProduct.warrantyYears} năm chống xẹp lún và áp dụng chính sách 30 đêm ngủ thử đổi mới miễn phí tại Hệ thống Đệm Xanh ạ!`;
    } else {
      reply = `Dạ em là trợ lý tư vấn Đệm Xanh (demxanh.com), hotline 0962 701 701. Em thấy anh/chị đang xem mẫu **${focalProduct.name}** (${focalProduct.salePrice.toLocaleString('vi-VN')}đ, quà tặng combo 2 gối, bảo hành ${focalProduct.warrantyYears} năm). Anh/chị cần em hỗ trợ kích thước hay tư vấn chi tiết hơn ạ?`;
    }

    return res.status(200).json({
      text: reply,
      source: 'local_engine',
      detectedIntent: contextRes.detectedIntent,
      scoreIncrement: 10,
      matchedProducts: [focalProduct],
    });
  } catch (err: any) {
    return res.status(200).json({
      text: 'Dạ em chào anh/chị, em có thể hỗ trợ anh/chị tìm mẫu đệm phù hợp nhất tại Đệm Xanh ạ!',
      source: 'fallback',
    });
  }
}
