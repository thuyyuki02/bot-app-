import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import {
  DEMXANH_REAL_CATALOG,
  DEMXANH_CORE_POLICIES,
  extractProductFromDemXanhUrl,
} from './src/services/crawlerService.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// In-memory knowledge cache of crawled products
let learnedProducts = [...DEMXANH_REAL_CATALOG];
let learnedPolicies = [...DEMXANH_CORE_POLICIES];

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

  // Allow iframe embedding and cross-origin widget requests from external websites
  app.use((req, res, next) => {
    res.removeHeader('X-Frame-Options');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Content-Security-Policy', 'frame-ancestors *');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

  app.use(express.json());

  // Initialize GoogleGenAI SDK if key exists
  const apiKey = process.env.GEMINI_API_KEY;
  let ai: GoogleGenAI | null = null;
  if (apiKey) {
    try {
      ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });
    } catch (e) {
      console.warn('Could not initialize GoogleGenAI with key:', e);
    }
  }

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      hasApiKey: Boolean(apiKey),
      timestamp: new Date().toISOString(),
      learnedProductsCount: learnedProducts.length,
    });
  });

  // DemXanh Crawler Endpoints
  app.get('/api/crawler/presets', (req, res) => {
    res.json({
      success: true,
      products: learnedProducts,
      policies: learnedPolicies,
    });
  });

  app.post('/api/crawler/scrape', async (req, res) => {
    try {
      const { url } = req.body;
      if (!url || typeof url !== 'string') {
        return res.status(400).json({ error: 'URL is required' });
      }

      let rawHtml = '';
      let fetchSource: 'live_fetch' | 'knowledge_database' = 'knowledge_database';

      try {
        const fetchResponse = await fetch(url.trim(), {
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
            Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          },
          signal: AbortSignal.timeout(6000),
        });
        if (fetchResponse.ok) {
          rawHtml = await fetchResponse.text();
          fetchSource = 'live_fetch';
        }
      } catch (err: any) {
        console.warn(`Could not live fetch ${url}, using intelligent slug parsing:`, err?.message);
      }

      const extractedProduct = extractProductFromDemXanhUrl(url, rawHtml);

      // Add to in-memory knowledge cache if not duplicate
      const existingIdx = learnedProducts.findIndex(
        (p) => p.id === extractedProduct.id || p.name.toLowerCase() === extractedProduct.name.toLowerCase()
      );
      if (existingIdx >= 0) {
        learnedProducts[existingIdx] = extractedProduct;
      } else {
        learnedProducts.unshift(extractedProduct);
      }

      return res.json({
        success: true,
        source: fetchSource,
        product: extractedProduct,
        totalLearned: learnedProducts.length,
        message: `Đã cào & nạp thành công sản phẩm "${extractedProduct.name}" vào bộ nhớ AI của Đệm Xanh!`,
      });
    } catch (e: any) {
      console.error('Error in /api/crawler/scrape:', e);
      res.status(500).json({ error: e.message || 'Scraping failed' });
    }
  });

  // AI Chat endpoint with full knowledge of demxanh.com products
  app.post('/api/ai/chat', async (req, res) => {
    try {
      const {
        message,
        history = [],
        systemPrompt = '',
        currentPageContext = '',
        customerProfile = null,
        catalog = null,
      } = req.body;

      if (!message) {
        return res.status(400).json({ error: 'Message is required' });
      }

      const activeCatalog = catalog && Array.isArray(catalog) && catalog.length > 0 ? catalog : learnedProducts;

      // Find matching products from knowledge base
      const lower = message.toLowerCase();
      const matchedProducts = activeCatalog.filter(
        (p: any) =>
          lower.includes(p.name.toLowerCase()) ||
          lower.includes(p.brand.toLowerCase()) ||
          lower.includes(p.category.toLowerCase()) ||
          currentPageContext.toLowerCase().includes(p.name.toLowerCase()) ||
          (lower.includes('đau lưng') && (p.category === 'Đệm cao su' || p.name.includes('Audrey')))
      );

      // Build product reference context for prompt
      const productContextStr = (matchedProducts.length > 0 ? matchedProducts.slice(0, 4) : activeCatalog.slice(0, 4))
        .map(
          (p: any) =>
            `- Tên: ${p.name} | Hãng: ${p.brand} | Danh mục: ${p.category} | Giá KM: ${p.salePrice?.toLocaleString(
              'vi-VN'
            )}đ (Giá gốc: ${p.originalPrice?.toLocaleString('vi-VN')}đ) | Bảo hành: ${p.warrantyYears} năm | Chất liệu: ${
              p.material
            } | Ưu điểm: ${(p.features || []).join('; ')}`
        )
        .join('\n');

      const policiesContextStr = learnedPolicies.map((p) => `- ${p.title}: ${p.content}`).join('\n');

      if (ai) {
        try {
          const contents = [
            ...history.map((h: { sender: string; text: string }) => ({
              role: h.sender === 'customer' ? 'user' : 'model',
              parts: [{ text: h.text }],
            })),
            {
              role: 'user',
              parts: [
                {
                  text: `DỮ LIỆU SẢN PHẨM TRÍ TUỆ NHÂN TẠO CÀO TỪ DEMXANH.COM:\n${productContextStr}\n\nCHÍNH SÁCH ĐỆM XANH:\n${policiesContextStr}\n\nNGỮ CẢNH TRANG KHÁCH ĐANG XEM TRÊN WEBSITE DEMXANH.COM:\n${currentPageContext}\n\nTHÔNG TIN KHÁCH HÀNG: ${JSON.stringify(
                    customerProfile || {}
                  )}\n\nCÂU HỎI CỦA KHÁCH: "${message}"`,
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
NHIỆM VỤ CỐT LÕI:
1. Dựa trên dữ liệu sản phẩm vừa cào và học từ demxanh.com để trả lời chính xác 100% về giá tiền (VNĐ), kích thước, độ cứng/êm và bảo hành.
2. Nếu khách đang ở trên một đường link hoặc xem sản phẩm cụ thể (được nêu trong "Ngữ cảnh trang"), hãy ưu tiên tư vấn sâu về sản phẩm đó trước.
3. Luôn nhiệt tình, tư vấn chuẩn y khoa (đặc biệt các bệnh lý đau thắt lưng, thoát vị đĩa đệm, người lớn tuổi, giấc ngủ vợ chồng).
4. Nhắc đến ưu đãi độc quyền tại Đệm Xanh: Miễn phí vận chuyển 30km, tặng combo 2 gối, 30 đêm ngủ thử đổi mới miễn phí.
5. Giữ giọng văn thân thiện, xưng "Em" gọi "Anh/Chị".`,
              temperature: 0.25,
            },
          });

          const replyText = response.text || '';
          return res.json({ text: replyText, source: 'gemini' });
        } catch (apiError: any) {
          console.warn('Gemini API call failed, falling back to local engine:', apiError?.message || apiError);
        }
      }

      // Local intelligent response fallback
      let fallbackText = '';
      let detectedIntent = 'general';
      let scoreIncrement = 5;

      const topProduct = matchedProducts[0] || activeCatalog[0];

      if (lower.includes('giá') || lower.includes('bao nhiêu') || lower.includes('triệu')) {
        detectedIntent = 'Hỏi giá';
        scoreIncrement = 15;
        if (topProduct) {
          fallbackText = `Dạ hiện tại mẫu ${topProduct.name} tại Đệm Xanh đang có giá khuyến mãi chỉ ${topProduct.salePrice.toLocaleString(
            'vi-VN'
          )}đ (giá niêm yết ${topProduct.originalPrice.toLocaleString('vi-VN')}đ), tiết kiệm ${(
            topProduct.originalPrice - topProduct.salePrice
          ).toLocaleString('vi-VN')}đ. Đệm được bảo hành chính hãng ${topProduct.warrantyYears} năm và tặng kèm 2 ruột gối cao cấp. Anh/chị cần kích thước nào (1m6x2m, 1m8x2m hay 2mx2m2) để em chốt giá chuẩn nhất nhé!`;
        } else {
          fallbackText =
            'Dạ hiện tại Đệm Xanh đang có chương trình khuyến mãi giảm từ 15% - 25% kèm combo quà tặng ruột gối trị giá 1.800.000đ cho tất cả các dòng đệm lò xo và cao su thiên nhiên. Anh/chị đang quan tâm cụ thể dòng đệm nào (Dunlopillo, Liên Á hay Kim Cương) để em gửi bảng giá ưu đãi theo kích thước chuẩn nhé!';
        }
      } else if (lower.includes('đau lưng') || lower.includes('thoát vị') || lower.includes('cột sống')) {
        detectedIntent = 'Tư vấn y khoa / Đau lưng';
        scoreIncrement = 20;
        fallbackText =
          'Dạ với tình trạng đau thắt lưng hoặc thoái hóa cột sống, lời khuyên y khoa là không nên nằm đệm quá lún võng cũng không nên nằm phản quá cứng. Lựa chọn tốt nhất hiện nay trên demxanh.com là Đệm cao su thiên nhiên Kim Cương Happy Gold (giá ưu đãi 6.517.000đ, độ cứng chuẩn y khoa) hoặc Đệm lò xo Dunlopillo Audrey nâng đỡ phân vùng. Em gửi thông tin 2 mẫu này để mình xem thử nhé!';
      } else if (lower.includes('giao hàng') || lower.includes('ship') || lower.includes('vận chuyển')) {
        detectedIntent = 'Hỏi giao hàng';
        scoreIncrement = 10;
        fallbackText =
          'Dạ Đệm Xanh MIỄN PHÍ 100% phí giao hàng và bưng vác lên tận phòng ngủ trong bán kính 30km từ hệ thống showroom Hà Nội, TP.HCM và Hải Phòng ạ. Đơn nội thành giao hỏa tốc chỉ trong 2-4 giờ. Anh/chị đang ở quận/huyện nào ạ?';
      } else if (lower.includes('nhân viên') || lower.includes('người thật') || lower.includes('tư vấn viên')) {
        detectedIntent = 'Yêu cầu gặp nhân viên';
        scoreIncrement = 25;
        fallbackText =
          'Dạ em hiểu rồi ạ! Em đang kết nối chuyên viên bán hàng trực tiếp của Đệm Xanh qua hotline 0962 701 701 hoặc hỗ trợ ngay trong khung chat này. Anh/chị đợi giây lát nhé!';
      } else if (
        lower.includes('mua') ||
        lower.includes('đặt') ||
        lower.includes('sđt') ||
        lower.includes('09') ||
        lower.includes('03') ||
        lower.includes('08')
      ) {
        detectedIntent = 'Ý định mua hàng';
        scoreIncrement = 30;
        fallbackText =
          'Dạ tuyệt vời ạ! Em đã ghi nhận thông tin của anh/chị. Chuyên viên Đệm Xanh sẽ liên hệ lại ngay trong ít phút để xác nhận kích thước đệm, quà tặng kèm và lịch hẹn giao hàng thuận tiện nhất cho mình ạ!';
      } else {
        fallbackText = `Dạ em là trợ lý AI Đệm Xanh (demxanh.com). Em có thể báo giá nhanh các mẫu đệm cao su Kim Cương, Liên Á, đệm lò xo Dunlopillo, hoặc tư vấn loại đệm phù hợp với thể trạng lưng và không gian phòng của anh/chị. Anh/chị muốn xem mẫu nào ạ?`;
      }

      return res.json({
        text: fallbackText,
        source: 'local_engine',
        detectedIntent,
        scoreIncrement,
      });
    } catch (err: any) {
      console.error('Error handling chat:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  // Serve static files or Vite middlewares
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Đệm Xanh AI Assistant server running on port ${PORT}`);
  });
}

startServer();
