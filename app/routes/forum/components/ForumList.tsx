import { Flex, LoadingIndicator } from '@webkom/lego-bricks';
import { usePreparedEffect } from '@webkom/react-prepare';
import { fetchForums } from 'app/actions/ForumActions';
import { Content, ContentMain } from 'app/components/Content';
import { NavigationLink } from 'app/components/NavigationTab';
import { Tag } from 'app/components/Tags';
import { selectAllForums } from 'app/reducers/forums';
import { useAppDispatch, useAppSelector } from 'app/store/hooks';
import ForumListEntry from './ForumListEntry';
import type { PublicForum } from 'app/store/models/Forum';

const ForumList = () => {
  const dispatch = useAppDispatch();

  usePreparedEffect('fetchAllForums', () => dispatch(fetchForums()), []);

  const forums: PublicForum[] = useAppSelector(selectAllForums);
  const fetching = useAppSelector((state) => state.forums.fetching);
  const actionGrant = useAppSelector((state) => state.forums.actionGrant);

  return (
    <Content>
      <ContentMain>
        <Flex alignItems="center" gap="var(--spacing-sm)">
          <h1>Forum</h1>
          <Tag tag="Beta" color="purple" />
        </Flex>
        {actionGrant.includes('create') && (
          <NavigationLink to="/forum/new">Nytt forum</NavigationLink>
        )}
        <Flex column>
          {forums?.map((f: PublicForum) => (
            <ForumListEntry forum={f} key={f.id} />
          ))}
        </Flex>
        <LoadingIndicator loading={fetching} />
      </ContentMain>
    </Content>
  );
};

export default ForumList;
