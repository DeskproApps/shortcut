import { FC, useState, useEffect } from "react";
import styled from "styled-components";
import { faPlus, faUser } from "@fortawesome/free-solid-svg-icons";
import ReactTimeAgo from "react-time-ago";
import { Avatar, P1, P11, Stack, Button, H2 } from "@deskpro/deskpro-ui";
import { DeskproAppTheme, useQueryWithClient } from "@deskpro/app-sdk";
import { Comment as CommentType } from "../../context/StoreProvider/types";
import { getMemberById } from "../../context/StoreProvider/api";
import isEmpty from "lodash.isempty";

type Props = {
  onAddComment: () => void;
  comments: CommentType[];
};

const Author = styled(Stack)`
  width: 35px;
`;

const Comment = styled(P1)`
  width: calc(100% - 35px);

  p {
    white-space: pre-wrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  img {
    width: 100%;
    height: auto;
  }

  a {
    :hover {
      color: ${({ theme }) => theme.colors.cyan100};
    }

    color: ${({ theme }) => theme.colors.cyan100};
  }
`;

const TimeAgo = styled(ReactTimeAgo)<DeskproAppTheme>`
  color: ${({ theme }) => theme.colors.grey80};
`;

const sortByUpdated = (comments: CommentType[]) =>
  comments.sort(function (a, b) {
    if (a.updated_at < b.updated_at) {
      return 1;
    }
    if (a.updated_at > b.updated_at) {
      return -1;
    }
    return 0;
  });

const Comments: FC<Props> = ({ onAddComment, comments }) => {
  const [count, setCount] = useState(0);

  const isEmptyBool = isEmpty(comments);

  const membersQuery = useQueryWithClient(
    ["members", ...comments.map((e) => e.id.toString())],
    (client) => {
      return Promise.all(
        comments.map((comment) => getMemberById(client, comment.author_id))
      );
    },
    { enabled: !isEmptyBool }
  );

  const members = membersQuery.data;

  useEffect(() => {
    if (Array.isArray(comments)) {
      setCount(comments.length);
    } else {
      setCount(0);
    }
  }, [comments]);

  return (
    <Stack vertical padding={12}>
      <H2
        style={{ fontWeight: 500 }}
      >
        Comments ({count}) &nbsp;
        <Button
          icon={faPlus}
          minimal
          noMinimalUnderline
          onClick={onAddComment}
        />
      </H2>

      {sortByUpdated(comments).map(
        ({ id, updated_at, author_id, textHtml }) => (
          <Stack key={id} wrap="nowrap" gap={6} style={{ marginBottom: 10 }}>
            <Author vertical style={{ marginTop: 15 }}>
              <Avatar
                size={18}
                name={
                  members?.find((e) => e.id === author_id)?.profile.name ?? ""
                }
                backupIcon={faUser}
              />
              <P11>
                <TimeAgo date={new Date(updated_at)} timeStyle="mini" />
              </P11>
            </Author>
            <Comment dangerouslySetInnerHTML={{ __html: textHtml }} />
          </Stack>
        )
      )}
    </Stack>
  );
};

export { Comments };
