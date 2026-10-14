import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Checking listings and images...');
  const listings = await prisma.listing.findMany({
    include: { images: true }
  });

  console.log(`Found ${listings.length} listings in database.`);

  for (const item of listings) {
    console.log(`- [${item.id}] "${item.title}" (Images: ${item.images.length})`);

    // Fix Herman Miller chair image if broken or matching 404 URL
    if (item.title.toLowerCase().includes('herman miller') || item.title.toLowerCase().includes('mirra')) {
      const workingChairUrl = 'https://images.unsplash.com/photo-1505797149-43b0069ec26b?auto=format&fit=crop&w=800&q=80';
      if (item.images.length > 0) {
        await prisma.listingImage.updateMany({
          where: { listingId: item.id },
          data: { url: workingChairUrl }
        });
        console.log(`  -> Updated Herman Miller chair image to: ${workingChairUrl}`);
      } else {
        await prisma.listingImage.create({
          data: {
            listingId: item.id,
            url: workingChairUrl,
            order: 0
          }
        });
        console.log(`  -> Added image for Herman Miller chair: ${workingChairUrl}`);
      }
    }

    // Check if any listing has 0 images and attach an image if needed
    if (item.images.length === 0) {
      if (item.title.toLowerCase().includes('sony wh-1000xm5') || item.title.toLowerCase().includes('headphones')) {
        const headphoneUrl = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1000&q=80';
        await prisma.listingImage.create({
          data: {
            listingId: item.id,
            url: headphoneUrl,
            order: 0
          }
        });
        console.log(`  -> Added missing image for headphone listing: ${headphoneUrl}`);
      }
    }
  }

  console.log('✅ Done updating listings and images.');
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
