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

// ─── Media to download ───────────────────────────────────────────────────────

const images = [
  // Cristiano Ronaldo
  { file: "cr7-profile.jpg",   url: "https://picsum.photos/seed/cr7avatar/400/400" },
  { file: "cr7-cover.jpg",     url: "https://picsum.photos/seed/cr7stadium/1200/400" },
  { file: "cr7-post1.jpg",     url: "https://picsum.photos/seed/cr7training/1200/800" },
  { file: "cr7-post2.jpg",     url: "https://picsum.photos/seed/cr7goal/1200/800" },
  { file: "cr7-post3.jpg",     url: "https://picsum.photos/seed/cr7family/1200/900" },
  { file: "cr7-post4.jpg",     url: "https://picsum.photos/seed/cr7lifestyle/1200/800" },
  { file: "cr7-post5.jpg",     url: "https://picsum.photos/seed/cr7brand/1200/900" },
  { file: "cr7-market1.jpg",   url: "https://picsum.photos/seed/cr7jersey/800/600" },
  { file: "cr7-market2.jpg",   url: "https://picsum.photos/seed/cr7boots/800/600" },
  { file: "cr7-event1.jpg",    url: "https://picsum.photos/seed/cr7charity/1200/700" },
  { file: "cr7-story1.jpg",    url: "https://picsum.photos/seed/cr7story/600/1000" },

  // Elon Musk
  { file: "elon-profile.jpg",  url: "https://picsum.photos/seed/elonface/400/400" },
  { file: "elon-cover.jpg",    url: "https://picsum.photos/seed/elonspace/1200/400" },
  { file: "elon-post1.jpg",    url: "https://picsum.photos/seed/elontesla/1200/800" },
  { file: "elon-post2.jpg",    url: "https://picsum.photos/seed/elonrocket/1200/800" },
  { file: "elon-post3.jpg",    url: "https://picsum.photos/seed/elonai/1200/900" },
  { file: "elon-post4.jpg",    url: "https://picsum.photos/seed/elonoffice/1200/800" },
  { file: "elon-post5.jpg",    url: "https://picsum.photos/seed/elonmars/1200/900" },
  { file: "elon-market1.jpg",  url: "https://picsum.photos/seed/teslacar/800/600" },
  { file: "elon-market2.jpg",  url: "https://picsum.photos/seed/spacexmerch/800/600" },
  { file: "elon-event1.jpg",   url: "https://picsum.photos/seed/techlaunch/1200/700" },
  { file: "elon-story1.jpg",   url: "https://picsum.photos/seed/elonstory/600/1000" },

  // Taylor Swift
  { file: "taylor-profile.jpg",url: "https://picsum.photos/seed/tayloravatar/400/400" },
  { file: "taylor-cover.jpg",  url: "https://picsum.photos/seed/taylorconcert/1200/400" },
  { file: "taylor-post1.jpg",  url: "https://picsum.photos/seed/taylorstage/1200/800" },
  { file: "taylor-post2.jpg",  url: "https://picsum.photos/seed/tayloralbum/1200/800" },
  { file: "taylor-post3.jpg",  url: "https://picsum.photos/seed/taylorstudio/1200/900" },
  { file: "taylor-post4.jpg",  url: "https://picsum.photos/seed/taylorfashion/1200/800" },
  { file: "taylor-post5.jpg",  url: "https://picsum.photos/seed/taylorcat/1200/900" },
  { file: "taylor-market1.jpg",url: "https://picsum.photos/seed/taylormerch/800/600" },
  { file: "taylor-market2.jpg",url: "https://picsum.photos/seed/taylorvinyl/800/600" },
  { file: "taylor-event1.jpg", url: "https://picsum.photos/seed/erastourevent/1200/700" },
  { file: "taylor-story1.jpg", url: "https://picsum.photos/seed/taylorstory/600/1000" },

  // LeBron James
  { file: "lebron-profile.jpg",url: "https://picsum.photos/seed/lebronavatar/400/400" },
  { file: "lebron-cover.jpg",  url: "https://picsum.photos/seed/lebronbasketball/1200/400" },
  { file: "lebron-post1.jpg",  url: "https://picsum.photos/seed/lebroncourt/1200/800" },
  { file: "lebron-post2.jpg",  url: "https://picsum.photos/seed/lebronlakers/1200/800" },
  { file: "lebron-post3.jpg",  url: "https://picsum.photos/seed/lebronfamily/1200/900" },
  { file: "lebron-post4.jpg",  url: "https://picsum.photos/seed/lebronbusiness/1200/800" },
  { file: "lebron-post5.jpg",  url: "https://picsum.photos/seed/lebronkids/1200/900" },
  { file: "lebron-market1.jpg",url: "https://picsum.photos/seed/lebronjerseyshop/800/600" },
  { file: "lebron-market2.jpg",url: "https://picsum.photos/seed/lebronshoes/800/600" },
  { file: "lebron-event1.jpg", url: "https://picsum.photos/seed/lakeracharity/1200/700" },
  { file: "lebron-story1.jpg", url: "https://picsum.photos/seed/lebronstory/600/1000" },

  // Priyanka Chopra
  { file: "priyanka-profile.jpg", url: "https://picsum.photos/seed/priyankaavatar/400/400" },
  { file: "priyanka-cover.jpg",   url: "https://picsum.photos/seed/priyankamovie/1200/400" },
  { file: "priyanka-post1.jpg",   url: "https://picsum.photos/seed/priyankafashion/1200/800" },
  { file: "priyanka-post2.jpg",   url: "https://picsum.photos/seed/priyankabollywood/1200/800" },
  { file: "priyanka-post3.jpg",   url: "https://picsum.photos/seed/priyankatravel/1200/900" },
  { file: "priyanka-post4.jpg",   url: "https://picsum.photos/seed/priyankacharity/1200/800" },
  { file: "priyanka-post5.jpg",   url: "https://picsum.photos/seed/priyankafood/1200/900" },
  { file: "priyanka-market1.jpg", url: "https://picsum.photos/seed/priyankahaircare/800/600" },
  { file: "priyanka-market2.jpg", url: "https://picsum.photos/seed/priyankabookshop/800/600" },
  { file: "priyanka-event1.jpg",  url: "https://picsum.photos/seed/bollywoodevent/1200/700" },
  { file: "priyanka-story1.jpg",  url: "https://picsum.photos/seed/priyankastory/600/1000" },
];

// ─── Users ────────────────────────────────────────────────────────────────────

const users = [
  {
    username: "Cristiano",
    email: "cr7@example.com",
    name: "Cristiano Ronaldo",
    bio: "⚽ Professional footballer. Al Nassr & Portugal 🇵🇹. Father. Always believe.",
    website: "https://www.cristianoronaldo.com",
    profilePic: "cr7-profile.jpg",
    coverPic: "cr7-cover.jpg",
    isPrivate: 0,
  },
  {
    username: "elonmusk",
    email: "elon@example.com",
    name: "Elon Musk",
    bio: "🚀 CEO of SpaceX & Tesla. X owner. Making humanity multiplanetary.",
    website: "https://www.tesla.com",
    profilePic: "elon-profile.jpg",
    coverPic: "elon-cover.jpg",
    isPrivate: 0,
  },
  {
    username: "taylorswift",
    email: "taylor@example.com",
    name: "Taylor Swift",
    bio: "🎶 Singer-songwriter. The Eras Tour. 13 albums and counting. Cat mom 🐱",
    website: "https://www.taylorswift.com",
    profilePic: "taylor-profile.jpg",
    coverPic: "taylor-cover.jpg",
    isPrivate: 0,
  },
  {
    username: "KingJames",
    email: "lebron@example.com",
    name: "LeBron James",
    bio: "👑 NBA Champion. LA Lakers. Father. Entrepreneur. Philanthropy via @LJFF.",
    website: "https://www.lebronjames.com",
    profilePic: "lebron-profile.jpg",
    coverPic: "lebron-cover.jpg",
    isPrivate: 0,
  },
  {
    username: "priyankachopra",
    email: "priyanka@example.com",
    name: "Priyanka Chopra Jonas",
    bio: "🎬 Actor. Producer. UNICEF Goodwill Ambassador 🌍. Author. Desi girl 🇮🇳",
    website: "https://www.priyankachopra.com",
    profilePic: "priyanka-profile.jpg",
    coverPic: "priyanka-cover.jpg",
    isPrivate: 0,
  },
];

// ─── Posts ────────────────────────────────────────────────────────────────────

const posts = [
  // Cristiano Ronaldo
  { username: "Cristiano", desc: "Every day is a new opportunity to improve. Morning training done 💪 Hard work, dedication, and faith. SIUUU! 🔥", img: "cr7-post1.jpg" },
  { username: "Cristiano", desc: "That feeling when the ball hits the back of the net. Pure joy. Nothing compares to this moment ⚽🥅 #CR7 #AlNassr", img: "cr7-post2.jpg" },
  { username: "Cristiano", desc: "Family is everything ❤️ These moments with my kids remind me why I play. Grateful for every single day. #Family", img: "cr7-post3.jpg" },
  { username: "Cristiano", desc: "New chapter, same hunger. Proud to be part of Saudi Arabia 🇸🇦 and to grow football across the world. #AlNassr", img: "cr7-post4.jpg" },
  { username: "Cristiano", desc: "CR7 | The brand is about more than football — it's about lifestyle, confidence, and style. New collection dropping soon 👟", img: "cr7-post5.jpg" },
  { username: "Cristiano", desc: "To all my fans worldwide — your energy makes me want to give 100% every single time I step on that pitch. THANK YOU 🙏❤️", img: "" },

  // Elon Musk
  { username: "elonmusk", desc: "The goal of SpaceX is to make humanity a multi-planetary species. We are getting very close to the first crewed Mars mission 🚀", img: "elon-post2.jpg" },
  { username: "elonmusk", desc: "Tesla's Full Self-Driving is now statistically the safest way to travel. The data speaks for itself ⚡🚗", img: "elon-post1.jpg" },
  { username: "elonmusk", desc: "AI is the most transformative technology in human history. We must ensure it benefits all of humanity, not just a few. #xAI", img: "elon-post3.jpg" },
  { username: "elonmusk", desc: "The thing I love most about X is that it gives everyone a voice. Free speech is the foundation of a functioning democracy 🦅", img: "elon-post4.jpg" },
  { username: "elonmusk", desc: "Mars in 2029. I know it sounds crazy. But so did landing rockets on drone ships 10 years ago 🔴🚀 #SpaceX #Mars", img: "elon-post5.jpg" },
  { username: "elonmusk", desc: "Manufacturing is underrated. Solving the machine that makes the machine is harder than the product itself. That's the real moat.", img: "" },

  // Taylor Swift
  { username: "taylorswift", desc: "The Eras Tour has been the most joyful experience of my life 🎶✨ Every night you show up and give everything. I see you. I love you.", img: "taylor-post1.jpg" },
  { username: "taylorswift", desc: "MIDNIGHTS is officially 1 year old 🌙 I wrote every song thinking about nights I laid awake overthinking. Glad I'm not alone 💜", img: "taylor-post2.jpg" },
  { username: "taylorswift", desc: "Studio days are my favourite days. Something new is coming and I cannot stop smiling 😊🎵 #NewMusic", img: "taylor-post3.jpg" },
  { username: "taylorswift", desc: "Met the most incredible Swifties tonight after the show. The friendship bracelets, the outfits, the signs — you are art 🫶✨", img: "taylor-post4.jpg" },
  { username: "taylorswift", desc: "My cats Benjamin, Meredith, and Olivia are the real bosses of this household 🐱😂 They definitely do not care about the Grammys.", img: "taylor-post5.jpg" },
  { username: "taylorswift", desc: "Sending so much love to everyone going through a hard time. You are not alone. The music is always here for you 💛", img: "" },

  // LeBron James
  { username: "KingJames", desc: "Locked in 🔒 Pre-season prep hits different when you've got something to prove. Every rep counts. Lakers up 💜💛", img: "lebron-post1.jpg" },
  { username: "KingJames", desc: "Championship mindset never stops. Ring or not — this team is built for something special this season. Believe that 👑", img: "lebron-post2.jpg" },
  { username: "KingJames", desc: "My family is my foundation ❤️ Savannah, Bronny, Bryce and Zhuri — everything I do is for you. #JamesGang", img: "lebron-post3.jpg" },
  { username: "KingJames", desc: "SpringHill Company is growing 📈 Changing the narrative around Black excellence in Hollywood and business. Stay tuned 🎬", img: "lebron-post4.jpg" },
  { username: "KingJames", desc: "Bronny on the court, Bron on the court. Father-son duo in the NBA 👨‍👦🏀 A moment I will never take for granted. HISTORY.", img: "lebron-post5.jpg" },
  { username: "KingJames", desc: "The I PROMISE School kids gave me the biggest standing ovation today. That right there is why I do everything. #LJFF 🙏", img: "" },

  // Priyanka Chopra
  { username: "priyankachopra", desc: "Fashion is my second language 💫 This look took 6 hours and every single minute was worth it. Thank you to my incredible team 🙏", img: "priyanka-post1.jpg" },
  { username: "priyankachopra", desc: "Back on set and loving every second of it 🎬 This role is unlike anything I've ever done. Cannot wait for you all to see it ✨", img: "priyanka-post2.jpg" },
  { username: "priyankachopra", desc: "Just returned from my UNICEF mission 🌍 The resilience of children in conflict zones humbles me every single time. Do more. Give more.", img: "priyanka-post4.jpg" },
  { username: "priyankachopra", desc: "Malaga, sunsets, and good food 🌅🍝 Nick and I are recharging and I am very grateful for these quiet moments of joy.", img: "priyanka-post3.jpg" },
  { username: "priyankachopra", desc: "Desi food always wins 🇮🇳❤️ Maa ke haath ka khana is literally a superpower. Made dal makhani today and cried happy tears 😂", img: "priyanka-post5.jpg" },
  { username: "priyankachopra", desc: "My memoir Unfinished taught me that your story is not done until you decide it is. Keep going. You are not finished. 💛📖", img: "" },
];

// ─── Marketplace ──────────────────────────────────────────────────────────────

const marketItems = [
  { username: "Cristiano",      title: "CR7 Signed Match Jersey", description: "Authentic Al Nassr match-worn jersey signed by Cristiano Ronaldo. Certificate of authenticity included.", media: "cr7-market1.jpg", mediaType: "image", meta: "$4,500" },
  { username: "Cristiano",      title: "Nike Mercurial CR7 Boots", description: "Limited edition CR7 Mercurial football boots. Size 9.5 US. Worn in pre-season training. Collector's item.", media: "cr7-market2.jpg", mediaType: "image", meta: "$850" },
  { username: "elonmusk",       title: "Tesla Model S Plaid — Mint Condition", description: "2023 Tesla Model S Plaid, 1020hp, 0-60 in 1.99s. Full autopilot. White exterior, black interior. Low mileage.", media: "elon-market1.jpg", mediaType: "image", meta: "$89,000" },
  { username: "elonmusk",       title: "SpaceX Mission Patch Set", description: "Official SpaceX embroidered mission patch set — Crew Dragon 1 through 6. Rare collector's set. Framed.", media: "elon-market2.jpg", mediaType: "image", meta: "$299" },
  { username: "taylorswift",    title: "Eras Tour Official Merch Bundle", description: "Complete Eras Tour merch bundle: hoodie, t-shirt, poster, friendship bracelet, and signed setlist print.", media: "taylor-market1.jpg", mediaType: "image", meta: "$220" },
  { username: "taylorswift",    title: "Midnights Vinyl — Signed Edition", description: "Midnight Rain variant Midnights vinyl, hand-signed by Taylor Swift. Mint condition. Original shrink wrap.", media: "taylor-market2.jpg", mediaType: "image", meta: "$1,200" },
  { username: "KingJames",      title: "Lakers Game Night Jersey — #23", description: "Official Fanatics authentic LeBron James Lakers jersey. XL. New with tags. Perfect for game nights or framing.", media: "lebron-market1.jpg", mediaType: "image", meta: "$350" },
  { username: "KingJames",      title: "Nike LeBron 21 — Limited Colourway", description: "Nike LeBron 21 'Purple Rain' colourway. Size 12 US. DS. Deadstock in original box. Very limited release.", media: "lebron-market2.jpg", mediaType: "image", meta: "$480" },
  { username: "priyankachopra", title: "Anomaly Haircare Starter Bundle", description: "Full Anomaly by Priyanka Chopra Jonas haircare starter set — shampoo, conditioner, mask, and serum. Brand new.", media: "priyanka-market1.jpg", mediaType: "image", meta: "$75" },
  { username: "priyankachopra", title: "Unfinished — Signed Hardcover", description: "Priyanka Chopra's memoir Unfinished, hardcover first edition, personally signed. Ships worldwide.", media: "priyanka-market2.jpg", mediaType: "image", meta: "$95" },
];

// ─── Events ───────────────────────────────────────────────────────────────────

const events = [
  { username: "Cristiano",      title: "CR7 Charity Football Match", description: "Cristiano Ronaldo hosts a charity match to raise funds for UNICEF children's programs. Special guest appearances from world-class footballers.", media: "cr7-event1.jpg", mediaType: "image", meta: "Sat 21 Dec · Riyadh, Saudi Arabia" },
  { username: "elonmusk",       title: "Tesla & SpaceX Tech Showcase 2025", description: "Elon Musk unveils the next generation of Tesla vehicles and the latest SpaceX Starship developments. Live stream available.", media: "elon-event1.jpg", mediaType: "image", meta: "Fri 17 Jan · Austin, TX" },
  { username: "taylorswift",    title: "The Eras Tour — Final Night (London)", description: "The historic final night of The Eras Tour at Wembley Stadium. All 44 songs. All 10 eras. One last time.", media: "taylor-event1.jpg", mediaType: "image", meta: "Sun 23 Aug · Wembley Stadium, London" },
  { username: "KingJames",      title: "Lakers vs Celtics — Open Practice Day", description: "LeBron James invites fans to an open practice session before the big Lakers vs Celtics game. Free entry for I PROMISE School families.", media: "lebron-event1.jpg", mediaType: "image", meta: "Thu 9 Jan · Crypto.com Arena, LA" },
  { username: "priyankachopra", title: "UNICEF Fundraiser Gala with Priyanka", description: "An elegant gala evening hosted by Priyanka Chopra Jonas to raise funds for UNICEF's education programs in South Asia.", media: "priyanka-event1.jpg", mediaType: "image", meta: "Sat 14 Feb · The Beverly Hills Hotel" },
];

// ─── Communities ──────────────────────────────────────────────────────────────

const communities = [
  { username: "Cristiano",      title: "CR7 Global Fans", description: "The official fan community for Cristiano Ronaldo supporters worldwide. Goals, interviews, behind-the-scenes, and more.", media: "cr7-post1.jpg", mediaType: "image", meta: "92M members" },
  { username: "elonmusk",       title: "Mars Colonization Society", description: "Dedicated to the mission of making humanity multiplanetary. SpaceX updates, Mars habitat designs, and serious aerospace discussion.", media: "elon-post2.jpg", mediaType: "image", meta: "1.4M members" },
  { username: "taylorswift",    title: "Swifties HQ", description: "The ultimate Taylor Swift fan community. Eras Tour recaps, album theories, setlist predictions, and friendship bracelet swaps.", media: "taylor-post1.jpg", mediaType: "image", meta: "48M members" },
  { username: "KingJames",      title: "Lakers Nation", description: "Lakers fans unite. Game analysis, trade news, LeBron highlights, and everything purple and gold. Let's get another ring 💜💛", media: "lebron-post1.jpg", mediaType: "image", meta: "12M members" },
  { username: "priyankachopra", title: "Desi Culture & Bollywood", description: "Celebrating South Asian culture, Bollywood films, music, food, fashion and everything desi. A warm community for all.", media: "priyanka-post2.jpg", mediaType: "image", meta: "5.2M members" },
];

// ─── Clips ────────────────────────────────────────────────────────────────────

const clips = [
  { username: "Cristiano",      title: "Training Session Highlights", description: "A glimpse into my daily training routine at Al Nassr. This is what consistency looks like 💪⚽", media: "uks15-demo-clip-flower.mp4", mediaType: "video", meta: "2:15" },
  { username: "elonmusk",       title: "SpaceX Starship Launch Replay", description: "Watch the full Starship integrated flight test. The most powerful rocket ever built. History in the making 🚀", media: "uks15-demo-clip-flower.mp4", mediaType: "video", meta: "4:30" },
  { username: "taylorswift",    title: "Eras Tour Crowd Cam — London Night 2", description: "You guys were INSANE tonight. Watch what 90,000 people singing Love Story sounds like from the stage 🎶❤️", media: "uks15-demo-clip-flower.mp4", mediaType: "video", meta: "1:45" },
  { username: "KingJames",      title: "Top 5 Plays This Week", description: "From that alley-oop with AD to the buzzer-beater in Dallas. Here are my top 5 plays of the week 🏀👑", media: "uks15-demo-clip-flower.mp4", mediaType: "video", meta: "3:00" },
  { username: "priyankachopra", title: "Behind the Scenes — On Set in London", description: "A little peek at what a 16-hour filming day looks like. Chaos, laughter, and great food between takes 🎬😄", media: "uks15-demo-clip-flower.mp4", mediaType: "video", meta: "2:45" },
  { username: "Cristiano",      title: "Goal of the Week — Al Nassr", description: "That free-kick in the 89th minute. I'll let the ball do the talking ⚽🔥 #CR7 #SIUUU", media: "uks15-fresh-clip.mp4", mediaType: "video", meta: "0:45" },
];

// ─── Stories ──────────────────────────────────────────────────────────────────

const stories = [
  { username: "Cristiano",      img: "cr7-story1.jpg" },
  { username: "elonmusk",       img: "elon-story1.jpg" },
  { username: "taylorswift",    img: "taylor-story1.jpg" },
  { username: "KingJames",      img: "lebron-story1.jpg" },
  { username: "priyankachopra", img: "priyanka-story1.jpg" },
];

// ─── Download helper ──────────────────────────────────────────────────────────

const download = (url, filePath) =>
  new Promise((resolve, reject) => {
    const req = https.get(url, (res) => {
      if ([301, 302, 303, 307, 308].includes(res.statusCode)) {
        res.resume();
        download(res.headers.location, filePath).then(resolve).catch(reject);
        return;
      }
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode} — ${url}`));
        return;
      }
      const file = fs.createWriteStream(filePath);
      res.pipe(file);
      file.on("finish", () => file.close(resolve));
    });
    req.on("error", reject);
  });

const ensureMedia = async () => {
  fs.mkdirSync(uploadsDir, { recursive: true });
  for (const img of images) {
    const target = path.join(uploadsDir, img.file);
    if (!fs.existsSync(target)) {
      process.stdout.write(`  Downloading ${img.file}...`);
      await download(img.url, target);
      console.log(" done");
    }
  }
};

// ─── Main ─────────────────────────────────────────────────────────────────────

const main = async () => {
  console.log("\n🌍  Seeding real-world celebrity users...\n");

  await ensureMedia();

  const db = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "root",
    database: process.env.DB_NAME || "mydevify_social",
  });

  const password = bcrypt.hashSync("pass123456", 10);

  // ── Users ──────────────────────────────────────────────────────────────────
  console.log("👤  Creating users...");
  for (const u of users) {
    await db.execute(
      `INSERT INTO users (username, email, password, name, bio, website, profilePic, coverPic, isPrivate)
       SELECT ?, ?, ?, ?, ?, ?, ?, ?, 0
       WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = ?)`,
      [u.username, u.email, password, u.name, u.bio, u.website, u.profilePic, u.coverPic, u.username]
    );
    // Always refresh bio/pics so re-running the script updates them
    await db.execute(
      `UPDATE users SET bio=?, website=?, profilePic=?, coverPic=?, isPrivate=0 WHERE username=?`,
      [u.bio, u.website, u.profilePic, u.coverPic, u.username]
    );
    console.log(`   ✓ ${u.name} (@${u.username})`);
  }

  // ── Posts ──────────────────────────────────────────────────────────────────
  console.log("\n📝  Creating posts...");
  for (const p of posts) {
    const [[user]] = await db.execute("SELECT id FROM users WHERE username = ?", [p.username]);
    if (!user) continue;
    await db.execute(
      `INSERT INTO posts (\`Desc\`, img, userId, createdAt)
       SELECT ?, ?, ?, NOW() - INTERVAL FLOOR(RAND()*30) DAY
       WHERE NOT EXISTS (SELECT 1 FROM posts WHERE \`Desc\` = ? AND userId = ?)`,
      [p.desc, p.img, user.id, p.desc, user.id]
    );
  }
  console.log(`   ✓ ${posts.length} posts inserted`);

  // ── Marketplace ────────────────────────────────────────────────────────────
  console.log("\n🛒  Creating marketplace listings...");
  for (const item of marketItems) {
    const [[user]] = await db.execute("SELECT id FROM users WHERE username = ?", [item.username]);
    if (!user) continue;
    await db.execute(
      `INSERT INTO feature_items (type, title, description, media, mediaType, meta, userId)
       SELECT 'market', ?, ?, ?, ?, ?, ?
       WHERE NOT EXISTS (SELECT 1 FROM feature_items WHERE type='market' AND title=?)`,
      [item.title, item.description, item.media, item.mediaType, item.meta, user.id, item.title]
    );
  }
  console.log(`   ✓ ${marketItems.length} listings inserted`);

  // ── Events ─────────────────────────────────────────────────────────────────
  console.log("\n📅  Creating events...");
  for (const ev of events) {
    const [[user]] = await db.execute("SELECT id FROM users WHERE username = ?", [ev.username]);
    if (!user) continue;
    await db.execute(
      `INSERT INTO feature_items (type, title, description, media, mediaType, meta, userId)
       SELECT 'event', ?, ?, ?, ?, ?, ?
       WHERE NOT EXISTS (SELECT 1 FROM feature_items WHERE type='event' AND title=?)`,
      [ev.title, ev.description, ev.media, ev.mediaType, ev.meta, user.id, ev.title]
    );
  }
  console.log(`   ✓ ${events.length} events inserted`);

  // ── Communities ────────────────────────────────────────────────────────────
  console.log("\n👥  Creating communities...");
  for (const c of communities) {
    const [[user]] = await db.execute("SELECT id FROM users WHERE username = ?", [c.username]);
    if (!user) continue;
    await db.execute(
      `INSERT INTO feature_items (type, title, description, media, mediaType, meta, userId)
       SELECT 'community', ?, ?, ?, ?, ?, ?
       WHERE NOT EXISTS (SELECT 1 FROM feature_items WHERE type='community' AND title=?)`,
      [c.title, c.description, c.media, c.mediaType, c.meta, user.id, c.title]
    );
  }
  console.log(`   ✓ ${communities.length} communities inserted`);

  // ── Clips ──────────────────────────────────────────────────────────────────
  console.log("\n🎬  Creating clips...");
  for (const cl of clips) {
    const [[user]] = await db.execute("SELECT id FROM users WHERE username = ?", [cl.username]);
    if (!user) continue;
    // Only add if the video file exists
    const videoPath = path.join(uploadsDir, cl.media);
    if (!fs.existsSync(videoPath)) {
      console.log(`   ⚠ Skipping clip "${cl.title}" — ${cl.media} not found`);
      continue;
    }
    await db.execute(
      `INSERT INTO feature_items (type, title, description, media, mediaType, meta, userId)
       SELECT 'clip', ?, ?, ?, ?, ?, ?
       WHERE NOT EXISTS (SELECT 1 FROM feature_items WHERE type='clip' AND title=?)`,
      [cl.title, cl.description, cl.media, cl.mediaType, cl.meta, user.id, cl.title]
    );
  }
  console.log(`   ✓ Clips inserted`);

  // ── Stories ────────────────────────────────────────────────────────────────
  console.log("\n📸  Creating stories...");
  for (const s of stories) {
    const [[user]] = await db.execute("SELECT id FROM users WHERE username = ?", [s.username]);
    if (!user) continue;
    await db.execute(
      `INSERT INTO stories (img, userId, createdAt)
       SELECT ?, ?, NOW()
       WHERE NOT EXISTS (SELECT 1 FROM stories WHERE img = ? AND userId = ?)`,
      [s.img, user.id, s.img, user.id]
    );
  }
  console.log(`   ✓ ${stories.length} stories inserted`);

  // ── Mutual follows ─────────────────────────────────────────────────────────
  console.log("\n🤝  Setting up mutual follows between celebrities...");
  const usernames = users.map((u) => u.username);
  for (const a of usernames) {
    const [[userA]] = await db.execute("SELECT id FROM users WHERE username = ?", [a]);
    for (const b of usernames) {
      if (a === b) continue;
      const [[userB]] = await db.execute("SELECT id FROM users WHERE username = ?", [b]);
      await db.execute(
        `INSERT INTO relationships (followerUserId, followedUserId)
         SELECT ?, ? WHERE NOT EXISTS (
           SELECT 1 FROM relationships WHERE followerUserId=? AND followedUserId=?
         )`,
        [userA.id, userB.id, userA.id, userB.id]
      );
    }
  }
  console.log(`   ✓ All 5 celebrities follow each other`);

  // ── Also make xLoy & virat_kohli follow all celebs ────────────────────────
  const autoFollowUsers = ["xLoy", "virat_kohli"];
  for (const seedName of autoFollowUsers) {
    const [[seedUser]] = await db.execute("SELECT id FROM users WHERE username = ?", [seedName]);
    if (!seedUser) continue;
    for (const celeb of usernames) {
      const [[celebUser]] = await db.execute("SELECT id FROM users WHERE username = ?", [celeb]);
      if (!celebUser) continue;
      await db.execute(
        `INSERT INTO relationships (followerUserId, followedUserId)
         SELECT ?, ? WHERE NOT EXISTS (
           SELECT 1 FROM relationships WHERE followerUserId=? AND followedUserId=?
         )`,
        [seedUser.id, celebUser.id, seedUser.id, celebUser.id]
      );
    }
    console.log(`   ✓ @${seedName} now follows all 5 celebrities`);
  }

  await db.end();

  console.log(`
════════════════════════════════════════
  ✅  Done! 5 celebrity accounts ready.
════════════════════════════════════════
  Users created:
    @Cristiano     — Cristiano Ronaldo
    @elonmusk      — Elon Musk
    @taylorswift   — Taylor Swift
    @KingJames     — LeBron James
    @priyankachopra — Priyanka Chopra Jonas

  Password for all: pass123456

  Each user has:
    • 6 feed posts with photos
    • 2 marketplace listings
    • 1 event
    • 1 community
    • 1 clip (video)
    • 1 story
════════════════════════════════════════
`);
};

main().catch((err) => {
  console.error("\n❌ Seed failed:", err.message);
  process.exit(1);
});
