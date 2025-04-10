-- Step 1: Drop the existing foreign key constraint first
ALTER TABLE `Job` DROP FOREIGN KEY `Job_userId_fkey`;

-- Step 2: Rename the column (keeping it nullable temporarily)
ALTER TABLE `Job` CHANGE COLUMN `userId` `createdById` INTEGER;

-- Step 3: Backfill NULL values with a default user ID
-- Replace 1 with your actual admin user ID
UPDATE `Job` SET `createdById` = 1 WHERE `createdById` IS NULL;

-- Step 4: Now make the column NOT NULL
ALTER TABLE `Job` MODIFY COLUMN `createdById` INTEGER NOT NULL;

-- Step 5: Create the many-to-many relationship table
CREATE TABLE `_SavedJobs` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,
    UNIQUE INDEX `_SavedJobs_AB_unique`(`A`, `B`),
    INDEX `_SavedJobs_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Step 6: Add the new foreign key constraint
ALTER TABLE `Job` ADD CONSTRAINT `Job_createdById_fkey` 
    FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- Step 7: Add join table foreign keys
ALTER TABLE `_SavedJobs` ADD CONSTRAINT `_SavedJobs_A_fkey` 
    FOREIGN KEY (`A`) REFERENCES `Job`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `_SavedJobs` ADD CONSTRAINT `_SavedJobs_B_fkey` 
    FOREIGN KEY (`B`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;