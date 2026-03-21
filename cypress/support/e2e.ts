import "./commands";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      login(email: string, password: string): Chainable<void>;
    }

    interface Tasks {
      // Utilisateurs
      verifyUser(email: string): null;
      deleteUser(email: string): null;

      // Workspaces
      seedWorkspace(params: {
        ownerEmail: string;
        name: string;
        slug: string;
        type?: string;
      }): string;
      getWorkspaceId(slug: string): string | null;
      deleteWorkspace(slug: string): null;

      // Membres
      seedMember(params: {
        workspaceSlug: string;
        memberEmail: string;
        role?: string;
      }): string;
      removeMember(params: {
        workspaceSlug: string;
        memberEmail: string;
      }): null;

      // Invitations
      getPendingInvitation(params: {
        workspaceSlug: string;
        email: string;
      }): { id: string; status: string } | null;
      deleteInvitation(params: {
        workspaceSlug: string;
        email: string;
      }): null;
    }
  }
}
