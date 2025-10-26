const express = require('express');
const router = express.Router();
const auth = require('../middleware/Auth');
const taskCtrl = require('../controllers/TaskController');
const Task = require('../models/TaskModel');
router.post('/createtask', auth, taskCtrl.createTask);
router.get('/listtasks', auth, taskCtrl.listTasks);
router.put('/updatetask/:id', auth, taskCtrl.updateTask);
router.put('/updatestatus/:id', auth, taskCtrl.updateStatus);
router.put('/updatepriority/:id', auth, taskCtrl.updatePriority);
router.delete('/deletetask/:id', auth, taskCtrl.deleteTask);
router.put('/assigntask/:id', auth, taskCtrl.assigntask);

module.exports = router;
