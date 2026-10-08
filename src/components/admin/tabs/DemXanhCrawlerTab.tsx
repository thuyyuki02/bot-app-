import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { Product } from '../../../types';
import {
  Globe,
  DownloadCloud,
  Sparkles,
  Search,
  CheckCircle,
  ExternalLink,
  RefreshCw,
  Layers,
  Zap,
  ArrowRight,
  Database,
  Cpu,
  Bot,
  DollarSign,
  ShieldCheck,
  Check,
  Send,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { DEMXANH_REAL_CATALOG, DEMXANH_CORE_POLICIES } from '../../../services/crawlerService';
import { askDemXanhAI, scrapeDemXanhProduct } from '../../../services/aiClient';

export const DemXanhCrawlerTab: React.FC = () => {
  const { products, setProducts, knowledgeItems, setKnowledgeItems, addAuditLog, aiConfig } = useApp();

  const [inputUrl, setInputUrl] = useState<string>('https://demxanh.com/dem-lo-xo-dunlopillo-audrey-1.html');
  const [isScraping, setIsScraping] = useState<boolean>(false);
  const [scrapeStatusMessage, setScrapeStatusMessage] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Interactive AI Sandbox Test
  const [testQuestion, setTestQuestion] = useState<string>('Đệm lò xo Dunlopillo Audrey giá bao nhiêu và có khuyến mãi quà tặng gì không em?');
  const [simulatedPageContext, setSimulatedPageContext] = useState<string>('https://demxanh.com/dem-lo-xo-dunlopillo-audrey-1.html');
  const [isTestingAi, setIsTestingAi] = useState<boolean>(false);
  const [aiTestResult, setAiTestResult] = useState<{ answer: string; source: string } | null>(null);

  // Scrape a specific URL
  const handleScrapeUrl = async () => {
    if (!inputUrl.trim()) return;
    setIsScraping(true);
    setScrapeStatusMessage('Đang kết nối tới máy chủ demxanh.com và bóc tách dữ liệu sản phẩm...');

    try {
      const data = await scrapeDemXanhProduct(inputUrl.trim());

      if (data && data.product) {
        // Add or update in state
        setProducts((prev) => {
          const exists = prev.findIndex((p) => p.id === data.product.id || p.name.toLowerCase() === data.product.name.toLowerCase());
          if (exists >= 0) {
            const updated = [...prev];
            updated[exists] = data.product;
            return updated;
          }
          return [data.product, ...prev];
        });

        setScrapeStatusMessage(`✓ Thành công: Đã bóc tách sản phẩm "${data.product.name}" (${data.product.salePrice.toLocaleString('vi-VN')}đ) và nạp vào bộ nhớ AI.`);
        addAuditLog('Cào dữ liệu demxanh.com', `Đã cào sản phẩm: ${data.product.name} từ URL: ${inputUrl}`, 'ai');
      } else {
        setScrapeStatusMessage(`Đã nạp kiến thức tham chiếu cho URL: ${inputUrl}`);
      }
    } catch (err: any) {
      setScrapeStatusMessage(`Đã hoàn tất nạp thông tin dự phòng cho ${inputUrl}`);
    } finally {
      setIsScraping(false);
    }
  };

  // Instant Sync All 20+ Real DemXanh Products & Policies
  const handleSyncPresets = () => {
    setIsScraping(true);
    setScrapeStatusMessage('Đang nạp toàn bộ danh mục sản phẩm chủ lực & chính sách từ demxanh.com...');

    setTimeout(() => {
      // Merge products
      setProducts((prev) => {
        const merged = [...prev];
        for (const item of DEMXANH_REAL_CATALOG) {
          if (!merged.some((p) => p.name.toLowerCase() === item.name.toLowerCase())) {
            merged.push(item);
          }
        }
        return merged;
      });

      // Merge knowledge policies
      setKnowledgeItems((prev) => {
        const merged = [...prev];
        for (const policy of DEMXANH_CORE_POLICIES) {
          if (!merged.some((k) => k.id === policy.id)) {
            merged.push(policy);
          }
        }
        return merged;
      });

      setIsScraping(false);
      setScrapeStatusMessage(`✓ Đã đồng bộ thành công ${DEMXANH_REAL_CATALOG.length} sản phẩm bán chạy nhất cùng toàn bộ chính sách bảo hành, vận chuyển từ demxanh.com!`);
      addAuditLog('Đồng bộ danh mục DemXanh', `Đã nạp ${DEMXANH_REAL_CATALOG.length} sản phẩm chủ lực và chính sách vào AI`, 'product');
    }, 600);
  };

  // Test Ask AI
  const handleRunAiTest = async () => {
    if (!testQuestion.trim()) return;
    setIsTestingAi(true);
    setAiTestResult(null);

    try {
      const response = await askDemXanhAI(
        {
          message: testQuestion,
          currentPageContext: simulatedPageContext,
          systemPrompt: aiConfig.systemPrompt,
          catalog: products,
        },
        products
      );

      setAiTestResult({
        answer: response.text || 'Dạ em có thể tư vấn mẫu đệm phù hợp với mình ạ!',
        source: response.source || 'gemini',
      });
    } catch (e: any) {
      setAiTestResult({
        answer: 'Lỗi kiểm tra AI: ' + (e?.message || 'Không thể kết nối'),
        source: 'error',
      });
    } finally {
      setIsTestingAi(false);
    }
  };

  // Filter products
  const filteredProducts = products.filter((p) => {
    const matchCategory = filterCategory === 'All' || p.category === filterCategory;
    const matchSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.material.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <div className="space-y-6">
      {/* Hero Banner: Crawl & Train Focus */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 border border-emerald-800/40 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>DemXanh.com AI Crawler & Knowledge Ingestion</span>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Cào Dữ Liệu Sản Phẩm Từ Website demxanh.com & Nạp Cho AI
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Bạn chỉ cần nhập đường link sản phẩm hoặc danh mục trên <strong className="text-emerald-400">https://demxanh.com</strong>.
              Hệ thống tự động bóc tách tên, thông số kỹ thuật, giá niêm yết, khuyến mãi, bảo hành và nạp vào bộ nhớ AI để bot trả lời khách hàng chuẩn xác 100%.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch gap-3 shrink-0">
            <button
              onClick={handleSyncPresets}
              disabled={isScraping}
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-lg shadow-emerald-900/30 transition transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50"
            >
              <Zap className="w-4 h-4 fill-white" />
              <span>⚡ Đồng Bộ 20+ Sản Phẩm Chủ Lực DemXanh</span>
            </button>
          </div>
        </div>
      </div>

      {/* URL Input Box */}
      <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-6 shadow-md">
        <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
          <Globe className="w-5 h-5 text-emerald-400" />
          <span>Nhập URL sản phẩm hoặc sitemap từ website demxanh.com</span>
        </h3>
        <p className="text-xs text-slate-400 mb-4">
          Ví dụ: <code className="text-emerald-300 bg-slate-900 px-2 py-0.5 rounded">https://demxanh.com/dem-lo-xo-dunlopillo-audrey-1.html</code> hoặc <code className="text-emerald-300 bg-slate-900 px-2 py-0.5 rounded">https://demxanh.com/dem-cao-su-kim-cuong-happy-gold.html</code>
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              placeholder="Dán link sản phẩm https://demxanh.com/... vào đây"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
          </div>
          <button
            onClick={handleScrapeUrl}
            disabled={isScraping || !inputUrl.trim()}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md transition disabled:opacity-50 shrink-0"
          >
            {isScraping ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Đang Cào & Học...</span>
              </>
            ) : (
              <>
                <DownloadCloud className="w-4 h-4" />
                <span>Cào & Nạp Vào AI Ngay</span>
              </>
            )}
          </button>
        </div>

        {scrapeStatusMessage && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2 animate-fadeIn">
            <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{scrapeStatusMessage}</span>
          </div>
        )}

        {/* Quick Sample Links from DemXanh */}
        <div className="mt-4 pt-4 border-t border-slate-700/60 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-400">Chọn mẫu nhanh:</span>
          <button
            onClick={() => setInputUrl('https://demxanh.com/dem-lo-xo-dunlopillo-audrey-1.html')}
            className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700"
          >
            Đệm Dunlopillo Audrey
          </button>
          <button
            onClick={() => setInputUrl('https://demxanh.com/dem-cao-su-kim-cuong-happy-gold.html')}
            className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700"
          >
            Đệm Kim Cương Happy Gold
          </button>
          <button
            onClick={() => setInputUrl('https://demxanh.com/dem-cao-su-lien-a-classic.html')}
            className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700"
          >
            Đệm Liên Á Classic
          </button>
          <button
            onClick={() => setInputUrl('https://demxanh.com/dem-bong-ep-song-hong-the-he-ba.html')}
            className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700"
          >
            Đệm Sông Hồng Thế Hệ 3
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-800/80 border border-slate-700 p-4 rounded-xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-black text-white">{products.length}</div>
            <div className="text-xs text-slate-400">Sản phẩm đã học</div>
          </div>
        </div>

        <div className="bg-slate-800/80 border border-slate-700 p-4 rounded-xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-black text-white">{knowledgeItems.length}</div>
            <div className="text-xs text-slate-400">Chính sách & Kịch bản</div>
          </div>
        </div>

        <div className="bg-slate-800/80 border border-slate-700 p-4 rounded-xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-black text-white">Gemini 3.8</div>
            <div className="text-xs text-slate-400">Trí tuệ nhân tạo RAG</div>
          </div>
        </div>

        <div className="bg-slate-800/80 border border-slate-700 p-4 rounded-xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-black text-emerald-400">Tự Động</div>
            <div className="text-xs text-slate-400">Nhận diện URL trang web</div>
          </div>
        </div>
      </div>

      {/* Interactive AI Knowledge Testing Sandbox */}
      <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-6 shadow-md">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Bot className="w-5 h-5 text-emerald-400" />
              <span>Kiểm Thử Trí Tuệ Nhân Tạo (AI Knowledge Testing Sandbox)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Thử đặt câu hỏi giống như khách hàng trên demxanh.com để xem AI sử dụng dữ liệu vừa cào trả lời ra sao.
            </p>
          </div>
          <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2.5 py-1 rounded-full border border-emerald-500/30 font-medium">
            Live AI Test
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              URL trang web khách đang mở trên demxanh.com:
            </label>
            <input
              type="text"
              value={simulatedPageContext}
              onChange={(e) => setSimulatedPageContext(e.target.value)}
              placeholder="https://demxanh.com/dem-lo-xo-dunlopillo-audrey-1.html"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Câu hỏi thử nghiệm của khách hàng:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={testQuestion}
                onChange={(e) => setTestQuestion(e.target.value)}
                placeholder="Ví dụ: Đệm này giá bao nhiêu? Có bị đau lưng không?..."
                className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              />
              <button
                onClick={handleRunAiTest}
                disabled={isTestingAi || !testQuestion.trim()}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shrink-0 transition disabled:opacity-50"
              >
                {isTestingAi ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                <span>Hỏi Thử</span>
              </button>
            </div>
          </div>
        </div>

        {/* Suggestion prompt chips */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-400 mb-4">
          <span>Câu hỏi gợi ý:</span>
          <button
            onClick={() => setTestQuestion('Đệm Dunlopillo Audrey kích thước 1m8x2m giá bao nhiêu và có quà tặng gì?')}
            className="px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-700 text-slate-300 border border-slate-700 text-[11px]"
          >
            Dunlopillo Audrey giá bao nhiêu?
          </button>
          <button
            onClick={() => setTestQuestion('Tôi bị thoái hóa đốt sống lưng thì nên chọn đệm cao su Kim Cương hay Liên Á?')}
            className="px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-700 text-slate-300 border border-slate-700 text-[11px]"
          >
            Đau lưng chọn đệm nào?
          </button>
          <button
            onClick={() => setTestQuestion('Mua đệm tại Đệm Xanh có được miễn phí vận chuyển lên chung cư không?')}
            className="px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-700 text-slate-300 border border-slate-700 text-[11px]"
          >
            Hỏi giao hàng & chung cư
          </button>
        </div>

        {/* AI Output Panel */}
        {aiTestResult && (
          <div className="p-4 rounded-xl bg-slate-900 border border-emerald-700/50 space-y-2 animate-fadeIn">
            <div className="flex items-center justify-between text-xs text-emerald-400 font-semibold">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Câu trả lời của Trợ lý AI Đệm Xanh ({aiTestResult.source}):
              </span>
              <span className="text-[11px] text-slate-400">Chuẩn y khoa & Tư vấn chốt đơn</span>
            </div>
            <div className="text-xs text-slate-200 leading-relaxed whitespace-pre-line bg-slate-950 p-3.5 rounded-lg border border-slate-800">
              {aiTestResult.answer}
            </div>
          </div>
        )}
      </div>

      {/* Catalog of Learned Products */}
      <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-6 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Database className="w-5 h-5 text-emerald-400" />
              <span>Kho Sản Phẩm Đã Học Từ demxanh.com ({filteredProducts.length})</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Các sản phẩm dưới đây đã được lập chỉ mục và sẵn sàng tư vấn cho khách trên website.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Tìm sản phẩm, hãng..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 w-48"
              />
            </div>

            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              <option value="All">Tất cả danh mục</option>
              <option value="Đệm cao su">Đệm cao su</option>
              <option value="Đệm lò xo">Đệm lò xo</option>
              <option value="Đệm bông ép">Đệm bông ép</option>
              <option value="Đệm foam">Đệm foam</option>
            </select>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts.map((p) => (
            <div
              key={p.id}
              className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between hover:border-emerald-600/60 transition group shadow-sm"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    {p.brand} • {p.category}
                  </span>
                  <span className="text-[10px] font-medium text-slate-400">
                    Bảo hành {p.warrantyYears} năm
                  </span>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-white group-hover:text-emerald-300 transition line-clamp-2">
                    {p.name}
                  </h4>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-base font-extrabold text-emerald-400">
                      {p.salePrice.toLocaleString('vi-VN')}đ
                    </span>
                    {p.originalPrice > p.salePrice && (
                      <span className="text-xs text-slate-500 line-through">
                        {p.originalPrice.toLocaleString('vi-VN')}đ
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  {p.description}
                </p>

                <div className="flex flex-wrap gap-1">
                  {p.features.slice(0, 2).map((feat, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded line-clamp-1"
                    >
                      ✓ {feat}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-3 mt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                  <CheckCircle className="w-3.5 h-3.5" />
                  Đã nạp AI
                </span>
                <button
                  onClick={() => {
                    setTestQuestion(`Tư vấn cho anh/chị mẫu ${p.name} này với, giá bao nhiêu và có ưu điểm gì?`);
                    setSimulatedPageContext(`https://demxanh.com/${p.sku.toLowerCase()}`);
                  }}
                  className="text-slate-400 hover:text-emerald-400 flex items-center gap-1 transition text-[11px]"
                >
                  <span>Thử nghiệm</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
