const getLinkedComment = (
    ticketId: string,
    ticketUrl?: string,
    type: "link"|"unlink" = "link",
): string => {
    if (type === "link") {
        return `Linked to Deskpro ticket ${ticketId}${ticketUrl ? `, ${ticketUrl}` : ""}`;
    } else {
        return `Unlinked from Deskpro ticket ${ticketId}${ticketUrl ? `, ${ticketUrl}` : ""}`;
    }
};

export { getLinkedComment };
