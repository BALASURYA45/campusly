const express = require('express');
const {
  getActiveTheme,
  getAllThemes,
  getThemeById,
  createTheme,
  updateTheme,
  activateTheme,
  deleteTheme,
  duplicateTheme,
  getPresets,
  resetThemeToDefault,
} = require('../controllers/themeController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Public route - get active theme
router.get('/active', getActiveTheme);

// Public route - get presets
router.get('/presets', getPresets);

// Admin only routes
router.get('/', protect, authorize('admin', 'superadmin'), getAllThemes);
router.get('/:id', protect, authorize('admin', 'superadmin'), getThemeById);
router.post('/', protect, authorize('admin', 'superadmin'), createTheme);
router.put('/:id', protect, authorize('admin', 'superadmin'), updateTheme);
router.put('/:id/activate', protect, authorize('admin', 'superadmin'), activateTheme);
router.post('/:id/duplicate', protect, authorize('admin', 'superadmin'), duplicateTheme);
router.delete('/:id', protect, authorize('admin', 'superadmin'), deleteTheme);

// Super admin only - reset to default
router.put('/reset', protect, authorize('superadmin'), resetThemeToDefault);

module.exports = router;
