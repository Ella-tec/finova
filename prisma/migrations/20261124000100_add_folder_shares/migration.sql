CREATE TABLE "FolderShare" (
  "id" TEXT NOT NULL,
  "folderId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "grantedById" TEXT NOT NULL,
  "canUpload" BOOLEAN NOT NULL DEFAULT false,
  "canDownload" BOOLEAN NOT NULL DEFAULT true,
  "canManage" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "FolderShare_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "FolderShare_folderId_userId_key" ON "FolderShare"("folderId", "userId");
CREATE INDEX "FolderShare_userId_folderId_idx" ON "FolderShare"("userId", "folderId");
ALTER TABLE "FolderShare" ADD CONSTRAINT "FolderShare_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "Folder"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "FolderShare" ADD CONSTRAINT "FolderShare_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "FolderShare" ADD CONSTRAINT "FolderShare_grantedById_fkey" FOREIGN KEY ("grantedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
