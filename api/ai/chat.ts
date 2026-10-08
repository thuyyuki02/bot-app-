import { GoogleGenAI } from '@google/genai';
import { DEMXANH_REAL_CATALOG, DEMXANH_CORE_POLICIES } from '../../src/services/crawlerService';

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
    const lower = message.toLowerCase();

    // Check Gemini API Key if available in Vercel environment
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      try {
        const ai = new GoogleGenAI({ apiKey });
        const matchedProducts = activeCatalog.filter(
          (p: any) =>
            lower.includes(p.name.toLowerCase()) ||
            lower.includes(p.brand.toLowerCase()) ||
            lower.includes(p.category.toLowerCase()) ||
            currentPageContext.toLowerCase().includes(p.name.toLowerCase())
        );

        const productContextStr = (matchedProducts.length > 0 ? matchedProducts.slice(0, 4) : activeCatalog.slice(0, 4))
          .map(
            (p: any) =>
              `- Tên: ${p.name} | Hãng: ${p.brand} | Giá: ${p.salePrice?.toLocaleString('vi-VN')}đ | Bảo hành: ${p.warrantyYears} năm | Chất liệu: ${p.material}`
          )
          .join('\n');

        const contents = [
          ...history.map((h: { sender: string; text: string }) => ({
            role: h.sender === 'customer' ? 'user' : 'model',
            parts: [{ text: h.text }],
          })),
          {
            role: 'user',
            parts: [
              {
                text: `DỮ LIỆU SẢN PHẨM TỪ DEMXANH.COM:\n${productContextStr}\n\nTRANG KHÁCH ĐANG XEM: ${currentPageContext}\n\nCÂU HỎI: "${message}"`,
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
              'Bạn là nhân viên tư vấn bán nệm chuyên nghiệp của Đệm Xanh (demxanh.com), hotline 0962 701 701. Trả lời ngắn gọn, chuẩn giá tiền VNĐ, lễ phép và chuẩn y khoa.',
            temperature: 0.25,
          },
        });

        if (response.text) {
          return res.status(200).json({ text: response.text, source: 'gemini' });
        }
      } catch (geminiError) {
        console.warn('Gemini error on Vercel:', geminiError);
      }
    }

    // Smart Local Fallback
    const topProd = activeCatalog[0];
    let reply = `Dạ em là trợ lý tư vấn Đệm Xanh (demxanh.com). Mẫu ${topProd.name} đang có giá ưu đãi ${topProd.salePrice.toLocaleString('vi-VN')}đ kèm quà tặng 2 ruột gối và miễn phí giao hàng 30km. Anh/chị cần tư vấn kích thước nào ạ?`;

    if (lower.includes('đau lưng')) {
      reply = `Dạ với người bị đau lưng hoặc thoái hóa cột sống, lời khuyên y khoa là nên chọn Đệm cao su thiên nhiên Kim Cương Happy Gold (6.517.000đ) hoặc Đệm lò xo Dunlopillo Audrey nâng đỡ phân vùng. Đệm Xanh hỗ trợ 30 đêm ngủ thử đổi mới miễn phí ạ!`;
    }

    return res.status(200).json({
      text: reply,
      source: 'local_engine',
      detectedIntent: 'Tư vấn đệm',
      scoreIncrement: 10,
    });
  } catch (err: any) {
    return res.status(200).json({
      text: 'Dạ em chào anh/chị, em có thể hỗ trợ anh/chị tìm mẫu đệm phù hợp nhất tại Đệm Xanh ạ!',
      source: 'fallback',
    });
  }
}
