import Notification from "../models/Notification.js";

/* =========================
   GET USER NOTIFICATIONS
========================= */
export const getNotifications = async (req, res) => {
  try {
    if (req.user?.isGuest) {
      return res.json({
        notifications: [],
        pagination: {
          page: 1,
          limit: 20,
          total: 0,
          pages: 0
        },
        unreadCount: 0
      });
    }

    const userId = req.user._id;
    const { page = 1, limit = 20, unreadOnly = false } = req.query;

    const query = { userId };
    if (unreadOnly === 'true') {
      query.read = false;
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({ userId, read: false });

    res.json({
      notifications,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      },
      unreadCount
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =========================
   MARK NOTIFICATION AS READ
========================= */
export const markAsRead = async (req, res) => {
  try {
    if (req.user?.isGuest) {
      return res.status(403).json({ message: "Guests cannot modify notifications" });
    }

    const { id } = req.params;
    const userId = req.user._id;

    const notification = await Notification.findOneAndUpdate(
      { _id: id, userId },
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.json({ notification });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =========================
   MARK ALL AS READ
========================= */
export const markAllAsRead = async (req, res) => {
  try {
    if (req.user?.isGuest) {
      return res.status(403).json({ message: "Guests cannot modify notifications" });
    }

    const userId = req.user._id;

    await Notification.updateMany(
      { userId, read: false },
      { read: true }
    );

    res.json({ message: "All notifications marked as read" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =========================
   DELETE NOTIFICATION
========================= */
export const deleteNotification = async (req, res) => {
  try {
    if (req.user?.isGuest) {
      return res.status(403).json({ message: "Guests cannot modify notifications" });
    }

    const { id } = req.params;
    const userId = req.user._id;

    const notification = await Notification.findOneAndDelete({ _id: id, userId });
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.json({ message: "Notification deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =========================
   CLEAR ALL NOTIFICATIONS
========================= */
export const clearAllNotifications = async (req, res) => {
  try {
    if (req.user?.isGuest) {
      return res.status(403).json({ message: "Guests cannot modify notifications" });
    }

    const userId = req.user._id;

    await Notification.deleteMany({ userId, read: true });

    res.json({ message: "All read notifications cleared" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =========================
   CREATE NOTIFICATION (UTILITY)
========================= */
export const createNotification = async (userId, type, title, message, data = {}, icon = 'Bell', color = 'info', actionUrl = /** @type {string | null} */ (null)) => {
  try {
    const notification = await Notification.create({
      userId,
      type,
      title,
      message,
      data,
      icon,
      color,
      actionUrl
    });

    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    return null;
  }
};
