import { Router } from 'express';
import * as conversationController from '../controllers/conversationController.js';
import { requireAuth } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = Router();

router.use(requireAuth);

router.post('/', conversationController.startOrGetConversation);
router.get('/', conversationController.getMyConversations);
router.get('/:id/messages', conversationController.getConversationMessages);
router.post('/:id/messages', upload.single('image'), conversationController.sendMessage);
router.post('/:id/block', conversationController.toggleBlock);

export default router;
