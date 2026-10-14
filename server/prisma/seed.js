import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting ReLoop Database Initialization...');

  // 1. Ensure Marketplace Categories exist
  const categoriesData = [
    { name: 'Mobiles & Accessories', slug: 'mobiles', icon: 'Smartphone', description: 'Smartphones, cases, chargers, smartwatches and accessories' },
    { name: 'Laptops & Computers', slug: 'laptops', icon: 'Laptop', description: 'Laptops, desktops, monitors, keyboards, components and accessories' },
    { name: 'Electronics & Audio', slug: 'electronics', icon: 'Headphones', description: 'Audio gear, headphones, speakers, home entertainment and gadgets' },
    { name: 'Furniture & Home', slug: 'furniture', icon: 'Armchair', description: 'Tables, ergonomic chairs, sofas, study desks, decor and home appliances' },
    { name: 'Gaming', slug: 'gaming', icon: 'Gamepad2', description: 'Consoles, controllers, video games, gaming peripherals and accessories' },
    { name: 'Cameras & Photography', slug: 'cameras', icon: 'Camera', description: 'DSLRs, mirrorless cameras, lenses, tripods, lighting and gear' },
    { name: 'Books & Education', slug: 'books', icon: 'BookOpen', description: 'Novels, college textbooks, reference guides and educational materials' },
    { name: 'Sports & Fitness', slug: 'sports', icon: 'Dumbbell', description: 'Bicycles, gym equipment, weights, yoga mats and sports accessories' },
    { name: 'Fashion & Wearables', slug: 'fashion', icon: 'Shirt', description: 'Pre-loved designer apparel, jackets, shoes, bags and watches' },
  ];

  for (const cat of categoriesData) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, icon: cat.icon, description: cat.description },
      create: cat,
    });
  }
  console.log(`✅ Ensured ${categoriesData.length} marketplace categories exist.`);

  // 2. Ensure Admin User is configured
  const adminEmail = process.env.ADMIN_INITIAL_EMAIL || 'nithish4626@gmail.com';
  if (adminEmail) {
    const existing = await prisma.user.findUnique({
      where: { email: adminEmail.toLowerCase().trim() },
    });

    if (existing) {
      if (existing.role !== 'ADMIN') {
        await prisma.user.update({
          where: { id: existing.id },
          data: { role: 'ADMIN' },
        });
        console.log(`👑 Updated user ${adminEmail} to ADMIN.`);
      } else {
        console.log(`👑 User ${adminEmail} is confirmed as ADMIN.`);
      }
    }
  }

  console.log('🎉 ReLoop Database Initialization Completed.');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
