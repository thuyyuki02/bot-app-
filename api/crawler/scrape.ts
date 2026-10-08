import { extractProductFromDemXanhUrl } from '../../src/services/crawlerService';

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { url = '' } = req.body || {};
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    const product = extractProductFromDemXanhUrl(url);
    return res.status(200).json({
      success: true,
      product,
      source: 'knowledge_database',
      message: `Đã nạp sản phẩm "${product.name}" thành công vào AI.`,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Scrape failed' });
  }
}
