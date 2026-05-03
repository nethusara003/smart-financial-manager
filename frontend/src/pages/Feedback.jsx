import React, { useState } from 'react';
import { Star, ThumbsUp, Edit, Trash2, Trophy, Crown, CheckCircle, BarChart3 } from 'lucide-react';
import { InlineEditor, useToast } from '../components/ui';
import {
  useCreateFeedback,
  useDeleteFeedback,
  useFeedbackList,
  useMarkFeedbackHelpful,
  useUpdateFeedback,
} from '../hooks/useFeedback';
import { getAuth } from '../utils/auth';
import SystemPageHeader from '../components/layout/SystemPageHeader';

const Feedback = () => {
  const toast = useToast();
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [showForm, setShowForm] = useState(false);
  const [editingFeedback, setEditingFeedback] = useState(null);
  const [feedbackToDelete, setFeedbackToDelete] = useState(null);

  const [formData, setFormData] = useState({
    rating: 5,
    title: '',
    comment: '',
    category: 'Overall',
  });

  const categories = ['Features', 'Performance', 'UI/UX', 'Support', 'Overall', 'Other'];

  const { data: feedbackData, isLoading: loading } = useFeedbackList({ type: filter, sort: sortBy });
  const feedbacks = feedbackData?.feedbacks || [];
  const stats = feedbackData?.stats || null;

  const createFeedbackMutation = useCreateFeedback();
  const updateFeedbackMutation = useUpdateFeedback();
  const deleteFeedbackMutation = useDeleteFeedback();
  const markHelpfulMutation = useMarkFeedbackHelpful();
  const currentUser = getAuth()?.user || null;
  const currentUserId = currentUser?.id || currentUser?._id || null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingFeedback) {
        await updateFeedbackMutation.mutateAsync({ id: editingFeedback._id, payload: formData });
      } else {
        await createFeedbackMutation.mutateAsync(formData);
      }
      setFormData({ rating: 5, title: '', comment: '', category: 'Overall' });
      setShowForm(false);
      setEditingFeedback(null);
      toast.success(editingFeedback ? 'Feedback updated successfully' : 'Feedback submitted successfully');
    } catch (error) {
      toast.error(error?.message || 'Failed to submit feedback');
    }
  };

  const handleDelete = (id) => setFeedbackToDelete(id);

  const confirmDelete = async () => {
    if (!feedbackToDelete) return;
    try {
      await deleteFeedbackMutation.mutateAsync(feedbackToDelete);
      toast.success('Feedback deleted successfully');
      setFeedbackToDelete(null);
    } catch (error) {
      toast.error(error?.message || 'Failed to delete feedback');
    }
  };

  const handleMarkHelpful = async (id) => {
    try {
      await markHelpfulMutation.mutateAsync(id);
    } catch (error) {
      toast.error(error?.message || 'Failed to mark feedback as helpful');
    }
  };

  const handleEdit = (feedback) => {
    setEditingFeedback(feedback);
    setFormData({ rating: feedback.rating, title: feedback.title, comment: feedback.comment, category: feedback.category });
    setShowForm(true);
  };

  const renderStars = ({ rating, interactive = false, onRate = null, size = 18 }) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => interactive && onRate && onRate(star)}
          disabled={!interactive}
          className={interactive ? 'cursor-pointer hover:scale-110 transition-transform' : ''}
        >
          <Star
            className={star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-[#374151]'}
            size={size}
          />
        </button>
      ))}
    </div>
  );

  const renderFeedbackCard = (feedback) => {
    const feedbackOwnerId = feedback.user?._id || feedback.user?.id;
    const isOwner = Boolean(currentUserId) && currentUserId === feedbackOwnerId;
    const isPremium = feedback.isPremiumFeedback;

    return (
      <div
        className={`rounded-2xl border p-4 transition-all duration-200 ${
          isPremium
            ? 'bg-[#0D1117] border-purple-500/20'
            : 'bg-[#0D1117] border-white/5'
        }`}
      >
        {/* User row */}
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
              isPremium ? 'bg-purple-600/20 text-purple-400 border border-purple-500/20' : 'bg-[#3B82F6]/10 text-[#3B82F6] border border-[#3B82F6]/15'
            }`}>
              {feedback.user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-semibold text-[#F9FAFB]">{feedback.user?.name || 'Anonymous'}</span>
                {feedback.isVerified && <CheckCircle className="text-[#3B82F6]" size={13} />}
                {isPremium && (
                  <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-[10px] font-semibold text-purple-400">
                    <Crown size={10} /> Premium
                  </span>
                )}
              </div>
              <p className="text-[11px] text-[#6B7280]">
                {new Date(feedback.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {renderStars({ rating: feedback.rating, size: 14 })}
            <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/5 text-[10px] font-medium text-[#9CA3AF]">
              {feedback.category}
            </span>
          </div>
        </div>

        {/* Content */}
        <h4 className="text-sm font-semibold text-[#F9FAFB] mb-1">{feedback.title}</h4>
        <p className="text-xs text-[#9CA3AF] leading-relaxed">{feedback.comment}</p>

        {/* Footer */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
          <button
            onClick={() => handleMarkHelpful(feedback._id)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/8 border border-white/5 transition-colors"
          >
            <ThumbsUp className="text-[#3B82F6]" size={13} />
            <span className="text-xs text-[#9CA3AF]">Helpful ({feedback.helpfulCount})</span>
          </button>

          {isOwner && (
            <div className="flex gap-1.5">
              <button
                onClick={() => handleEdit(feedback)}
                className="p-1.5 rounded-lg bg-[#3B82F6]/10 hover:bg-[#3B82F6]/20 border border-[#3B82F6]/15 transition-colors"
              >
                <Edit className="text-[#3B82F6]" size={13} />
              </button>
              <button
                onClick={() => handleDelete(feedback._id)}
                className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/15 transition-colors"
              >
                <Trash2 className="text-red-400" size={13} />
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <SystemPageHeader
        tagline="COMMUNITY FEEDBACK"
        title="Reviews"
        subtitle="Share your experience and help us improve the platform."
        actions={(
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-[#3B82F6] hover:bg-[#2563EB] text-white text-xs font-semibold transition-all"
          >
            <Star size={13} />
            {showForm ? 'Cancel' : 'Write Review'}
          </button>
        )}
      />

      {/* Stats Strip */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Average Rating', value: stats.averageRating, icon: Star, iconColor: 'text-yellow-400', iconBg: 'bg-yellow-400/10 border-yellow-400/15' },
            { label: 'Total Reviews', value: stats.totalFeedbacks, icon: BarChart3, iconColor: 'text-[#3B82F6]', iconBg: 'bg-[#3B82F6]/10 border-[#3B82F6]/15' },
            { label: 'Premium Reviews', value: stats.premiumFeedbacks, icon: Crown, iconColor: 'text-purple-400', iconBg: 'bg-purple-400/10 border-purple-400/15' },
            { label: '5-Star Reviews', value: stats.ratingDistribution?.[5] || 0, icon: Trophy, iconColor: 'text-[#10B981]', iconBg: 'bg-[#10B981]/10 border-[#10B981]/15' },
          ].map(({ label, value, icon: Icon, iconColor, iconBg }) => (
            <div key={label} className="rounded-2xl border border-white/5 bg-[#0D1117] p-4 flex items-center gap-3">
              <div className={`flex h-9 w-9 items-center justify-center rounded-lg border flex-shrink-0 ${iconBg}`}>
                <Icon className={iconColor} size={16} />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] text-[#6B7280] truncate">{label}</p>
                <p className="text-xl font-bold text-[#F9FAFB]">{value}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all border ${
              filter === 'all'
                ? 'bg-[#3B82F6] border-[#3B82F6] text-white'
                : 'bg-white/5 border-white/5 text-[#9CA3AF] hover:bg-white/10'
            }`}
          >
            All Reviews
          </button>
          <button
            onClick={() => setFilter('premium')}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all border flex items-center gap-1.5 ${
              filter === 'premium'
                ? 'bg-purple-600 border-purple-600 text-white'
                : 'bg-white/5 border-white/5 text-[#9CA3AF] hover:bg-white/10'
            }`}
          >
            <Crown size={13} /> Premium
          </button>
        </div>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 text-xs text-[#9CA3AF] focus:border-[#3B82F6]/50 focus:outline-none"
        >
          <option value="recent">Most Recent</option>
          <option value="rating">Highest Rated</option>
          <option value="helpful">Most Helpful</option>
        </select>
      </div>

      {/* Review Form */}
      {showForm && (
        <div className="rounded-2xl border border-white/5 bg-[#0D1117] p-5">
          <h2 className="text-sm font-semibold text-[#F9FAFB] mb-4 flex items-center gap-2">
            <Star className="text-yellow-400" size={15} />
            {editingFeedback ? 'Edit Your Review' : 'Write a Review'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#9CA3AF] mb-1.5">Your Rating</label>
                {renderStars({ rating: formData.rating, interactive: true, onRate: (rating) => setFormData({ ...formData, rating }), size: 22 })}
              </div>
              <div>
                <label className="block text-xs font-medium text-[#9CA3AF] mb-1.5">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/5 text-sm text-[#F9FAFB] focus:border-[#3B82F6]/50 focus:outline-none"
                >
                  {categories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#9CA3AF] mb-1.5">Review Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Summarize your experience..."
                required
                maxLength={100}
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/5 text-sm text-[#F9FAFB] placeholder-[#4B5563] focus:border-[#3B82F6]/50 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#9CA3AF] mb-1.5">Your Review</label>
              <textarea
                value={formData.comment}
                onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                placeholder="Share your detailed experience..."
                required
                maxLength={1000}
                rows={4}
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/5 text-sm text-[#F9FAFB] placeholder-[#4B5563] focus:border-[#3B82F6]/50 focus:outline-none resize-none"
              />
              <p className="text-[11px] text-[#4B5563] mt-1">{formData.comment.length}/1000</p>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-lg text-sm font-semibold bg-[#3B82F6] hover:bg-[#2563EB] text-white transition-all"
            >
              {editingFeedback ? 'Update Review' : 'Submit Review'}
            </button>
          </form>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-10">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-[#3B82F6] border-t-transparent" />
            <p className="mt-3 text-sm text-[#6B7280]">Loading reviews...</p>
          </div>
        ) : feedbacks.length === 0 ? (
          <div className="text-center py-10 rounded-2xl border border-white/5 bg-[#0D1117]">
            <Star className="text-[#374151] mx-auto mb-3" size={36} />
            <p className="text-sm text-[#6B7280]">No reviews yet. Be the first to share your experience!</p>
          </div>
        ) : (
          feedbacks.map((feedback) => (
            <React.Fragment key={feedback._id}>{renderFeedbackCard(feedback)}</React.Fragment>
          ))
        )}
      </div>

      <InlineEditor
        isOpen={Boolean(feedbackToDelete)}
        title="Delete Feedback"
        subtitle="This action cannot be undone"
        onClose={() => setFeedbackToDelete(null)}
        className="max-w-xl"
      >
        <div className="space-y-4">
          <p className="text-sm text-[#9CA3AF]">Are you sure you want to delete this feedback?</p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setFeedbackToDelete(null)}
              className="flex-1 px-4 py-2 rounded-lg border border-white/10 text-[#9CA3AF] bg-white/5 text-sm font-medium"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={confirmDelete}
              className="flex-1 px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-semibold hover:bg-red-500/20 transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      </InlineEditor>
    </div>
  );
};

export default Feedback;
