// Seed script for Odin Book
// Usage: DATABASE_URL=your_db_url node prisma/seed.js

/* eslint-disable no-console */
// eslint-disable-next-line import/no-extraneous-dependencies
const { faker } = require("@faker-js/faker");
const prisma = require("../src/prisma.js");

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error("Please set DATABASE_URL in your environment before running the seed script.");
    process.exit(1);
  }

  console.log("Cleaning existing data...");
  await prisma.like.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.post.deleteMany();
  await prisma.follow.deleteMany();
  await prisma.user.deleteMany();

  console.log("Creating users...");
  const userPromises = Array.from({ length: 10 }).map(() =>
    prisma.user.create({
      data: {
        email: faker.internet.email(),
        username: `${faker.internet.username().toLowerCase()}${Math.floor(Math.random() * 1000)}`,
        password: "password",
        name: faker.person.fullName(),
        bio: faker.lorem.sentence(),
        avatarUrl: faker.image.avatar(),
      },
    })
  );
  const users = await Promise.all(userPromises);

  console.log("Creating follows...");
  const followPromises = [];
  users.forEach((follower) => {
    const followCount = faker.number.int({ min: 2, max: 4 });
    const shuffled = faker.helpers.shuffle(users.filter((u) => u.id !== follower.id));
    for (let i = 0; i < followCount; i += 1) {
      const followee = shuffled[i];
      followPromises.push(
        prisma.follow.create({
          data: {
            followerId: follower.id,
            followeeId: followee.id,
            status: i === 0 ? "ACCEPTED" : "PENDING",
          },
        })
      );
    }
  });
  await Promise.all(followPromises);

  const posts = [];
  console.log("Creating posts...");
  const postPromises = [];
  users.forEach((user) => {
    const count = faker.number.int({ min: 1, max: 3 });
    for (let i = 0; i < count; i += 1) {
      postPromises.push(
        prisma.post.create({
          data: {
            authorId: user.id,
            body: faker.lorem.paragraph(),
            imageUrl: faker.datatype.boolean() ? faker.image.url() : null,
          },
        })
      );
    }
  });
  const createdPosts = await Promise.all(postPromises);
  posts.push(...createdPosts);

  console.log("Creating comments and likes...");
  const likePromises = [];
  const commentPromises = [];
  posts.forEach((post) => {
    const likeCount = faker.number.int({ min: 0, max: 5 });
    const likers = faker.helpers.shuffle(users).slice(0, likeCount);
    likers.forEach((liker) => {
      likePromises.push(prisma.like.create({ data: { userId: liker.id, postId: post.id } }));
    });

    const commentCount = faker.number.int({ min: 0, max: 3 });
    for (let i = 0; i < commentCount; i += 1) {
      const author = users[faker.number.int({ min: 0, max: users.length - 1 })];
      commentPromises.push(
        prisma.comment.create({
          data: { postId: post.id, authorId: author.id, body: faker.lorem.sentence() },
        })
      );
    }
  });

  // run likes and comments in parallel, ignore individual failures for likes
  await Promise.allSettled(likePromises);
  await Promise.all(commentPromises);

  console.log("Seeding finished.");
}

main()
  .catch((e) => {
    // eslint-disable-next-line no-console
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
