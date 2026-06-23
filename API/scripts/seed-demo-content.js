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

const demoImages = [
  {
    file: "uks15-demo-feed-1.jpg",
    url: "https://picsum.photos/seed/uks15-workspace/1200/800",
  },
  {
    file: "uks15-demo-feed-2.jpg",
    url: "https://picsum.photos/seed/uks15-community/1200/900",
  },
  {
    file: "uks15-demo-feed-3.jpg",
    url: "https://picsum.photos/seed/uks15-market/1200/800",
  },
  {
    file: "uks15-demo-feed-4.jpg",
    url: "https://picsum.photos/seed/uks15-clips/1200/900",
  },
];

const demoVideos = [
  {
    file: "uks15-demo-clip-flower.mp4",
    url: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
  },
];

const demoUsers = [
  {
    username: "maya_ui",
    email: "maya.ui@example.com",
    name: "Maya UI",
    bio: "Product designer sharing clean social app ideas.",
  },
  {
    username: "dev_aarav",
    email: "aarav.dev@example.com",
    name: "Aarav Dev",
    bio: "React and Node builder. Posting full-stack progress.",
  },
  {
    username: "greenmarket",
    email: "greenmarket@example.com",
    name: "Green Market",
    bio: "Local finds, useful tools, and community listings.",
  },
  {
    username: "studio_nora",
    email: "nora.studio@example.com",
    name: "Nora Studio",
    bio: "Photos, clips, and visual stories for Uks15.",
    isPrivate: 1,
  },
];

const demoPosts = [
  {
    username: "maya_ui",
    desc: "Polished the new Uks15 profile layout today. Cover photos, clean tabs, and a quieter card system make the whole app feel more real.",
    img: "uks15-demo-feed-1.jpg",
  },
  {
    username: "dev_aarav",
    desc: "Built a notification flow for follows, reactions, and comments. Small feature, huge difference for a social platform.",
    img: "uks15-demo-feed-2.jpg",
  },
  {
    username: "greenmarket",
    desc: "Uks15 Market concept: simple local listings that sit beside your social feed without feeling like a separate app.",
    img: "uks15-demo-feed-3.jpg",
  },
  {
    username: "studio_nora",
    desc: "A media-first feed should feel fast, visual, and easy to scan. Stories and photos now carry more of the experience.",
    img: "uks15-demo-feed-4.jpg",
  },
];

const featureItems = [
  {
    type: "community",
    title: "Frontend Builders",
    description: "A community for React, UI, portfolio, and full-stack project builders.",
    media: "uks15-demo-feed-1.jpg",
    mediaType: "image",
    meta: "1.2k members",
    username: "maya_ui",
  },
  {
    type: "community",
    title: "Saskatchewan Creators",
    description: "Share local events, design ideas, and small business posts.",
    media: "uks15-demo-feed-2.jpg",
    mediaType: "image",
    meta: "Local community",
    username: "studio_nora",
  },
  {
    type: "market",
    title: "Minimal desk setup",
    description: "Clean monitor stand, keyboard tray, and lamp bundle for a home office.",
    media: "uks15-demo-feed-3.jpg",
    mediaType: "image",
    meta: "$85",
    username: "greenmarket",
  },
  {
    type: "market",
    title: "Creator camera kit",
    description: "Starter photo kit for clips, marketplace posts, and product shots.",
    media: "uks15-demo-feed-4.jpg",
    mediaType: "image",
    meta: "$140",
    username: "studio_nora",
  },
  {
    type: "clip",
    title: "Short nature clip",
    description: "A real playable demo video for testing the Uks15 Clips experience.",
    media: "uks15-demo-clip-flower.mp4",
    mediaType: "video",
    meta: "0:05",
    username: "maya_ui",
  },
  {
    type: "clip",
    title: "Node API cleanup",
    description: "Quick walkthrough of turning template routes into portfolio-ready APIs.",
    media: "uks15-demo-feed-2.jpg",
    mediaType: "image",
    meta: "1:10",
    username: "dev_aarav",
  },
  {
    type: "event",
    title: "Uks15 Launch Night",
    description: "A demo event for testing interested/going flows and event discovery.",
    media: "uks15-demo-feed-1.jpg",
    mediaType: "image",
    meta: "Friday 7:00 PM",
    username: "dev_aarav",
  },
  {
    type: "event",
    title: "Portfolio Build Sprint",
    description: "A weekend sprint for improving social app features and GitHub polish.",
    media: "uks15-demo-feed-2.jpg",
    mediaType: "image",
    meta: "Saturday 11:00 AM",
    username: "maya_ui",
  },
];

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
      file.on("finish", () => {
        file.close(resolve);
      });
    });

    request.on("error", reject);
  });

const ensureDemoMedia = async () => {
  fs.mkdirSync(uploadsDir, { recursive: true });

  for (const image of demoImages) {
    const target = path.join(uploadsDir, image.file);
    if (!fs.existsSync(target)) {
      await download(image.url, target);
    }
  }

  for (const video of demoVideos) {
    const target = path.join(uploadsDir, video.file);
    if (!fs.existsSync(target)) {
      await download(video.url, target);
    }
  }
};

const main = async () => {
  await ensureDemoMedia();

  const db = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "root",
    database: process.env.DB_NAME || "mydevify_social",
  });

  const password = bcrypt.hashSync("pass123456", 10);

  for (const user of demoUsers) {
    await db.execute(
      `INSERT INTO users (username, email, password, name, bio, isPrivate)
       SELECT ?, ?, ?, ?, ?, 0
       WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = ?)`,
      [user.username, user.email, password, user.name, user.bio, user.username]
    );
    await db.execute("UPDATE users SET bio = ?, isPrivate = ? WHERE username = ?", [
      user.bio,
      user.isPrivate ? 1 : 0,
      user.username,
    ]);
  }

  for (const post of demoPosts) {
    const [[user]] = await db.execute("SELECT id FROM users WHERE username = ?", [
      post.username,
    ]);

    await db.execute(
      `INSERT INTO posts (\`Desc\`, img, userId, createdAt)
       SELECT ?, ?, ?, NOW()
       WHERE NOT EXISTS (SELECT 1 FROM posts WHERE \`Desc\` = ?)`,
      [post.desc, post.img, user.id, post.desc]
    );
  }

  for (const item of featureItems) {
    const [[user]] = await db.execute("SELECT id FROM users WHERE username = ?", [
      item.username,
    ]);

    await db.execute(
      `INSERT INTO feature_items (type, title, description, media, mediaType, meta, userId)
       SELECT ?, ?, ?, ?, ?, ?, ?
       WHERE NOT EXISTS (
        SELECT 1 FROM feature_items WHERE type = ? AND title = ?
       )`,
      [
        item.type,
        item.title,
        item.description,
        item.media,
        item.mediaType,
        item.meta,
        user.id,
        item.type,
        item.title,
      ]
    );

    await db.execute(
      "UPDATE feature_items SET mediaType = ? WHERE type = ? AND title = ?",
      [item.mediaType, item.type, item.title]
    );
  }

  const [[xloy]] = await db.execute("SELECT id FROM users WHERE username = ?", [
    "xLoy",
  ]);

  if (xloy) {
    for (const user of demoUsers) {
      const [[demoUser]] = await db.execute(
        "SELECT id FROM users WHERE username = ?",
        [user.username]
      );
      await db.execute(
        `INSERT INTO relationships (followerUserId, followedUserId)
         SELECT ?, ?
         WHERE NOT EXISTS (
           SELECT 1 FROM relationships
           WHERE followerUserId = ? AND followedUserId = ?
         )`,
        [xloy.id, demoUser.id, xloy.id, demoUser.id]
      );
    }
  }

  await db.end();
  console.log("Demo content seeded. Demo user password: pass123456");
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
