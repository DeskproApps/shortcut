import { MarkdownString } from "../context/StoreProvider/types";

const getLinkedComment = (
    ticketId: string,
    ticketUrl?: string,
    type: "link"|"unlink" = "link",
): MarkdownString => {
    if (type === "link") {
        return `Linked to Deskpro ticket ${ticketId}${ticketUrl ? `, [${ticketUrl}](${ticketUrl}){:target="_blank"}` : ""}`;
    } else {
        return `Unlinked from Deskpro ticket ${ticketId}${ticketUrl ? `, [${ticketUrl}](${ticketUrl}){:target="_blank"}` : ""}`;
    }
};

export { getLinkedComment };
