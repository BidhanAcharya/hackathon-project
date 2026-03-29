/**
 * API Endpoints - All backend API calls organized by domain
 * Based on backend routes:
 * - /api/v1/auth/* - Authentication routes
 * - /api/v1/* - Chat sessions
 * - /api/v1/* - Help requests and matching
 * - /api/v1/websocket/chat/* - WebSocket routes
 */

import apiClient, { BASE_URL } from './apiClient';
import axios from 'axios';

// ============================================
// AUTH ENDPOINTS
// ============================================

/**
 * Register a new user
 * POST /api/v1/auth/register
 */
export async function registerUser({ username, email, password }) {
  const response = await apiClient.post('/api/v1/auth/register', {
    username,
    email,
    password,
  });
  return response.data;
}

/**
 * Register a new helper
 * POST /api/v1/auth/helper/register
 */
export async function registerHelper({ username, email, password, domain_expertise = 'general' }) {
  const response = await apiClient.post('/api/v1/auth/helper/register', {
    username,
    email,
    password,
    domain_expertise,
  });
  return response.data;
}

/**
 * Login user with email and password (OAuth2 form-encoded)
 * POST /api/v1/auth/login/access-token
 * Returns: { access_token, refresh_token, token_type }
 */
export async function loginUser({ email, password }) {
  const body = new URLSearchParams({ username: email, password });
  const response = await axios.post(`${BASE_URL}/api/v1/auth/login/access-token`, body, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });
  return response.data;
}

/**
 * Login helper with email and password (OAuth2 form-encoded)
 * POST /api/v1/auth/helper/login/access-token
 */
export async function loginHelper({ email, password }) {
  const body = new URLSearchParams({ username: email, password });
  const response = await axios.post(`${BASE_URL}/api/v1/auth/helper/login/access-token`, body, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });
  return response.data;
}

/**
 * Refresh access token
 * POST /api/v1/auth/refresh-token
 * Returns: { access_token, refresh_token, token_type }
 */
export async function refreshTokens(refreshToken) {
  const response = await axios.post(`${BASE_URL}/api/v1/auth/refresh-token`, {
    refresh_token: refreshToken,
  });
  return response.data;
}

/**
 * Get current user info
 * GET /api/v1/auth/users/me
 * Returns: { username, email }
 */
export async function getMe() {
  const response = await apiClient.get('/api/v1/auth/users/me');
  return response.data;
}

/**
 * Get current helper info
 * GET /api/v1/auth/helper/me
 */
export async function getHelperMe() {
  const response = await apiClient.get('/api/v1/auth/helper/me');
  return response.data;
}

// ============================================
// CHAT SESSION ENDPOINTS
// ============================================

/**
 * Create a new chat session
 * POST /api/v1/sessions
 * Returns: { session_id }
 */
export async function createChatSession(query = '') {
  const response = await apiClient.post('/api/v1/sessions', { query });
  return response.data;
}

/**
 * Get all chat sessions for current user
 * GET /api/v1/sessions
 * Returns: { sessions: [{ session_id, created_at, title }] }
 */
export async function getAllSessions() {
  const response = await apiClient.get('/api/v1/sessions');
  return response.data;
}

/**
 * Get chat history for a specific session
 * GET /api/v1/sessions/{session_id}
 * Returns: { session_id, messages: [{ role, content, timestamp }] }
 */
export async function getSessionHistory(sessionId) {
  const response = await apiClient.get(`/api/v1/sessions/${sessionId}`);
  return response.data;
}

/**
 * Send a message in a chat session
 * POST /api/v1/sessions/{session_id}/messages
 * Returns: { session_id, response }
 */
export async function sendChatMessage(sessionId, query) {
  const response = await apiClient.post(`/api/v1/sessions/${sessionId}/messages`, { query });
  return response.data;
}

/**
 * Delete a chat session
 * DELETE /api/v1/sessions/{session_id}
 * Returns: { detail: "Session deleted successfully" }
 */
export async function deleteSession(sessionId) {
  const response = await apiClient.delete(`/api/v1/sessions/${sessionId}`);
  return response.data;
}

// ============================================
// ASSESSMENT & HELP REQUEST ENDPOINTS
// ============================================

/**
 * Store individual assessment Q&A pairs from onboarding
 * POST /api/v1/assessments
 * Body: { assessments: [{ question, answer }] }
 */
export async function storeAssessments(assessments) {
  const response = await apiClient.post('/api/v1/assessments', {
    assessments,
  });
  return response.data;
}

/**
 * Submit initial assessment (onboarding) - analyzes conversation and stores result
 * POST /api/v1/initial-assessment
 * Body: { conversation }
 */
export async function submitInitialAssessment(conversation) {
  const response = await apiClient.post('/api/v1/initial-assessment', {
    conversation,
  });
  return response.data;
}

/**
 * Analyze conversation for domain
 * POST /api/v1/analyze
 * Body: { conversation }
 * Returns: { domain }
 */
export async function analyzeConversation(conversation) {
  const response = await apiClient.post('/api/v1/analyze', { conversation });
  return response.data;
}

/**
 * Request help from a professional
 * POST /api/v1/request
 * Body: { domain, user_id, preferences }
 */
export async function requestHelp(domain, userId, preferences = null) {
  const response = await apiClient.post('/api/v1/request', {
    domain,
    user_id: userId,
    preferences,
  });
  return response.data;
}

/**
 * Get all help requests for the current user
 * GET /api/v1/my-requests
 */
export async function getMyRequests() {
  const response = await apiClient.get('/api/v1/my-requests');
  return response.data;
}

/**
 * Get help session status
 * GET /api/v1/status/{session_id}
 * Returns: { status }
 */
export async function getHelpSessionStatus(sessionId) {
  const response = await apiClient.get(`/api/v1/status/${sessionId}`);
  return response.data;
}

/**
 * Get help session detail with user info
 * GET /api/v1/session-detail/{session_id}
 * Returns: { session_id, user_id, helper_id, status, created_at, initial_assessment }
 */
export async function getHelpSessionDetail(sessionId) {
  const response = await apiClient.get(`/api/v1/session-detail/${sessionId}`);
  return response.data;
}

/**
 * Get pending requests for a helper
 * GET /api/v1/pending/{helper_id}
 */
export async function getPendingRequests(helperId) {
  const response = await apiClient.get(`/api/v1/pending/${helperId}`);
  return response.data;
}

/**
 * Get active sessions for a helper
 * GET /api/v1/active/{helper_id}
 */
export async function getActiveSessions(helperId) {
  const response = await apiClient.get(`/api/v1/active/${helperId}`);
  return response.data;
}

/**
 * Accept a help request (for helpers)
 * POST /api/v1/accept/{session_id}
 * Returns: { message, session_id }
 */
export async function acceptHelpRequest(sessionId) {
  const response = await apiClient.post(`/api/v1/accept/${sessionId}`);
  return response.data;
}

/**
 * Close a help session
 * POST /api/v1/close/{session_id}
 * Returns: { message }
 */
export async function closeHelpSession(sessionId) {
  const response = await apiClient.post(`/api/v1/close/${sessionId}`);
  return response.data;
}

/**
 * Get all available helpers
 * GET /api/v1/helpers
 * Returns: [{ helper_id, username, email, domain_expertise }]
 */
export async function getAllHelpers() {
  const response = await apiClient.get('/api/v1/helpers');
  return response.data;
}

// ============================================
// WEBSOCKET ENDPOINTS
// ============================================

/**
 * Get WebSocket chat history
 * GET /api/v1/websocket/chat/{session_id}/history
 */
export async function getWebSocketChatHistory(sessionId) {
  const response = await apiClient.get(`/api/v1/websocket/chat/${sessionId}/history`);
  return response.data;
}

/**
 * Create WebSocket connection for real-time chat
 * @param {string} sessionId - The help session ID
 * @param {string} role - 'user' or 'helper'
 * @returns {WebSocket}
 */
export function createWebSocketConnection(sessionId, role) {
  const wsUrl = `ws://localhost:8000/api/v1/websocket/chat/${sessionId}/${role}`;
  return new WebSocket(wsUrl);
}

// ============================================
// API ERROR HANDLER
// ============================================

/**
 * Extract error message from API error response
 */
export function getErrorMessage(error) {
  if (error.response?.data?.detail) {
    return error.response.data.detail;
  }
  if (error.message) {
    return error.message;
  }
  return 'An unexpected error occurred';
}
