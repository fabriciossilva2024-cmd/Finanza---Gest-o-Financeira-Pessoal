import { handleAssistant } from '../../src/server/ai.js';

export default async function assistant(req: any, res: any) {
  return handleAssistant(req, res);
}
