const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, 'db.sqlite'),
  logging: false,
});

const Participant = sequelize.define('Participant', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  regId: { type: DataTypes.STRING, allowNull: false, unique: true },
});

const Attendance = sequelize.define('Attendance', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  timestamp: { type: DataTypes.DATE, allowNull: false },
  status: { type: DataTypes.STRING, allowNull: false, defaultValue: 'present' },
});

Participant.hasOne(Attendance, { onDelete: 'CASCADE' });
Attendance.belongsTo(Participant);

module.exports = { sequelize, Participant, Attendance };