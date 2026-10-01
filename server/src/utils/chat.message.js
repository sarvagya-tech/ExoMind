export function getTextFromUIMessage(message) {
    if (!message) return "";
    if (typeof message.content === "string") return message.content;
    if (Array.isArray(message.parts)) {
        return message.parts
            .filter((part) => part.type === "text")
            .map((part) => part.text)
            .join("");
    }
    return "";
}

export function getLastUserMessageText(messages) {
    if (!Array.isArray(messages)) return null;
    for (let index = messages.length - 1; index >= 0; index -= 1) {
        const message = messages[index];
        if (message.role === "user" || message.role === "USER") {
            const text = getTextFromUIMessage(message).trim();
            if (text) {
                return text;
            }
        }
    }

    return null;
}

export function buildConversationTitle(text) {
    if (!text) return "New chat";
    const normalized = text.replace(/\s+/g, " ").trim();
    if (!normalized) {
        return "New chat";
    }

    return normalized.length > 72
        ? `${normalized.slice(0, 72).trim()}…`
        : normalized;
}

export function formatModelMessages(messages) {
    if (!Array.isArray(messages)) return [];
    return messages
        .filter((m) => m && (m.content || m.text || (Array.isArray(m.parts) && m.parts.length > 0)))
        .map((m) => {
            const role = m.role?.toLowerCase() === "assistant" ? "assistant" : "user";
            let content = "";
            if (typeof m.content === "string") {
                content = m.content;
            } else if (typeof m.text === "string") {
                content = m.text;
            } else if (Array.isArray(m.parts)) {
                content = m.parts
                    .filter((p) => p.type === "text" && typeof p.text === "string")
                    .map((p) => p.text)
                    .join("\n");
            } else if (m.content && typeof m.content === "object") {
                content = JSON.stringify(m.content);
            }
            return {
                role,
                content: content.trim(),
            };
        })
        .filter((m) => m.content.length > 0);
}
