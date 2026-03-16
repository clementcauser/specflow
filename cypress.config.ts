import "dotenv/config";
import { defineConfig } from "cypress";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:3000",
    supportFile: "cypress/support/e2e.ts",
    specPattern: "cypress/e2e/**/*.cy.{js,jsx,ts,tsx}",
    viewportWidth: 1280,
    viewportHeight: 720,
    setupNodeEvents(on) {
      const prisma = new PrismaClient({
        adapter: new PrismaPg(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          new Pool({ connectionString: process.env.DATABASE_URL }) as any,
        ),
      });

      on("task", {
        async verifyUser(email: string) {
          await prisma.user.update({
            where: { email },
            data: { emailVerified: true },
          });
          return null;
        },
        async deleteUser(email: string) {
          const user = await prisma.user.findUnique({
            where: { email },
            include: { memberships: true },
          });
          if (user) {
            // Delete organizations where this user was a member
            for (const membership of user.memberships) {
              await prisma.organization.delete({
                where: { id: membership.organizationId },
              });
            }
            // Finally delete the user ( cascade will handle sessions, accounts, memberships )
            await prisma.user.delete({
              where: { id: user.id },
            });
          }
          // Clean up any pending verifications for this email
          await prisma.verification.deleteMany({
            where: { identifier: email },
          });
          return null;
        },
      });
    },
  },
});
