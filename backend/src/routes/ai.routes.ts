import { Router } from 'express';
import { AIController } from '../controllers/AIController';
import { authenticate } from '../middleware/auth';

const router = Router();
const aiController = new AIController();

router.use(authenticate);

router.post('/summarize', aiController.summarize.bind(aiController));
router.get('/chats', aiController.getChats.bind(aiController));
router.get('/chats/:id', aiController.getChatById.bind(aiController));
router.post('/chat', aiController.chat.bind(aiController));

export default router;
