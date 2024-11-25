export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

export const throttle = (func, limit) => {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

export const formatRoomTopic = (topic) => {
  if (!topic) return '';
  return topic.charAt(0).toUpperCase() + topic.slice(1);
};

export const getInitials = (name) => {
  if (!name) return '';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();
};

export const generateRandomColor = () => {
  const colors = [
    '#1a73e8',
    '#34a853',
    '#fbbc04',
    '#ea4335',
    '#9334e6',
    '#f50057',
    '#00bcd4',
    '#4caf50',
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};
