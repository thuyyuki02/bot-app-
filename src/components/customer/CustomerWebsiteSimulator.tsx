import React from 'react';
import { useApp } from '../../context/AppContext';
import { ChatWidget } from './ChatWidget';
import {
  Search,
  ShoppingCart,
  Phone,
  MapPin,
  Truck,
  ShieldCheck,
  Star,
  CheckCircle,
  Clock,
  Sparkles,
  ArrowRight,
  Heart,
  Share2,
} from 'lucide-react';

export const CustomerWebsiteSimulator: React.FC = () => {
  const { currentPage, setCurrentPage, products, sendCustomerMessage, isMobilePreview } = useApp();

  // Find product matching current page
  const currentProduct =
    products.find(
      (p) =>
        currentPage.includes(p.sku.toLowerCase()) ||
        currentPage.includes(p.brand.toLowerCase()) ||
        currentPage.includes('dunlopillo') && p.id === 'prod-dunlopillo-audrey'
    ) || products[0];

  const isProductPage = currentPage !== '/' && !currentPage.includes('khuyen-mai');

  return (
    <div className="relative min-h-[calc(100vh-64px)] bg-slate-100 flex flex-col">
      {/* Top Simulator Context Bar (C12 Context Awareness Controller) */}
      <div className="bg-emerald-950 text-emerald-200 px-4 py-2 text-xs border-b border-emerald-900 flex flex-wrap items-center justify-between gap-2 shadow-xs">
        <div className="flex items-center gap-2">
          <span className="bg-emerald-800 text-emerald-100 px-2 py-0.5 rounded font-mono font-bold text-[10px]">
            C12 CONTEXT
          </span>
          <span className="text-slate-300">Mô phỏng đường dẫn trang web khách đang duyệt:</span>
          <span className="font-mono bg-emerald-900/80 px-2 py-0.5 rounded text-white font-semibold">
            demxanh.com{currentPage}
          </span>
        </div>

        {/* Quick Page Selector */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <span className="text-slate-400 text-[11px]">Chuyển nhanh:</span>
          <button
            onClick={() => setCurrentPage('/')}
            className={`px-2 py-0.5 rounded text-[11px] font-medium transition ${
              currentPage === '/'
                ? 'bg-emerald-500 text-slate-950 font-bold'
                : 'bg-emerald-900/60 hover:bg-emerald-800 text-emerald-100'
            }`}
          >
            Trang chủ
          </button>
          <button
            onClick={() => setCurrentPage('/dem-lo-xo-dunlopillo-audrey')}
            className={`px-2 py-0.5 rounded text-[11px] font-medium transition ${
              currentPage.includes('dunlopillo-audrey')
                ? 'bg-emerald-500 text-slate-950 font-bold'
                : 'bg-emerald-900/60 hover:bg-emerald-800 text-emerald-100'
            }`}
          >
            Đệm Dunlopillo Audrey
          </button>
          <button
            onClick={() => setCurrentPage('/dem-cao-su-lien-a-classic')}
            className={`px-2 py-0.5 rounded text-[11px] font-medium transition ${
              currentPage.includes('lien-a')
                ? 'bg-emerald-500 text-slate-950 font-bold'
                : 'bg-emerald-900/60 hover:bg-emerald-800 text-emerald-100'
            }`}
          >
            Đệm Liên Á Classic
          </button>
          <button
            onClick={() => setCurrentPage('/dem-cao-su-kim-cuong-happy-gold')}
            className={`px-2 py-0.5 rounded text-[11px] font-medium transition ${
              currentPage.includes('kim-cuong')
                ? 'bg-emerald-500 text-slate-950 font-bold'
                : 'bg-emerald-900/60 hover:bg-emerald-800 text-emerald-100'
            }`}
          >
            Đệm Kim Cương
          </button>
          <button
            onClick={() => setCurrentPage('/khuyen-mai-thang-10')}
            className={`px-2 py-0.5 rounded text-[11px] font-medium transition ${
              currentPage.includes('khuyen-mai')
                ? 'bg-emerald-500 text-slate-950 font-bold'
                : 'bg-emerald-900/60 hover:bg-emerald-800 text-emerald-100'
            }`}
          >
            Khuyến Mãi
          </button>
        </div>
      </div>

      {/* Website Frame Container (Desktop or Mobile preview) */}
      <div
        className={`mx-auto w-full transition-all duration-300 flex-1 flex flex-col ${
          isMobilePreview
            ? 'max-w-[430px] my-4 rounded-3xl shadow-2xl border-8 border-slate-900 overflow-hidden bg-white min-h-[840px]'
            : 'max-w-7xl bg-white shadow-sm flex-1'
        }`}
      >
        {/* demxanh.com Top Announcement Bar */}
        <div className="bg-emerald-800 text-white text-xs py-1.5 px-4 flex items-center justify-between">
          <div className="flex items-center gap-4 text-[11px]">
            <span className="flex items-center gap-1">
              <Truck className="w-3.5 h-3.5 text-emerald-300" />
              <span>Miễn phí giao hàng & bưng tận phòng 30km</span>
            </span>
            <span className="hidden sm:flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
              <span>30 Đêm Ngủ Thử Miễn Phí Đổi Trả</span>
            </span>
          </div>
          <div className="flex items-center gap-3 text-[11px]">
            <span className="flex items-center gap-1 font-bold text-amber-300">
              <Phone className="w-3 h-3" /> 1800 6250 (Miễn phí cước)
            </span>
            <span className="hidden md:inline text-slate-200">15+ Showroom Toàn Quốc</span>
          </div>
        </div>

        {/* demxanh.com Header */}
        <div className="border-b border-slate-200 px-4 py-3 sm:py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setCurrentPage('/')}>
            <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-extrabold text-lg shadow-sm">
              ĐX
            </div>
            <div>
              <span className="text-xl font-black text-emerald-800 tracking-tight">ĐỆM XANH</span>
              <span className="hidden sm:block text-[10px] text-slate-500 font-medium">
                Công ty Minh Phong • Hệ thống nệm & chăn ga gối chính hãng
              </span>
            </div>
          </div>

          {/* Search bar */}
          <div className="flex-1 max-w-md hidden md:flex items-center relative">
            <input
              type="text"
              placeholder="Tìm đệm Dunlopillo, Liên Á, Kim Cương..."
              className="w-full bg-slate-100 hover:bg-slate-50 focus:bg-white text-xs px-4 py-2 pl-9 rounded-full border border-slate-200 focus:border-emerald-600 outline-none transition"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3" />
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => sendCustomerMessage('Tư vấn giúp tôi đệm đang có sẵn tại showroom gần nhất')}
              className="hidden lg:flex items-center gap-1.5 text-xs text-slate-700 hover:text-emerald-700 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200"
            >
              <MapPin className="w-3.5 h-3.5 text-emerald-600" />
              <span>Tìm Showroom</span>
            </button>
            <div className="relative p-2 text-slate-700 hover:text-emerald-700 cursor-pointer">
              <ShoppingCart className="w-5 h-5" />
              <span className="absolute top-0 right-0 w-4 h-4 bg-rose-600 text-white rounded-full text-[10px] font-bold flex items-center justify-center">
                1
              </span>
            </div>
          </div>
        </div>

        {/* Category Navigation Bar */}
        <div className="bg-slate-50 border-b border-slate-200 px-4 py-2 flex items-center gap-4 text-xs font-semibold text-slate-700 overflow-x-auto">
          <span className="text-emerald-700 cursor-pointer hover:underline" onClick={() => setCurrentPage('/')}>
            Trang Chủ
          </span>
          <span
            className="cursor-pointer hover:text-emerald-700 whitespace-nowrap"
            onClick={() => setCurrentPage('/dem-lo-xo-dunlopillo-audrey')}
          >
            Đệm Lò Xo
          </span>
          <span
            className="cursor-pointer hover:text-emerald-700 whitespace-nowrap"
            onClick={() => setCurrentPage('/dem-cao-su-lien-a-classic')}
          >
            Đệm Cao Su Thiên Nhiên
          </span>
          <span
            className="cursor-pointer hover:text-emerald-700 whitespace-nowrap"
            onClick={() => setCurrentPage('/dem-foam-oyasumi-aki')}
          >
            Đệm Foam Nhật Bản
          </span>
          <span
            className="cursor-pointer hover:text-emerald-700 whitespace-nowrap"
            onClick={() => setCurrentPage('/dem-cao-su-kim-cuong-happy-gold')}
          >
            Đệm Bông Ép
          </span>
          <span
            className="cursor-pointer hover:text-emerald-700 text-rose-600 font-bold whitespace-nowrap"
            onClick={() => setCurrentPage('/khuyen-mai-thang-10')}
          >
            Khuyến Mãi Đại Tiệc 25% 🔥
          </span>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8">
          {/* PRODUCT PAGE VIEW (When customer is viewing a specific mattress) */}
          {isProductPage ? (
            <div className="max-w-5xl mx-auto space-y-8">
              {/* Breadcrumb */}
              <div className="text-xs text-slate-500 flex items-center gap-1.5">
                <span>Trang chủ</span>
                <span>/</span>
                <span>{currentProduct.category}</span>
                <span>/</span>
                <span className="text-slate-900 font-semibold">{currentProduct.name}</span>
              </div>

              {/* Product main grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Images */}
                <div className="space-y-3">
                  <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm relative group">
                    <img
                      src={currentProduct.image}
                      alt={currentProduct.name}
                      className="w-full h-80 object-cover group-hover:scale-105 transition duration-500"
                    />
                    <span className="absolute top-3 left-3 bg-rose-600 text-white font-bold text-xs px-2.5 py-1 rounded-full shadow-md">
                      Tiết kiệm 20%
                    </span>
                    <span className="absolute top-3 right-3 bg-white/90 backdrop-blur-xs text-emerald-800 font-bold text-xs px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{currentProduct.warrantyYears} năm BH</span>
                    </span>
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="rounded-lg overflow-hidden border border-slate-200 h-16 cursor-pointer opacity-80 hover:opacity-100"
                      >
                        <img
                          src={currentProduct.image}
                          alt="thumbnail"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2 py-0.5 rounded">
                      {currentProduct.brand}
                    </span>
                    <span className="text-xs text-slate-500">Mã SKU: {currentProduct.sku}</span>
                    <div className="flex items-center gap-1 text-amber-500 text-xs ml-auto">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      <span className="font-bold text-slate-800">{currentProduct.rating}</span>
                      <span className="text-slate-400">({currentProduct.reviewCount} đánh giá)</span>
                    </div>
                  </div>

                  <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    {currentProduct.name}
                  </h1>

                  <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 flex items-baseline gap-3">
                    <span className="text-2xl font-black text-rose-600">
                      {currentProduct.salePrice.toLocaleString('vi-VN')}đ
                    </span>
                    <span className="text-sm line-through text-slate-400 font-medium">
                      {currentProduct.originalPrice.toLocaleString('vi-VN')}đ
                    </span>
                    <span className="text-xs bg-rose-100 text-rose-700 font-bold px-2 py-0.5 rounded ml-auto">
                      -15% Đại Tiệc Ngủ Ngon
                    </span>
                  </div>

                  {/* Mattress Attributes Matrix */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-slate-500 block text-[10px]">Độ dày đệm</span>
                      <span className="font-bold text-slate-800">{currentProduct.thickness}</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-slate-500 block text-[10px]">Độ cứng</span>
                      <span className="font-bold text-emerald-700">{currentProduct.firmness}</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-slate-500 block text-[10px]">Tồn kho sẵn</span>
                      <span className="font-bold text-slate-800">{currentProduct.stock} chiếc tại HN & HCM</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-slate-500 block text-[10px]">Bảo hành</span>
                      <span className="font-bold text-slate-800">{currentProduct.warrantyYears} năm chính hãng</span>
                    </div>
                  </div>

                  {/* Dimensions Selector */}
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1.5">
                      Chọn kích thước giường:
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {currentProduct.dimensions.map((dim, i) => (
                        <button
                          key={dim}
                          className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition ${
                            i === 2
                              ? 'bg-emerald-600 text-white border-emerald-600 font-bold'
                              : 'bg-white text-slate-700 border-slate-200 hover:border-emerald-500'
                          }`}
                        >
                          {dim}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Key Features List */}
                  <div className="space-y-1.5 pt-2">
                    <span className="text-xs font-bold text-slate-800">Đặc điểm nổi bật:</span>
                    {currentProduct.features.map((feat, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs text-slate-600">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>

                  {/* CTAs */}
                  <div className="grid grid-cols-2 gap-3 pt-3">
                    <button
                      onClick={() =>
                        sendCustomerMessage(
                          `Tôi muốn đặt mua ${currentProduct.name} kích thước 1m8 x 2m. Tư vấn giao hàng giúp tôi!`
                        )
                      }
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl text-xs sm:text-sm shadow-md transition flex items-center justify-center gap-1.5"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      <span>Đặt mua ngay</span>
                    </button>

                    <button
                      onClick={() =>
                        sendCustomerMessage(
                          `Mẫu ${currentProduct.name} này nằm có phù hợp với người bị đau lưng và vợ chồng khó ngủ không em?`
                        )
                      }
                      className="bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-bold py-3 rounded-xl text-xs sm:text-sm transition flex items-center justify-center gap-1.5"
                    >
                      <Sparkles className="w-4 h-4 text-amber-600" />
                      <span>Hỏi AI tư vấn mẫu này</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* HOME PAGE VIEW */
            <div className="space-y-10 max-w-6xl mx-auto">
              {/* Hero Banner */}
              <div className="rounded-3xl bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 text-white p-6 sm:p-10 shadow-xl relative overflow-hidden">
                <div className="max-w-xl space-y-4 relative z-10">
                  <span className="bg-amber-400 text-slate-950 font-black text-xs px-3 py-1 rounded-full uppercase tracking-wider inline-block">
                    Đại Tiệc Ngủ Ngon Tháng 10
                  </span>
                  <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
                    Giấc Ngủ Hoàn Hảo <br />
                    <span className="text-emerald-300">Chuẩn Y Khoa Cột Sống</span>
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                    Khám phá hơn 100+ dòng đệm lò xo túi, cao su thiên nhiên và foam Nhật Bản tại Đệm Xanh.
                    Trải nghiệm 30 đêm ngủ thử miễn phí tận nhà.
                  </p>
                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <button
                      onClick={() => setCurrentPage('/dem-lo-xo-dunlopillo-audrey')}
                      className="bg-white text-emerald-900 hover:bg-emerald-50 font-bold px-5 py-2.5 rounded-xl text-xs sm:text-sm transition shadow-lg"
                    >
                      Xem sản phẩm bán chạy
                    </button>
                    <button
                      onClick={() =>
                        sendCustomerMessage('Tư vấn giúp tôi 5 câu hỏi để chọn chiếc đệm phù hợp nhất')
                      }
                      className="bg-emerald-600/80 hover:bg-emerald-600 text-white border border-emerald-400/30 font-bold px-5 py-2.5 rounded-xl text-xs sm:text-sm transition flex items-center gap-2"
                    >
                      <Sparkles className="w-4 h-4 text-amber-300" />
                      <span>Tư vấn AI 1-kèm-1</span>
                    </button>
                  </div>
                </div>

                <div className="absolute right-0 bottom-0 top-0 w-1/3 opacity-20 lg:opacity-30 pointer-events-none hidden md:block">
                  <img
                    src="https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=800&q=80"
                    alt="banner"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Product Catalog Grid */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                      Top Đệm Bán Chạy Nhất Tại Hệ Thống Đệm Xanh
                    </h2>
                    <p className="text-xs text-slate-500">
                      Bảo hành chính hãng tới 12 năm • Hỗ trợ trả góp 0%
                    </p>
                  </div>
                  <span className="text-xs text-emerald-700 font-bold hover:underline cursor-pointer">
                    Xem tất cả 45 mẫu &gt;
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((p) => (
                    <div
                      key={p.id}
                      className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl hover:border-emerald-300 transition duration-300 flex flex-col group"
                    >
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={p.image}
                          alt={p.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                        />
                        <span className="absolute top-2 left-2 bg-emerald-700 text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                          {p.brand}
                        </span>
                        <span className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-xs text-white text-[10px] font-semibold px-2 py-0.5 rounded-md">
                          Độ cứng: {p.firmness}
                        </span>
                      </div>

                      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                        <div>
                          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                            <span>{p.category}</span>
                            <div className="flex items-center gap-1 text-amber-500 font-bold">
                              <Star className="w-3 h-3 fill-amber-400" />
                              <span>{p.rating}</span>
                            </div>
                          </div>
                          <h3
                            onClick={() => setCurrentPage(`/dem-${p.sku.toLowerCase()}`)}
                            className="font-bold text-sm text-slate-900 hover:text-emerald-700 cursor-pointer line-clamp-1"
                          >
                            {p.name}
                          </h3>
                          <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                            {p.description}
                          </p>
                        </div>

                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                          <div>
                            <span className="text-base font-black text-rose-600 block">
                              {p.salePrice.toLocaleString('vi-VN')}đ
                            </span>
                            <span className="text-[11px] line-through text-slate-400">
                              {p.originalPrice.toLocaleString('vi-VN')}đ
                            </span>
                          </div>

                          <button
                            onClick={() => {
                              setCurrentPage(`/dem-${p.sku.toLowerCase()}`);
                              sendCustomerMessage(
                                `Cho tôi xin tư vấn chi tiết về ${p.name} và quà tặng kèm nhé!`
                              );
                            }}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition shadow-xs flex items-center gap-1"
                          >
                            <span>Tư vấn</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Website Footer */}
        <div className="bg-slate-900 text-slate-400 text-xs py-8 px-6 border-t border-slate-800 mt-auto">
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="space-y-2">
              <div className="font-black text-white text-base">ĐỆM XANH</div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Hệ sinh thái phân phối chăn ga gối đệm chính hãng số 1 tại Việt Nam. Cam kết 100% hàng chuẩn thương hiệu Dunlopillo, Liên Á, Kim Cương, Oyasumi, Everon, Sông Hồng.
              </p>
            </div>
            <div>
              <div className="font-bold text-white mb-2">Hỗ trợ khách hàng</div>
              <ul className="space-y-1 text-[11px]">
                <li>Chính sách 30 ngày ngủ thử</li>
                <li>Chính sách vận chuyển & bưng vác</li>
                <li>Chính sách bảo hành đổi trả</li>
                <li>Hướng dẫn thanh toán trả góp 0%</li>
              </ul>
            </div>
            <div>
              <div className="font-bold text-white mb-2">Tổng đài tư vấn</div>
              <ul className="space-y-1 text-[11px]">
                <li className="text-white font-bold">Hotline: 1800 6250 (Miễn phí cước)</li>
                <li>Hotline Miền Bắc (Zalo): 0962 701 701</li>
                <li>Hotline Miền Nam (Zalo): 0971 022 062</li>
                <li>Kỹ thuật & bảo hành: 0981 212 212</li>
                <li>Giờ mở cửa: 8h00 - 21h30 hàng ngày</li>
              </ul>
            </div>
            <div>
              <div className="font-bold text-white mb-2">Chứng nhận uy tín</div>
              <p className="text-[11px] text-slate-400">
                Đệm Xanh vinh dự nhận cúp Thương hiệu Đệm được yêu thích nhất 2025 do người tiêu dùng bình chọn.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Embedded Customer Chatbot Widget */}
      <ChatWidget />
    </div>
  );
};
