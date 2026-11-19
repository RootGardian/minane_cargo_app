const express = require('express');
const router = express.Router();
const { authAdmin } = require('../middleware/auth');
const containerController = require('../controllers/container.controller');

// ─── Routes Conteneurs Maritimes (MVC Architecture) ─────────────────────────
router.get('/', authAdmin, containerController.list);
router.post('/', authAdmin, containerController.create);
router.get('/:id', authAdmin, containerController.getById);
router.put('/:id', authAdmin, containerController.update);
router.put('/:id/status', authAdmin, containerController.updateStatusBulk);
router.post('/:id/expenses', authAdmin, containerController.addExpense);
router.delete('/:id/expenses/:expenseId', authAdmin, containerController.deleteExpense);

module.exports = router;
