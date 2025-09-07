const { sequelize, Participant } = require('./models');

async function seed() {
  console.log('Resetting database and seeding sample data...');
  await sequelize.sync({ force: true });
  const participants = [
    { name: 'Aman Kumar', email: 'aman@example.com', regId: 'REG-0001' },
    { name: 'Chahat Tiwari', email: 'chahat@example.com', regId: 'REG-0002' },
    { name: 'Pankaj Kumar', email: 'pankaj@example.com', regId: 'REG-0003' },
  ];
  await Participant.bulkCreate(participants);
  console.log('✅ Seeded sample participants!');
  process.exit(0);
}

seed();