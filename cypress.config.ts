import "dotenv/config";
import { defineConfig } from "cypress";
import { PrismaClient } from "./src/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";

export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:3000",
    supportFile: "cypress/support/e2e.ts",
    specPattern: "cypress/e2e/**/*.cy.{js,jsx,ts,tsx}",
    viewportWidth: 1280,
    viewportHeight: 720,
    setupNodeEvents(on) {
      const prisma = new PrismaClient({
        adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
      });

      on("task", {
        // ─── Utilisateurs ────────────────────────────────────────────────

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
            for (const membership of user.memberships) {
              await prisma.workspace
                .delete({ where: { id: membership.workspaceId } })
                .catch(() => {});
            }
            await prisma.user.delete({ where: { id: user.id } });
          }
          await prisma.verification.deleteMany({
            where: { identifier: email },
          });
          return null;
        },

        // ─── Workspaces ───────────────────────────────────────────────────

        async seedWorkspace({
          ownerEmail,
          name,
          slug,
          type = "AGENCY",
        }: {
          ownerEmail: string;
          name: string;
          slug: string;
          type?: string;
        }) {
          const user = await prisma.user.findUnique({
            where: { email: ownerEmail },
          });
          if (!user) throw new Error(`Utilisateur ${ownerEmail} introuvable`);

          const workspace = await prisma.workspace.create({
            data: {
              name,
              slug,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              type: type as any,
              plan: "FREE",
              members: {
                create: { userId: user.id, role: "OWNER" },
              },
            },
          });
          return workspace.id;
        },

        async getWorkspaceId(slug: string) {
          const workspace = await prisma.workspace.findUnique({
            where: { slug },
          });
          return workspace?.id ?? null;
        },

        async deleteWorkspace(slug: string) {
          await prisma.workspace
            .delete({ where: { slug } })
            .catch(() => {});
          return null;
        },

        // ─── Membres ──────────────────────────────────────────────────────

        async seedMember({
          workspaceSlug,
          memberEmail,
          role = "MEMBER",
        }: {
          workspaceSlug: string;
          memberEmail: string;
          role?: string;
        }) {
          const [workspace, user] = await Promise.all([
            prisma.workspace.findUnique({ where: { slug: workspaceSlug } }),
            prisma.user.findUnique({ where: { email: memberEmail } }),
          ]);
          if (!workspace) throw new Error(`Workspace ${workspaceSlug} introuvable`);
          if (!user) throw new Error(`Utilisateur ${memberEmail} introuvable`);

          await prisma.member.upsert({
            where: {
              userId_workspaceId: {
                userId: user.id,
                workspaceId: workspace.id,
              },
            },
            create: {
              userId: user.id,
              workspaceId: workspace.id,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              role: role as any,
            },
            update: {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              role: role as any,
            },
          });
          return workspace.id;
        },

        async removeMember({
          workspaceSlug,
          memberEmail,
        }: {
          workspaceSlug: string;
          memberEmail: string;
        }) {
          const [workspace, user] = await Promise.all([
            prisma.workspace.findUnique({ where: { slug: workspaceSlug } }),
            prisma.user.findUnique({ where: { email: memberEmail } }),
          ]);
          if (!workspace || !user) return null;

          await prisma.member
            .delete({
              where: {
                userId_workspaceId: {
                  userId: user.id,
                  workspaceId: workspace.id,
                },
              },
            })
            .catch(() => {});
          return null;
        },

        // ─── Invitations ──────────────────────────────────────────────────

        async getPendingInvitation({
          workspaceSlug,
          email,
        }: {
          workspaceSlug: string;
          email: string;
        }) {
          const workspace = await prisma.workspace.findUnique({
            where: { slug: workspaceSlug },
          });
          if (!workspace) return null;

          const invitation = await prisma.invitation.findUnique({
            where: {
              workspaceId_email: {
                workspaceId: workspace.id,
                email,
              },
            },
          });
          return invitation ? { id: invitation.id, status: invitation.status } : null;
        },

        async deleteInvitation({
          workspaceSlug,
          email,
        }: {
          workspaceSlug: string;
          email: string;
        }) {
          const workspace = await prisma.workspace.findUnique({
            where: { slug: workspaceSlug },
          });
          if (!workspace) return null;

          await prisma.invitation
            .delete({
              where: {
                workspaceId_email: {
                  workspaceId: workspace.id,
                  email,
                },
              },
            })
            .catch(() => {});
          return null;
        },

        // ─── Specs ────────────────────────────────────────────────────────

        async seedSpec({
          workspaceSlug,
          ownerEmail,
          title,
          prompt,
          content,
        }: {
          workspaceSlug: string;
          ownerEmail: string;
          title: string;
          prompt?: string;
          content?: Record<string, string>;
        }) {
          const [workspace, user] = await Promise.all([
            prisma.workspace.findUnique({ where: { slug: workspaceSlug } }),
            prisma.user.findUnique({ where: { email: ownerEmail } }),
          ]);
          if (!workspace) throw new Error(`Workspace ${workspaceSlug} introuvable`);
          if (!user) throw new Error(`Utilisateur ${ownerEmail} introuvable`);

          const spec = await prisma.spec.create({
            data: {
              title,
              prompt: prompt ?? null,
              workspaceId: workspace.id,
              creatorId: user.id,
              status: "DONE",
              content: content ?? {},
            },
          });
          return spec.id;
        },

        async deleteSpec(specId: string) {
          await prisma.spec.delete({ where: { id: specId } }).catch(() => {});
          return null;
        },
      });
    },
  },
});
