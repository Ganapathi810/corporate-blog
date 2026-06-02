import { PrismaClient } from '../src/generated/prisma/index.js';

const prisma = new PrismaClient();

async function main() {
  const posts = await prisma.post.findMany({
    include: {
      author: true,
      categories: {
        include: {
          category: true
        }
      }
    }
  });

  console.log('Total posts:', posts.length);
  posts.forEach(p => {
    console.log(`Post: ${p.title}`);
    console.log(`  Slug: ${p.slug}`);
    console.log(`  Author: ${p.author.name} (Slug: ${p.author.slug})`);
    console.log(`  Categories: ${p.categories.map(c => `${c.category.name} (${c.categoryId})`).join(', ')}`);
    console.log(`  Status: ${p.status}`);
    console.log('---');
  });

  const users = await prisma.user.findMany();
  console.log('\nUsers:');
  users.forEach(u => console.log(`  ${u.name} (Slug: ${u.slug}) ID: ${u.id}`));

  const categories = await prisma.category.findMany();
  console.log('\nCategories:');
  categories.forEach(c => console.log(`  ${c.name} ID: ${c.id} Slug: ${c.slug}`));
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
