import Feedback from '../models/Feedback.js';
import User from '../models/User.js';

// Create new feedback
export const createFeedback = async (req, res) => {
  try {
    const { rating, title, comment, category } = req.body;
    const userId = req.user.id;

    // Check if user exists and get subscription status
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Determine if this is premium feedback based on user's subscription
    const isPremiumFeedback = user.subscriptionTier === 'premium';

    const feedback = new Feedback({
      user: userId,
      rating,
      title,
      comment,
      category: category || 'Overall',
      isPremiumFeedback,
      isVerified: isPremiumFeedback // Auto-verify premium user feedback
    });

    await feedback.save();

    // Populate user details before sending response
    await feedback.populate('user', 'name email subscriptionTier profilePicture');

    res.status(201).json({
      message: 'Feedback submitted successfully',
      feedback
    });
  } catch (error) {
    console.error('❌ Error creating feedback:', error);
    res.status(500).json({ message: 'Failed to submit feedback', error: error.message });
  }
};

// Get all approved feedbacks
export const getAllFeedbacks = async (req, res) => {
  try {
    const { type = 'all', sort = 'recent', limit = 50 } = req.query;

    let query = { status: 'approved' };

    // Filter by feedback type
    if (type === 'premium') {
      query.isPremiumFeedback = true;
    } else if (type === 'standard') {
      query.isPremiumFeedback = false;
    }

    // Determine sort order
    let sortOption = { createdAt: -1 }; // Default: most recent
    if (sort === 'rating') {
      sortOption = { rating: -1, createdAt: -1 };
    } else if (sort === 'helpful') {
      sortOption = { helpfulCount: -1, createdAt: -1 };
    }

    const feedbacks = await Feedback.find(query)
      .sort(sortOption)
      .limit(parseInt(limit))
      .populate('user', 'name email subscriptionTier profilePicture')
      .lean();

    // Calculate statistics
    const stats = await Feedback.aggregate([
      { $match: { status: 'approved' } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          totalFeedbacks: { $sum: 1 },
          premiumFeedbacks: {
            $sum: { $cond: ['$isPremiumFeedback', 1, 0] }
          },
          ratingDistribution: {
            $push: '$rating'
          }
        }
      }
    ]);

    // Calculate rating distribution
    const ratingCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    if (stats.length > 0 && stats[0].ratingDistribution) {
      stats[0].ratingDistribution.forEach(rating => {
        ratingCounts[rating] = (ratingCounts[rating] || 0) + 1;
      });
    }

    res.json({
      feedbacks,
      stats: stats.length > 0 ? {
        averageRating: Number(stats[0].averageRating.toFixed(1)),
        totalFeedbacks: stats[0].totalFeedbacks,
        premiumFeedbacks: stats[0].premiumFeedbacks,
        ratingDistribution: ratingCounts
      } : {
        averageRating: 0,
        totalFeedbacks: 0,
        premiumFeedbacks: 0,
        ratingDistribution: ratingCounts
      }
    });
  } catch (error) {
    console.error('❌ Error fetching feedbacks:', error);
    res.status(500).json({ message: 'Failed to fetch feedbacks', error: error.message });
  }
};

// Get user's own feedbacks
export const getMyFeedbacks = async (req, res) => {
  try {
    const userId = req.user.id;

    const feedbacks = await Feedback.find({ user: userId })
      .sort({ createdAt: -1 })
      .populate('user', 'name email subscriptionTier profilePicture')
      .lean();

    res.json({ feedbacks });
  } catch (error) {
    console.error('❌ Error fetching user feedbacks:', error);
    res.status(500).json({ message: 'Failed to fetch your feedbacks', error: error.message });
  }
};

// Update feedback
export const updateFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, title, comment, category } = req.body;
    const userId = req.user.id;

    const feedback = await Feedback.findOne({ _id: id, user: userId });

    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found or unauthorized' });
    }

    // Update fields
    if (rating !== undefined) feedback.rating = rating;
    if (title !== undefined) feedback.title = title;
    if (comment !== undefined) feedback.comment = comment;
    if (category !== undefined) feedback.category = category;

    await feedback.save();
    await feedback.populate('user', 'name email subscriptionTier profilePicture');

    res.json({
      message: 'Feedback updated successfully',
      feedback
    });
  } catch (error) {
    console.error('❌ Error updating feedback:', error);
    res.status(500).json({ message: 'Failed to update feedback', error: error.message });
  }
};

// Delete feedback
export const deleteFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const feedback = await Feedback.findOne({ _id: id, user: userId });

    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found or unauthorized' });
    }

    await Feedback.deleteOne({ _id: id });

    res.json({ message: 'Feedback deleted successfully' });
  } catch (error) {
    console.error('❌ Error deleting feedback:', error);
    res.status(500).json({ message: 'Failed to delete feedback', error: error.message });
  }
};

// Mark feedback as helpful
export const markHelpful = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const feedback = await Feedback.findById(id);

    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }

    // Check if user already marked this as helpful
    const alreadyMarked = feedback.markedHelpfulBy.includes(userId);

    if (alreadyMarked) {
      // Remove helpful mark
      feedback.markedHelpfulBy = feedback.markedHelpfulBy.filter(
        id => id.toString() !== userId.toString()
      );
      feedback.helpfulCount = Math.max(0, feedback.helpfulCount - 1);
    } else {
      // Add helpful mark
      feedback.markedHelpfulBy.push(userId);
      feedback.helpfulCount += 1;
    }

    await feedback.save();
    await feedback.populate('user', 'name email subscriptionTier profilePicture');

    res.json({
      message: alreadyMarked ? 'Removed helpful mark' : 'Marked as helpful',
      feedback,
      isMarkedHelpful: !alreadyMarked
    });
  } catch (error) {
    console.error('❌ Error marking feedback as helpful:', error);
    res.status(500).json({ message: 'Failed to mark feedback', error: error.message });
  }
};
