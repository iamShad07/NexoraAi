const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticateToken } = require('../middleware/auth');
const { requireRole, requireSuperAdmin, requirePermission } = require('../middleware/rbac');

// Admin login
router.post('/login', adminController.adminLogin);

// Protect all following routes with Token and Role check
router.use(authenticateToken);
router.use(requireRole(['ADMIN', 'SUPER_ADMIN']));

router.get('/analytics', requirePermission('VIEW_ANALYTICS'), adminController.getAnalytics);
router.get('/users', requirePermission('VIEW_USERS'), adminController.getUsers);
router.patch('/users/:id/status', requirePermission('MANAGE_USERS'), adminController.updateUserStatus);
router.delete('/users/:id', requirePermission('MANAGE_USERS'), adminController.deleteUser);

router.get('/documents', requirePermission('VIEW_DOCUMENTS'), adminController.getAdminDocuments);
router.delete('/documents/:id', requirePermission('MANAGE_DOCUMENTS'), adminController.deleteAdminDocument);

router.get('/activity-logs', requirePermission('VIEW_ACTIVITY_LOGS'), adminController.getActivityLogs);

// Super Admin Only routes
router.post('/create-admin', requireSuperAdmin(), adminController.createAdminAccount);
router.get('/settings', requireSuperAdmin(), adminController.getSystemSettings);
router.put('/settings', requireSuperAdmin(), adminController.updateSystemSettings);

module.exports = router;
