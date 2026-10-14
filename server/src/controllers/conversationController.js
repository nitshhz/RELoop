import fs from 'fs';
import * as chatService from '../services/chatService.js';
import { apiSuccess, apiError } from '../utils/apiResponse.js';
import { processUploadedFile } from '../middleware/upload.js';
import { verifyChatAttachmentImage } from '../services/aiModerationService.js';

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
    let imageUrl = null;

    // 1. If an image file was uploaded via multipart/form-data
    if (req.file) {
      const imgBuffer = fs.readFileSync(req.file.path);
      const verification = await verifyChatAttachmentImage(imgBuffer, req.file.mimetype);

      if (!verification.safe) {
        // Clean up unsafe file immediately
        if (fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
        return apiError(
          res,
          `Image blocked by ReLoop AI: ${verification.reason || 'Prohibited, adult, or illegal content detected.'}`,
          400
        );
      }

      // Upload safe image to Cloudinary / storage
      const uploadResult = await processUploadedFile(req.file, req, 'reloop/chat');
      imageUrl = uploadResult.url;
    } else if (req.body.imageUrl) {
      // 2. Pre-hosted or base64 image URL
      const verification = await verifyChatAttachmentImage(req.body.imageUrl);
      if (!verification.safe) {
        return apiError(
          res,
          `Image blocked by ReLoop AI: ${verification.reason || 'Prohibited, adult, or illegal content detected.'}`,
          400
        );
      }
      imageUrl = req.body.imageUrl;
    }

    const message = await chatService.sendMessage({
      userId: req.user.id,
      conversationId,
      content: content || '',
      imageUrl,
      isQuickReply: Boolean(isQuickReply),
    });

    return apiSuccess(res, { message }, 'Message sent.', 201);
  } catch (err) {
    // If an error occurred and a temp file was left on disk, clean it up
    if (req.file && fs.existsSync(req.file.path)) {
      try {
        fs.unlinkSync(req.file.path);
      } catch {}
    }
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
