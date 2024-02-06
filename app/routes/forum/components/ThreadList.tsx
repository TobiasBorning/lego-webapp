import { Flex, LoadingIndicator } from '@webkom/lego-bricks';
import { usePreparedEffect } from '@webkom/react-prepare';
import { fetchThread } from 'app/actions/ForumActions';
import { Content, ContentMain } from 'app/components/Content';
import { selectThreadsByForumId } from 'app/reducers/threads';
import { useAppDispatch, useAppSelector } from 'app/store/hooks';
import ThreadListEntry from './ThreadListEntry';
import type { ID } from 'app/store/models';
import type { PublicThread } from 'app/store/models/Forum';

const ThreadList = ({
  forumId,
  threadIds,
}: {
  forumId: ID;
  threadIds: ID[];
}) => {
  const dispatch = useAppDispatch();

  usePreparedEffect(
    'fetchAllThreadsByForum',
    () =>
      threadIds?.forEach((threadId) => {
        dispatch(fetchThread(threadId));
      }),
    []
  );

  const threads = useAppSelector(selectThreadsByForumId(parseInt(forumId)));

  const fetching = useAppSelector((state) => state.threads.fetching);

  return (
    <LoadingIndicator loading={fetching}>
      <Content>
        <ContentMain>
          <h1>Tråder 🧶</h1>
          <Flex column>
            {threads?.map((t: PublicThread) => (
              <ThreadListEntry thread={t} className={''} key={t.id} />
            ))}
          </Flex>
        </ContentMain>
      </Content>
    </LoadingIndicator>
  );
};

export default ThreadList;
