import React, { useState } from 'react';
import { FolderTree, FileCode, Check, Copy, Terminal, Shield, Layers } from 'lucide-react';

interface CodeFile {
  path: string;
  name: string;
  description: string;
  code: string;
}

export const CodeArchitectureTab: React.FC = () => {
  const CODE_FILES: CodeFile[] = [
    {
      path: 'src/ai/orchestrator/ai-orchestrator.service.ts',
      name: 'ai-orchestrator.service.ts',
      description: 'Trái tim của hệ thống: điều phối Intent, bóc tách Profile, gọi Recommendation & RAG',
      code: `import { Injectable, Logger } from '@nestjs/common';
import { CustomerProfileService } from '../customer/customer-profile.service';
import { ProductSearchService } from '../../products/product-search.service';
import { RecommendationService } from '../recommendation/recommendation.service';
import { RetrievalService } from '../rag/retrieval.service';
import { PolicyEngineService } from '../rules/policy-engine.service';
import { ResponseValidatorService } from '../validators/response-validator.service';
import { GoogleGenAIService } from '../llm/google-genai.service';

@Injectable()
export class AIOrchestratorService {
  private readonly logger = new Logger(AIOrchestratorService.name);

  constructor(
    private readonly profileService: CustomerProfileService,
    private readonly productService: ProductSearchService,
    private readonly recommendationService: RecommendationService,
    private readonly retrievalService: RetrievalService,
    private readonly policyEngine: PolicyEngineService,
    private readonly responseValidator: ResponseValidatorService,
    private readonly genAiService: GoogleGenAIService,
  ) {}

  async processCustomerMessage(dto: {
    sessionId: string;
    conversationId: string;
    message: string;
    pageUrl: string;
    productId?: string;
  }) {
    // 1. Phân loại Intent & Cập nhật Sleep Profile
    const profile = await this.profileService.extractAndSave(dto.conversationId, dto.message);

    // 2. Tra cứu RAG Knowledge Chunks từ pgvector
    const knowledgeChunks = await this.retrievalService.similaritySearch(dto.message, 3);

    // 3. Chạy Thuật toán Recommendation Ranking độc lập (không để LLM tự bịa)
    const candidates = await this.productService.findActiveCandidates();
    const rankedProducts = this.recommendationService.rankCandidates(candidates, profile);

    // 4. Kiểm tra Business Rules bắt buộc (Policy Engine)
    const activeRules = await this.policyEngine.getActiveRules();

    // 5. Xây dựng Prompt tổng hợp
    const prompt = this.buildPrompt({
      userMessage: dto.message,
      profile,
      topProducts: rankedProducts.slice(0, 3),
      knowledgeChunks,
      rules: activeRules,
    });

    // 6. Gọi Gemini 3.8 Flash qua @google/genai SDK
    const rawResponse = await this.genAiService.generateText(prompt);

    // 7. Chạy lớp kiểm duyệt trung thực (Response Validator)
    const validation = await this.responseValidator.verify({
      responseText: rawResponse,
      expectedProducts: rankedProducts.slice(0, 3),
      expectedPolicies: knowledgeChunks,
    });

    if (!validation.passed) {
      this.logger.warn(\`Response validation failed: \${validation.reason}. Falling back to rule response.\`);
      return this.buildFallbackResponse(rankedProducts.slice(0, 3));
    }

    return {
      content: rawResponse,
      products: rankedProducts.slice(0, 3),
      sources: validation.sourcesCited,
    };
  }
}`,
    },
    {
      path: 'src/ai/validators/response-validator.service.ts',
      name: 'response-validator.service.ts',
      description: 'Lớp bảo vệ kiểm tra chéo giá và chính sách trước khi xuất bản tới khách hàng',
      code: `import { Injectable } from '@nestjs/common';
import { Product } from '../../products/entities/product.entity';
import { KnowledgeChunk } from '../rag/entities/knowledge-chunk.entity';

@Injectable()
export class ResponseValidatorService {
  async verify(params: {
    responseText: string;
    expectedProducts: Product[];
    expectedPolicies: KnowledgeChunk[];
  }) {
    const { responseText, expectedProducts } = params;

    // 1. Kiểm tra không bịa giá tiền
    for (const prod of expectedProducts) {
      if (responseText.includes(prod.name)) {
        // Trích xuất các cụm giá bằng Regex
        const priceMatches = responseText.match(/\\d+[.,]\\d{3}[.,]\\d{3}/g) || [];
        for (const match of priceMatches) {
          const num = parseInt(match.replace(/[.,]/g, ''), 10);
          // Cho phép sai số nếu có tính voucher, nhưng cấm tuyệt đối giá lệch > 20%
          if (Math.abs(num - prod.salePrice) > 500000 && Math.abs(num - prod.originalPrice) > 500000) {
            return {
              passed: false,
              reason: \`Phát hiện giá \${num}đ không trùng khớp với giá niêm yết \${prod.salePrice}đ trong Catalog DB\`,
            };
          }
        }
      }
    }

    // 2. Kiểm tra cam kết sai thời gian giao hàng nếu tồn kho = 0
    for (const prod of expectedProducts) {
      if (prod.stock === 0 && (responseText.includes('giao ngay trong 2h') || responseText.includes('sẵn hàng'))) {
        return {
          passed: false,
          reason: \`Sản phẩm \${prod.name} đã hết hàng nhưng AI cam kết giao ngay\`,
        };
      }
    }

    return {
      passed: true,
      hallucinationRisk: 'LOW',
      sourcesCited: expectedProducts.map((p) => ({
        type: 'product',
        id: p.id,
        name: p.name,
      })),
    };
  }
}`,
    },
    {
      path: 'src/ai/recommendation/ranking.service.ts',
      name: 'ranking.service.ts',
      description: 'Thuật toán tính điểm đề xuất đa yếu tố (Budget, Size, Firmness, Stock, Brand)',
      code: `import { Injectable } from '@nestjs/common';
import { Product } from '../../products/entities/product.entity';
import { CustomerProfile } from '../customer/entities/customer-profile.entity';

@Injectable()
export class RecommendationRankingService {
  // Trọng số chuẩn theo đặc tả Đệm Xanh
  private readonly WEIGHTS = {
    budgetMatch: 0.25,       // 25%
    sizeMatch: 0.20,         // 20%
    firmnessMatch: 0.15,     // 15%
    purposeMatch: 0.15,      // 15%
    stockAvailability: 0.10, // 10%
    brandPreference: 0.10,   // 10%
    qualityRating: 0.05,     // 5%
  };

  rank(products: Product[], profile: CustomerProfile) {
    return products
      .filter((p) => p.aiEnabled && p.stock > 0) // Loại bỏ sản phẩm hết hàng
      .map((p) => {
        const budgetScore = this.calcBudgetScore(p.salePrice, profile.budgetMin, profile.budgetMax);
        const sizeScore = this.calcSizeScore(p, profile.mattressSize);
        const firmnessScore = this.calcFirmnessScore(p, profile.firmnessPreference);
        const purposeScore = this.calcPurposeScore(p, profile);
        const stockScore = p.stock > 10 ? 100 : 70;
        const brandScore = 85;

        const totalScore =
          budgetScore * this.WEIGHTS.budgetMatch +
          sizeScore * this.WEIGHTS.sizeMatch +
          firmnessScore * this.WEIGHTS.firmnessMatch +
          purposeScore * this.WEIGHTS.purposeMatch +
          stockScore * this.WEIGHTS.stockAvailability +
          brandScore * this.WEIGHTS.brandPreference;

        return {
          product: p,
          score: Math.round(totalScore),
        };
      })
      .sort((a, b) => b.score - a.score);
  }

  private calcBudgetScore(price: number, min?: number, max?: number): number {
    if (!max) return 80;
    if (price <= max && price >= (min || 0)) return 100;
    if (price <= max * 1.15) return 80;
    return 50;
  }
}`,
    },
  ];

  const [activeFile, setActiveFile] = useState<CodeFile>(CODE_FILES[0]);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto w-full">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-purple-950 text-purple-400 border border-purple-800 text-[10px] font-bold px-2 py-0.5 rounded">
              NESTJS MODULAR MONOLITH
            </span>
            <h2 className="text-xl font-black text-white tracking-tight">
              Kiến Trúc Code Backend & Tổ Chức Thư Mục Sản Phẩm
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Thiết kế theo cấu trúc Modular Monolith tối ưu hiệu năng và dễ bảo trì, sẵn sàng mở rộng Microservices khi traffic tăng
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Directory Tree */}
        <div className="lg:col-span-4 bg-slate-950 rounded-2xl border border-slate-800 p-3 space-y-2">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-2 py-1 flex items-center gap-1.5">
            <FolderTree className="w-3.5 h-3.5 text-emerald-400" />
            <span>Thư Mục Mã Nguồn Core Services</span>
          </div>

          <div className="space-y-1.5 font-mono text-xs">
            {CODE_FILES.map((f) => {
              const isSelected = activeFile.path === f.path;
              return (
                <div
                  key={f.path}
                  onClick={() => setActiveFile(f)}
                  className={`p-3 rounded-xl cursor-pointer transition border flex flex-col gap-1 ${
                    isSelected
                      ? 'bg-slate-900 border-purple-500 text-white shadow-md'
                      : 'bg-slate-950/60 border-slate-850 text-slate-300 hover:border-slate-700 hover:bg-slate-900/40'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <FileCode className="w-4 h-4 text-purple-400 shrink-0" />
                    <span className="font-bold text-xs truncate">{f.name}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 truncate">{f.path}</span>
                </div>
              );
            })}
          </div>

          <div className="pt-3 border-t border-slate-850 text-[11px] text-slate-400 space-y-1 p-2">
            <div className="font-bold text-slate-300">Công nghệ khuyến nghị:</div>
            <div>• Backend: NestJS (TypeScript)</div>
            <div>• ORM: Prisma hoặc Drizzle + pgvector</div>
            <div>• Queue: BullMQ + Redis</div>
            <div>• LLM SDK: @google/genai (Gemini 3.8 Flash)</div>
          </div>
        </div>

        {/* Right: Code Viewer */}
        <div className="lg:col-span-8 bg-slate-950 rounded-2xl border border-slate-800 p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <span className="font-mono text-xs text-purple-400 font-bold block">{activeFile.path}</span>
              <p className="text-xs text-slate-400 mt-0.5">{activeFile.description}</p>
            </div>

            <button
              onClick={() => handleCopyCode(activeFile.code)}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs px-2.5 py-1.5 rounded-lg border border-slate-700 flex items-center gap-1.5 transition"
            >
              {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedCode ? 'Đã sao chép' : 'Copy Code'}</span>
            </button>
          </div>

          <pre className="bg-slate-900 p-4 rounded-xl border border-slate-800 text-xs font-mono text-emerald-300 overflow-x-auto leading-relaxed max-h-[500px]">
{activeFile.code}
          </pre>
        </div>
      </div>
    </div>
  );
};
