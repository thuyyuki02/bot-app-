import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

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
    });
  });

  // AI Chat endpoint
  app.post('/api/ai/chat', async (req, res) => {
    try {
      const {
        message,
        history = [],
        systemPrompt = '',
        currentPageContext = '',
        customerProfile = null,
      } = req.body;

      if (!message) {
        return res.status(400).json({ error: 'Message is required' });
      }

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
                  text: `Ngữ cảnh trang hiện tại: ${currentPageContext}\nThông tin khách hàng: ${JSON.stringify(
                    customerProfile || {}
                  )}\n\nKhách hỏi: ${message}`,
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
                'Bạn là trợ lý AI tư vấn nệm chuyên nghiệp của Đệm Xanh (demxanh.com). Tư vấn nhiệt tình, chuẩn y khoa, đưa ra gợi ý cụ thể, hỗ trợ chọn đệm và thu thập thông tin khách hàng.',
              temperature: 0.3,
            },
          });

          const replyText = response.text || '';
          return res.json({ text: replyText, source: 'gemini' });
        } catch (apiError: any) {
          console.warn('Gemini API call failed, falling back to local engine:', apiError?.message || apiError);
        }
      }

      // Local intelligent response fallback
      const lower = message.toLowerCase();
      let fallbackText = '';
      let detectedIntent = 'general';
      let scoreIncrement = 5;

      if (lower.includes('giá') || lower.includes('bao nhiêu') || lower.includes('triệu')) {
        detectedIntent = 'Hỏi giá';
        scoreIncrement = 15;
        fallbackText =
          'Dạ hiện tại Đệm Xanh đang có chương trình khuyến mãi giảm từ 15% - 25% kèm combo quà tặng ruột gối trị giá 1.800.000đ cho tất cả các dòng đệm lò xo và cao su thiên nhiên. Anh/chị đang quan tâm cụ thể dòng đệm nào (Dunlopillo, Liên Á hay Kim Cương) để em gửi bảng giá ưu đãi theo kích thước chuẩn nhé!';
      } else if (lower.includes('đau lưng') || lower.includes('thoát vị') || lower.includes('cột sống')) {
        detectedIntent = 'Tư vấn y khoa / Đau lưng';
        scoreIncrement = 20;
        fallbackText =
          'Dạ với tình trạng đau thắt lưng hoặc thoái hóa cột sống, lời khuyên y khoa là không nên nằm đệm quá lún võng cũng không nên nằm phản quá cứng. Lựa chọn tốt nhất hiện nay là Đệm cao su thiên nhiên Kim Cương Happy Gold (độ cứng chuẩn y khoa) hoặc Đệm lò xo Dunlopillo Audrey nâng đỡ phân vùng. Em gửi thông tin 2 mẫu này để mình xem thử nhé!';
      } else if (lower.includes('giao hàng') || lower.includes('ship') || lower.includes('vận chuyển')) {
        detectedIntent = 'Hỏi giao hàng';
        scoreIncrement = 10;
        fallbackText =
          'Dạ Đệm Xanh MIỄN PHÍ 100% phí giao hàng và bưng vác lên tận phòng ngủ trong bán kính 30km từ hệ thống showroom Hà Nội, TP.HCM và Hải Phòng ạ. Đơn nội thành giao hỏa tốc chỉ trong 2-4 giờ. Anh/chị đang ở quận/huyện nào ạ?';
      } else if (lower.includes('nhân viên') || lower.includes('người thật') || lower.includes('tư vấn viên')) {
        detectedIntent = 'Yêu cầu gặp nhân viên';
        scoreIncrement = 25;
        fallbackText =
          'Dạ em hiểu rồi ạ! Em đang kết nối chuyên viên bán hàng trực tiếp của Đệm Xanh để hỗ trợ anh/chị ngay nhé. Anh/chị đợi giây lát trong khung chat này ạ!';
      } else if (lower.includes('mua') || lower.includes('đặt') || lower.includes('sđt') || lower.includes('09') || lower.includes('03') || lower.includes('08')) {
        detectedIntent = 'Ý định mua hàng';
        scoreIncrement = 30;
        fallbackText =
          'Dạ tuyệt vời ạ! Em đã ghi nhận thông tin của anh/chị. Chuyên viên Đệm Xanh sẽ liên hệ lại ngay trong ít phút để xác nhận kích thước đệm, quà tặng kèm và lịch hẹn giao hàng thuận tiện nhất cho mình ạ!';
      } else {
        fallbackText =
          'Dạ em có thể hỗ trợ anh/chị tìm đệm phù hợp với thể trạng (đau lưng, vợ chồng, trẻ nhỏ), gợi ý theo ngân sách từ dưới 3 triệu đến trên 20 triệu, hoặc kết nối nhân viên tư vấn trực tiếp tại Showroom Đệm Xanh. Anh/chị muốn bắt đầu từ bước nào ạ?';
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
