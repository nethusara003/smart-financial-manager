import React, { useState, useEffect, useCallback } from 'react';
import { Star, ThumbsUp, Edit, Trash2, Trophy, Crown, CheckCircle, Filter, BarChart3 } from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '../services/apiClient';

const Feedback = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, premium, standard
  const [sortBy, setSortBy] = useState('recent'); // recent, rating, helpful
  const [showForm, setShowForm] = useState(false);
  const [editingFeedback, setEditingFeedback] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    rating: 5,
    title: '',
    comment: '',
    category: 'Overall'
  });

  const categories = ['Features', 'Performance', 'UI/UX', 'Support', 'Overall', 'Other'];

  const fetchFeedbacks = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_BASE_URL}/feedback?type=${filter}&sort=${sortBy}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setFeedbacks(response.data.feedbacks);
      setStats(response.data.stats);
    } catch (error) {
      console.error('Error fetching feedbacks:', error);
    } finally {
      setLoading(false);
    }
  }, [filter, sortBy]);

  useEffect(() => {
    const loadFeedbacks = async () => {
      await fetchFeedbacks();
    };

    loadFeedbacks();
  }, [fetchFeedbacks]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (editingFeedback) {
        await axios.put(
          `${API_BASE_URL}/feedback/${editingFeedback._id}`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        await axios.post(`${API_BASE_URL}/feedback`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      setFormData({ rating: 5, title: '', comment: '', category: 'Overall' });
      setShowForm(false);
      setEditingFeedback(null);
      fetchFeedbacks();
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert('Failed to submit feedback');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this feedback?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE_URL}/feedback/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchFeedbacks();
    } catch (error) {
      console.error('Error deleting feedback:', error);
    }
  };

  const handleMarkHelpful = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_BASE_URL}/feedback/${id}/helpful`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchFeedbacks();
    } catch (error) {
      console.error('Error marking helpful:', error);
    }
  };

  const handleEdit = (feedback) => {
    setEditingFeedback(feedback);
    setFormData({
      rating: feedback.rating,
      title: feedback.title,
      comment: feedback.comment,
      category: feedback.category
    });
    setShowForm(true);
  };

  const StarRating = ({ rating, interactive = false, onRate = null, size = 'text-xl' }) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => interactive && onRate && onRate(star)}
            disabled={!interactive}
            className={`${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : ''} ${size}`}
          >
            <Star
              className={star <= rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-400'}
              size={size === 'text-3xl' ? 28 : 20}
            />
          </button>
        ))}
      </div>
    );
  };

  const FeedbackCard = ({ feedback }) => {
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    const isOwner = currentUser.id === feedback.user?._id;
    const isPremium = feedback.isPremiumFeedback;

    return (
      <div
        className={`relative overflow-hidden rounded-2xl p-6 transition-all duration-300 ${
          isPremium
            ? 'bg-gradient-to-br from-purple-900/30 via-indigo-900/30 to-blue-900/30 border-2 border-purple-500/50'
            : 'bg-gray-800/50 border border-gray-700'
        } backdrop-blur-sm`}
      >
        {/* Premium Badge */}
        {isPremium && (
          <div className="absolute top-4 right-4">
            <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-xs font-bold">
              <Crown className="text-yellow-400" size={14} />
              <span>Premium</span>
            </div>
          </div>
        )}

        {/* User Info */}
        <div className="flex items-start gap-4 mb-4">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold ${
            isPremium
              ? 'bg-gradient-to-br from-purple-600 to-pink-600'
              : 'bg-gradient-to-br from-blue-600 to-cyan-600'
          }`}>
            {feedback.user?.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-lg">{feedback.user?.name || 'Anonymous'}</h3>
              {feedback.isVerified && (
                <CheckCircle className="text-blue-500" size={16} title="Verified User" />
              )}
            </div>
            <p className="text-sm text-gray-400">
              {new Date(feedback.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
        </div>

        {/* Rating & Category */}
        <div className="flex items-center gap-4 mb-3">
          <StarRating rating={feedback.rating} />
          <span className="px-3 py-1 rounded-full bg-gray-700/50 text-xs font-medium">
            {feedback.category}
          </span>
        </div>

        {/* Title */}
        <h4 className="text-xl font-bold mb-2 text-white">{feedback.title}</h4>

        {/* Comment */}
        <p className="text-gray-300 mb-4 leading-relaxed">{feedback.comment}</p>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-700/50">
          <button
            onClick={() => handleMarkHelpful(feedback._id)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-700/50 hover:bg-gray-600/50 transition-colors"
          >
            <ThumbsUp className="text-blue-400" size={16} />
            <span className="text-sm">Helpful ({feedback.helpfulCount})</span>
          </button>

          {isOwner && (
            <div className="flex gap-2">
              <button
                onClick={() => handleEdit(feedback)}
                className="p-2 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 transition-colors"
              >
                <Edit className="text-blue-400" size={16} />
              </button>
              <button
                onClick={() => handleDelete(feedback._id)}
                className="p-2 rounded-lg bg-red-600/20 hover:bg-red-600/30 transition-colors"
              >
                <Trash2 className="text-red-400" size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600">
              <Star className="text-4xl" size={36} />
            </div>
          </div>
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
            User Feedback & Reviews
          </h1>
          <p className="text-xl text-gray-400">
            Share your experience and help us improve
          </p>
        </div>

        {/* Statistics */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 animate-fade-in">
            <div className="bg-gradient-to-br from-blue-900/30 to-blue-800/30 border border-blue-600/30 rounded-2xl p-6 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-2">
                <Star className="text-3xl text-yellow-500" size={32} />
                <div>
                  <p className="text-sm text-gray-400">Average Rating</p>
                  <p className="text-3xl font-bold">{stats.averageRating}</p>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-green-900/30 to-green-800/30 border border-green-600/30 rounded-2xl p-6 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-2">
                <BarChart3 className="text-3xl text-green-500" size={32} />
                <div>
                  <p className="text-sm text-gray-400">Total Reviews</p>
                  <p className="text-3xl font-bold">{stats.totalFeedbacks}</p>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-purple-900/30 to-purple-800/30 border border-purple-600/30 rounded-2xl p-6 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-2">
                <Crown className="text-3xl text-purple-500" size={32} />
                <div>
                  <p className="text-sm text-gray-400">Premium Reviews</p>
                  <p className="text-3xl font-bold">{stats.premiumFeedbacks}</p>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-orange-900/30 to-orange-800/30 border border-orange-600/30 rounded-2xl p-6 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-2">
                <Trophy className="text-3xl text-orange-500" size={32} />
                <div>
                  <p className="text-sm text-gray-400">5-Star Reviews</p>
                  <p className="text-3xl font-bold">{stats.ratingDistribution?.[5] || 0}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="flex flex-wrap gap-4 mb-8 items-center justify-between animate-fade-in">
          <div className="flex gap-3">
            <button
              onClick={() => setFilter('all')}
              className={`px-6 py-3 rounded-xl font-medium transition-all ${
                filter === 'all'
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg shadow-purple-500/30'
                  : 'bg-gray-700/50 hover:bg-gray-600/50'
              }`}
            >
              All Reviews
            </button>
            <button
              onClick={() => setFilter('premium')}
              className={`px-6 py-3 rounded-xl font-medium transition-all flex items-center gap-2 ${
                filter === 'premium'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 shadow-lg shadow-pink-500/30'
                  : 'bg-gray-700/50 hover:bg-gray-600/50'
              }`}
            >
              <Crown size={16} /> Premium
            </button>
          </div>

          <div className="flex gap-3">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 rounded-xl bg-gray-700/50 border border-gray-600 focus:border-purple-500 focus:outline-none"
            >
              <option value="recent">Most Recent</option>
              <option value="rating">Highest Rated</option>
              <option value="helpful">Most Helpful</option>
            </select>

            <button
              onClick={() => setShowForm(!showForm)}
              className="px-8 py-3 rounded-xl font-medium bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg shadow-purple-500/30"
            >
              {showForm ? 'Cancel' : 'Write Review'}
            </button>
          </div>
        </div>

        {/* Feedback Form */}
        {showForm && (
          <div className="mb-8 animate-slide-down">
              <form onSubmit={handleSubmit} className="bg-gradient-to-br from-purple-900/30 via-indigo-900/30 to-blue-900/30 border-2 border-purple-500/50 rounded-2xl p-8 backdrop-blur-sm">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <Star className="text-yellow-500" size={24} />
                  {editingFeedback ? 'Edit Your Review' : 'Write a Review'}
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Your Rating</label>
                    <StarRating
                      rating={formData.rating}
                      interactive
                      onRate={(rating) => setFormData({ ...formData, rating })}
                      size="text-3xl"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-gray-700/50 border border-gray-600 focus:border-purple-500 focus:outline-none"
                    >
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2">Review Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Summarize your experience..."
                    required
                    maxLength={100}
                    className="w-full px-4 py-3 rounded-xl bg-gray-700/50 border border-gray-600 focus:border-purple-500 focus:outline-none"
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2">Your Review</label>
                  <textarea
                    value={formData.comment}
                    onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                    placeholder="Share your detailed experience..."
                    required
                    maxLength={1000}
                    rows={5}
                    className="w-full px-4 py-3 rounded-xl bg-gray-700/50 border border-gray-600 focus:border-purple-500 focus:outline-none resize-none"
                  />
                  <p className="text-sm text-gray-400 mt-2">{formData.comment.length}/1000 characters</p>
                </div>

                <button
                  type="submit"
                  className="w-full py-4 rounded-xl font-bold text-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg shadow-purple-500/30"
                >
                  {editingFeedback ? 'Update Review' : 'Submit Review'}
                </button>
              </form>
            </div>
          )}

        {/* Feedbacks List */}
        <div className="grid grid-cols-1 gap-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
              <p className="mt-4 text-gray-400">Loading reviews...</p>
            </div>
          ) : feedbacks.length === 0 ? (
            <div className="text-center py-12">
              <Star className="text-6xl text-gray-600 mx-auto mb-4" size={64} />
              <p className="text-xl text-gray-400">No reviews yet. Be the first to share your experience!</p>
            </div>
          ) : (
            feedbacks.map((feedback) => (
              <FeedbackCard key={feedback._id} feedback={feedback} />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Feedback;
