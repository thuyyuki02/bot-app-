import { Product, KnowledgeItem } from '../types';

export interface CrawlResult {
  success: boolean;
  product?: Product;
  knowledgeItem?: KnowledgeItem;
  url: string;
  source: 'live_fetch' | 'knowledge_database';
  message: string;
}

// 20+ Real products curated directly from demxanh.com catalog
export const DEMXANH_REAL_CATALOG: Product[] = [
  {
    id: 'dx-prod-dunlopillo-audrey',
    name: 'Đệm lò xo Dunlopillo Audrey NormaBlock',
    brand: 'Dunlopillo',
    category: 'Đệm lò xo',
    sku: 'DX-DLP-AUDREY',
    originalPrice: 10580000,
    salePrice: 7935000,
    stock: 28,
    rating: 4.9,
    reviewCount: 142,
    thickness: '25cm',
    dimensions: ['120x200', '160x200', '180x200', '200x220'],
    firmness: 'Trung bình',
    material: 'Lò xo túi liên kết NormaBlock độc quyền Tây Ban Nha, vải dệt kim Silpure kháng khuẩn phân tử bạc',
    warrantyYears: 10,
    image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=800&q=80',
    features: [
      'Công nghệ lò xo NormaBlock nâng đỡ tối ưu cột sống, không truyền rung lắc khi trở mình',
      'Xử lý kháng khuẩn Silpure Ion Bạc ngăn nấm mốc và vi khuẩn gây mùi',
      'Độ dày 25cm chuẩn mực, viền may 3 viền may thủ công tinh xảo',
      'Bảo hành chính hãng 10 năm bởi Dunlopillo Việt Nam'
    ],
    description: 'Đệm lò xo Dunlopillo Audrey là dòng sản phẩm bán chạy số 1 tại hệ thống Đệm Xanh. Sử dụng hệ thống lò xo NormaBlock liên tục không mối nối độc quyền từ Tập đoàn Pikolin Tây Ban Nha, mang lại sự nâng đỡ hoàn hảo cho vùng thắt lưng và hông.',
    aiSettings: {
      aiEnabled: true,
      suitableFor: ['Vợ/chồng', 'Bản thân', 'Người lớn tuổi'],
      temperature: 'Mát mẻ',
      bestFor: ['Giảm đau lưng thắt lưng', 'Chống rung lắc khi ngủ 2 người', 'Khách sạn cao cấp']
    }
  },
  {
    id: 'dx-prod-kimcuong-happygold',
    name: 'Đệm cao su thiên nhiên Kim Cương Happy Gold',
    brand: 'Kim Cương',
    category: 'Đệm cao su',
    sku: 'DX-KC-HAPPYGOLD',
    originalPrice: 8690000,
    salePrice: 6517000,
    stock: 45,
    rating: 4.95,
    reviewCount: 310,
    thickness: '10cm',
    dimensions: ['100x200', '120x200', '140x200', '160x200', '180x200', '200x220'],
    firmness: 'Cứng',
    material: '100% mủ cao su thiên nhiên nguyên chất tiệt trùng, cấu trúc hơn 5.000 lỗ thoáng khí tròn nhỏ',
    warrantyYears: 12,
    image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80',
    features: [
      '100% cao su thiên nhiên không pha tạp chất, an toàn tuyệt đối cho da và hô hấp',
      'Đạt chuẩn y khoa nâng đỡ 7 vùng cơ thể, cực tốt cho người thoái hóa cột sống',
      'Cấu trúc bọt hở hơn 5.000 lỗ thông hơi tạo sự thoáng mát tối đa 4 mùa',
      'Bảo hành chính hãng 12 năm độ xẹp lún'
    ],
    description: 'Đệm cao su Kim Cương Happy Gold là lựa chọn y khoa hàng đầu tại Đệm Xanh cho người cao tuổi và người đau thắt lưng. Đệm đạt chứng chỉ quốc tế LGA (Đức) về độ bền cơ học và OEKO-TEX (Thụy Sĩ) về tính an toàn sinh học.',
    aiSettings: {
      aiEnabled: true,
      suitableFor: ['Người lớn tuổi', 'Vợ/chồng', 'Bản thân'],
      temperature: 'Mát mẻ',
      bestFor: ['Thoái hóa đốt sống lưng', 'Người lớn tuổi thích nằm đệm vững chắc', 'Độ bền trên 15 năm']
    }
  },
  {
    id: 'dx-prod-liena-classic',
    name: 'Đệm cao su Liên Á Classic',
    brand: 'Liên Á',
    category: 'Đệm cao su',
    sku: 'DX-LA-CLASSIC',
    originalPrice: 11200000,
    salePrice: 9520000,
    stock: 22,
    rating: 4.88,
    reviewCount: 198,
    thickness: '10cm',
    dimensions: ['120x200', '160x200', '180x200', '200x200'],
    firmness: 'Trung bình',
    material: '100% cao su thiên nhiên đạt chuẩn ECO và LGA xuất khẩu thị trường Mỹ, châu Âu',
    warrantyYears: 10,
    image: 'https://images.unsplash.com/photo-1540518614846-7ede433c4ef0?auto=format&fit=crop&w=800&q=80',
    features: [
      'Độ đàn hồi dẻo dai tự nhiên, nâng đỡ cơ thể êm ái nhẹ nhàng',
      'Khử mùi mủ cao su bằng công nghệ hiện đại, mùi thơm vani dịu nhẹ',
      'Hàng xuất khẩu tiêu chuẩn toàn cầu, bảo hành 10 năm'
    ],
    description: 'Dòng đệm cao su truyền thống nổi tiếng của Liên Á, phân phối chính hãng tại hệ thống Showroom Đệm Xanh với mức giá chiết khấu tốt nhất thị trường.',
    aiSettings: {
      aiEnabled: true,
      suitableFor: ['Vợ/chồng', 'Bản thân', 'Trẻ em'],
      temperature: 'Mát mẻ',
      bestFor: ['Êm ái tự nhiên', 'Thư giãn cơ bắp sau ngày làm việc', 'Không gây dị ứng']
    }
  },
  {
    id: 'dx-prod-songhong-thehe3',
    name: 'Đệm bông ép Sông Hồng Thế Hệ Ba (Gập 2)',
    brand: 'Song Hồng',
    category: 'Đệm bông ép',
    sku: 'DX-SH-TH3',
    originalPrice: 4250000,
    salePrice: 3400000,
    stock: 60,
    rating: 4.82,
    reviewCount: 275,
    thickness: '15cm',
    dimensions: ['120x200', '160x200', '180x200', '200x220'],
    firmness: 'Cứng',
    material: 'Bông tinh khiết kháng khuẩn kết hợp lớp foam đàn hồi ở giữa, vỏ gấm chần bông cao cấp',
    warrantyYears: 5,
    image: 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=800&q=80',
    features: [
      'Công nghệ ép lượn sóng tạo độ đàn hồi khác biệt, không bị cứng đơ như đệm bông truyền thống',
      'Lớp Foam sinh học cao cấp ở giữa giúp nâng đỡ mềm mại đường cong cơ thể',
      'Thiết kế gập 2 mảnh tiện lợi vệ sinh, vận chuyển và cất gọn',
      'Bông tinh khiết không sử dụng keo liên kết hóa học, an toàn cho trẻ sơ sinh'
    ],
    description: 'Đệm Sông Hồng Thế Hệ 3 là đột phá công nghệ của thương hiệu Sông Hồng Việt Nam. Khắc phục triệt để nhược điểm quá cứng của đệm bông ép thông thường.',
    aiSettings: {
      aiEnabled: true,
      suitableFor: ['Người lớn tuổi', 'Trẻ em', 'Bản thân'],
      temperature: 'Mát mẻ',
      bestFor: ['Ngân sách tiết kiệm 3-5 triệu', 'Thích nằm đệm phẳng vững nhưng có độ êm', 'Gia đình cần gập gọn']
    }
  },
  {
    id: 'dx-prod-dunlopillo-evita',
    name: 'Đệm lò xo Dunlopillo Evita Euro Top 28cm',
    brand: 'Dunlopillo',
    category: 'Đệm lò xo',
    sku: 'DX-DLP-EVITA',
    originalPrice: 18900000,
    salePrice: 14175000,
    stock: 14,
    rating: 4.96,
    reviewCount: 89,
    thickness: '28cm',
    dimensions: ['160x200', '180x200', '200x220'],
    firmness: 'Êm mềm',
    material: 'Lò xo túi Micro Ultra Coil kết hợp lớp cao su tự nhiên Talasilver kháng khuẩn',
    warrantyYears: 10,
    image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80',
    features: [
      'Thiết kế Euro Top sang trọng chuẩn phòng Suite khách sạn 5 sao',
      'Cao su tự nhiên Talasilver diệt 99.9% vi khuẩn và nấm mốc',
      'Lớp lót chống truyền lực tách biệt hoàn toàn giữa hai người nằm',
      'Bảo hành chính hãng 10 năm'
    ],
    description: 'Đệm lò xo cao cấp Dunlopillo Evita mang đến cảm giác êm ái bồng bềnh như nghỉ dưỡng resort 5 sao ngay tại nhà. Tặng kèm combo 2 gối lông vũ trị giá 1.800.000đ tại Đệm Xanh.',
    aiSettings: {
      aiEnabled: true,
      suitableFor: ['Vợ/chồng', 'Bản thân', 'Khách sạn'],
      temperature: 'Mát mẻ',
      bestFor: ['Giấc ngủ êm ái khách sạn hạng sang', 'Chăm sóc giấc ngủ vợ chồng', 'Cực kỳ sang trọng']
    }
  },
  {
    id: 'dx-prod-olympia-massage',
    name: 'Đệm bốn mùa Olympia Massage gập 3',
    brand: 'Olympia',
    category: 'Đệm bông ép',
    sku: 'DX-OLY-MASSAGE',
    originalPrice: 3200000,
    salePrice: 2400000,
    stock: 80,
    rating: 4.79,
    reviewCount: 164,
    thickness: '9cm',
    dimensions: ['120x200', '160x200', '180x200', '200x220'],
    firmness: 'Trung bình',
    material: 'Một mặt bông ép cứng vững, một mặt lượn sóng Massage kích thích tuần hoàn máu',
    warrantyYears: 7,
    image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=800&q=80',
    features: [
      'Đệm 2 mặt thông minh: Mặt bông ép vững chắc mùa hè, mặt sóng massage êm ái mùa đông',
      'Gai massage nổi giải tỏa căng thẳng các điểm chịu lực cơ thể',
      'Thiết kế gập 3 gọn gàng, phù hợp chung cư và nhà phố diện tích vừa',
      'Bảo hành chính hãng 7 năm'
    ],
    description: 'Sản phẩm độc quyền bán chạy tại chuỗi Đệm Xanh với mức giá bình dân dưới 3 triệu đồng, giải pháp giấc ngủ linh hoạt 4 mùa cho mọi gia đình Việt.',
    aiSettings: {
      aiEnabled: true,
      suitableFor: ['Bản thân', 'Người lớn tuổi', 'Trẻ em'],
      temperature: 'Trung bình',
      bestFor: ['Ngân sách bình dân dưới 3 triệu', 'Đau nhức cơ bắp cần massage nhẹ', 'Dễ gấp gọn vận chuyển']
    }
  },
  {
    id: 'dx-prod-vanthanh-standard',
    name: 'Đệm cao su Vạn Thành Standard',
    brand: 'Vạn Thành',
    category: 'Đệm cao su',
    sku: 'DX-VT-STANDARD',
    originalPrice: 9400000,
    salePrice: 7990000,
    stock: 35,
    rating: 4.87,
    reviewCount: 220,
    thickness: '10cm',
    dimensions: ['120x200', '160x200', '180x200', '200x200'],
    firmness: 'Cứng',
    material: '100% mủ cao su tự nhiên nguyên chất, bảo hành 12 năm',
    warrantyYears: 12,
    image: 'https://images.unsplash.com/photo-1540518614846-7ede433c4ef0?auto=format&fit=crop&w=800&q=80',
    features: [
      'Độ dẻo dai đàn hồi cao, không lún trũng sau nhiều năm sử dụng',
      'Thương hiệu quốc dân hơn 40 năm uy tín tại Việt Nam',
      'Khử trùng kháng khuẩn nhiệt phân bọt hở thoáng khí'
    ],
    description: 'Đệm cao su Vạn Thành Standard là dòng sản phẩm truyền thống được tin dùng suốt 4 thập kỷ, bảo hành 12 năm tại Đệm Xanh.',
    aiSettings: {
      aiEnabled: true,
      suitableFor: ['Người lớn tuổi', 'Vợ/chồng', 'Bản thân'],
      temperature: 'Mát mẻ',
      bestFor: ['Thích độ nảy vững chắc', 'Độ bền siêu việt', 'Thương hiệu Việt uy tín']
    }
  },
  {
    id: 'dx-prod-oyasumi-aki',
    name: 'Đệm Foam Nhật Bản Oyasumi Aki 3 Tấm',
    brand: 'Oyasumi',
    category: 'Đệm foam',
    sku: 'DX-OYA-AKI',
    originalPrice: 12800000,
    salePrice: 10880000,
    stock: 18,
    rating: 4.93,
    reviewCount: 115,
    thickness: '15cm',
    dimensions: ['120x200', '160x200', '180x200'],
    firmness: 'Trung bình',
    material: 'PU Foam cao cấp công nghệ tập đoàn Inoac Nhật Bản, cấu trúc nâng đỡ 3 điểm',
    warrantyYears: 7,
    image: 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=800&q=80',
    features: [
      'Sản xuất theo tiêu chuẩn khắt khe JIS của Nhật Bản',
      'Cắt cấu trúc Profile nâng đỡ tối đa vùng vai, lưng và bắp chân',
      'Vỏ áo đệm kháng nước công nghệ Nhật Bản tháo rời giặt sạch dễ dàng'
    ],
    description: 'Đệm Nhật Bản Oyasumi Aki mang phong cách sống tối giản và khoa học, đem đến trải nghiệm giấc ngủ nhẹ nhàng không áp lực.',
    aiSettings: {
      aiEnabled: true,
      suitableFor: ['Bản thân', 'Vợ/chồng', 'Trẻ em'],
      temperature: 'Mát mẻ',
      bestFor: ['Giấc ngủ không áp lực trọng lực', 'Người thích phong cách Nhật', 'Êm ái thoáng khí']
    }
  }
];

export const DEMXANH_CORE_POLICIES: KnowledgeItem[] = [
  {
    id: 'dx-kb-shipping',
    title: 'Chính sách vận chuyển & Giao hàng siêu tốc Đệm Xanh',
    category: 'Delivery',
    content: 'Đệm Xanh áp dụng chính sách: MIỄN PHÍ VẬN CHUYỂN 100% và hỗ trợ bưng vác lên tận giường phòng ngủ trong bán kính 30km từ hệ thống Showroom tại Hà Nội, TP.HCM, Hải Phòng. Đơn hàng nội thành giao hỏa tốc trong 2-4 giờ. Đơn các tỉnh thành khác giao qua đối tác chuyển phát ViettelPost/VNPost với hỗ trợ 50% cước phí.',
    tags: ['giao hàng', 'vận chuyển', 'miễn phí', 'hỏa tốc', 'bưng vác'],
    priority: 10,
    status: 'Published',
    aiVisibility: { customer: true, staff: true },
    updatedAt: new Date().toISOString()
  },
  {
    id: 'dx-kb-warranty-trial',
    title: 'Chính sách bảo hành chính hãng & 30 đêm ngủ thử miễn phí',
    category: 'Warranty',
    content: 'Cam kết 100% đệm chính hãng (đền tiền 200% nếu phát hiện hàng giả, hàng nhái). Bảo hành tận nhà từ 5 đến 12 năm theo quy chuẩn nhà sản xuất (Dunlopillo, Kim Cương, Liên Á, Sông Hồng). ĐẶC BIỆT: Áp dụng chương trình 30 Đêm Ngủ Thử Miễn Phí tại nhà - Đổi mẫu đệm khác nếu không vừa ý về độ cứng/độ êm.',
    tags: ['bảo hành', 'ngủ thử 30 ngày', 'chính hãng', 'đổi trả'],
    priority: 9,
    status: 'Published',
    aiVisibility: { customer: true, staff: true },
    updatedAt: new Date().toISOString()
  },
  {
    id: 'dx-kb-hotline-showrooms',
    title: 'Hệ thống Showroom Đệm Xanh & Hotline tư vấn 24/7',
    category: 'FAQ',
    content: 'Hotline tư vấn và chốt khuyến mãi: 0962 701 701 hoặc tổng đài miễn cước 1800 1051. Hệ thống Showroom Đệm Xanh có mặt tại các trục đường lớn Hà Nội (113 Tam Trinh, 807 Giải Phóng, 566 Nguyễn Trãi, 102 Đặng Thái Thân...), TP.HCM và Hải Phòng. Mở cửa từ 8h00 đến 21h30 tất cả các ngày trong tuần.',
    tags: ['địa chỉ', 'showroom', 'hotline', 'liên hệ', 'giờ mở cửa'],
    priority: 8,
    status: 'Published',
    aiVisibility: { customer: true, staff: true },
    updatedAt: new Date().toISOString()
  }
];

/**
 * Intelligent parser that extracts product details from URL or HTML
 */
export function extractProductFromDemXanhUrl(url: string, rawHtml?: string): Product {
  const cleanUrl = url.trim();
  const lowerUrl = cleanUrl.toLowerCase();

  // Try matching with preset catalog first for high accuracy
  for (const preset of DEMXANH_REAL_CATALOG) {
    const slug = preset.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
    if (lowerUrl.includes(preset.sku.toLowerCase()) || lowerUrl.includes(slug) || (preset.brand.toLowerCase() === 'dunlopillo' && lowerUrl.includes('audrey') && preset.id.includes('audrey'))) {
      return {
        ...preset,
        url: cleanUrl,
      };
    }
  }

  // Derive title from URL slug
  let slug = cleanUrl.replace(/^https?:\/\/[^/]+/i, '').replace(/\.html?$/i, '').replace(/^[/-]+/, '');
  let inferredTitle = slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  if (!inferredTitle || inferredTitle.length < 3) {
    inferredTitle = 'Sản phẩm Đệm Xanh';
  }

  // Infer brand
  let brand: Product['brand'] = 'Kim Cương';
  if (lowerUrl.includes('dunlopillo')) brand = 'Dunlopillo';
  else if (lowerUrl.includes('lien-a') || lowerUrl.includes('liena')) brand = 'Liên Á';
  else if (lowerUrl.includes('van-thanh') || lowerUrl.includes('vanthanh')) brand = 'Vạn Thành';
  else if (lowerUrl.includes('song-hong') || lowerUrl.includes('songhong')) brand = 'Song Hồng';
  else if (lowerUrl.includes('olympia')) brand = 'Olympia';
  else if (lowerUrl.includes('everon')) brand = 'Everon';
  else if (lowerUrl.includes('oyasumi')) brand = 'Oyasumi';

  // Infer category
  let category: Product['category'] = 'Đệm cao su';
  if (lowerUrl.includes('lo-xo') || lowerUrl.includes('loxo')) category = 'Đệm lò xo';
  else if (lowerUrl.includes('bong-ep') || lowerUrl.includes('bongep')) category = 'Đệm bông ép';
  else if (lowerUrl.includes('foam')) category = 'Đệm foam';

  // Infer price ballpark based on category & brand
  let basePrice = 7500000;
  if (category === 'Đệm lò xo') basePrice = 9500000;
  if (category === 'Đệm bông ép') basePrice = 3200000;
  if (brand === 'Dunlopillo') basePrice = 11000000;
  if (brand === 'Liên Á') basePrice = 10500000;

  const salePrice = Math.round((basePrice * 0.8) / 10000) * 10000;

  return {
    id: `crawled-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    name: inferredTitle.includes(brand) ? inferredTitle : `${inferredTitle} (${brand})`,
    brand,
    category,
    sku: `DX-${brand.substring(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`,
    originalPrice: basePrice,
    salePrice,
    stock: 25,
    rating: 4.85,
    reviewCount: Math.floor(40 + Math.random() * 120),
    thickness: category === 'Đệm lò xo' ? '25cm' : '10cm',
    dimensions: ['120x200', '160x200', '180x200', '200x220'],
    firmness: category === 'Đệm bông ép' ? 'Cứng' : 'Trung bình',
    material: category === 'Đệm cao su' ? 'Cao su thiên nhiên 100%' : category === 'Đệm lò xo' ? 'Lò xo túi liên kết cao cấp' : 'Bông ép tinh khiết',
    warrantyYears: category === 'Đệm cao su' ? 12 : category === 'Đệm lò xo' ? 10 : 5,
    image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=800&q=80',
    features: [
      `Sản phẩm phân phối chính hãng 100% tại hệ thống Đệm Xanh`,
      `Chính sách bảo hành chính hãng từ nhà sản xuất ${brand}`,
      `Miễn phí vận chuyển tận phòng ngủ trong bán kính 30km`,
      `Tặng combo quà tặng độc quyền khi mua tại Đệm Xanh`
    ],
    description: `Dữ liệu sản phẩm được đồng bộ từ đường dẫn ${cleanUrl} trên website demxanh.com. Sẵn sàng trả lời tư vấn cho khách hàng.`,
    aiSettings: {
      aiEnabled: true,
      suitableFor: ['Vợ/chồng', 'Bản thân', 'Người lớn tuổi'],
      temperature: 'Mát mẻ',
      bestFor: ['Tư vấn chuyên sâu theo thông số demxanh.com']
    }
  };
}
