/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `driver_applications` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "driver_applications_email_key" ON "driver_applications"("email");
