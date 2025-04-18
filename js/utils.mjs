/**
 * Get data from local storage
 * @param {string} key - The key to get from localStorage
 * @returns {Object|null} The parsed data or null if none exists
 */

// Local storage utilities
export function getLocalStorage(key) {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error(`Error getting localStorage item ${key}:`, error);
    return null;
  }
}

/**
 * Save data to local storage
 * @param {string} key - The key to use for localStorage
 * @param {Object} data - The data to save
 */

export function setLocalStorage(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error(`Error setting localStorage item ${key}:`, error);
    return false;
  }
}

/**
 * Remove data from local storage
 * @param {string} key - The key to remove from localStorage
 */

export function removeLocalStorage(key) {
  try {
    localStorage.removeItem(key);
  } catch (e) {
    console.error(`Error removing localStorage item ${key}:`, e);
  }
}

/**
 * Check if a user is logged in
 * @returns {boolean} True if user is logged in, false otherwise
 */
export function isLoggedIn() {
  const userData = getLocalStorage('userData');
  return !!(userData && userData.username);
}

/**
* Get the current logged in user data
* @returns {Object|null} The user data or null if not logged in
*/
export function getCurrentUser() {
  return getLocalStorage('userData');
}

export function getParam(param) {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  return urlParams.get(param);
}

// Environment variable helper for browser context
export function getEnvVariable(name) {
  // In browser context, we would typically access ENV variables
  // that have been injected during build process
  if (typeof window !== 'undefined' && window.ENV && window.ENV[name]) {
    return window.ENV[name];
  }
  // Fallback
  return '';
}

// DOM manipulation helpers
export function createElement(tag, className, text = '') {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text) element.textContent = text;
  return element;
}

export function createElementWithAttributes(tag, attrs = {}, text = '') {
  const element = document.createElement(tag);
  
  Object.entries(attrs).forEach(([key, value]) => {
    if (key === 'className') {
      element.className = value;
    } else if (key === 'dataset') {
      Object.entries(value).forEach(([dataKey, dataValue]) => {
        element.dataset[dataKey] = dataValue;
      });
    } else {
      element.setAttribute(key, value);
    }
  });
  
  if (text) element.textContent = text;
  return element;
}

export function appendChildren(parent, children) {
  if (!parent) return;
  children.forEach(child => {
    if (child) parent.appendChild(child);
  });
}

// Formatting helpers
export function formatDate(dateString) {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
}

export function formatCategoryName(category) {
  return category
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// Format cooking time from minutes
export function formatCookingTime(minutes) {
  if (!minutes) return 'Time not specified';
  
  if (minutes < 60) {
    return `${minutes} min`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours} hr`;
  }
  
  return `${hours} hr ${remainingMinutes} min`;
}

/**
 * Log out the current user
 */
export function logoutUser() {
  // We don't completely remove the userData, just mark as logged out
  const userData = getLocalStorage('userData');
  if (userData) {
      userData.isLoggedIn = false;
      setLocalStorage('userData', userData);
  }
}
