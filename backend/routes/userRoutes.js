const express = require('express');
const router = express.Router();
const { createUser, getUsers, updateAgentProfile, setUserActive } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);
router.get('/', authorize('admin'), getUsers);
router.post('/', authorize('admin'), createUser);
router.put('/:id/agent-profile', authorize('admin', 'agent'), updateAgentProfile);
router.put('/:id/active', authorize('admin'), setUserActive);

module.exports = router;
