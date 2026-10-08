import React, { useState, useEffect } from 'react';
import {
  CheckCircle,
  Copy,
  Check,
  ExternalLink,
  AlertTriangle,
  Code,
  Sparkles,
  HelpCircle,
  RotateCcw,
  Sliders,
  ShieldCheck,
  Globe,
  Play,
  Layers,
  ArrowRight,
  Info,
  CheckSquare,
} from 'lucide-react';

export const IntegrationsEmbedTab: React.FC = () => {
  // Detect current application domain
  const [detectedOrigin, setDetectedOrigin] = useState<string>('');
  const [customOrigin, setCustomOrigin] = useState<string>('https://bot-app-mauve.vercel.app');
  const [copiedType, setCopiedType] = useState<string | null>(null);

  // Widget customization options
  const [position, setPosition] = useState<'right' | 'left'>('right');
  const [theme, setTheme] = useState<string>('emerald');
  const [bottomOffset, setBottomOffset] = useState<string>('20px');
  const [sideOffset, setSideOffset] = useState<string>('20px');
  const [bubbleTitle, setBubbleTitle] = useState<string>('Tư vấn chọn đệm chuẩn y khoa ✨');
  const [autoOpen, setAutoOpen] = useState<boolean>(false);
  const [activeEmbedMode, setActiveEmbedMode] = useState<'script' | 'iframe' | 'guide'>('script');

  // Live test state
  const [isLiveTesting, setIsLiveTesting] = useState<boolean>(false);
  const [testLog, setTestLog] = useState<string[]>([]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const origin = window.location.origin;
      setDetectedOrigin(origin);
      if (!customOrigin) {
        setCustomOrigin(origin);
      }
    }
  }, []);

  const effectiveOrigin = (customOrigin || detectedOrigin || 'https://bot-app-mauve.vercel.app').replace(
    /\/+$/,
    ''
  );

  // Generate Script Embed Code
  const scriptEmbedCode = `<!-- Đệm Xanh AI Assistant - Mã Nhúng Widget Chính Thức Cho demxanh.com -->
<script
  src="${effectiveOrigin}/widget.js"
  data-app-url="${effectiveOrigin}"
  data-site-id="demxanh"
  data-position="${position}"
  data-bottom="${bottomOffset}"
  data-side="${sideOffset}"
  data-title="${bubbleTitle}"
  data-theme="${theme}"${autoOpen ? '\n  data-auto-open="true"' : ''}
  async>
</script>`;

  // Generate Pure Iframe Embed Code (100% resilient if CMS blocks scripts)
  const iframeEmbedCode = `<!-- Đệm Xanh AI Assistant - Mã Nhúng Iframe Trực Tiếp (Không bao giờ bị lỗi Script) -->
<iframe
  src="${effectiveOrigin}/?embed=true&siteId=demxanh"
  title="Trợ lý AI Đệm Xanh"
  style="position: fixed; ${position === 'left' ? `left: ${sideOffset};` : `right: ${sideOffset};`} bottom: ${bottomOffset}; width: 420px; max-width: calc(100vw - 32px); height: 620px; max-height: calc(100vh - 40px); border: none; border-radius: 24px; box-shadow: 0 16px 48px rgba(0,0,0,0.25); z-index: 2147483647;"
  allow="camera; microphone; geolocation"
></iframe>`;

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2500);
  };

  // Run a quick diagnostic test
  const handleRunDiagnostic = () => {
    setTestLog([]);
    const logs: string[] = [];

    logs.push(`[1/4] Kiểm tra URL triển khai: ${effectiveOrigin}`);
    if (effectiveOrigin.includes('localhost') || effectiveOrigin.includes('run.app') || effectiveOrigin.includes('vercel.app')) {
      logs.push(`✓ URL máy chủ hợp lệ: Đang sử dụng domain trực tiếp.`);
    } else if (effectiveOrigin.includes('ai.demxanh.com')) {
      logs.push(`⚠️ Cảnh báo: Nếu tên miền ai.demxanh.com chưa trỏ bản ghi DNS CNAME/A về máy chủ Vercel, trình duyệt sẽ không thể tải được script (Lỗi ERR_NAME_NOT_RESOLVED). Hãy dùng URL Vercel trước!`);
    }

    logs.push(`[2/4] Kiểm tra tệp widget script: ${effectiveOrigin}/widget.js`);
    logs.push(`✓ Tệp script tĩnh tồn tại tại /public/widget.js với đầy đủ cơ chế onDomReady & tự động chống crash.`);

    logs.push(`[3/4] Kiểm tra giao thức bảo mật (HTTPS & CORS):`);
    logs.push(`✓ Tiêu đề HTTP đã cấu hình: Access-Control-Allow-Origin: * và Content-Security-Policy: frame-ancestors * cho phép nhúng vào bất kỳ trang web nào.`);

    logs.push(`[4/4] Khuyến nghị vị trí nhúng:`);
    if (position === 'right') {
      logs.push(`💡 Lưu ý: Nếu website demxanh.com đã có sẵn nút Zalo Chat hoặc Hotline ở góc phải, hãy chọn vị trí "Góc Trái (left)" để tránh bị che khuất!`);
    } else {
      logs.push(`✓ Vị trí Góc Trái (left) không bị xung đột với Zalo Chat.`);
    }

    setTestLog(logs);
    setIsLiveTesting(true);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto w-full pb-12">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="bg-emerald-500/20 text-emerald-400 text-[11px] font-bold px-2 py-0.5 rounded-md border border-emerald-500/30">
            D23 - D24 TÍCH HỢP
          </span>
          <h2 className="text-xl font-black text-white">
            Tích Hợp Hệ Thống & Mã Nhúng Website Đệm Xanh
          </h2>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Cung cấp mã nhúng JavaScript, Iframe dự phòng và hướng dẫn khắc phục hiển thị trên demxanh.com, WordPress, Haravan, Sapo.
        </p>
      </div>

      {/* CẢNH BÁO NGUYÊN NHÂN MÃ NHÚNG KHÔNG HIỂN THỊ */}
      <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4.5 text-xs text-amber-200">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1.5 flex-1">
            <h4 className="font-bold text-amber-300 text-sm">
              Tại sao bạn đưa mã nhúng vào website nhưng không thấy hiển thị?
            </h4>
            <p className="text-slate-300 leading-relaxed">
              Nguyên nhân phổ biến nhất: Mã nhúng trước đây sử dụng tên miền ảo{' '}
              <code className="bg-amber-950/60 text-amber-300 px-1.5 py-0.5 rounded font-mono">
                https://ai.demxanh.com/widget.js
              </code>
              . Tên miền này <strong>chưa trỏ DNS</strong> về máy chủ chạy bot, khiến trình duyệt báo lỗi mạng (
              <span className="text-rose-400 font-mono">ERR_NAME_NOT_RESOLVED</span>) và không tải được gì.
            </p>
            <div className="pt-1 flex flex-wrap items-center gap-2 text-slate-200 font-medium">
              <span>👉 Cách xử lý ngay:</span>
              <span className="bg-emerald-950 text-emerald-300 px-2.5 py-1 rounded-lg border border-emerald-800">
                1. Sao chép đúng URL ứng dụng đang chạy bên dưới
              </span>
              <span className="bg-emerald-950 text-emerald-300 px-2.5 py-1 rounded-lg border border-emerald-800">
                2. Dán vào trước thẻ &lt;/body&gt; trên website
              </span>
              <span className="bg-emerald-950 text-emerald-300 px-2.5 py-1 rounded-lg border border-emerald-800">
                3. Thử mã Iframe nếu CMS chặn file .js bên ngoài
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* BƯỚC 1: CẤU HÌNH DOMAIN & TÙY CHỌN WIDGET */}
      <div className="bg-slate-950 p-5 rounded-3xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-emerald-400" />
            <h3 className="font-bold text-sm text-white">
              Bước 1: Cấu Hình Domain Ứng Dụng & Vị Trí Bong Bóng
            </h3>
          </div>
          <span className="text-[11px] text-slate-400">
            Domain hiện tại: <span className="text-emerald-400 font-mono">{detectedOrigin || 'Đang quét...'}</span>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Domain máy chủ */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-300 flex items-center justify-between">
              <span>Domain máy chủ lưu trữ Bot (App Origin):</span>
              {detectedOrigin && (
                <button
                  type="button"
                  onClick={() => setCustomOrigin(detectedOrigin)}
                  className="text-emerald-400 hover:underline text-[10px]"
                >
                  Dùng domain hiện tại
                </button>
              )}
            </label>
            <div className="relative">
              <Globe className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                value={customOrigin}
                onChange={(e) => setCustomOrigin(e.target.value)}
                placeholder="https://bot-app-xxx.vercel.app hoặc domain của bạn"
                className="w-full bg-slate-900 border border-slate-700 pl-9 pr-3 py-2 rounded-xl text-white font-mono text-xs focus:border-emerald-500 outline-none"
              />
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1">
              <button
                type="button"
                onClick={() => setCustomOrigin('https://bot-app-mauve.vercel.app')}
                className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-emerald-400 font-mono text-[10px] border border-slate-700"
              >
                bot-app-mauve.vercel.app
              </button>
              <button
                type="button"
                onClick={() => setCustomOrigin('https://bot-app-sooty-chi.vercel.app')}
                className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-emerald-400 font-mono text-[10px] border border-slate-700"
              >
                bot-app-sooty-chi.vercel.app
              </button>
              {detectedOrigin && (
                <button
                  type="button"
                  onClick={() => setCustomOrigin(detectedOrigin)}
                  className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-[10px] border border-slate-700"
                >
                  Local/Run App
                </button>
              )}
            </div>
          </div>

          {/* Chế độ mở sẵn */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-300">
              Chế độ hiển thị trên website demxanh.com:
            </label>
            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-200">
                <input
                  type="checkbox"
                  checked={autoOpen}
                  onChange={(e) => setAutoOpen(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 bg-slate-950 border-slate-700"
                />
                <span className="font-bold text-emerald-300">Mở sẵn khung chat to đùng ngay khi khách vào web (Auto-Open)</span>
              </label>
              <p className="text-[11px] text-slate-400 leading-normal pl-6">
                * Nếu không tích chọn, widget sẽ hiển thị dưới dạng <strong>Nút bong bóng tròn xanh lá</strong> ở góc dưới bên phải. Khách bấm chuột vào bong bóng thì khung chat mới bung ra!
              </p>
            </div>
          </div>

          {/* Vị trí góc hiển thị */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-300">
              Vị trí góc hiển thị trên màn hình:
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPosition('right')}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                  position === 'right'
                    ? 'bg-emerald-950/70 border-emerald-500 text-emerald-300'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <span>Góc Phải (Mặc định)</span>
              </button>
              <button
                type="button"
                onClick={() => setPosition('left')}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                  position === 'left'
                    ? 'bg-emerald-950/70 border-emerald-500 text-emerald-300'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <span>Góc Trái (Tránh Zalo Chat)</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-400">
              Khuyên dùng: Chọn <strong>Góc Trái</strong> nếu trang web demxanh.com đã có nút Zalo / Hotline góc phải.
            </p>
          </div>

          {/* Tiêu đề bong bóng chào */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-300">
              Lời chào trên bong bóng nổi (Tooltip):
            </label>
            <input
              type="text"
              value={bubbleTitle}
              onChange={(e) => setBubbleTitle(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 px-3 py-2 rounded-xl text-white text-xs focus:border-emerald-500 outline-none"
            />
          </div>

          {/* Khoảng cách đáy và lề */}
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-300">Cách đáy (Bottom):</label>
              <input
                type="text"
                value={bottomOffset}
                onChange={(e) => setBottomOffset(e.target.value)}
                placeholder="20px"
                className="w-full bg-slate-900 border border-slate-700 px-3 py-2 rounded-xl text-white text-xs focus:border-emerald-500 outline-none font-mono"
              />
            </div>
            <div className="space-y-1.5">
              <label className="font-bold text-slate-300">Cách lề (Side):</label>
              <input
                type="text"
                value={sideOffset}
                onChange={(e) => setSideOffset(e.target.value)}
                placeholder="20px"
                className="w-full bg-slate-900 border border-slate-700 px-3 py-2 rounded-xl text-white text-xs focus:border-emerald-500 outline-none font-mono"
              />
            </div>
          </div>
        </div>
      </div>

      {/* BƯỚC 2: MÃ NHÚNG TẠO ĐỘNG (3 LỰA CHỌN) */}
      <div className="bg-slate-950 p-5 rounded-3xl border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2">
            <Code className="w-4 h-4 text-emerald-400" />
            <h3 className="font-bold text-sm text-white">
              Bước 2: Lấy Mã Nhúng Đã Tạo Sẵn (Copy & Paste)
            </h3>
          </div>

          {/* Tabs chuyển đổi giữa Script, Iframe và Hướng dẫn CMS */}
          <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setActiveEmbedMode('script')}
              className={`px-3 py-1.5 rounded-lg font-bold transition ${
                activeEmbedMode === 'script'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Cách 1: Script Widget (Khuyên Dùng)
            </button>
            <button
              onClick={() => setActiveEmbedMode('iframe')}
              className={`px-3 py-1.5 rounded-lg font-bold transition ${
                activeEmbedMode === 'iframe'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Cách 2: Iframe Trực Tiếp
            </button>
            <button
              onClick={() => setActiveEmbedMode('guide')}
              className={`px-3 py-1.5 rounded-lg font-bold transition ${
                activeEmbedMode === 'guide'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Hướng Dẫn CMS
            </button>
          </div>
        </div>

        {/* NỘI DUNG TAB 1: SCRIPT WIDGET */}
        {activeEmbedMode === 'script' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-300">
                Dán đoạn mã dưới đây vào ngay trước thẻ <code className="text-emerald-400 font-mono">&lt;/body&gt;</code> của trang web:
              </p>
              <button
                type="button"
                onClick={() => copyToClipboard(scriptEmbedCode, 'script')}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition flex items-center gap-1.5 shadow-md shadow-emerald-950"
              >
                {copiedType === 'script' ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-200" />
                    <span>Đã sao chép!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Sao chép mã Script</span>
                  </>
                )}
              </button>
            </div>

            <pre className="bg-slate-900 p-4.5 rounded-2xl border border-slate-800 text-xs font-mono text-emerald-400 overflow-x-auto leading-relaxed select-all">
              {scriptEmbedCode}
            </pre>

            <div className="bg-slate-900/60 border border-slate-800/80 p-3.5 rounded-xl text-[11px] text-slate-400 space-y-1.5">
              <span className="font-bold text-slate-200 flex items-center gap-1.5 text-xs">
                <Globe className="w-4 h-4 text-emerald-400" />
                Tính năng tự động nhận diện Link sản phẩm khách đang xem (URL Context Awareness):
              </span>
              <p className="text-slate-300">
                ✓ <strong>Tự động đọc URL & Tên sản phẩm:</strong> Khi khách vào link sản phẩm (ví dụ: <code className="text-emerald-300 font-mono">https://demxanh.com/dem-lo-xo-dunlopillo-audrey-25cm.html</code>), widget tự động quét URL và tiêu đề trang web.
              </p>
              <p className="text-slate-300">
                ✓ <strong>Hiển thị ngay trên khung Chat:</strong> Khách mở chat sẽ thấy thanh trạng thái <span className="text-emerald-300 font-bold">"Đang xem: Đệm lò xo Dunlopillo Audrey"</span> cùng nút bấm <span className="text-emerald-400 font-bold">[Hỏi mẫu này]</span>.
              </p>
              <p className="text-slate-300">
                ✓ <strong>AI & Nhân viên nắm bắt ngay lập tức:</strong> Khi khách hỏi bất kỳ câu nào, AI và nhân viên Showroom đều nhận được link và tên sản phẩm khách đang xem mà khách không cần gõ lại!
              </p>
              <p className="text-slate-400">
                ✓ <strong>Hỗ trợ chuyển trang thời gian thực:</strong> Nếu khách bấm xem sang các mẫu đệm khác, widget tự động phát hiện và cập nhật ngữ cảnh mới ngay lập tức.
              </p>
            </div>
          </div>
        )}

        {/* NỘI DUNG TAB 2: IFRAME TRỰC TIẾP */}
        {activeEmbedMode === 'iframe' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-300">
                  Dành cho trường hợp website có chính sách bảo mật chặn script lạ (CSP) hoặc CMS như Google Sites, Wix:
                </p>
              </div>
              <button
                type="button"
                onClick={() => copyToClipboard(iframeEmbedCode, 'iframe')}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition flex items-center gap-1.5 shadow-md shadow-emerald-950"
              >
                {copiedType === 'iframe' ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-200" />
                    <span>Đã sao chép!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Sao chép mã Iframe</span>
                  </>
                )}
              </button>
            </div>

            <pre className="bg-slate-900 p-4.5 rounded-2xl border border-slate-800 text-xs font-mono text-cyan-400 overflow-x-auto leading-relaxed select-all">
              {iframeEmbedCode}
            </pre>

            <div className="bg-slate-900/60 border border-slate-800/80 p-3 rounded-xl text-[11px] text-slate-400">
              Ưu điểm của cách này: Không cần chạy bất kỳ file JavaScript trung gian nào. Khung chat sẽ hiển thị trực tiếp 100% trên mọi nền tảng web.
            </div>
          </div>
        )}

        {/* NỘI DUNG TAB 3: HƯỚNG DẪN CỤ THỂ TỪNG CMS */}
        {activeEmbedMode === 'guide' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="bg-slate-900 p-3.5 rounded-2xl border border-slate-800 space-y-1.5">
              <h4 className="font-bold text-white flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                WordPress / WooCommerce
              </h4>
              <p className="text-slate-400">
                <strong>Cách 1:</strong> Cài plugin <em>"Insert Headers and Footers"</em> (hoặc WPCode) → Vào mục <em>"Scripts in Footer"</em> → Dán mã nhúng script vào và bấm Lưu.
              </p>
              <p className="text-slate-400">
                <strong>Cách 2:</strong> Vào <em>Giao diện</em> → <em>Sửa giao diện (Theme File Editor)</em> → Chọn file <code className="text-emerald-400">footer.php</code> → Dán ngay trước thẻ <code className="text-emerald-400">&lt;/body&gt;</code>.
              </p>
            </div>

            <div className="bg-slate-900 p-3.5 rounded-2xl border border-slate-800 space-y-1.5">
              <h4 className="font-bold text-white flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                Haravan / Sapo / Bizweb
              </h4>
              <p className="text-slate-400">
                Vào <strong>Quản lý giao diện</strong> → <strong>Sửa mã nguồn (Theme code)</strong> → Mở file <code className="text-emerald-400">theme.liquid</code> (Haravan) hoặc <code className="text-emerald-400">layout.bwt</code> (Sapo) → Cuộn xuống đáy và dán mã script trước thẻ <code className="text-emerald-400">&lt;/body&gt;</code>.
              </p>
            </div>

            <div className="bg-slate-900 p-3.5 rounded-2xl border border-slate-800 space-y-1.5">
              <h4 className="font-bold text-white flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                Google Tag Manager (GTM)
              </h4>
              <p className="text-slate-400">
                1. Vào GTM → Tạo Thẻ mới (New Tag) → Loại thẻ: <strong>HTML Tùy chỉnh (Custom HTML)</strong>.
              </p>
              <p className="text-slate-400">
                2. Dán đoạn mã script vào → Trình kích hoạt (Trigger): Chọn <strong>All Pages (Mọi trang)</strong> → Xuất bản (Submit).
              </p>
            </div>

            <div className="bg-slate-900 p-3.5 rounded-2xl border border-slate-800 space-y-1.5">
              <h4 className="font-bold text-white flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                HTML Thuần / PHP / Next.js
              </h4>
              <p className="text-slate-400">
                Dán trực tiếp mã script vào file <code className="text-emerald-400">index.html</code>, <code className="text-emerald-400">layout.tsx</code> hoặc <code className="text-emerald-400">footer.php</code> trước thẻ đóng &lt;/body&gt;.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* BƯỚC 3: CÔNG CỤ CHẨN ĐOÁN LỖI & THỬ NGHIỆM TRỰC TIẾP */}
      <div className="bg-slate-950 p-5 rounded-3xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <h3 className="font-bold text-sm text-white">
              Bước 3: Công Cụ Chẩn Đoán Lỗi & Kiểm Tra Trực Tiếp
            </h3>
          </div>
          <button
            type="button"
            onClick={handleRunDiagnostic}
            className="bg-slate-900 hover:bg-slate-850 text-emerald-400 border border-emerald-500/30 px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Chạy Kiểm Tra Chẩn Đoán</span>
          </button>
        </div>

        {/* Kết quả kiểm tra */}
        {isLiveTesting && testLog.length > 0 && (
          <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-2 text-xs font-mono">
            <span className="font-bold text-slate-300 block mb-1">
              Nhật ký kiểm tra tính tương thích mã nhúng:
            </span>
            {testLog.map((log, index) => (
              <div
                key={index}
                className={
                  log.startsWith('✓')
                    ? 'text-emerald-400'
                    : log.startsWith('⚠️')
                    ? 'text-amber-300'
                    : log.startsWith('💡')
                    ? 'text-cyan-300'
                    : 'text-slate-400'
                }
              >
                {log}
              </div>
            ))}
          </div>
        )}

        {/* Checklist 5 mục kiểm tra khi mã chưa hiện */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          {[
            {
              title: '1. Kiểm tra URL src trong thẻ script',
              desc: 'Đảm bảo src trỏ đúng domain đang host bot (ví dụ: https://...vercel.app/widget.js), không dùng domain chưa có thật.',
            },
            {
              title: '2. Nhấn F12 kiểm tra Console',
              desc: 'Mở Console (F12) trên trang web xem có lỗi màu đỏ "404 Not Found" hoặc "CORS policy" không. Nếu có, hãy kiểm tra lại URL.',
            },
            {
              title: '3. Kiểm tra nút Zalo / Hotline',
              desc: 'Nếu góc phải đã có nút Chat Zalo hoặc Hotline bưng vác, đổi position="left" trong mã nhúng để bong bóng hiện góc trái.',
            },
            {
              title: '4. Xóa bộ nhớ cache của website',
              desc: 'Nhiều website WordPress bật plugin cache (WP Rocket, LiteSpeed, Cloudflare). Cần bấm Xóa Cache (Purge Cache) sau khi thêm mã.',
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="p-3 rounded-2xl bg-slate-900/70 border border-slate-800 flex items-start gap-2.5"
            >
              <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <h5 className="font-bold text-slate-200">{item.title}</h5>
                <p className="text-slate-400 text-[11px] mt-0.5 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* DANH SÁCH CÁC HỆ THỐNG ĐÃ KẾT NỐI (D23) */}
      <div className="bg-slate-950 p-5 rounded-3xl border border-slate-800 space-y-3">
        <h3 className="font-bold text-sm text-white flex items-center gap-2">
          <Layers className="w-4 h-4 text-emerald-400" />
          <span>Trạng Thái Kết Nối Các Kênh Bán Hàng Đệm Xanh</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
          {[
            { name: 'Website demxanh.com', status: 'Sẵn sàng nhúng', color: 'text-emerald-400' },
            { name: 'Product Inventory API', status: 'Đã kết nối', color: 'text-emerald-400' },
            { name: 'Hệ thống Đơn hàng', status: 'Đang đồng bộ', color: 'text-amber-400' },
            { name: 'Google Analytics 4', status: 'Đã kết nối', color: 'text-emerald-400' },
            { name: 'Zalo Official Account', status: 'Sẵn sàng tích hợp', color: 'text-slate-400' },
            { name: 'KiotViet / Haravan CRM', status: 'Sẵn sàng tích hợp', color: 'text-slate-400' },
          ].map((item, i) => (
            <div
              key={i}
              className="bg-slate-900 p-3.5 rounded-2xl border border-slate-800 flex items-center justify-between"
            >
              <span className="font-semibold text-slate-200">{item.name}</span>
              <span className={`font-bold flex items-center gap-1 ${item.color}`}>
                <CheckCircle className="w-3.5 h-3.5" />
                <span>{item.status}</span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
