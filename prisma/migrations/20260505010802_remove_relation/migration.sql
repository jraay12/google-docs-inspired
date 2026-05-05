-- DropForeignKey
ALTER TABLE `Document` DROP FOREIGN KEY `Document_ownerId_fkey`;

-- DropIndex
DROP INDEX `Document_ownerId_fkey` ON `Document`;
