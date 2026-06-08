import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'https://ubuntu-math-backend.onrender.com/api';

const api = axios.create({ baseURL: BASE_URL });

// Attach JWT token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (err) => Promise.reject(err)
);

// On 401, clear auth and redirect to login
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('user');
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authAPI = {
  signin: (data) => api.post('/auth/signin', data),
  signup: (data) => api.post('/auth/register', data),
  getMe: (userId) => api.get(`/auth/me/${userId}`),
};

// ── Stories ───────────────────────────────────────────────────────────────────
export const storiesAPI = {
  getAll: () => api.get('/stories'),
  getBySlug: (slug) => api.get(`/story/${slug}`),
  create: (data) => api.post('/stories', data),
  update: (id, data) => api.put(`/stories/${id}`, data),
  delete: (id) => api.delete(`/stories/${id}`),
};

// ── Innovations ───────────────────────────────────────────────────────────────
export const innovationsAPI = {
  getById: (id) => api.get(`/innovation/${id}`),
  getByStory: (storyId) => api.get(`/innovation/story/${storyId}`),
};

// ── Modules ───────────────────────────────────────────────────────────────────
export const modulesAPI = {
  getAll: () => api.get('/modules'),
  getById: (id) => api.get(`/module/${id}`),
  getByInnovation: (innovationId) => api.get(`/module/innovation/${innovationId}`),
  create: (data) => api.post('/module', data),
  update: (id, data) => api.put(`/module/${id}`, data),
  delete: (id) => api.delete(`/module/${id}`),
};

// ── Progress ──────────────────────────────────────────────────────────────────
export const progressAPI = {
  update: (data) => api.post('/progress/update', data),
  complete: (data) => api.post('/progress/complete', data),
  getByUser: (userId) => api.get(`/progress/${userId}`),
};

// ── Courses ───────────────────────────────────────────────────────────────────
export const coursesAPI = {
  getPublished: () => api.get('/courses'),
  getAll: () => api.get('/courses/all'),
  getById: (id) => api.get(`/courses/${id}`),
  getBySlug: (slug) => api.get(`/course/slug/${slug}`),
  create: (data) => api.post('/courses', data),
  update: (id, data) => api.put(`/courses/${id}`, data),
  delete: (id) => api.delete(`/courses/${id}`),
};

// ── Enrollments ───────────────────────────────────────────────────────────────
export const enrollmentsAPI = {
  enroll: (data) => api.post('/enrollments', data),
  getByUser: (userId) => api.get(`/enrollments/user/${userId}`),
  getOne: (userId, courseId) => api.get(`/enrollments/${userId}/${courseId}`),
  updateLessonProgress: (data) => api.post('/enrollments/progress', data),
  issueCertificate: (enrollmentId, data) => api.post(`/enrollments/${enrollmentId}/certificate`, data),
  purchaseCertificate: (certificateId) => api.post(`/certificates/${certificateId}/purchase`),
};

// ── Subscriptions ─────────────────────────────────────────────────────────────
export const subscriptionsAPI = {
  getPlans: () => api.get('/pricing'),
  getMine: (userId) => api.get(`/subscriptions/${userId}`),
  create: (data) => api.post('/subscriptions', data),
  cancel: (id) => api.delete(`/subscriptions/${id}`),
};

// ── Payments ──────────────────────────────────────────────────────────────────
export const paymentsAPI = {
  // EvriPay (ZAR bank transfers)
  initiate: (data) => api.post('/payments/initiate', data),
  getStatus: (paymentId) => api.get(`/payments/${paymentId}/status`),
  getHistory: (params) => api.get('/payments/history', { params }),
  cancel: (paymentId) => api.post(`/payments/${paymentId}/cancel`),
  
  // Legacy Paystack/Stripe (keeping for backward compatibility)
  initPaystack: (data) => api.post('/payment/paystack/init', data),
  verifyPaystack: (data) => api.post('/payment/paystack/verify', data),
  initStripe: (data) => api.post('/payment/stripe/session', data),
  verifyStripe: (data) => api.post('/payment/stripe/verify', data),
};

// ── Admin ─────────────────────────────────────────────────────────────────────
export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  getUsers: () => api.get('/admin/users'),
  updateUserRole: (id, role) => api.patch(`/admin/users/${id}/role`, { role }),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  createUser: (data) => api.post('/admin/users/create', data),
};

// ── Analytics ─────────────────────────────────────────────────────────────────
export const analyticsAPI = {
  track: (data) => api.post('/analytics/track', data),
};

// ── Ubuntu Computation ────────────────────────────────────────────────────────
export const computationAPI = {
  calculate: (data) => api.post('/ubuntu/calculate', data),
};

// ── Google Classroom ──────────────────────────────────────────────────────────
export const googleAPI = {
  getAuthUrl: (userId) => api.get('/google/auth-url', { params: { userId } }),
  listCourses: (userId) => api.get('/google/courses', { params: { userId } }),
  importCourses: (data) => api.post('/google/import', data),
};

// ── Upload ────────────────────────────────────────────────────────────────────
export const uploadAPI = {
  upload: (formData) => api.post('/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  uploadMultiple: (formData) => api.post('/upload/multiple', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  deleteFile: (publicId, resourceType = 'raw') => api.delete('/upload', { data: { publicId, resourceType } }),
  listFiles: (folder, type = 'raw') => api.get('/upload/list', { params: { folder, type } }),
};

// ── Books ─────────────────────────────────────────────────────────────────────
export const booksAPI = {
  getAll: () => api.get('/books'),
  getAllAdmin: () => api.get('/books/all'),
  getBySlug: (slug) => api.get(`/books/slug/${slug}`),
  checkPurchase: (userId, bookId) => api.get('/books/check-purchase', { params: { userId, bookId } }),
  download: (id, userId) => api.post(`/books/${id}/download`, { userId }),
  initPayment: (data) => api.post('/books/payment/init', data),
  verifyPayment: (data) => api.post('/books/payment/verify', data),
  create: (data) => api.post('/books', data),
  update: (id, data) => api.put(`/books/${id}`, data),
  delete: (id) => api.delete(`/books/${id}`),
};

// ── Essays ────────────────────────────────────────────────────────────────────
export const essaysAPI = {
  getAll: (params) => api.get('/essays', { params }),
  getAllAdmin: () => api.get('/essays/all'),
  getBySlug: (slug) => api.get(`/essays/slug/${slug}`),
  download: (id) => api.post(`/essays/${id}/download`),
  create: (data) => api.post('/essays', data),
  update: (id, data) => api.put(`/essays/${id}`, data),
  delete: (id) => api.delete(`/essays/${id}`),
};

// ── Industrial Processes ──────────────────────────────────────────────────────
export const processesAPI = {
  getAll: (params) => api.get('/processes', { params }),
  getAllAdmin: () => api.get('/processes/all'),
  getBySlug: (slug) => api.get(`/processes/slug/${slug}`),
  download: (id) => api.post(`/processes/${id}/download`),
  initPayment: (data) => api.post('/processes/payment/init', data),
  create: (data) => api.post('/processes', data),
  update: (id, data) => api.put(`/processes/${id}`, data),
  delete: (id) => api.delete(`/processes/${id}`),
};

// ── Community ─────────────────────────────────────────────────────────────────
export const communityAPI = {
  getChannels: () => api.get('/community/channels'),
  getPosts: (params) => api.get('/community/posts', { params }),
  createPost: (data) => api.post('/community/posts', data),
  likePost: (id, userId) => api.post(`/community/posts/${id}/like`, { userId }),
  deletePost: (id) => api.delete(`/community/posts/${id}`),
  pinPost: (id) => api.patch(`/community/posts/${id}/pin`),
  search: (params) => api.get('/community/search', { params }),
};

// ── Marketplace ───────────────────────────────────────────────────────────────
export const marketplaceAPI = {
  getCatalog: () => api.get('/marketplace/catalog'),
  getPatentDossier: () => api.get('/marketplace/patent-dossier'),
  acceptLicense: (data) => api.post('/marketplace/license/accept', data),
  checkLicense: (userId, productId) => api.get('/marketplace/license/check', { params: { userId, productId } }),
  getLibrary: (userId) => api.get(`/marketplace/library/${userId}`),
  validateCoupon: (data) => api.post('/marketplace/coupon/validate', data),
  initPayment: (data) => api.post('/marketplace/payment/init', data),
  verifyPayment: (data) => api.post('/marketplace/payment/verify', data),
  download: (productId, data) => api.post(`/marketplace/download/${productId}`, data),
  getInvoice: (purchaseId, userId) => api.get(`/marketplace/invoice/${purchaseId}`, { params: { userId } }),
  getSalesDashboard: () => api.get('/admin/sales'),
};

export default api;
