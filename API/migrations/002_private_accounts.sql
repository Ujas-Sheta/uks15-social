USE defaultdb;
ALTER TABLE `users`
  ADD COLUMN `isPrivate` tinyint(1) NOT NULL DEFAULT 0;
