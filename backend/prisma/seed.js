const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const existing = await prisma.user.findUnique({ where: { username: 'admin' } });
  if (existing) {
    console.log('Super admin already exists, skipping seed.');
    return;
  }

  const hashed = await bcrypt.hash('Admin@123', 10);
  const user = await prisma.user.create({
    data: {
      username: 'admin',
      name: 'Super Admin',
      password: hashed,
      role: 'SUPER_ADMIN',
    },
  });

  console.log(`\nSuper admin created:`);
  console.log(`  Username : admin`);
  console.log(`  Password : Admin@123`);
  console.log(`  Role     : SUPER_ADMIN`);
  console.log(`  ID       : ${user.id}`);
  console.log(`\nChange this password immediately after first login.\n`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
