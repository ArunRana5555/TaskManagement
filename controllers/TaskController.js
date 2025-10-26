const Task = require('../models/TaskModel');
const Joi = require('joi');
const Pusher = require('pusher');
const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.PUSHER_APP_KEY,
  secret: process.env.PUSHER_APP_SECRET,
  cluster: process.env.PUSHER_APP_CLUSTER,
  useTLS: true
});

const createTask = async (req, res) => {
  try {
  const schema = Joi.object({
    title: Joi.string().required(),
    description: Joi.string().required(),
    dueDate: Joi.date(),
    priority: Joi.string().valid('Low', 'Medium', 'High').default('Medium'),
    assignedTo: Joi.string().hex().length(24).optional(),
  });
  const { error, value } = schema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });
  const { title, description, dueDate, priority, assignedTo } = value;
  const task = await Task.create({
    title, description, dueDate, priority, createdBy: req.user._id, assignedTo
  });
  if (assignedTo) {
    pusher.trigger(`user-${assignedTo}`, 'task-created', {
      message: `New task assigned - ${task.title}`,
      task,
    });
  }
  res.status(201).json(task);
  } catch (error) {
    console.error("Error in createTask controller:", error);
    return res.status(500).json({ error: "Something went wrong" });
  }
};

const listTasks = async (req, res) => {
  try {
  const schema = Joi.object({
    status: Joi.string().valid('Todo', 'In-Progress', 'Done').optional(),
    priority: Joi.string().valid('Low', 'Medium', 'High').optional(),
    assignedTo: Joi.string().hex().length(24).allow('').optional(),
    search: Joi.string().allow('').optional(),
    sortBy: Joi.string().valid('dueDate', 'priority', 'status').default('dueDate'),
    order: Joi.string().valid('asc', 'desc').default('asc'),
    page: Joi.number().default(1),
    limit: Joi.number().default(20),
  });

  const { error, value } = schema.validate(req.query);
  if (error) return res.status(400).json({ message: error.details[0].message });

  const { status, priority, assignedTo, search, sortBy, order, page, limit } = value;

  const filter = {};

  if (status) filter.status = status;
  if (priority) filter.priority = priority;
  if (assignedTo) filter.assignedTo = assignedTo;

  if (req.user.userType === 'admin') {
    // all tasks
  } else if (req.user.userType === 'manager') {
    filter.$or = [
      { createdBy: req.user._id },
      { assignedTo: req.user._id }
    ];
  } else {
    filter.$or = [
      { createdBy: req.user._id },
      { assignedTo: req.user._id }
    ];
  }

  let query = Task.find(filter).populate('createdBy assignedTo', 'username email userType');

  if (search) {
    query = query.find({ $text: { $search: search } });
  }

  const skip = (page - 1) * limit;
  const total = await Task.countDocuments(filter);
  const tasks = await query.sort({ [sortBy]: order === 'asc' ? 1 : -1 })
    .skip(skip)
    .limit(Number(limit));

  res.json({ total, page: Number(page), limit: Number(limit), tasks });
  } catch (error) {
    console.error("Error in listTasks controller:", error);
    return res.status(500).json({ error: "Something went wrong" });
  }
};

const updateTask = async (req, res) => {
  try {
  const schema = Joi.object({
    title: Joi.string(),
    description: Joi.string(),
    status: Joi.string().valid('Todo', 'In-Progress', 'Done').default('Todo'),
    dueDate: Joi.date(),
    priority: Joi.string().valid('Low', 'Medium', 'High').default('Medium'),
    assignedTo: Joi.string().hex().length(24).optional(),
  });
  const { error, value } = schema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });
  const { title, description, status, dueDate, priority, assignedTo } = value;
  const t = await Task.findById(req.params.id);
  if (!t) return res.status(404).json({ message: 'Not found' });
  if (!req.user.userType === 'admin' && !t.createdBy.equals(req.user._id) && !(req.user.userType === 'manager')) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  Object.assign(t, { title, description, status, dueDate, priority, assignedTo });
  await t.save();
  if (assignedTo !== t.assignedTo) {
    pusher.trigger(`user-${assignedTo}`, 'task-assigned', {
      message: `New task assigned - ${t.title}`,
      task: t,
    });
  }
  res.json(t);
  } catch (error) {
    console.error("Error in updateTask controller:", error);
    return res.status(500).json({ error: "Something went wrong" });
  }
};

const assigntask = async (req, res) => {
  try {
  const schema = Joi.object({
    assignedTo: Joi.string().hex().length(24).allow('').allow(null).optional()
  });

  const { error, value } = schema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  let { assignedTo } = value;

  if (!assignedTo) assignedTo = null;

  const t = await Task.findById(req.params.id);
  if (!t) return res.status(404).json({ message: 'Not found' });

  const previousAssignedUser = t.assignedTo;

  t.assignedTo = assignedTo;
  await t.save();

  if (assignedTo) {
    pusher.trigger(`user-${assignedTo}`, 'task-assigned', {
      message: `New task assigned - ${t.title}`,
      task: t,
    });
  }

  res.json(t);
  } catch (error) {
    console.error("Error in assigntask controller:", error);
    return res.status(500).json({ error: "Something went wrong" });
  }
};

const deleteTask = async (req, res) => {
  try {
  const t = await Task.findById(req.params.id);
  if (!t) return res.status(404).json({ message: 'Not found' });
  if (!req.user.userType === 'admin' && !t.createdBy.equals(req.user._id)) return res.status(403).json({ message: 'Forbidden' });
  await t.deleteOne();
  res.json({ message: 'Deleted' });
  } catch (error) {
    console.error("Error in deleteTask controller:", error);
    return res.status(500).json({ error: "Something went wrong" });
  }
};

const updateStatus = async (req, res) => {
  try {
  const schema = Joi.object({
    status: Joi.string().valid('Todo', 'In-Progress', 'Done').default('Todo'),
  });
  const { error, value } = schema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });
  const { status } = value;
  const t = await Task.findById(req.params.id);
  if (!t) return res.status(404).json({ message: 'Not found' });
  if (!req.user.userType === 'admin' && !t.createdBy.equals(req.user._id) && !(req.user.userType === 'manager')) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  t.status = status;
  await t.save();
  res.json(t);
  } catch (error) {
    console.error("Error in updateStatus controller:", error);
    return res.status(500).json({ error: "Something went wrong" });
  }
};

const updatePriority = async (req, res) => {
  try {
  const schema = Joi.object({
    priority: Joi.string().valid('Low', 'Medium', 'High').default('Medium'),
  });
  const { error, value } = schema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });
  const { priority } = value;
  const t = await Task.findById(req.params.id);
  if (!t) return res.status(404).json({ message: 'Not found' });
  if (!req.user.userType === 'admin' && !t.createdBy.equals(req.user._id) && !(req.user.userType === 'manager')) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  t.priority = priority;
  await t.save();
  res.json(t);
  } catch (error) {
    console.error("Error in updatePriority controller:", error);
    return res.status(500).json({ error: "Something went wrong" });
  }
};
module.exports = { createTask, listTasks, updateTask, deleteTask, updateStatus, updatePriority, assigntask };
