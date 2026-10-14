const rawApiUrl = import.meta.env.VITE_API_URL || '/api';
let cleanApiUrl = rawApiUrl.replace(/\/+$/, '');
if (cleanApiUrl.startsWith('http') && !cleanApiUrl.endsWith('/api')) {
  cleanApiUrl += '/api';
}
const API_BASE_URL = cleanApiUrl;

export async function apiRequest(endpoint, options = {}) {
  const { method = 'GET', data, params, headers = {}, isFormData = false } = options;

  let url = `${API_BASE_URL}${endpoint}`;

  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        searchParams.append(key, val);
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
  }

  const token = localStorage.getItem('reloop_token');

  const requestHeaders = {
    ...headers,
    ...(token && { Authorization: `Bearer ${token}` }),
  };

  if (!isFormData && data) {
    requestHeaders['Content-Type'] = 'application/json';
  }

  const fetchOptions = {
    method,
    headers: requestHeaders,
    credentials: 'include', // Support HTTP-only cookies
  };

  if (data) {
    fetchOptions.body = isFormData ? data : JSON.stringify(data);
  }

  const response = await fetch(url, fetchOptions);

  let responseData = null;
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    responseData = await response.json();
  } else {
    responseData = await response.text();
  }

  if (!response.ok) {
    const errorMessage =
      (responseData && responseData.message) ||
      (typeof responseData === 'string' ? responseData : 'An unexpected error occurred');

    const error = new Error(errorMessage);
    error.status = response.status;
    error.errors = responseData?.errors || null;
    throw error;
  }

  return responseData?.data !== undefined ? responseData.data : responseData;
}
