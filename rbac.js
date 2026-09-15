const AdminPermission = require('../models/AdminPermission');

/**
 * Enforces role-based access control (RBAC).
 * Allowed roles: 'USER', 'ADMIN', 'SUPER_ADMIN'
 * If a regular user hits an admin route, returns 403 Forbidden.
 */
const requireRole = (allowedRoles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: '403 Forbidden: You do not have permission to access this administrative resource.'
      });
    }

    next();
  };
};

const requireSuperAdmin = () => {
  return (req, res, next) => {
    if (!req.user || req.user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({
        success: false,
        message: '403 Forbidden: Super Admin privilege required.'
      });
    }
    next();
  };
};

/**
 * Checks granular permissions for ADMIN accounts.
 * SUPER_ADMIN bypasses granular checks.
 */
const requirePermission = (permissionKey) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    if (req.user.role === 'SUPER_ADMIN') {
      return next();
    }

    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: '403 Forbidden: Administrator privilege required.'
      });
    }

    // Check granular permissions for this admin
    const adminPerm = AdminPermission.findOne({ userId: req.user.id });
    if (!adminPerm || !adminPerm.permissions || !adminPerm.permissions.includes(permissionKey)) {
      return res.status(403).json({
        success: false,
        message: `403 Forbidden: You lack the '${permissionKey}' permission.`
      });
    }

    next();
  };
};

module.exports = {
  requireRole,
  requireSuperAdmin,
  requirePermission
};
