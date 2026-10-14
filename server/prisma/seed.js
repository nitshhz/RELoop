import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const prisma = new PrismaClient();

async function hash(password) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

async function main() {
  console.log('🌱 Starting ReLoop Database Seeding...');

  // 1. Clean existing records (in order of relations)
  try {
    await prisma.notification.deleteMany();
    await prisma.report.deleteMany();
    await prisma.review.deleteMany();
    await prisma.message.deleteMany();
    await prisma.conversation.deleteMany();
    await prisma.offer.deleteMany();
    await prisma.savedListing.deleteMany();
    await prisma.recentlyViewed.deleteMany();
    await prisma.savedSearch.deleteMany();
    await prisma.priceHistory.deleteMany();
    await prisma.listingImage.deleteMany();
    await prisma.listing.deleteMany();
    await prisma.category.deleteMany();
    await prisma.auditLog.deleteMany();
    await prisma.user.deleteMany();
    console.log('🧹 Cleaned existing database records.');
  } catch (e) {
    console.warn('Note during clean up:', e.message);
  }

  // 2. Create Categories
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

  const categories = {};
  for (const cat of categoriesData) {
    const created = await prisma.category.create({ data: cat });
    categories[cat.slug] = created;
  }
  console.log(`✅ Created ${Object.keys(categories).length} marketplace categories.`);

  // 3. Create Users
  const defaultPassword = 'Password123!';
  const adminPassword = process.env.ADMIN_INITIAL_PASSWORD || 'Admin@ReLoop2026!';
  const userHash = await hash(defaultPassword);
  const adminHash = await hash(adminPassword);

  const adminUser = await prisma.user.create({
    data: {
      name: 'ReLoop Admin',
      email: process.env.ADMIN_INITIAL_EMAIL || 'admin@reloop.dev',
      passwordHash: adminHash,
      role: 'ADMIN',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      bio: 'Marketplace Safety & Moderation Operations Lead.',
    },
  });

  const sellerUser = await prisma.user.create({
    data: {
      name: 'Aarav Sharma',
      email: 'seller@reloop.dev',
      passwordHash: userHash,
      role: 'USER',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
      bio: 'Tech enthusiast and designer down-sizing my workspace setup.',
    },
  });

  const buyer1 = await prisma.user.create({
    data: {
      name: 'Priya Patel',
      email: 'buyer1@reloop.dev',
      passwordHash: userHash,
      role: 'USER',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
      bio: 'Looking for sustainable secondhand finds and good books.',
    },
  });

  const buyer2 = await prisma.user.create({
    data: {
      name: 'Karan Verma',
      email: 'buyer2@reloop.dev',
      passwordHash: userHash,
      role: 'USER',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
      bio: 'Gamer & developer looking for upgrade hardware.',
    },
  });

  console.log(`✅ Created 4 accounts (1 Admin, 3 Regular Users).`);

  // 4. Create Diverse Marketplace Listings
  const listingsData = [
    {
      title: 'Apple iPhone 14 Pro 128GB - Space Black',
      description: 'Excellent condition iPhone 14 Pro with 89% battery health. Comes with original box, Apple charging cable, and Spigen tempered glass pre-installed since day 1. No dents or visible scratches. Minor hairline mark near charging port only.',
      price: 64999,
      originalPrice: 69999,
      condition: 'LIKE_NEW',
      brand: 'Apple',
      model: 'iPhone 14 Pro',
      specifications: { Storage: '128GB', Color: 'Space Black', 'Battery Health': '89%', Screen: '6.1-inch Super Retina XDR' },
      location: 'Indiranagar, Bengaluru',
      status: 'ACTIVE',
      completenessScore: 95,
      viewsCount: 142,
      savesCount: 18,
      categoryId: categories['mobiles'].id,
      sellerId: sellerUser.id,
      images: [
        'https://images.unsplash.com/photo-1678652197831-2d180705cd2c?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=800&q=80',
      ],
    },
    {
      title: 'Sony WH-1000XM4 Wireless Noise-Cancelling Headphones',
      description: 'Pair of Sony WH-1000XM4 active noise canceling headphones in Silver. Fully functional with exceptional sound and ANC. Ear cushions cleaned and sterilized. Includes carrying case, airplane adapter, and USB-C charging cord.',
      price: 14500,
      originalPrice: 16000,
      condition: 'GOOD',
      brand: 'Sony',
      model: 'WH-1000XM4',
      specifications: { BatteryLife: '30 Hours', Connectivity: 'Bluetooth 5.0, 3.5mm Aux', Weight: '254g' },
      location: 'Koramangala, Bengaluru',
      status: 'ACTIVE',
      completenessScore: 90,
      viewsCount: 88,
      savesCount: 12,
      categoryId: categories['electronics'].id,
      sellerId: sellerUser.id,
      images: [
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=800&q=80',
      ],
    },
    {
      title: 'Ergonomic Mesh High-Back Office Chair with Lumbar Support',
      description: 'Adjustable mesh office chair with 3D armrests, tilt-lock mechanism, and breathable high-tensile mesh back. Bought 10 months ago, moving to a furnished flat so selling. Very sturdy chrome steel base and smooth PU castor wheels.',
      price: 6800,
      originalPrice: 7500,
      condition: 'GOOD',
      brand: 'Green Soul',
      model: 'Jupiter Superb',
      specifications: { Material: 'Breathable Nylon Mesh', Height: 'Adjustable 45-55cm', WeightCapacity: '135 kg' },
      location: 'HSR Layout, Bengaluru',
      status: 'ACTIVE',
      completenessScore: 85,
      viewsCount: 64,
      savesCount: 9,
      categoryId: categories['furniture'].id,
      sellerId: sellerUser.id,
      images: [
        'https://images.unsplash.com/photo-1580481077195-c328a3727140?auto=format&fit=crop&w=800&q=80',
      ],
    },
    {
      title: 'Sony PlayStation 5 Disc Edition + 2 DualSense Controllers',
      description: 'PlayStation 5 Disc Edition console in pristine condition. Includes 2 original DualSense wireless controllers (White & Midnight Black), HDMI 2.1 cable, stand, and power cord. Barely used over weekends, works flawlessly.',
      price: 39500,
      originalPrice: 42000,
      condition: 'LIKE_NEW',
      brand: 'Sony',
      model: 'PS5 Disc Edition (CFI-1208A)',
      specifications: { Storage: '825GB SSD', Resolution: '4K 120Hz', HDR: 'Supported' },
      location: 'Whitefield, Bengaluru',
      status: 'ACTIVE',
      completenessScore: 92,
      viewsCount: 210,
      savesCount: 35,
      categoryId: categories['gaming'].id,
      sellerId: sellerUser.id,
      images: [
        'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=800&q=80',
      ],
    },
    {
      title: 'MacBook Air M2 13-inch 256GB - Midnight Blue',
      description: 'Pending review sample listing: MacBook Air M2 8-core CPU, 8-core GPU, 8GB unified memory, 256GB SSD storage. Battery cycle count only 42, 100% capacity.',
      price: 74900,
      originalPrice: 74900,
      condition: 'LIKE_NEW',
      brand: 'Apple',
      model: 'MacBook Air M2',
      specifications: { Processor: 'Apple M2', RAM: '8GB Unified', Storage: '256GB NVMe' },
      location: 'Bellandur, Bengaluru',
      status: 'PENDING_REVIEW', // Moderation demo
      completenessScore: 88,
      viewsCount: 15,
      savesCount: 2,
      categoryId: categories['laptops'].id,
      sellerId: buyer1.id,
      images: [
        'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80',
      ],
    },
    {
      title: 'Canon EOS M50 Mark II Mirrorless Camera + 15-45mm Lens',
      description: 'Lightly used Canon EOS M50 Mark II with standard 15-45mm IS STM kit lens. Great for YouTube vlogging, portrait, and street photography. Includes 2 batteries, SanDisk 64GB Extreme Pro card, charger, and camera bag.',
      price: 42000,
      originalPrice: 45000,
      condition: 'LIKE_NEW',
      brand: 'Canon',
      model: 'EOS M50 Mark II',
      specifications: { Sensor: '24.1MP APS-C CMOS', Video: '4K UHD 24p', Autofocus: 'Dual Pixel CMOS AF' },
      location: 'Jayanagar, Bengaluru',
      status: 'ACTIVE',
      completenessScore: 94,
      viewsCount: 76,
      savesCount: 14,
      categoryId: categories['cameras'].id,
      sellerId: buyer2.id,
      images: [
        'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80',
      ],
    },
  ];

  const createdListings = [];
  for (const item of listingsData) {
    const { images, ...listingPayload } = item;
    const created = await prisma.listing.create({
      data: {
        ...listingPayload,
        images: {
          create: images.map((url, idx) => ({ url, order: idx })),
        },
      },
    });
    createdListings.push(created);
  }
  console.log(`✅ Created ${createdListings.length} product listings.`);

  const iphoneListing = createdListings[0];
  const headphonesListing = createdListings[1];

  // 5. Price History for iPhone (demonstrating price drop)
  await prisma.priceHistory.create({
    data: {
      listingId: iphoneListing.id,
      oldPrice: 69999,
      newPrice: 64999,
    },
  });

  // 6. Saved Listings
  await prisma.savedListing.create({
    data: {
      userId: buyer1.id,
      listingId: iphoneListing.id,
    },
  });

  await prisma.savedListing.create({
    data: {
      userId: buyer2.id,
      listingId: iphoneListing.id,
    },
  });

  await prisma.savedListing.create({
    data: {
      userId: buyer1.id,
      listingId: headphonesListing.id,
    },
  });
  console.log('✅ Created saved listings records.');

  // 7. Offers & Counteroffers Demonstration
  // Buyer 1 made an offer of ₹61,000 on iPhone
  const offer1 = await prisma.offer.create({
    data: {
      listingId: iphoneListing.id,
      buyerId: buyer1.id,
      sellerId: sellerUser.id,
      amount: 61000,
      status: 'PENDING',
    },
  });

  // Buyer 2 made an offer of ₹62,000, which seller countered with ₹63,500
  const offer2 = await prisma.offer.create({
    data: {
      listingId: iphoneListing.id,
      buyerId: buyer2.id,
      sellerId: sellerUser.id,
      amount: 62000,
      counterAmount: 63500,
      status: 'COUNTERED',
    },
  });
  console.log('✅ Created demonstration offers and counteroffers.');

  // 8. Conversations & Messages with Quick Replies
  const conv = await prisma.conversation.create({
    data: {
      listingId: iphoneListing.id,
      buyerId: buyer1.id,
      sellerId: sellerUser.id,
    },
  });

  await prisma.message.createMany({
    data: [
      {
        conversationId: conv.id,
        senderId: buyer1.id,
        content: 'Is this still available?',
        isQuickReply: true,
        isRead: true,
      },
      {
        conversationId: conv.id,
        senderId: sellerUser.id,
        content: 'Yes! It is available. Battery health is at 89% and I have the original bill as well.',
        isQuickReply: false,
        isRead: true,
      },
      {
        conversationId: conv.id,
        senderId: buyer1.id,
        content: 'Would you consider this offer?',
        isQuickReply: true,
        isRead: false,
      },
    ],
  });
  console.log('✅ Created conversation and chat messages.');

  // 9. Notifications
  await prisma.notification.createMany({
    data: [
      {
        userId: sellerUser.id,
        type: 'OFFER_RECEIVED',
        title: `New Offer on "${iphoneListing.title}"`,
        message: `Priya Patel offered ₹61,000 for your listing.`,
        link: '/offers',
        isRead: false,
      },
      {
        userId: buyer2.id,
        type: 'OFFER_COUNTERED',
        title: `Counter-Offer on "${iphoneListing.title}"`,
        message: `The seller countered your offer with ₹63,500.`,
        link: '/offers',
        isRead: false,
      },
      {
        userId: buyer1.id,
        type: 'PRICE_DROP',
        title: `Price Drop: 7% off on "${iphoneListing.title}"!`,
        message: `Price reduced from ₹69,999 to ₹64,999. Check it out now!`,
        link: `/listing/${iphoneListing.id}`,
        isRead: true,
      },
    ],
  });
  console.log('✅ Created in-app demo notifications.');

  // 10. Sample Moderation Report
  await prisma.report.create({
    data: {
      reporterId: buyer1.id,
      targetType: 'LISTING',
      targetId: headphonesListing.id,
      reason: 'MISLEADING',
      details: 'Checking if warranty information needs to be clarified in description.',
      status: 'PENDING',
    },
  });
  console.log('✅ Created sample moderation report for admin testing.');

  console.log('\n=============================================');
  console.log('🎉 ReLoop Database Seeding Completed Successfully!');
  console.log('=============================================');
  console.log('🔑 DEMO CREDENTIALS:');
  console.log(`• Admin Account:  ${adminUser.email} / ${adminPassword}`);
  console.log(`• Seller Account: ${sellerUser.email} / ${defaultPassword}`);
  console.log(`• Buyer 1:        ${buyer1.email} / ${defaultPassword}`);
  console.log(`• Buyer 2:        ${buyer2.email} / ${defaultPassword}`);
  console.log('=============================================\n');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
