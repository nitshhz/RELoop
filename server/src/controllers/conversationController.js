import * as chatService from '../services/chatService.js';
import { apiSuccess } from '../utils/apiResponse.js';

export async function startOrGetConversation(req, res, next) {
  try {
    const { listingId } = req.body;
    const conversation = await chatService.getOrCreateConversation({
      userId: req.user.id,
      listingId,
    });
    return apiSuccess(res, { conversation });
  } catch (err) {
    next(err);
  }
}

export async function getMyConversations(req, res, next) {
  try {
    const conversations = await chatService.getUserConversations(req.user.id);
    return apiSuccess(res, { conversations });
  } catch (err) {
    next(err);
  }
}

export async function getConversationMessages(req, res, next) {
  try {
    const conversationId = req.params.id;
    const result = await chatService.getConversationMessages(req.user.id, conversationId);
    return apiSuccess(res, result);
  } catch (err) {
    next(err);
  }
}

export async function sendMessage(req, res, next) {
  try {
    const conversationId = req.params.id;
    const { content, isQuickReply } = req.body;

    const message = await chatService.sendMessage({
      userId: req.user.id,
      conversationId,
      content,
      isQuickReply: Boolean(isQuickReply),
    });

    return apiSuccess(res, { message }, 'Message sent.', 201);
  } catch (err) {
    next(err);
  }
}

export async function toggleBlock(req, res, next) {
  try {
    const conversationId = req.params.id;
    const updated = await chatService.toggleBlockConversation(req.user.id, conversationId);
    return apiSuccess(
      res,
      { conversation: updated },
      updated.isBlocked ? 'Conversation blocked.' : 'Conversation unblocked.'
    );
  } catch (err) {
    next(err);
  }
}
