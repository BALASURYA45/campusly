const Theme = require('../models/Theme');
const User = require('../models/User');

// @desc    Get current active theme
// @route   GET /api/v1/admin/theme
// @access  Public
exports.getActiveTheme = async (req, res, next) => {
  try {
    let theme = await Theme.findOne({ isActive: true });

    if (!theme) {
      theme = await Theme.findOne({ isSystem: true });
    }

    if (!theme) {
      return res.status(404).json({ message: 'No active theme found' });
    }

    res.status(200).json({
      success: true,
      data: theme,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// @desc    Get all themes
// @route   GET /api/v1/admin/themes
// @access  Admin
exports.getAllThemes = async (req, res, next) => {
  try {
    const themes = await Theme.find()
      .populate('createdBy', 'name email')
      .sort({ isSystem: -1, createdAt: -1 });

    const total = await Theme.countDocuments();

    res.status(200).json({
      success: true,
      data: themes,
      total,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// @desc    Get single theme
// @route   GET /api/v1/admin/theme/:id
// @access  Admin
exports.getThemeById = async (req, res, next) => {
  try {
    const theme = await Theme.findById(req.params.id)
      .populate('createdBy', 'name email');

    if (!theme) {
      return res.status(404).json({ message: 'Theme not found' });
    }

    res.status(200).json({
      success: true,
      data: theme,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// @desc    Create new theme
// @route   POST /api/v1/admin/theme
// @access  Admin
exports.createTheme = async (req, res, next) => {
  try {
    const {
      name,
      primaryColor,
      secondaryColor,
      backgroundColor,
      textColor,
      successColor,
      errorColor,
      warningColor,
      infoColor,
      settings,
      darkMode,
    } = req.body;

    const theme = await Theme.create({
      name,
      primaryColor,
      secondaryColor,
      backgroundColor,
      textColor,
      successColor,
      errorColor,
      warningColor,
      infoColor,
      settings,
      darkMode,
      createdBy: req.user.id,
    });

    res.status(201).json({
      success: true,
      data: theme,
      message: 'Theme created successfully',
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// @desc    Update theme
// @route   PUT /api/v1/admin/theme/:id
// @access  Admin
exports.updateTheme = async (req, res, next) => {
  try {
    let theme = await Theme.findById(req.params.id);

    if (!theme) {
      return res.status(404).json({ message: 'Theme not found' });
    }

    // Prevent updating system themes
    if (theme.isSystem && req.user.role !== 'superadmin') {
      return res.status(403).json({ message: 'Cannot modify system themes' });
    }

    theme = await Theme.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: theme,
      message: 'Theme updated successfully',
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// @desc    Set theme as active
// @route   PUT /api/v1/admin/theme/:id/activate
// @access  Admin
exports.activateTheme = async (req, res, next) => {
  try {
    const theme = await Theme.findById(req.params.id);

    if (!theme) {
      return res.status(404).json({ message: 'Theme not found' });
    }

    // Deactivate all other themes
    await Theme.updateMany({ _id: { $ne: req.params.id } }, { isActive: false });

    // Activate the selected theme
    theme.isActive = true;
    await theme.save();

    res.status(200).json({
      success: true,
      data: theme,
      message: 'Theme activated successfully',
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// @desc    Delete theme
// @route   DELETE /api/v1/admin/theme/:id
// @access  Admin
exports.deleteTheme = async (req, res, next) => {
  try {
    const theme = await Theme.findById(req.params.id);

    if (!theme) {
      return res.status(404).json({ message: 'Theme not found' });
    }

    if (theme.isSystem) {
      return res.status(403).json({ message: 'Cannot delete system themes' });
    }

    if (theme.isActive) {
      return res.status(400).json({ message: 'Cannot delete active theme. Activate another theme first.' });
    }

    await Theme.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Theme deleted successfully',
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// @desc    Duplicate theme
// @route   POST /api/v1/admin/theme/:id/duplicate
// @access  Admin
exports.duplicateTheme = async (req, res, next) => {
  try {
    const originalTheme = await Theme.findById(req.params.id);

    if (!originalTheme) {
      return res.status(404).json({ message: 'Theme not found' });
    }

    const themeData = originalTheme.toObject();
    delete themeData._id;
    themeData.name = `${themeData.name} (Copy)`;
    themeData.isActive = false;
    themeData.isSystem = false;
    themeData.createdBy = req.user.id;

    const newTheme = await Theme.create(themeData);

    res.status(201).json({
      success: true,
      data: newTheme,
      message: 'Theme duplicated successfully',
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// @desc    Get preset themes
// @route   GET /api/v1/admin/theme/presets
// @access  Public
exports.getPresets = async (req, res, next) => {
  try {
    const presets = [
      {
        name: 'Default Blue',
        colors: {
          primaryColor: '#1976d2',
          secondaryColor: '#dc004e',
          backgroundColor: '#ffffff',
          textColor: '#000000',
          successColor: '#4caf50',
          errorColor: '#f44336',
          warningColor: '#ff9800',
          infoColor: '#2196f3',
        },
      },
      {
        name: 'Dark Mode',
        colors: {
          primaryColor: '#90caf9',
          secondaryColor: '#f48fb1',
          backgroundColor: '#121212',
          textColor: '#ffffff',
          successColor: '#66bb6a',
          errorColor: '#ef5350',
          warningColor: '#ffa726',
          infoColor: '#29b6f6',
        },
      },
      {
        name: 'Green Nature',
        colors: {
          primaryColor: '#2e7d32',
          secondaryColor: '#00bcd4',
          backgroundColor: '#ffffff',
          textColor: '#1b5e20',
          successColor: '#66bb6a',
          errorColor: '#f44336',
          warningColor: '#ff9800',
          infoColor: '#00bcd4',
        },
      },
      {
        name: 'Purple Elite',
        colors: {
          primaryColor: '#7c3aed',
          secondaryColor: '#ec4899',
          backgroundColor: '#ffffff',
          textColor: '#1f2937',
          successColor: '#10b981',
          errorColor: '#ef4444',
          warningColor: '#f59e0b',
          infoColor: '#3b82f6',
        },
      },
    ];

    res.status(200).json({
      success: true,
      data: presets,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// @desc    Reset theme to default
// @route   PUT /api/v1/admin/theme/reset
// @access  Admin
exports.resetThemeToDefault = async (req, res, next) => {
  try {
    let defaultTheme = await Theme.findOne({ isSystem: true });

    if (!defaultTheme) {
      defaultTheme = await Theme.create({
        name: 'Default System Theme',
        isSystem: true,
        isActive: true,
        primaryColor: '#1976d2',
        secondaryColor: '#dc004e',
        backgroundColor: '#ffffff',
        textColor: '#000000',
        successColor: '#4caf50',
        errorColor: '#f44336',
        warningColor: '#ff9800',
        infoColor: '#2196f3',
      });
    }

    await Theme.updateMany({ _id: { $ne: defaultTheme._id } }, { isActive: false });
    defaultTheme.isActive = true;
    await defaultTheme.save();

    res.status(200).json({
      success: true,
      data: defaultTheme,
      message: 'Theme reset to default successfully',
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
