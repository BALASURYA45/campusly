export const A11Y = {
  // Color contrast ratios
  contrast: {
    AALarge: 3,        // 18pt+ or 14pt+ bold
    AA: 4.5,          // Normal text
    AAA: 7,           // Enhanced contrast
    AAALarge: 4.5,    // 18pt+ or 14pt+ bold enhanced
  },

  // Focus management
  focusStyles: {
    outline: '2px solid #0000FF',
    outlineOffset: '2px',
  },

  // Keyboard navigation
  keyboardMap: {
    Enter: 13,
    Escape: 27,
    Space: 32,
    ArrowUp: 38,
    ArrowDown: 40,
    ArrowLeft: 37,
    ArrowRight: 39,
    Tab: 9,
  },

  // ARIA labels
  ariaLabels: {
    closeButton: 'Close dialog',
    searchButton: 'Search',
    menuButton: 'Open menu',
    submitButton: 'Submit form',
    loadingIndicator: 'Loading',
    successMessage: 'Success',
    errorMessage: 'Error',
    warningMessage: 'Warning',
  },

  // Skip links
  skipLink: {
    position: 'absolute',
    top: '-40px',
    left: 0,
    backgroundColor: '#000',
    color: 'white',
    padding: '8px',
    textDecoration: 'none',
    zIndex: 100,
    '&:focus': {
      top: 0,
    },
  },

  // Reduced motion preference
  prefersReducedMotion: {
    '@media (prefers-reduced-motion: reduce)': {
      animation: 'none',
      transition: 'none',
    },
  },
};

export const createA11yProps = (options = {}) => {
  const {
    label,
    role,
    expanded = false,
    disabled = false,
    required = false,
    invalid = false,
    describedBy = null,
  } = options;

  const props = {
    role,
    'aria-label': label,
    'aria-disabled': disabled,
  };

  if (role === 'button') {
    props['aria-pressed'] = options.pressed ?? false;
  }

  if (role === 'menuitem' && expanded !== undefined) {
    props['aria-expanded'] = expanded;
  }

  if (required) {
    props['aria-required'] = true;
  }

  if (invalid) {
    props['aria-invalid'] = true;
  }

  if (describedBy) {
    props['aria-describedby'] = describedBy;
  }

  return props;
};

export const announceScreenReader = (message, priority = 'polite') => {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.textContent = message;
  document.body.appendChild(announcement);

  setTimeout(() => announcement.remove(), 1000);
};

export const focusManager = {
  setFocus: (elementOrSelector) => {
    const element = typeof elementOrSelector === 'string'
      ? document.querySelector(elementOrSelector)
      : elementOrSelector;
    element?.focus();
  },

  trapFocus: (container) => {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    container.addEventListener('keydown', (e) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement?.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement?.focus();
      }
    });
  },
};

export const createAccessibleForm = (fields) => {
  return fields.map(field => ({
    ...field,
    'aria-label': field.label || field.name,
    'aria-required': field.required ? 'true' : 'false',
    'aria-invalid': field.error ? 'true' : 'false',
    'aria-describedby': field.error ? `${field.name}-error` : null,
  }));
};

export const createAccessibleButton = (options = {}) => {
  const {
    label,
    onClick,
    disabled = false,
    type = 'button',
    ariaLabel = label,
  } = options;

  return {
    type,
    onClick,
    disabled,
    'aria-label': ariaLabel,
    'aria-disabled': disabled,
  };
};

export const colorPaletteA11y = {
  // WCAG AA compliant color combinations
  text: {
    onLight: '#000000',
    onDark: '#FFFFFF',
  },
  interactive: {
    focus: '#0000FF',
    active: '#0000CC',
    visited: '#551A8B',
  },
  semantic: {
    success: '#007819',     // Green
    error: '#AE0A0A',       // Red
    warning: '#664D03',     // Brown
    info: '#0043B6',        // Blue
  },
};

export const keyboardShortcuts = {
  register: (key, modifier, callback) => {
    document.addEventListener('keydown', (e) => {
      if ((modifier === 'ctrl' && e.ctrlKey) || (modifier === 'alt' && e.altKey)) {
        if (e.key.toLowerCase() === key.toLowerCase()) {
          e.preventDefault();
          callback();
        }
      }
    });
  },

  ariaKeymap: {
    'alt+s': 'Save',
    'alt+d': 'Delete',
    'alt+e': 'Edit',
    'alt+c': 'Cancel',
    'alt+h': 'Help',
    '?': 'Show keyboard shortcuts',
  },
};
