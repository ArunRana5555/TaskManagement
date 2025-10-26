const express = require('express');
const router = express.Router();
const auth = require('../middleware/Auth');
const taskCtrl = require('../controllers/TaskController');
const Task = require('../models/TaskModel');
// create
router.post('/createtask', auth, taskCtrl.createTask);

// list & search
router.get('/listtasks', auth, taskCtrl.listTasks);

// update
router.put('/updatetask/:id', auth, taskCtrl.updateTask);

//update status
router.put('/updatestatus/:id', auth, taskCtrl.updateStatus);

//update priority
router.put('/updatepriority/:id', auth, taskCtrl.updatePriority);

// delete
router.delete('/deletetask/:id', auth, taskCtrl.deleteTask);

router.put('/assigntask/:id', auth, taskCtrl.assigntask);

module.exports = router;
