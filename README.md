# Uks15 Social

Uks15 Social is a full-stack social networking platform inspired by familiar social media patterns, but built with original branding, a green visual system, and custom UI. It mixes a Facebook-style feed and navigation shell with Instagram-style image-first stories, profile presentation, and post cards.

This project is designed as a portfolio-ready React, Node.js, Express, and MySQL application.

## Features

- User registration and login
- JWT cookie authentication
- Green Uks15 brand system with light and dark mode
- Responsive three-column social app layout
- Search users from the header
- Follow and unfollow users
- Feed posts from the current user and followed users
- Create text and image posts
- Image preview before posting
- Story strip with story uploads
- Short video uploads for Clips
- Like/react to posts
- Multiple reaction types: Like, Love, Haha, Wow, and Sad
- Comment on posts
- Profile page with cover photo, avatar, stats, tabs, and follow action
- Notification system for follows, reactions, and comments
- Private-account follow requests with accept/reject
- Clickable notifications that route to profiles, messages, or feed
- Connections page with pending requests and message links
- Basic friend/connection messaging
- Full-screen story viewer
- Repost action that creates a repost in the feed
- Saved posts page with private saved collection
- Communities, Uks15 Market, Clips, and Events pages with create forms
- Search and filter toolbar for Communities, Market, Clips, and Events
- Clips page renders playable video cards with browser video controls
- Prepared routes for Connections, Communities, Market, Clips, Events, Saved, and Settings

## Tech Stack

Frontend:
- React.js with Vite
- React Router DOM
- React Query
- Axios
- Tailwind CSS and custom CSS variables
- Material UI icons

Backend:
- Node.js
- Express.js
- MySQL with mysql2
- JWT
- bcryptjs
- multer
- cookie-parser
- dotenv

## Project Structure

```text
API/
  controllers/
  routes/
  migrations/
  connect.js
  index.js

frontend/
  src/
    components/
    context/
    pages/
    App.jsx
    index.css

mydevify_social.sql
```

## Setup

1. Create the MySQL database.

```sql
CREATE DATABASE mydevify_social;
```

2. Import the base schema and seed data.

```bash
mysql -u root -p mydevify_social < mydevify_social.sql
```

3. Import the notifications migration.

```bash
mysql -u root -p mydevify_social < API/migrations/001_notifications.sql
```

4. Import the private-account migration.

```bash
mysql -u root -p mydevify_social < API/migrations/002_private_accounts.sql
```

5. Import the social feature migration.

```bash
mysql -u root -p mydevify_social < API/migrations/003_social_features.sql
```

6. Import the feature media type migration for video clips.

```bash
mysql -u root -p mydevify_social < API/migrations/004_feature_media_type.sql
```

7. Import the saved posts and reaction type migration.

```bash
mysql -u root -p mydevify_social < API/migrations/005_saved_posts_reactions.sql
```

8. Install backend dependencies.

```bash
cd API
npm install
```

9. Create `API/.env` from `API/.env.example`.

```bash
copy .env.example .env
```

10. Seed demo users, follows, posts, marketplace items, clips, events, communities, local demo images, and one real demo MP4 clip.

```bash
npm run seed
```

Demo seed user password:

```text
pass123456
```

11. Start the backend.

```bash
npm start
```

12. Install frontend dependencies.

```bash
cd ../frontend
npm install
```

13. Create `frontend/.env` from `frontend/.env.example`.

```bash
copy .env.example .env
```

14. Start the frontend.

```bash
npm run dev
```

Open:

```text
http://localhost:5173
```

## Demo Login

The imported SQL includes sample users.

```text
Username: xLoy
Password: 123456789
```

You can also create a new account from the register page.

## Environment Variables

Backend:

```text
PORT=8800
CLIENT_URL=http://localhost:5173
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=root
DB_NAME=mydevify_social
JWT_SECRET=secretkey
```

Frontend:

```text
VITE_API_URL=http://localhost:8800/api
```

## Notes

- This is an original Uks15-branded social app. It does not use Facebook or Instagram branding, logos, icons, assets, or trademarked copy.
- Some navigation sections are prepared as milestone pages so the app can expand cleanly.
- The notification system is implemented for follow, like, and comment events.
- Private accounts hide posts, photos, about details, and connections from non-followers.
- `npm run seed` adds demo users and web-sourced local demo images so the feed is not empty for new accounts.
- Clip uploads support common short video formats such as MP4, WebM, OGG, and MOV up to 50 MB.

## Useful Scripts

Backend:

```bash
npm start
```

Frontend:

```bash
npm run dev
npm run build
npm run lint
```

## License

MIT
