import { handleInsights } from '../../src/server/ai.js';

export default async function insights(req: any, res: any) {
  return handleInsights(req, res);
}
