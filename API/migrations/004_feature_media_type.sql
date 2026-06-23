USE defaultdb;
ALTER TABLE `feature_items`
  ADD COLUMN `mediaType` varchar(20) NOT NULL DEFAULT 'image';
