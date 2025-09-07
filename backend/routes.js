const router = require('express').Router();
const { v4: uuidv4 } = require('uuid');
const ExcelJS = require('exceljs');
const { Participant, Attendance } = require('./models');

// POST /api/register
router.post('/register', async (req, res) => {
  try {
    const { name, email } = req.body;
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required.' });
    }
    const regId = `EVT-${uuidv4().slice(0, 8).toUpperCase()}`;
    const participant = await Participant.create({ name, email, regId });
    res.status(201).json({ participant }); // Wrapped for consistency
  } catch (error) {
    res.status(400).json({ error: 'Email may already be registered.' });
  }
});

// POST /api/scan  <-- THIS IS THE MISSING/INCORRECT ROUTE
router.post('/scan', async (req, res) => {
  try {
    const { regId } = req.body;
    const participant = await Participant.findOne({ where: { regId }, include: Attendance });

    if (!participant) {
      return res.status(404).json({ error: 'Participant not found.' });
    }

    if (participant.Attendance) {
      return res.json({ message: 'Attendance already marked.', participant });
    }

    const attendance = await Attendance.create({ timestamp: new Date(), ParticipantId: participant.id });
    
    // Fetch the updated participant with the new attendance record
    const updatedParticipant = await Participant.findByPk(participant.id, { include: Attendance });

    // Notify admin dashboard in real-time
    req.app.get('io').emit('attendanceUpdate', updatedParticipant);

    res.json({ message: 'Attendance marked successfully!', participant: updatedParticipant });
  } catch (error) {
    res.status(500).json({ error: 'Server error during scan.' });
  }
});

// GET /api/participants
router.get('/participants', async (req, res) => {
  const participants = await Participant.findAll({
    include: Attendance,
    order: [['createdAt', 'DESC']],
  });
  // Send the data back in the same format as the old API
  res.json({ success: true, participants: participants });
});

// GET /api/export
router.get('/export', async (req, res) => {
  const participants = await Participant.findAll({ include: Attendance, order: [['name', 'ASC']] });
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Attendance Report');

  worksheet.columns = [
    { header: 'Name', key: 'name', width: 30 },
    { header: 'Email', key: 'email', width: 30 },
    { header: 'Registration ID', key: 'regId', width: 25 },
    { header: 'Status', key: 'status', width: 15 },
    { header: 'Check-in Time', key: 'timestamp', width: 25 },
  ];

  participants.forEach(p => {
    worksheet.addRow({
      name: p.name,
      email: p.email,
      regId: p.regId,
      status: p.Attendance ? 'Present' : 'Absent',
      timestamp: p.Attendance ? p.Attendance.timestamp.toLocaleString() : 'N/A',
    });
  });

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename=AttendanceReport.xlsx');
  await workbook.xlsx.write(res);
  res.end();
});

module.exports = router;