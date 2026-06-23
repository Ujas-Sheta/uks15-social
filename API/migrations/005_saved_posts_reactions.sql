ALTER TABLE `likes`
  ADD COLUMN `reactionType` varchar(24) NOT NULL DEFAULT 'like';

CREATE TABLE IF NOT EXISTS `saved_posts` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `userId` int(11) NOT NULL,
  `postId` int(11) NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_saved_post` (`userId`, `postId`),
  KEY `postId` (`postId`),
  CONSTRAINT `saved_posts_user_fk` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `saved_posts_post_fk` FOREIGN KEY (`postId`) REFERENCES `posts` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
