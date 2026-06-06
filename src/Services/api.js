const BASE_URL = "/api";

export const API = {
  // Get matching sitters for a job
  getMatchingSitters: async (jobId) => {
    const res = await fetch(`${BASE_URL}/jobs/${jobId}/matchingsitters`);
    return res.json();
  },

  // Get job details
  getJobDetails: async (jobId) => {
    const res = await fetch(`${BASE_URL}/jobs/jobdetails/${jobId}`);
    return res.json();
  },

  // Get all sitters (optional)
  getSitters: async () => {
    const res = await fetch(`${BASE_URL}/matching/sitters`);
    return res.json();
  },

  // Reject a job
  rejectJob: async (jobId) => {
    const res = await fetch(`${BASE_URL}/matching/reject?jobId=${jobId}`, {
      method: 'POST',
    });
    return res.json();
  },

  // Get sitter availability
  getSitterAvailability: async (sitterId) => {
    const res = await fetch(`${BASE_URL}/matching/availability/${sitterId}`);
    if (!res.ok) throw new Error(`getSitterAvailability failed: ${res.status}`);
    return res.json();
  },

  // Get open jobs (optionally filtered by city)
  getJobs: async (city) => {
    const url = city
      ? `${BASE_URL}/jobs?city=${encodeURIComponent(city)}`
      : `${BASE_URL}/jobs`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`getJobs failed: ${res.status}`);
    return res.json();
  },

  // Confirm a job (sitter accepts)
  confirmJob: async (jobId, sitterId) => {
    const res = await fetch(`${BASE_URL}/jobs/confirm/${jobId}/${sitterId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) throw new Error(`confirmJob failed: ${res.status}`);
    return res.json();
  },

confirmJobsBulk: async (jobIds, sitterId) => {
  const res = await fetch(`${BASE_URL}/jobs/confirm-bulk`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ JobIds: jobIds, SitterId: sitterId }),
  });
  if (!res.ok) throw new Error(`confirmJobsBulk failed: ${res.status}`);
  return res.json();
},

  // Clear all availability for a sitter
  clearAllAvailability: async (sitterId) => {
    const res = await fetch(`${BASE_URL}/matching/availability/clear/${sitterId}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error(`clearAllAvailability failed: ${res.status}`);
    return res.json();
  },
  // Get job requests specifically matched to a sitter's availability
getJobRequests: async (sitterId) => {
  const res = await fetch(`${BASE_URL}/matching/jobrequests?sitterId=${sitterId}`);
  if (!res.ok) throw new Error(`getJobRequests failed: ${res.status}`);
  return res.json();
},

  // Get reviews for a user (parent or sitter)
  getUserReviews: async (userId, role) => {
    const res = await fetch(`${BASE_URL}/review/user/${userId}/${role}`);
    if (!res.ok) throw new Error('Failed to fetch reviews');
    return res.json();
  },

  // Save sitter availability
  saveAvailability: async (payload) => {
    const res = await fetch(`${BASE_URL}/matching/availability/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            SitterId: payload.sitterId,
            Date: payload.date,
            SlotIds: payload.slotIds,
            City: payload.city,
        }),
    });
    if (!res.ok) {
        const errorText = await res.text();   // ← capture the real error
        console.error('Save error body:', errorText);
        throw new Error(`saveAvailability failed: ${res.status} - ${errorText}`);
    }
    return res.json();
},
};