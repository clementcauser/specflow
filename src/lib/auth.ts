import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { magicLink, organization } from "better-auth/plugins";
import { prisma } from "./prisma";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url }) => {
      if (process.env.NODE_ENV === "test") return;
      await resend.emails.send({
        from: "Specflow <onboarding@resend.dev>",
        to:
          process.env.NODE_ENV === "development"
            ? process.env.DEV_EMAIL_TO!
            : user.email,
        subject: "Réinitialisation de votre mot de passe",
        html: emailResetTemplate(url),
      });
    },
  },

  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      if (process.env.NODE_ENV === "test") return;
      await resend.emails.send({
        from: "Specflow <onboarding@resend.dev>",
        to:
          process.env.NODE_ENV === "development"
            ? process.env.DEV_EMAIL_TO!
            : user.email,
        subject: "Vérifiez votre adresse email",
        html: emailVerificationTemplate(url),
      });
    },
  },

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },

  plugins: [
    organization({
      tableName: "workspace",
      allowUserToCreateOrganization: true,
      schema: {
        organization: {
          modelName: "workspace",
        },
        member: {
          fields: {
            organizationId: "workspaceId",
          },
        },
        invitation: {
          fields: {
            organizationId: "workspaceId",
          },
        },
        session: {
          fields: {
            activeOrganizationId: "activeWorkspaceId",
          },
        },
      },
    }),
    magicLink({
      sendMagicLink: async ({ email, url }) => {
      if (process.env.NODE_ENV === "test") return;
      await resend.emails.send({
          from: "Specflow <onboarding@resend.dev>",
          to:
            process.env.NODE_ENV === "development"
              ? process.env.DEV_EMAIL_TO!
              : email,
          subject: "Votre lien de connexion",
          html: emailMagicLinkTemplate(url),
        });
      },
    }),
  ],

  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 jours
    updateAge: 60 * 60 * 24, // refresh si > 1j
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5, // cache 5min côté client
    },
  },
});

export type Session = typeof auth.$Infer.Session;

// --- Templates email minimalistes ---
function emailVerificationTemplate(url: string) {
  return `<div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px">
    <h2 style="font-size:20px;font-weight:600;margin-bottom:16px">Vérifiez votre email</h2>
    <p style="color:#555;margin-bottom:24px">Cliquez sur le bouton ci-dessous pour activer votre compte.</p>
    <a href="${url}" style="display:inline-block;background:#18181b;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:500">Vérifier mon email</a>
    <p style="color:#999;font-size:12px;margin-top:24px">Lien valable 24h. Si vous n'avez pas créé de compte, ignorez cet email.</p>
  </div>`;
}

function emailMagicLinkTemplate(url: string) {
  return `<div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px">
    <h2 style="font-size:20px;font-weight:600;margin-bottom:16px">Votre lien de connexion</h2>
    <p style="color:#555;margin-bottom:24px">Cliquez ci-dessous pour vous connecter instantanément.</p>
    <a href="${url}" style="display:inline-block;background:#18181b;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:500">Me connecter</a>
    <p style="color:#999;font-size:12px;margin-top:24px">Lien valable 10 minutes. Ne partagez pas cet email.</p>
  </div>`;
}

function emailResetTemplate(url: string) {
  return `<div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px">
    <h2 style="font-size:20px;font-weight:600;margin-bottom:16px">Réinitialiser le mot de passe</h2>
    <p style="color:#555;margin-bottom:24px">Vous avez demandé à réinitialiser votre mot de passe.</p>
    <a href="${url}" style="display:inline-block;background:#18181b;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:500">Réinitialiser</a>
    <p style="color:#999;font-size:12px;margin-top:24px">Lien valable 1h. Si vous n'avez pas fait cette demande, ignorez cet email.</p>
  </div>`;
}
