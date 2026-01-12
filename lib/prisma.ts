/**
 * Prisma Stub
 *
 * This is a stub file that provides a Prisma-like interface.
 * The project has been migrated to Supabase, so these functions
 * return empty/null results. Full functionality requires migration
 * of the learning-engine, prediction-engine, and attention-decay
 * modules to use Supabase directly.
 */

// Create a stub that mimics Prisma's API but returns null/empty results
const createStubModel = () => ({
  findUnique: async () => null,
  findFirst: async () => null,
  findMany: async () => [],
  create: async () => ({}),
  update: async () => ({}),
  upsert: async () => ({}),
  delete: async () => ({}),
  deleteMany: async () => ({ count: 0 }),
  count: async () => 0,
})

export const prisma: any = {
  // User learning
  userLearning: createStubModel(),
  learningSignal: createStubModel(),

  // Predictions
  prediction: createStubModel(),

  // Replies and outcomes
  reply: createStubModel(),
  outcome: createStubModel(),

  // Attention decay
  attentionDecay: createStubModel(),
  engagementSnapshot: createStubModel(),

  // Other models
  user: createStubModel(),
  alert: createStubModel(),
  candidateTweet: createStubModel(),
  score: createStubModel(),
  target: createStubModel(),
  smartAlert: createStubModel(),
  userPreferences: createStubModel(),

  // Transaction support (stub)
  $transaction: async <T>(fn: (tx: typeof prisma) => Promise<T>): Promise<T> => {
    return fn(prisma)
  },

  // Connection methods (no-op)
  $connect: async () => {},
  $disconnect: async () => {},
}

export default prisma
