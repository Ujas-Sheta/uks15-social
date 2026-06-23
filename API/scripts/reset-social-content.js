import "dotenv/config";
import fs from "fs";
import https from "https";
import path from "path";
import { fileURLToPath } from "url";
import mysql from "mysql2/promise";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..", "..");
const uploadsDir = path.join(rootDir, "frontend", "public", "uploads", "posts");

const media = [
  {
    file: "uks15-fresh-feed-studio.jpg",
    url: "https://picsum.photos/seed/uks15-fresh-studio/1400/950",
  },
  {
    file: "uks15-fresh-community.jpg",
    url: "https://picsum.photos/seed/uks15-fresh-community/1400/900",
  },
  {
    file: "uks15-fresh-market.jpg",
    url: "https://picsum.photos/seed/uks15-fresh-market/1400/950",
  },
  {
    file: "uks15-fresh-event.jpg",
    url: "https://picsum.photos/seed/uks15-fresh-event/1400/900",
  },
  {
    file: "uks15-fresh-story.jpg",
    url: "https://picsum.photos/seed/uks15-fresh-story/900/1400",
  },
  {
    file: "uks15-fresh-clip.mp4",
    url: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
  },
];

const tablesToReset = [
  "saved_posts",
  "likes",
  "comments",
  "messages",
  "notifications",
  "friend_requests",
  "relationships",
  "stories",
  "feature_items",
  "posts",
];

const pickUser = (users, index) => users[index % users.length];

const download = (url, filePath) =>
  new Promise((resolve, reject) => {
    const request = https.get(url, (response) => {
      if ([301, 302, 303, 307, 308].includes(response.statusCode)) {
        response.resume();
        download(response.headers.location, filePath).then(resolve).catch(reject);
        return;
      }

      if (response.statusCode !== 200) {
        reject(new Error(`Download failed: ${response.statusCode} ${url}`));
        return;
      }

      const file = fs.createWriteStream(filePath);
      response.pipe(file);
      file.on("finish", () => file.close(resolve));
    });

    request.on("error", reject);
    request.setTimeout(15000, () => {
      request.destroy(new Error(`Download timed out: ${url}`));
    });
  });

const ensureMedia = async () => {
  fs.mkdirSync(uploadsDir, { recursive: true });

  for (const item of media) {
    const target = path.join(uploadsDir, item.file);
    if (fs.existsSync(target)) continue;

    try {
      await download(item.url, target);
    } catch (error) {
      console.warn(`Could not download ${item.file}: ${error.message}`);
    }
  }
};

const resetTables = async (db) => {
  await db.query("SET FOREIGN_KEY_CHECKS = 0");
  for (const table of tablesToReset) {
    await db.query(`TRUNCATE TABLE \`${table}\``);
  }
  await db.query("SET FOREIGN_KEY_CHECKS = 1");
};

const seedPosts = async (db, users) => {
  const posts = [
    {
      user: pickUser(users, 0),
      desc: "Fresh start for Uks15: a cleaner feed, new demo content, and no old repeated posts.",
      img: "uks15-fresh-feed-studio.jpg",
    },
    {
      user: pickUser(users, 1),
      desc: "Testing the new discovery experience with realistic profiles, reactions, and comments.",
      img: "uks15-fresh-community.jpg",
    },
    {
      user: pickUser(users, 2),
      desc: "Uks15 Market is ready for a new set of listings. This reset keeps accounts but refreshes the content.",
      img: "uks15-fresh-market.jpg",
    },
    {
      user: pickUser(users, 3),
      desc: "Stories, clips, posts, communities, marketplace, and events have been rebuilt from clean data.",
      img: "uks15-fresh-event.jpg",
    },
  ];

  const inserted = [];
  for (const post of posts) {
    const [result] = await db.execute(
      "INSERT INTO posts (`Desc`, img, userId, createdAt) VALUES (?, ?, ?, NOW())",
      [post.desc, post.img, post.user.id]
    );
    inserted.push({ id: result.insertId, userId: post.user.id });
  }

  return inserted;
};

const seedStories = async (db, users) => {
  const stories = [
    { user: pickUser(users, 0), img: "uks15-fresh-story.jpg" },
    { user: pickUser(users, 1), img: "uks15-fresh-community.jpg" },
    { user: pickUser(users, 2), img: "uks15-fresh-event.jpg" },
  ];

  for (const story of stories) {
    await db.execute("INSERT INTO stories (img, userId, createdAt) VALUES (?, ?, NOW())", [
      story.img,
      story.user.id,
    ]);
  }
};

const seedFeatures = async (db, users) => {
  const items = [
    {
      type: "community",
      title: "Uks15 Creators",
      description: "A fresh community for profile polish, content ideas, and social app feedback.",
      media: "uks15-fresh-community.jpg",
      mediaType: "image",
      meta: "Fresh group",
      user: pickUser(users, 0),
    },
    {
      type: "community",
      title: "React Social Builders",
      description: "Frontend, API, database, and GitHub-ready full-stack project discussion.",
      media: "uks15-fresh-feed-studio.jpg",
      mediaType: "image",
      meta: "Developers",
      user: pickUser(users, 1),
    },
    {
      type: "market",
      title: "Creator desk bundle",
      description: "Monitor stand, compact keyboard, and desk lamp for a clean working setup.",
      media: "uks15-fresh-market.jpg",
      mediaType: "image",
      meta: "$95",
      user: pickUser(users, 2),
    },
    {
      type: "market",
      title: "Portable content light",
      description: "Small LED light for stories, product photos, and short clips.",
      media: "uks15-fresh-story.jpg",
      mediaType: "image",
      meta: "$35",
      user: pickUser(users, 3),
    },
    {
      type: "clip",
      title: "Fresh short video",
      description: "A real playable short video for the refreshed Clips page.",
      media: "uks15-fresh-clip.mp4",
      mediaType: "video",
      meta: "0:05",
      user: pickUser(users, 0),
    },
    {
      type: "clip",
      title: "Quick UI pass",
      description: "A short visual update for testing clip cards and engagement.",
      media: "uks15-fresh-event.jpg",
      mediaType: "image",
      meta: "0:18",
      user: pickUser(users, 1),
    },
    {
      type: "event",
      title: "Fresh Data Launch",
      description: "A demo event created after clearing old content from the database.",
      media: "uks15-fresh-event.jpg",
      mediaType: "image",
      meta: "Today 7:00 PM",
      user: pickUser(users, 2),
    },
    {
      type: "event",
      title: "Portfolio Review Night",
      description: "A community event for checking profiles, posts, and GitHub presentation.",
      media: "uks15-fresh-community.jpg",
      mediaType: "image",
      meta: "Saturday 11:00 AM",
      user: pickUser(users, 3),
    },
  ];

  for (const item of items) {
    await db.execute(
      `INSERT INTO feature_items (type, title, description, media, mediaType, meta, userId)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        item.type,
        item.title,
        item.description,
        item.media,
        item.mediaType,
        item.meta,
        item.user.id,
      ]
    );
  }
};

const seedEngagement = async (db, users, posts) => {
  if (users.length < 2) return;

  const first = pickUser(users, 0);
  const second = pickUser(users, 1);

  await db.execute(
    "INSERT INTO relationships (followerUserId, followedUserId) VALUES (?, ?), (?, ?)",
    [first.id, second.id, second.id, first.id]
  );

  await db.execute("INSERT INTO messages (senderId, receiverId, body) VALUES (?, ?, ?)", [
    first.id,
    second.id,
    "Fresh message thread after the database content reset.",
  ]);

  if (posts.length > 0) {
    await db.execute(
      "INSERT INTO comments (`desc`, createdAt, userId, postId) VALUES (?, NOW(), ?, ?)",
      ["Fresh comment after reset. The old content is gone.", second.id, posts[0].id]
    );
    await db.execute("INSERT INTO likes (userId, postId, reactionType) VALUES (?, ?, ?)", [
      second.id,
      posts[0].id,
      "love",
    ]);
    await db.execute("INSERT INTO saved_posts (userId, postId) VALUES (?, ?)", [
      first.id,
      posts[0].id,
    ]);
    await db.execute(
      "INSERT INTO notifications (receiverId, senderId, type, entityId, message) VALUES (?, ?, ?, ?, ?)",
      [posts[0].userId, second.id, "comment", posts[0].id, "Fresh content has new engagement."]
    );
  }
};

const main = async () => {
  await ensureMedia();

  const db = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "root",
    database: process.env.DB_NAME || "mydevify_social",
  });

  try {
    const [users] = await db.execute(
      "SELECT id, username, name FROM users ORDER BY id ASC"
    );

    if (users.length === 0) {
      throw new Error("No users found. Register at least one user before seeding fresh content.");
    }

    await resetTables(db);

    const posts = await seedPosts(db, users);
    await seedStories(db, users);
    await seedFeatures(db, users);
    await seedEngagement(db, users, posts);

    const [counts] = await db.query(`
      SELECT 'users' AS tableName, COUNT(*) AS rowCount FROM users
      UNION ALL SELECT 'posts', COUNT(*) FROM posts
      UNION ALL SELECT 'stories', COUNT(*) FROM stories
      UNION ALL SELECT 'feature_items', COUNT(*) FROM feature_items
      UNION ALL SELECT 'relationships', COUNT(*) FROM relationships
      UNION ALL SELECT 'messages', COUNT(*) FROM messages
      UNION ALL SELECT 'comments', COUNT(*) FROM comments
      UNION ALL SELECT 'likes', COUNT(*) FROM likes
      UNION ALL SELECT 'saved_posts', COUNT(*) FROM saved_posts
      UNION ALL SELECT 'notifications', COUNT(*) FROM notifications
      UNION ALL SELECT 'friend_requests', COUNT(*) FROM friend_requests
    `);

    console.table(counts);
  } finally {
    await db.end();
  }
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
