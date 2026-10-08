import { DatabaseTableDefinition, ApiEndpointDefinition } from '../types';

export const DATABASE_TABLES: DatabaseTableDefinition[] = [
  // 1. CATALOG GROUP
  {
    name: 'products',
    group: 'CATALOG',
    description: 'Bảng dữ liệu sản phẩm trung tâm (Dunlopillo, Liên Á, Kim Cương, Oyasumi, Everon...)',
    columns: [
      { name: 'id', type: 'UUID', nullable: false, isPrimary: true, description: 'Khóa chính UUID' },
      { name: 'category_id', type: 'UUID', nullable: false, isForeign: true, foreignRef: 'categories(id)', description: 'Danh mục đệm' },
      { name: 'brand_id', type: 'UUID', nullable: false, isForeign: true, foreignRef: 'brands(id)', description: 'Thương hiệu sản xuất' },
      { name: 'sku', type: 'VARCHAR(100)', nullable: false, description: 'Mã định danh sản phẩm' },
      { name: 'name', type: 'VARCHAR(500)', nullable: false, description: 'Tên đệm thương mại' },
      { name: 'slug', type: 'VARCHAR(500)', nullable: false, description: 'Slug URL trên demxanh.com' },
      { name: 'base_price', type: 'NUMERIC(15,2)', nullable: false, description: 'Giá niêm yết hãng' },
      { name: 'sale_price', type: 'NUMERIC(15,2)', nullable: false, description: 'Giá bán khuyến mãi thực tế' },
      { name: 'warranty_months', type: 'INT', nullable: true, description: 'Số tháng bảo hành chính hãng' },
      { name: 'firmness_score', type: 'NUMERIC(3,1)', nullable: true, description: 'Thang độ cứng (1.0 = Cực mềm, 10.0 = Cực cứng)' },
      { name: 'material', type: 'VARCHAR(255)', nullable: true, description: 'Chất liệu (Cao su thiên nhiên, Lò xo túi, Foam, Bông ép)' },
      { name: 'ai_enabled', type: 'BOOLEAN', nullable: false, description: 'Cho phép AI đề xuất cho khách' },
      { name: 'status', type: 'VARCHAR(30)', nullable: false, description: 'active / inactive / out_of_stock' },
      { name: 'metadata', type: 'JSONB', nullable: true, description: 'Thuộc tính mở rộng AI (suitable_for, best_for)' },
    ],
    sqlDDL: `CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID REFERENCES categories(id),
    brand_id UUID REFERENCES brands(id),
    sku VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(500) NOT NULL,
    slug VARCHAR(500) UNIQUE NOT NULL,
    short_description TEXT,
    description TEXT,
    base_price NUMERIC(15,2) NOT NULL,
    sale_price NUMERIC(15,2) NOT NULL,
    warranty_months INT DEFAULT 120,
    firmness_score NUMERIC(3,1),
    material VARCHAR(255),
    thickness_min NUMERIC(8,2),
    thickness_max NUMERIC(8,2),
    ai_enabled BOOLEAN DEFAULT TRUE,
    status VARCHAR(30) DEFAULT 'active',
    source_url TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);`,
  },
  {
    name: 'product_variants',
    group: 'CATALOG',
    description: 'Biến thể kích thước giường (1m2x2m, 1m4x2m, 1m6x2m, 1m8x2m, 2mx2m) và độ dày',
    columns: [
      { name: 'id', type: 'UUID', nullable: false, isPrimary: true, description: 'Khóa chính UUID' },
      { name: 'product_id', type: 'UUID', nullable: false, isForeign: true, foreignRef: 'products(id)', description: 'Thuộc về sản phẩm' },
      { name: 'sku', type: 'VARCHAR(100)', nullable: false, description: 'SKU biến thể kích thước' },
      { name: 'width', type: 'NUMERIC(8,2)', nullable: false, description: 'Chiều rộng (cm, ví dụ 180)' },
      { name: 'length', type: 'NUMERIC(8,2)', nullable: false, description: 'Chiều dài (cm, ví dụ 200)' },
      { name: 'height', type: 'NUMERIC(8,2)', nullable: false, description: 'Độ dày đệm (cm, ví dụ 25)' },
      { name: 'price', type: 'NUMERIC(15,2)', nullable: false, description: 'Giá niêm yết kích thước này' },
      { name: 'sale_price', type: 'NUMERIC(15,2)', nullable: false, description: 'Giá bán thực tế kích thước này' },
    ],
    sqlDDL: `CREATE TABLE product_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    sku VARCHAR(100) UNIQUE NOT NULL,
    width NUMERIC(8,2) NOT NULL,
    length NUMERIC(8,2) NOT NULL,
    height NUMERIC(8,2) NOT NULL,
    price NUMERIC(15,2) NOT NULL,
    sale_price NUMERIC(15,2) NOT NULL,
    weight NUMERIC(8,2),
    status VARCHAR(30) DEFAULT 'active',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);`,
  },
  {
    name: 'inventory',
    group: 'CATALOG',
    description: 'Tồn kho thời gian thực theo từng kho Showroom (AI không tự suy đoán tồn)',
    columns: [
      { name: 'id', type: 'UUID', nullable: false, isPrimary: true, description: 'Khóa chính' },
      { name: 'variant_id', type: 'UUID', nullable: false, isForeign: true, foreignRef: 'product_variants(id)', description: 'Biến thể kích thước' },
      { name: 'warehouse_id', type: 'UUID', nullable: false, description: 'Mã showroom/kho (Cầu Giấy, Đống Đa, HCM...)' },
      { name: 'quantity', type: 'INT', nullable: false, description: 'Số lượng thực tế còn trong kho' },
      { name: 'reserved_quantity', type: 'INT', nullable: false, description: 'Số lượng khách đã đặt cọc giữ chỗ' },
    ],
    sqlDDL: `CREATE TABLE inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    variant_id UUID REFERENCES product_variants(id),
    warehouse_id UUID,
    quantity INT DEFAULT 0,
    reserved_quantity INT DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);`,
  },
  {
    name: 'product_attributes',
    group: 'CATALOG',
    description: 'Thuộc tính chi tiết đệm hỗ trợ Recommendation Engine (độ thoáng khí, chống rung, y khoa)',
    columns: [
      { name: 'id', type: 'UUID', nullable: false, isPrimary: true, description: 'Khóa chính' },
      { name: 'product_id', type: 'UUID', nullable: false, isForeign: true, foreignRef: 'products(id)', description: 'Sản phẩm' },
      { name: 'attribute_name', type: 'VARCHAR(100)', nullable: false, description: 'Tên thuộc tính (thoang_khi, chong_rung, do_cung...)' },
      { name: 'attribute_value', type: 'TEXT', nullable: false, description: 'Giá trị thuộc tính' },
      { name: 'searchable', type: 'BOOLEAN', nullable: false, description: 'Có index tìm kiếm AI không' },
    ],
    sqlDDL: `CREATE TABLE product_attributes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id),
    attribute_name VARCHAR(100) NOT NULL,
    attribute_value TEXT NOT NULL,
    searchable BOOLEAN DEFAULT TRUE
);`,
  },

  // 2. CUSTOMER & PROFILES GROUP
  {
    name: 'customer_profiles',
    group: 'CUSTOMER',
    description: 'Hồ sơ Sleep Profile AI bóc tách từ hội thoại (kích thước, ngân sách, số người ngủ, đau lưng)',
    columns: [
      { name: 'id', type: 'UUID', nullable: false, isPrimary: true, description: 'Khóa chính' },
      { name: 'customer_id', type: 'UUID', nullable: false, isForeign: true, foreignRef: 'customers(id)', description: 'Khách hàng' },
      { name: 'mattress_size', type: 'VARCHAR(50)', nullable: true, description: 'Kích thước giường (180x200, 160x200...)' },
      { name: 'budget_min', type: 'NUMERIC(15,2)', nullable: true, description: 'Ngân sách tối thiểu (VNĐ)' },
      { name: 'budget_max', type: 'NUMERIC(15,2)', nullable: true, description: 'Ngân sách tối đa (VNĐ)' },
      { name: 'firmness_preference', type: 'VARCHAR(30)', nullable: true, description: 'Sở thích độ cứng (soft / medium / firm)' },
      { name: 'sleeper_count', type: 'INT', nullable: true, description: 'Số người nằm (1 hoặc 2)' },
      { name: 'age_group', type: 'VARCHAR(50)', nullable: true, description: 'Độ tuổi (trẻ em, thanh niên, người già)' },
      { name: 'purpose', type: 'VARCHAR(100)', nullable: true, description: 'Mục đích (ngủ hàng ngày, khách sạn, phòng trọ)' },
      { name: 'special_needs', type: 'TEXT', nullable: true, description: 'Vấn đề cột sống: đau lưng, thoái hóa, thoát vị' },
      { name: 'preferences', type: 'JSONB', nullable: true, description: 'Tiêu chí phụ: thoáng mát, không rung' },
    ],
    sqlDDL: `CREATE TABLE customer_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES customers(id),
    mattress_size VARCHAR(50),
    budget_min NUMERIC(15,2),
    budget_max NUMERIC(15,2),
    firmness_preference VARCHAR(30),
    sleeper_count INT,
    age_group VARCHAR(50),
    purpose VARCHAR(100),
    special_needs TEXT,
    preferred_brands JSONB,
    preferences JSONB,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);`,
  },
  {
    name: 'leads',
    group: 'CUSTOMER',
    description: 'Khách hàng tiềm năng tạo từ Chatbot với điểm số Lead Score và phân bổ Sales',
    columns: [
      { name: 'id', type: 'UUID', nullable: false, isPrimary: true, description: 'Khóa chính' },
      { name: 'customer_id', type: 'UUID', nullable: false, isForeign: true, foreignRef: 'customers(id)', description: 'Mã khách' },
      { name: 'conversation_id', type: 'UUID', nullable: false, isForeign: true, foreignRef: 'conversations(id)', description: 'Phiên chat gốc' },
      { name: 'status', type: 'VARCHAR(50)', nullable: false, description: 'new / contacted / qualified / negotiating / won / lost' },
      { name: 'score', type: 'INT', nullable: false, description: 'Điểm số 0 - 100 (>= 80 là Hot Lead)' },
      { name: 'intent', type: 'VARCHAR(100)', nullable: true, description: 'Ý định mua hàng nhận diện bởi AI' },
      { name: 'estimated_value', type: 'NUMERIC(15,2)', nullable: true, description: 'Giá trị đơn hàng dự kiến' },
      { name: 'assigned_to', type: 'UUID', nullable: true, isForeign: true, foreignRef: 'users(id)', description: 'Nhân viên Sales phụ trách' },
    ],
    sqlDDL: `CREATE TABLE leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES customers(id),
    conversation_id UUID REFERENCES conversations(id),
    status VARCHAR(50) DEFAULT 'new',
    score INT DEFAULT 0,
    intent VARCHAR(100),
    estimated_value NUMERIC(15,2),
    assigned_to UUID REFERENCES users(id),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);`,
  },

  // 3. CHAT & MESSAGE SOURCES GROUP
  {
    name: 'conversation_messages',
    group: 'CHAT',
    description: 'Tin nhắn hội thoại giữa khách hàng, AI và nhân viên Showroom',
    columns: [
      { name: 'id', type: 'UUID', nullable: false, isPrimary: true, description: 'Khóa chính' },
      { name: 'conversation_id', type: 'UUID', nullable: false, isForeign: true, foreignRef: 'conversations(id)', description: 'Hội thoại' },
      { name: 'role', type: 'VARCHAR(30)', nullable: false, description: 'user / assistant / system / agent' },
      { name: 'content', type: 'TEXT', nullable: false, description: 'Nội dung tin nhắn' },
      { name: 'message_type', type: 'VARCHAR(50)', nullable: false, description: 'text / product / comparison / lead_form / handoff' },
      { name: 'metadata', type: 'JSONB', nullable: true, description: 'Chứa product_id, scores, intent' },
    ],
    sqlDDL: `CREATE TABLE conversation_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    role VARCHAR(30) NOT NULL,
    content TEXT NOT NULL,
    message_type VARCHAR(50) DEFAULT 'text',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);`,
  },
  {
    name: 'message_sources',
    group: 'CHAT',
    description: 'Nguồn trích dẫn RAG & Database mà AI đã dùng cho tin nhắn (chống Hallucination)',
    columns: [
      { name: 'id', type: 'UUID', nullable: false, isPrimary: true, description: 'Khóa chính' },
      { name: 'message_id', type: 'UUID', nullable: false, isForeign: true, foreignRef: 'conversation_messages(id)', description: 'Tin nhắn AI' },
      { name: 'source_type', type: 'VARCHAR(50)', nullable: false, description: 'product / knowledge_chunk / policy / inventory' },
      { name: 'source_id', type: 'UUID', nullable: false, description: 'ID của sản phẩm hoặc đoạn RAG' },
      { name: 'relevance_score', type: 'NUMERIC(5,4)', nullable: false, description: 'Điểm khớp ngữ nghĩa Vector (0.0000 - 1.0000)' },
    ],
    sqlDDL: `CREATE TABLE message_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID REFERENCES conversation_messages(id),
    source_type VARCHAR(50) NOT NULL,
    source_id UUID NOT NULL,
    relevance_score NUMERIC(5,4) NOT NULL,
    metadata JSONB DEFAULT '{}'
);`,
  },

  // 4. AI KNOWLEDGE & VECTOR GROUP
  {
    name: 'knowledge_chunks',
    group: 'AI KNOWLEDGE',
    description: 'Đoạn phân rã RAG lưu trữ Vector Embeddings pgvector (vector 1536 cosine index)',
    columns: [
      { name: 'id', type: 'UUID', nullable: false, isPrimary: true, description: 'Khóa chính' },
      { name: 'document_id', type: 'UUID', nullable: false, isForeign: true, foreignRef: 'knowledge_documents(id)', description: 'Văn bản gốc' },
      { name: 'chunk_index', type: 'INT', nullable: false, description: 'Thứ tự đoạn văn bản' },
      { name: 'content', type: 'TEXT', nullable: false, description: 'Nội dung đoạn trích xuất' },
      { name: 'embedding', type: 'vector(1536)', nullable: false, description: 'Vector nhúng ngữ nghĩa' },
    ],
    sqlDDL: `CREATE EXTENSION IF NOT EXISTS vector;
CREATE TABLE knowledge_chunks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID REFERENCES knowledge_documents(id) ON DELETE CASCADE,
    chunk_index INT NOT NULL,
    content TEXT NOT NULL,
    embedding vector(1536) NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX knowledge_embedding_idx
ON knowledge_chunks
USING ivfflat (embedding vector_cosine_ops);`,
  },
  {
    name: 'ai_rules',
    group: 'AI KNOWLEDGE',
    description: 'Quy tắc nghiệp vụ bán hàng bắt buộc (Không bịa giá, Không bịa tồn kho, Chuyển nhân viên)',
    columns: [
      { name: 'id', type: 'UUID', nullable: false, isPrimary: true, description: 'Khóa chính' },
      { name: 'name', type: 'VARCHAR(255)', nullable: false, description: 'Tên quy tắc' },
      { name: 'rule_type', type: 'VARCHAR(50)', nullable: false, description: 'price / stock / policy / handoff / medical' },
      { name: 'content', type: 'TEXT', nullable: false, description: 'Nội dung quy tắc ép buộc' },
      { name: 'priority', type: 'INT', nullable: false, description: 'Thứ tự ưu tiên thực thi' },
      { name: 'is_active', type: 'BOOLEAN', nullable: false, description: 'Trạng thái kích hoạt' },
    ],
    sqlDDL: `CREATE TABLE ai_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    rule_type VARCHAR(50) NOT NULL,
    content TEXT NOT NULL,
    priority INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);`,
  },

  // 5. SALES & RECOMMENDATIONS GROUP
  {
    name: 'recommendations',
    group: 'SALES',
    description: 'Nhật ký các sản phẩm AI đề xuất, tỷ lệ phù hợp (%) và tỷ lệ khách click / mua',
    columns: [
      { name: 'id', type: 'UUID', nullable: false, isPrimary: true, description: 'Khóa chính' },
      { name: 'conversation_id', type: 'UUID', nullable: false, isForeign: true, foreignRef: 'conversations(id)', description: 'Phiên chat' },
      { name: 'product_id', type: 'UUID', nullable: false, isForeign: true, foreignRef: 'products(id)', description: 'Sản phẩm được đề xuất' },
      { name: 'score', type: 'NUMERIC(5,2)', nullable: false, description: 'Điểm phù hợp (ví dụ 94.00)' },
      { name: 'reason', type: 'TEXT', nullable: false, description: 'Lý do phù hợp y khoa / ngân sách' },
      { name: 'position', type: 'INT', nullable: false, description: 'Vị trí hiển thị (1 = Nhất, 2 = Nhì, 3 = Ba)' },
      { name: 'clicked', type: 'BOOLEAN', nullable: false, description: 'Khách có click xem không' },
    ],
    sqlDDL: `CREATE TABLE recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES conversations(id),
    customer_id UUID REFERENCES customers(id),
    product_id UUID REFERENCES products(id),
    score NUMERIC(5,2) NOT NULL,
    reason TEXT NOT NULL,
    position INT NOT NULL,
    clicked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);`,
  },

  // 6. ANALYTICS GROUP
  {
    name: 'ai_feedback',
    group: 'ANALYTICS',
    description: 'Đánh giá chất lượng câu trả lời AI từ khách hàng và quản trị viên (Human-in-the-loop)',
    columns: [
      { name: 'id', type: 'UUID', nullable: false, isPrimary: true, description: 'Khóa chính' },
      { name: 'conversation_id', type: 'UUID', nullable: false, isForeign: true, foreignRef: 'conversations(id)', description: 'Hội thoại' },
      { name: 'message_id', type: 'UUID', nullable: false, isForeign: true, foreignRef: 'conversation_messages(id)', description: 'Tin nhắn đánh giá' },
      { name: 'rating', type: 'VARCHAR(20)', nullable: false, description: 'thumbs_up / thumbs_down / wrong_price / wrong_product' },
      { name: 'reason', type: 'TEXT', nullable: true, description: 'Ghi chú sai lệch' },
    ],
    sqlDDL: `CREATE TABLE ai_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES conversations(id),
    message_id UUID REFERENCES conversation_messages(id),
    rating VARCHAR(20) NOT NULL,
    reason TEXT,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);`,
  },
];

export const API_ENDPOINTS: ApiEndpointDefinition[] = [
  {
    method: 'POST',
    path: '/api/v1/ai/chat',
    summary: 'Chatbot AI Streaming & Intent Processing',
    description: 'Endpoint nhận tin nhắn khách hàng, bóc tách Sleep Profile, tra cứu sản phẩm trong Catalog DB và phản hồi kèm thẻ đệm',
    requestBody: {
      sessionId: 'sess_123',
      conversationId: 'conv_123',
      message: 'Tôi 50 tuổi, hay đau lưng, ngủ 2 người giường 1m8, ngân sách khoảng 10 triệu nên mua đệm gì?',
      pageUrl: 'https://demxanh.com/dem-lo-xo-dunlopillo-audrey',
      productId: 'prod-dunlopillo-audrey',
    },
    responseBody: {
      messageId: 'msg_8912',
      type: 'product_recommendation',
      content: 'Chào anh/chị! Với độ tuổi 50 và tình trạng đau thắt lưng, chuyên gia giấc ngủ Đệm Xanh khuyến nghị nên chọn đệm có độ nâng đỡ phân vùng cao, không quá mềm lún...',
      extractedProfile: {
        mattress_size: '180x200',
        budget_min: 5000000,
        budget_max: 10000000,
        firmness_preference: 'medium',
        sleeper_count: 2,
        age_group: '50',
        special_needs: 'hỗ trợ thắt lưng / đau lưng',
      },
      products: [
        {
          id: 'prod-kim-cuong-happy-gold',
          name: 'Đệm cao su Kim Cương Happy Gold 10cm',
          salePrice: 7990000,
          originalPrice: 9400000,
          matchScore: 94,
          reasons: ['Chuẩn y khoa nâng đỡ cột sống', 'Đúng ngân sách dưới 10 triệu', 'Có sẵn kích thước 1m8 x 2m'],
        },
        {
          id: 'prod-dunlopillo-audrey',
          name: 'Đệm lò xo Dunlopillo Audrey Normablock',
          salePrice: 11475000,
          originalPrice: 13500000,
          matchScore: 88,
          reasons: ['Khung thép liên hoàn không rung khi trở mình', 'Bảo hành 10 năm'],
        },
      ],
      sources: [
        { sourceType: 'product', sourceId: 'prod-kim-cuong-happy-gold', name: 'Kim Cương Happy Gold Catalog', relevanceScore: 0.96 },
        { sourceType: 'knowledge_chunk', sourceId: 'kb-back-pain-advice', name: 'Hướng dẫn chọn đệm người đau lưng', relevanceScore: 0.94 },
      ],
      validation: {
        priceCheckPassed: true,
        inventoryCheckPassed: true,
        hallucinationRisk: 'LOW',
      },
    },
    curlExample: `curl -X POST https://ai.demxanh.com/api/v1/ai/chat \\
  -H "Content-Type: application/json" \\
  -d '{"message": "Tư vấn đệm 1m8 cho người đau lưng khoảng 10 triệu"}'`,
  },
  {
    method: 'POST',
    path: '/api/v1/ai/recommend',
    summary: 'Recommendation Engine Ranking Algorithm',
    description: 'Tính toán điểm xếp hạng sản phẩm (Score = Budget 25% + Size 20% + Firmness 15% + Purpose 15% + Brand 10% + Stock 10% + Quality 5%)',
    requestBody: {
      customerProfile: {
        mattress_size: '180x200',
        budget_min: 5000000,
        budget_max: 10000000,
        firmness_preference: 'medium',
        sleeper_count: 2,
      },
      excludeOutOfStock: true,
      maxItems: 3,
    },
    responseBody: {
      recommendations: [
        {
          productId: 'prod-kim-cuong-happy-gold',
          score: 94.5,
          scoreBreakdown: { budgetMatch: 25, sizeMatch: 20, firmnessMatch: 15, purposeMatch: 14.5, stockMatch: 10, brandMatch: 10 },
          rank: 1,
        },
        {
          productId: 'prod-lien-a-classic',
          score: 89.0,
          scoreBreakdown: { budgetMatch: 22, sizeMatch: 20, firmnessMatch: 15, purposeMatch: 13, stockMatch: 10, brandMatch: 9 },
          rank: 2,
        },
      ],
    },
    curlExample: `curl -X POST https://ai.demxanh.com/api/v1/ai/recommend \\
  -H "Content-Type: application/json" \\
  -d '{"customerProfile": {"mattress_size": "180x200", "budget_max": 10000000}}'`,
  },
  {
    method: 'GET',
    path: '/api/v1/products/:id/inventory',
    summary: 'Tra cứu tồn kho thực tế thời gian thực',
    description: 'Kiểm tra tồn kho chính xác theo từng Showroom Đệm Xanh trước khi AI phát biểu, chống hứa hẹn sai thời gian giao hàng',
    responseBody: {
      productId: 'prod-dunlopillo-audrey',
      totalAvailable: 28,
      warehouses: [
        { showroom: 'Showroom 165 Cầu Giấy, Hà Nội', stock: 12, readyFor2hDelivery: true },
        { showroom: 'Showroom 113 Nguyễn Trãi, Đống Đa', stock: 9, readyFor2hDelivery: true },
        { showroom: 'Showroom Quận 7, TP.HCM', stock: 7, readyFor2hDelivery: true },
      ],
    },
    curlExample: `curl https://ai.demxanh.com/api/v1/products/prod-dunlopillo-audrey/inventory`,
  },
  {
    method: 'POST',
    path: '/api/v1/leads',
    summary: 'Thu thập Lead & Kích hoạt Thông báo Sales',
    description: 'Tạo Lead mới trên CRM Kanban và gửi thông báo chuông tới nhân viên tư vấn',
    requestBody: {
      name: 'Nguyễn Văn An',
      phone: '0912456789',
      area: 'Cầu Giấy, Hà Nội',
      preferredTime: 'Trong giờ hành chính',
      productId: 'prod-dunlopillo-audrey',
      budget: '10–20 triệu',
    },
    responseBody: {
      leadId: 'lead-9812',
      status: 'NEW',
      score: 96,
      assignedStaff: 'Nguyễn Văn Toàn (Sales Showroom Cầu Giấy)',
      message: 'Đã tạo Lead thành công và điều phối nhân viên liên hệ trong 15 phút.',
    },
    curlExample: `curl -X POST https://ai.demxanh.com/api/v1/leads \\
  -H "Content-Type: application/json" \\
  -d '{"name": "Nguyễn Văn An", "phone": "0912456789"}'`,
  },
];
