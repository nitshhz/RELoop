import * as notificationService from '../services/notificationService.js';
import { apiSuccess } from '../utils/apiResponse.js';

export async function getNotifications(req, res, next) {
  try {
    const { limit, offset } = req.query;
    const result = await notificationService.getUserNotifications(req.user.id, {
      limit: limit ? parseInt(limit, 10) : 20,
      offset: offset ? parseInt(offset, 10) : 0,
    });
    return apiSuccess(res, result);
  } catch (err) {
    next(err);
  }
}

export async function markAsRead(req, res, next) {
  try {
    const notificationId = req.params.id;
    const updated = await notificationService.markNotificationAsRead(req.user.id, notificationId);
    return apiSuccess(res, { notification: updated }, 'Notification marked as read.');
  } catch (err) {
    next(err);
  }
}

export async function markAllAsRead(req, res, next) {
  try {
    await notificationService.markAllNotificationsAsRead(req.user.id);
    return apiSuccess(res, null, 'All notifications marked as read.');
  } catch (err) {
    next(err);
  }
}
