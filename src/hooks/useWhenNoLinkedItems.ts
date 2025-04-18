import { useNavigate } from "react-router-dom";
import {
  useDeskproLatestAppContext,
  useInitialisedDeskproAppClient,
} from "@deskpro/app-sdk";

const useWhenNoLinkedItems = () => {
  const { context } = useDeskproLatestAppContext<{ ticket: { id: number } }, unknown>();
  const navigate = useNavigate();

  const ticketId = context?.data?.ticket.id;

  useInitialisedDeskproAppClient((client) => {
    if (!ticketId) {
      return;
    }

    client
      .getEntityAssociation("linkedShortcutStories", String(ticketId))
      .list()
      .then((items) => navigate(!items.length ? "/link" : "/home"));
  }, [context?.data?.ticket.id, navigate]);
};

export { useWhenNoLinkedItems };
