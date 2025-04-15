// Local storage utilities
export function getLocalStorage(key) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (e) {
      console.error(`Error getting localStorage item ${key}:`, e);
      return null;
    }
  }
  
  export function setLocalStorage(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.error(`Error setting localStorage item ${key}:`, e);
    }
  }
  
  export function removeLocalStorage(key) {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.error(`Error removing localStorage item ${key}:`, e);
    }
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
  export function formatDate(date) {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
  
  export function formatCategoryName(category) {
    return category
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }