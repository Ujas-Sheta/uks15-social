import "dotenv/config";
import fs from "fs";
import https from "https";
import path from "path";
import { fileURLToPath } from "url";
import bcrypt from "bcryptjs";
import mysql from "mysql2/promise";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..", "..");
const uploadsDir = path.join(rootDir, "frontend", "public", "uploads", "posts");

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
  "users",
];

const media = [
  {
    file: "virat-kohli-profile.jpg",
    url: "https://upload.wikimedia.org/wikipedia/commons/1/15/Virat_Kohli_portrait.jpg",
  },
  {
    file: "virat-kohli-cover.jpg",
    url: "https://picsum.photos/seed/virat-kohli-stadium-lights/1600/700",
  },
  {
    file: "virat-kohli-practice.jpg",
    url: "https://picsum.photos/seed/virat-kohli-practice/1400/950",
  },
  {
    file: "virat-kohli-fans.jpg",
    url: "https://picsum.photos/seed/virat-kohli-fans/1400/950",
  },
  {
    file: "virat-kohli-story.jpg",
    url: "https://picsum.photos/seed/virat-kohli-story/900/1400",
  },
  {
    file: "virat-kohli-clip.mp4",
    url: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
  },
];

const download = (url, filePath) =>
  new Promise((resolve, reject) => {
    const request = https.get(
      url,
      {
        headers: {
          "User-Agent": "Uks15DemoSeeder/1.0 (local development project)",
        },
      },
      (response) => {
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
      }
    );

    request.on("error", reject);
    request.setTimeout(20000, () => {
      request.destroy(new Error(`Download timed out: ${url}`));
    });
  });

const ensureMedia = async () => {
  fs.mkdirSync(uploadsDir, { recursive: true });

  for (const item of media) {
    const target = path.join(uploadsDir, item.file);
    if (fs.existsSync(target)) continue;
    await download(item.url, target);
  }
};

const resetTables = async (db) => {
  await db.query("SET FOREIGN_KEY_CHECKS = 0");
  for (const table of tablesToReset) {
    await db.query(`TRUNCATE TABLE \`${table}\``);
  }
  await db.query("SET FOREIGN_KEY_CHECKS = 1");
};

const createViratUser = async (db) => {
  const password = bcrypt.hashSync("virat123456", 10);
  const [result] = await db.execute(
    `INSERT INTO users
      (username, email, password, name, coverPic, profilePic, city, website, bio, facebookProfile, instagramProfile, XProfile, isPrivate)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      "virat_kohli",
      "virat.kohli@uks15.demo",
      password,
      "Virat Kohli",
      "virat-kohli-cover.jpg",
      "virat-kohli-profile.jpg",
      "Delhi, India",
      "https://www.viratkohli.foundation/",
      "Cricketer. Chase master. Fitness, discipline, and cricket moments.",
      "virat.kohli",
      "virat.kohli",
      "imVkohli",
      1,
    ]
  );

  return result.insertId;
};

const createViewerUser = async (db) => {
  const password = bcrypt.hashSync("fan123456", 10);
  const [result] = await db.execute(
    `INSERT INTO users
      (username, email, password, name, coverPic, profilePic, city, website, bio, isPrivate)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      "cricket_fan",
      "cricket.fan@uks15.demo",
      password,
      "Cricket Fan",
      "virat-kohli-cover.jpg",
      "virat-kohli-story.jpg",
      "Regina, Canada",
      "https://uks15.demo",
      "Demo viewer account for testing follow and message with Virat Kohli.",
      0,
    ]
  );

  return result.insertId;
};

const seedPosts = async (db, userId) => {
  const posts = [
    {
      desc: "Fresh training day. Discipline, focus, and small improvements every session.",
      img: "virat-kohli-practice.jpg",
    },
    {
      desc: "Nothing feels better than walking out with energy from the fans. Cricket is emotion.",
      img: "virat-kohli-fans.jpg",
    },
    {
      desc: "New Uks15 profile reset is live. One clean account, fresh posts, fresh stories, fresh clips.",
      img: "virat-kohli-profile.jpg",
    },
  ];

  const postIds = [];
  for (const post of posts) {
    const [result] = await db.execute(
      "INSERT INTO posts (`Desc`, img, userId, createdAt) VALUES (?, ?, ?, NOW())",
      [post.desc, post.img, userId]
    );
    postIds.push(result.insertId);
  }

  return postIds;
};

const seedStories = async (db, userId) => {
  const stories = [
    "virat-kohli-story.jpg",
    "virat-kohli-practice.jpg",
    "virat-kohli-profile.jpg",
  ];

  for (const img of stories) {
    await db.execute("INSERT INTO stories (img, userId, createdAt) VALUES (?, ?, NOW())", [
      img,
      userId,
    ]);
  }
};

const seedFeatures = async (db, userId) => {
  const items = [
    {
      type: "community",
      title: "Virat Fan Club",
      description: "A fresh community for match reactions, cricket discipline, fitness, and fan moments.",
      media: "virat-kohli-fans.jpg",
      mediaType: "image",
      meta: "Fresh community",
    },
    {
      type: "community",
      title: "Cricket Mindset",
      description: "Talk about practice routines, pressure chases, leadership, and consistency.",
      media: "virat-kohli-practice.jpg",
      mediaType: "image",
      meta: "Cricket talk",
    },
    {
      type: "market",
      title: "Signed practice bat",
      description: "Demo marketplace listing for cricket fans inside Uks15 Market.",
      media: "virat-kohli-practice.jpg",
      mediaType: "image",
      meta: "$299",
    },
    {
      type: "market",
      title: "Fan jersey bundle",
      description: "Demo fan merchandise listing with a clean product card layout.",
      media: "virat-kohli-fans.jpg",
      mediaType: "image",
      meta: "$89",
    },
    {
      type: "clip",
      title: "Training short",
      description: "Playable short video demo for the Clips page after the full reset.",
      media: "virat-kohli-clip.mp4",
      mediaType: "video",
      meta: "0:05",
    },
    {
      type: "clip",
      title: "Match-day energy",
      description: "A fresh visual card for clips with cricket-style storytelling.",
      media: "virat-kohli-fans.jpg",
      mediaType: "image",
      meta: "0:22",
    },
    {
      type: "event",
      title: "Virat Watch Party",
      description: "Demo event for fans to gather, react, and talk cricket moments.",
      media: "virat-kohli-cover.jpg",
      mediaType: "image",
      meta: "Friday 7:00 PM",
    },
    {
      type: "event",
      title: "Fitness Challenge",
      description: "Community event inspired by elite discipline, training, and consistency.",
      media: "virat-kohli-practice.jpg",
      mediaType: "image",
      meta: "Sunday 8:00 AM",
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
        userId,
      ]
    );
  }
};

const seedEngagement = async (db, viratUserId, viewerUserId, postIds) => {
  if (postIds.length === 0) return;

  await db.execute(
    "INSERT INTO comments (`desc`, createdAt, userId, postId) VALUES (?, NOW(), ?, ?)",
    ["Fresh database, fresh cricket energy.", viewerUserId, postIds[0]]
  );
  await db.execute("INSERT INTO likes (userId, postId, reactionType) VALUES (?, ?, ?)", [
    viewerUserId,
    postIds[0],
    "love",
  ]);
  await db.execute("INSERT INTO saved_posts (userId, postId) VALUES (?, ?)", [
    viewerUserId,
    postIds[1] || postIds[0],
  ]);
  await db.execute(
    "INSERT INTO notifications (receiverId, senderId, type, entityId, message) VALUES (?, ?, ?, ?, ?)",
    [viratUserId, viewerUserId, "post", postIds[0], "Cricket Fan reacted to your fresh Virat Kohli post."]
  );
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
    await resetTables(db);
    const viratUserId = await createViratUser(db);
    const viewerUserId = await createViewerUser(db);
    const postIds = await seedPosts(db, viratUserId);
    await seedStories(db, viratUserId);
    await seedFeatures(db, viratUserId);
    await seedEngagement(db, viratUserId, viewerUserId, postIds);

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
    console.log("Virat profile login username: virat_kohli");
    console.log("Virat profile login password: virat123456");
    console.log("Viewer test login username: cricket_fan");
    console.log("Viewer test login password: fan123456");
  } finally {
    await db.end();
  }
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
