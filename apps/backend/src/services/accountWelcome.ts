type Attributes = Record<string, string | number | boolean | null | undefined>;

export type WelcomeUser = {
  id: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  createdAtSeconds: number | undefined;
  freeCredits: number;
};

export type WelcomeDeps = {
  identify: (userId: string, attributes: Attributes) => Promise<void>;
  track: (userId: string, name: string, data?: Attributes) => Promise<void>;
  sendTransactional: (opts: {
    template: string;
    to: string;
    identifiers: { id: string };
    sender: "hi";
  }) => Promise<unknown>;
};

/**
 * Profile, then the account_created event, then T01. One promise so the host can
 * hold the whole chain open after the webhook responds.
 */
export async function deliverAccountCreated(user: WelcomeUser, deps: WelcomeDeps): Promise<void> {
  await deps.identify(user.id, {
    email: user.email,
    first_name: user.firstName,
    last_name: user.lastName,
    created_at: user.createdAtSeconds,
    plan: "free",
    plan_status: "free",
    credits_remaining: user.freeCredits,
  });
  await deps.track(user.id, "account_created");
  if (!user.email) {
    return;
  }
  await deps.sendTransactional({
    template: "T01_welcome",
    to: user.email,
    identifiers: { id: user.id },
    sender: "hi",
  });
}
