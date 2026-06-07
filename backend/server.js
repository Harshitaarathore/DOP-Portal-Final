const express = require('express');
const cors = require('cors');
require('dotenv').config();
const db = require('./config/db');
const authRoutes = require('./routes/auth.routes');
const meetingRoutes = require('./routes/meeting.routes');
const calendarRoutes = require('./routes/calendar.routes');
const taskRoutes = require('./routes/task.routes');
const visitorRoutes = require('./routes/visitor.routes');
const userRoutes = require('./routes/user.routes');
const documentRoutes = require('./routes/document.routes');
const reportRoutes = require('./routes/report.routes');
const adminRoutes = require('./routes/admin.routes');
const { verifyToken } = require('./middleware/auth.middleware');
const { allowRoles } = require('./middleware/role.middleware');
const { startScheduler } = require('./utils/scheduler');

const app = express();

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'authorization']
}));
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/meetings', meetingRoutes);
app.use('/events', calendarRoutes);
app.use('/tasks', taskRoutes);
app.use('/visitors', visitorRoutes);
app.use('/user', userRoutes);
app.use('/documents', documentRoutes);
app.use('/uploads', express.static('uploads'));
app.use('/reports', reportRoutes);
app.use('/admin', adminRoutes);

app.get('/test-auth', verifyToken, (req, res) => {
  res.json({ success: true, message: `Hello ${req.user.role}`, data: null });
});

app.get('/test-director', verifyToken, allowRoles('Director'), (req, res) => {
  res.json({ success: true, message: 'Welcome Director', data: null });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);

startScheduler();
});