import { apiGet, apiPost, apiDelete } from './apiClient';

export const API = {
  // Get matching sitters for a job
  getMatchingSitters: (jobId) => apiGet(`/matching/matches/${jobId}`),

  // Get job details
  getJobDetails: (jobId) => apiGet(`/jobs/jobdetails/${jobId}`),

  // Get all sitters (search sitters)
  getSitters: () => apiPost('/matching/search-sitters', {}),

  // Reject a job
  rejectJob: (jobId) => apiPost(`/matching/reject?jobId=${jobId}`, {}),

  // Get sitter availability
  getSitterAvailability: (sitterId) => apiGet(`/matching/availability/${sitterId}`),

  // Get open jobs (optionally filtered by city)
  getJobs: (city) => {
    const url = city
      ? `/jobs?city=${encodeURIComponent(city)}`
      : '/jobs';
    return apiGet(url);
  },

  // Confirm a job (sitter accepts)
  confirmJob: (jobId, sitterId) => apiPost(`/jobs/confirm/${jobId}/${sitterId}`, {}),

  // Confirm bulk jobs
  confirmJobsBulk: (jobIds, sitterId) => apiPost('/jobs/confirm-bulk', { JobIds: jobIds, SitterId: sitterId }),

  // Clear all availability for a sitter
  clearAllAvailability: (sitterId) => apiDelete(`/matching/availability/clear/${sitterId}`),

  // Get job requests specifically matched to a sitter's availability
  getJobRequests: (sitterId) => apiGet(`/matching/jobrequests?sitterId=${sitterId}`),

  // Get reviews for a user (parent or sitter)
  getUserReviews: (userId, role) => apiGet(`/review/user/${userId}/${role}`),

  // Save sitter availability
  saveAvailability: (payload) =>
    apiPost('/matching/availability/save', {
      SitterId: payload.sitterId,
      Date: payload.date,
      SlotIds: payload.slotIds,
      City: payload.city,
    }),
};

export default API;

