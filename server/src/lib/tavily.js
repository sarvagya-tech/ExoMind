import { tavily } from "@tavily/core";

let client = null;

/**
 * Runs a web search query via Tavily for the chat `web_search` tool.
 *
 * @param {string} query - Natural-language search query from the model
 * @returns {Promise<Object>} Normalized search response with up to 5 results and optional answer summary
 * @throws {Error} When `TAVILY_API_KEY` is not configured
 */
export async function searchWeb(query) {
    const apiKey = process.env.TAVILY_API_KEY?.trim();

    if (!apiKey) {
        throw new Error("TAVILY_API_KEY is not configured");
    }

    if (!client) {
        client = tavily({ apiKey });
    }

    const response = await client.search(query, {
        searchDepth: "basic",
        maxResults: 5,
        includeAnswer: true,
    });

    return {
        query,
        answer:
            typeof response.answer === "string" ? response.answer : undefined,
        results: (response.results ?? []).map((result) => ({
            title: result.title ?? result.url ?? "Untitled",
            url: result.url ?? "",
            content: result.content ?? "",
            score: result.score,
        })),
    };
}

/**
 * Formats Tavily results into a prompt block for the chat model.
 *
 * Results are labeled `[W1]`, `[W2]`, etc. for inline citation in assistant replies.
 *
 * @param {Object} response - Normalized Tavily search response
 * @returns {string} Multi-line string injected into the tool result
 */
export function formatTavilyResultsForPrompt(
    response,
) {
    if (response.results.length === 0) {
        return "No web results were found.";
    }

    const blocks = response.results.map(
        (result, index) =>
            `[W${index + 1}] ${result.title} (${result.url})\n${result.content}`,
    );

    const parts = ["Web search results:"];

    if (response.answer) {
        parts.push(`Summary: ${response.answer}`);
    }

    parts.push(blocks.join("\n\n"));

    return parts.join("\n\n");
}
