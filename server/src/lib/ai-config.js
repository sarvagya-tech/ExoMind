/** Default chat model when the client or workspace does not specify one. */
export const CHAT_MODEL =
    process.env.GEMINI_API_KEY && !process.env.OPENAI_API_KEY
        ? "gemini-2.0-flash"
        : "gpt-4o-mini";

/** Allowed chat models exposed to the client and workspace settings. */
export const CHAT_MODELS = [
    "gemini-2.0-flash",
    "gemini-1.5-pro",
    "gemini-1.5-flash",
    "gpt-4o-mini",
    "gpt-4o",
    "claude-3-5-sonnet",
];

/** Embedding model used for RAG vector indexing and query embedding. */
export const EMBEDDING_MODEL =
    process.env.GEMINI_API_KEY && !process.env.OPENAI_API_KEY
        ? "text-embedding-004"
        : "text-embedding-3-small";

/** Vector dimension count — matches your Pinecone index configuration (1024). */
export const EMBEDDING_DIMENSIONS = 1024;

/** Target max characters per text chunk during source processing. */
export const CHUNK_SIZE = 1000;

/** Character overlap between consecutive chunks at split boundaries. */
export const CHUNK_OVERLAP = 100;

/** Number of Pinecone chunks to retrieve per chat query. */
export const RAG_TOP_K = 6;

/** Minimum cosine similarity score for a retrieved chunk to be included in context. */
export const RAG_MIN_SCORE = 0.35;

/** Enqueue a conversation summary job every N persisted messages. */
export const CONVERSATION_SUMMARY_INTERVAL = 8;

/** Max recent UI messages sent to the model when a rolling summary exists. */
export const RECENT_MESSAGE_WINDOW = 12;