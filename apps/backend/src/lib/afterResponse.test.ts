import assert from "node:assert/strict";
import test from "node:test";
import { afterResponse } from "./afterResponse.js";
import { deliverAccountCreated } from "../services/accountWelcome.js";

const previous = {
  vercel: process.env.VERCEL,
  vercelEnv: process.env.VERCEL_ENV,
};

function restoreEnv(): void {
  if (previous.vercel === undefined) {
    delete process.env.VERCEL;
  } else {
    process.env.VERCEL = previous.vercel;
  }
  if (previous.vercelEnv === undefined) {
    delete process.env.VERCEL_ENV;
  } else {
    process.env.VERCEL_ENV = previous.vercelEnv;
  }
}

test("a local process finishes the welcome chain without waitUntil", async () => {
  delete process.env.VERCEL;
  delete process.env.VERCEL_ENV;
  const held: Promise<unknown>[] = [];
  const calls: string[] = [];
  const task = deliverAccountCreated(
    {
      id: "user_1",
      email: "person@example.com",
      firstName: "Ada",
      lastName: "Lovelace",
      createdAtSeconds: 1_700_000_000,
      freeCredits: 100,
    },
    {
      identify: async () => {
        calls.push("identify");
      },
      track: async (_userId, name) => {
        calls.push(name);
      },
      sendTransactional: async (opts) => {
        calls.push(opts.template);
      },
    }
  );
  afterResponse(task, (promise) => {
    held.push(promise);
  });
  assert.equal(held.length, 0);
  await task;
  assert.deepEqual(calls, ["identify", "account_created", "T01_welcome"]);
  restoreEnv();
});

test("vercel holds the same promise that sends the welcome email", async () => {
  process.env.VERCEL = "1";
  delete process.env.VERCEL_ENV;
  const held: Promise<unknown>[] = [];
  const calls: string[] = [];
  const task = deliverAccountCreated(
    {
      id: "user_1",
      email: "person@example.com",
      firstName: null,
      lastName: null,
      createdAtSeconds: 1_700_000_000,
      freeCredits: 100,
    },
    {
      identify: async () => {
        calls.push("identify");
      },
      track: async () => {
        calls.push("track");
      },
      sendTransactional: async () => {
        calls.push("send");
      },
    }
  );
  afterResponse(task, (promise) => {
    held.push(promise);
  });
  assert.equal(held.length, 1);
  assert.equal(held[0], task);
  assert.deepEqual(calls, ["identify"]);
  await held[0];
  assert.deepEqual(calls, ["identify", "track", "send"]);
  restoreEnv();
});

test("a signup with no email still records the account and does not send", async () => {
  delete process.env.VERCEL;
  delete process.env.VERCEL_ENV;
  const calls: string[] = [];
  await deliverAccountCreated(
    {
      id: "user_2",
      email: null,
      firstName: null,
      lastName: null,
      createdAtSeconds: undefined,
      freeCredits: 100,
    },
    {
      identify: async () => {
        calls.push("identify");
      },
      track: async () => {
        calls.push("track");
      },
      sendTransactional: async () => {
        calls.push("send");
      },
    }
  );
  assert.deepEqual(calls, ["identify", "track"]);
  restoreEnv();
});
