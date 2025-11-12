const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  const user = await prisma.user.create({
    data: {
      username: 'testuser',
      email: 'test@example.com',
      password: hashedPassword
    }
  });
  
  console.log('Usuario creado:', user);
}

main().then(() => prisma.$disconnect());