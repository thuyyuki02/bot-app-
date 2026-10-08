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
import { resolveContextualTargetProduct } from './src/services/contextResolver.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// In-memory knowledge cache of crawled products
let learnedProducts = [...DEMXANH_REAL_CATALOG];
let learnedPolicies = [...DEMXANH_CORE_POLICIES];

async function startServer() {
  const app = express();
  const PORT = 3000;

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
      const isFromHistory = contextRes.contextType === 'history_product';
      const contextExplanation = contextRes.explanation;

      // Build product reference context for prompt (focal product is strictly Priority #1)
      const otherProducts = activeCatalog.filter((p: any) => p.id !== focalProduct.id).slice(0, 3);
      const productContextStr = [
        `[SẢN PHẨM TRỌNG TÂM CỦA NGỮ CẢNH HIỆN TẠI - ƯU TIÊN 1]:\n` +
          `- Tên: ${focalProduct.name} | Hãng: ${focalProduct.brand} | Danh mục: ${focalProduct.category} | SKU: ${focalProduct.sku}\n` +
          `- Giá KM: ${focalProduct.salePrice?.toLocaleString('vi-VN')}đ (Giá niêm yết: ${focalProduct.originalPrice?.toLocaleString(
            'vi-VN'
          )}đ - Tiết kiệm: ${(focalProduct.originalPrice - focalProduct.salePrice)?.toLocaleString('vi-VN')}đ)\n` +
          `- Độ dày chuẩn: ${focalProduct.thickness} | Độ cứng/êm: ${focalProduct.firmness}\n` +
          `- Kích thước tiêu chuẩn: ${(focalProduct.dimensions || []).join(', ')}\n` +
          `- Thời gian bảo hành chính hãng: ${focalProduct.warrantyYears} năm\n` +
          `- Chất liệu: ${focalProduct.material}\n` +
          `- Tính năng nổi bật & Y khoa: ${(focalProduct.features || []).join('; ')}\n` +
          `- Mô tả: ${focalProduct.description || ''}`,
        ...otherProducts.map(
          (p: any) =>
            `[SẢN PHẨM THAM KHẢO/SO SÁNH]: Tên: ${p.name} | Hãng: ${p.brand} | Giá KM: ${p.salePrice?.toLocaleString(
              'vi-VN'
            )}đ | Độ dày: ${p.thickness} | Bảo hành: ${p.warrantyYears} năm | Chất liệu: ${p.material}`
        ),
      ].join('\n\n');

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
                  text: `BỐI CẢNH & DỮ LIỆU ĐỐI SOÁT TỪ DEMXANH.COM:\n` +
                    `NGỮ CẢNH TRANG KHÁCH ĐANG XEM TRÊN WEBSITE: "${currentPageContext}"\n` +
                    `SẢN PHẨM TRỌNG TÂM XÁC ĐỊNH: "${focalProduct.name}"\n` +
                    `TRẠNG THÁI NGỮ CẢNH: ${contextExplanation}\n\n` +
                    `DỮ LIỆU SẢN PHẨM DEMXANH.COM:\n${productContextStr}\n\n` +
                    `CHÍNH SÁCH ĐỆM XANH:\n${policiesContextStr}\n\n` +
                    `THÔNG TIN KHÁCH HÀNG: ${JSON.stringify(customerProfile || {})}\n\n` +
                    `CÂU HỎI MỚI NHẤT CỦA KHÁCH: "${message}"`,
                },
              ],
            },
          ];

          const generatePromise = ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents,
            config: {
              systemInstruction:
                systemPrompt ||
                `Bạn là Trợ lý AI tư vấn nệm độc quyền của Hệ thống Đệm Xanh (demxanh.com), hotline 0962 701 701.

QUY TẮC BẮT BUỘC VỀ NGỮ CẢNH (CONTEXT-STRICT RULES):
1. ĐÚNG ĐỐI TƯỢNG VÀ SẢN PHẨM ĐANG XEM:
   - Khách đang xem trang: "${currentPageContext}".
   - Sản phẩm trọng tâm được xác định: "${focalProduct.name}".
   - ${contextExplanation}
   - Khi khách dùng các đại từ chỉ định ("mẫu này", "đệm này", "cái này", "sản phẩm này", hoặc các câu hỏi không nhắc tên đệm như "giá bao nhiêu", "bảo hành thế nào", "dày mấy phân", "nằm có bị đau lưng không", "có quà tặng không", "có giao về Cầu Giấy không"): BẠN PHẢI 100% HIỂU VÀ TRẢ LỜI CHÍNH XÁC VỀ "${focalProduct.name}". Tuyệt đối không được hỏi lại "anh/chị đang hỏi mẫu nào" và không được trả lời sang mẫu đệm khác!

2. LIÊN TỤC VÀ NHẤT QUÁN VỚI LỊCH SỬ HỘI THOẠI (CONVERSATION CONTINUITY):
   - Đọc kỹ lịch sử chat trước đó. Nếu ở tin nhắn trước khách đã chia sẻ thông tin (như: mua cho bố mẹ 70 tuổi bị đau lưng, giường kích thước 1m8x2m, ngân sách 7 triệu...), bạn phải nhớ và duy trì ngữ cảnh này trong câu trả lời tiếp theo.

3. ĐỐI SOÁT DỮ LIỆU CHÍNH XÁC 100% TỪ DEMXANH.COM:
   - Báo đúng giá khuyến mãi (VNĐ), đúng độ dày chuẩn, đúng độ cứng/êm và thời gian bảo hành chính hãng từ catalog được cung cấp.
   - Nhắc quà tặng độc quyền tại Đệm Xanh: Combo 2 ruột gối cao cấp + ga chống thấm.
   - Chính sách đặc quyền: 30 đêm ngủ thử đổi mới miễn phí tại nhà, Miễn phí vận chuyển 30km tận phòng ngủ.
   - Hotline: 0962 701 701.

4. PHONG CÁCH TƯ VẤN:
   - Lễ phép, xưng "Em", gọi "Anh/Chị". Chuẩn y khoa, ngắn gọn, súc tích, chuyên nghiệp.`,
              temperature: 0.25,
            },
          });

          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Gemini API timeout')), 9000)
          );

          const response = (await Promise.race([generatePromise, timeoutPromise])) as any;
          const replyText = response.text || '';
          if (replyText.trim()) {
            return res.json({
              text: replyText,
              source: 'gemini',
              detectedIntent: contextRes.detectedIntent,
              scoreIncrement: 15,
              matchedProducts: [focalProduct],
            });
          }
        } catch (apiError: any) {
          console.warn('Gemini API call failed, falling back to local engine:', apiError?.message || apiError);
        }
      }

      // Local intelligent response fallback (also 100% context-faithful)
      const lower = message.toLowerCase();
      let fallbackText = '';
      let detectedIntent = contextRes.detectedIntent;
      let scoreIncrement = 15;

      if (lower.includes('giá') || lower.includes('bao nhiêu') || lower.includes('tiền') || lower.includes('khuyến mãi')) {
        detectedIntent = 'Hỏi giá & Khuyến mãi';
        const discount = focalProduct.originalPrice - focalProduct.salePrice;
        fallbackText = `Dạ hiện tại mẫu **${focalProduct.name}** tại Hệ thống Đệm Xanh (demxanh.com) đang có giá khuyến mãi chỉ ${focalProduct.salePrice.toLocaleString(
          'vi-VN'
        )}đ (giá niêm yết ${focalProduct.originalPrice.toLocaleString('vi-VN')}đ, tiết kiệm ${discount.toLocaleString(
          'vi-VN'
        )}đ).\n\n• Quà tặng: Tặng combo 2 ruột gối cao cấp + ga chống thấm.\n• Bảo hành: Chính hãng ${focalProduct.warrantyYears} năm.\n• Đặc quyền: 30 đêm ngủ thử đổi mới miễn phí + Miễn phí vận chuyển 30km tận phòng.\n\nAnh/chị cần kích thước nào (1m6x2m, 1m8x2m hay 2mx2m2) để em báo giá chuẩn nhất ạ?`;
      } else if (lower.includes('dày') || lower.includes('chiều cao') || lower.includes('phân') || lower.includes('cm')) {
        detectedIntent = 'Hỏi độ dày & Kích thước';
        fallbackText = `Dạ mẫu **${focalProduct.name}** có độ dày chuẩn là **${focalProduct.thickness}**, chất liệu ${focalProduct.material}. Kích thước chuẩn sẵn hàng: ${(focalProduct.dimensions || []).join(', ')}. Giường của anh/chị là kích thước nào để em kiểm tra kho ạ?`;
      } else if (lower.includes('đau lưng') || lower.includes('thoát vị') || lower.includes('cột sống')) {
        detectedIntent = 'Tư vấn y khoa / Đau lưng';
        fallbackText = `Dạ về nâng đỡ cột sống: Mẫu **${focalProduct.name}** có độ nâng đỡ ${focalProduct.firmness}, chất liệu ${focalProduct.material}. Đặc tính: ${(focalProduct.features || []).slice(0, 2).join('; ')}. Đệm giữ cột sống thẳng tự nhiên khi nằm, rất tốt cho người đau lưng. Đệm Xanh có chính sách 30 đêm ngủ thử miễn phí tại nhà để anh/chị trải nghiệm ạ!`;
      } else if (lower.includes('bảo hành') || lower.includes('đổi') || lower.includes('ngủ thử')) {
        detectedIntent = 'Chính sách bảo hành & Ngủ thử';
        fallbackText = `Dạ mẫu **${focalProduct.name}** được bảo hành chính hãng **${focalProduct.warrantyYears} năm** chống xẹp lún. Quý khách được áp dụng chính sách độc quyền **30 đêm ngủ thử miễn phí**, đổi mới nếu không hợp độ cứng/êm ạ!`;
      } else if (lower.includes('giao hàng') || lower.includes('ship') || lower.includes('vận chuyển')) {
        detectedIntent = 'Hỏi giao hàng';
        fallbackText = `Dạ Đệm Xanh MIỄN PHÍ 100% phí giao hàng và hỗ trợ kê đệm tận phòng ngủ trong bán kính 30km từ hệ thống showroom Hà Nội, TP.HCM và Hải Phòng ạ. Giao hỏa tốc 2-4 giờ. Anh/chị đang ở quận/huyện nào ạ?`;
      } else {
        fallbackText = `Dạ em là trợ lý tư vấn AI Đệm Xanh (demxanh.com), hotline 0962 701 701. Em thấy anh/chị đang quan tâm mẫu **${focalProduct.name}** (${focalProduct.salePrice.toLocaleString('vi-VN')}đ, bảo hành ${focalProduct.warrantyYears} năm, quà tặng 2 gối cao cấp). Anh/chị cần em hỗ trợ kích thước, báo giá hay tư vấn độ êm nâng đỡ lưng ạ?`;
      }

      return res.json({
        text: fallbackText,
        source: 'local_engine',
        detectedIntent,
        scoreIncrement,
        matchedProducts: [focalProduct],
      });
    } catch (err: any) {
      console.error('Error handling chat:', err);
      res.status(200).json({
        text: 'Dạ em là trợ lý tư vấn AI Đệm Xanh (demxanh.com), hotline 0962 701 701. Em có thể báo giá nhanh các mẫu đệm cao su Kim Cương, Liên Á, đệm lò xo Dunlopillo và tư vấn độ cứng phù hợp với thể trạng lưng của anh/chị ạ!',
        source: 'local_engine',
        detectedIntent: 'Tư vấn đệm',
        scoreIncrement: 10,
      });
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
