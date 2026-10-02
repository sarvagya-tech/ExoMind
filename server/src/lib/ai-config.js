/** Default chat model when the client or workspace does not specify one. */
export const CHAT_MODEL = "gemini-3.8-flash";

/** Allowed chat models exposed to the client and workspace settings. */
export const CHAT_MODELS = [
    "gemini-3.8-flash",
    "gemini-flash-latest",
    "gemini-pro-latest",
    "gpt-4o-mini",
    "gpt-4o",
];


/** OpenAI / Gemini embedding model used for RAG vector indexing and query embedding. */
export const EMBEDDING_MODEL = "text-embedding-004";

/** Vector dimension count — matches user's Pinecone index configuration. */
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