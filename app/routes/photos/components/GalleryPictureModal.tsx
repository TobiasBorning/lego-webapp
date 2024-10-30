import { Flex, Icon, Modal, Image, LoadingPage } from '@webkom/lego-bricks';
import { usePreparedEffect } from '@webkom/react-prepare';
import throttle from 'lodash/throttle';
import { Download, Pencil } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useSwipeable, RIGHT, LEFT } from 'react-swipeable';
import { fetchGallery, updateGalleryCover } from 'app/actions/GalleryActions';
import {
  deletePicture,
  fetchGalleryPicture,
  fetchSiblingGallerPicture,
} from 'app/actions/GalleryPictureActions';
import CommentView from 'app/components/Comments/CommentView';
import Dropdown from 'app/components/Dropdown';
import ProgressiveImage from 'app/components/ProgressiveImage';
import PropertyHelmet, {
  type PropertyGenerator,
} from 'app/components/PropertyHelmet';
import config from 'app/config';
import { selectCommentsByIds } from 'app/reducers/comments';
import { selectGalleryById } from 'app/reducers/galleries';
import {
  selectGalleryPicturesByGalleryId,
  selectGalleryPictureById,
} from 'app/reducers/galleryPictures';
import { selectPaginationNext } from 'app/reducers/selectors';
import { useAppDispatch, useAppSelector } from 'app/store/hooks';
import { EntityType } from 'app/store/models/entities';
import { Keyboard } from 'app/utils/constants';
import GalleryDetailsRow from './GalleryDetailsRow';
import styles from './GalleryPictureModal.module.css';
import type { DetailedGallery } from 'app/store/models/Gallery';
import type { GalleryListPicture } from 'app/store/models/GalleryPicture';
import type { PublicUser } from 'app/store/models/User';
import type { ReactNode } from 'react';

const propertyGenerator: PropertyGenerator<{
  gallery: DetailedGallery;
  picture: GalleryListPicture;
}> = (props, config) => {
  if (!props.picture) return;
  const url = `${config?.webUrl}/photos/${props.gallery.id}/picture/${props.picture.id}/`;
  // Becuase the parent route sets the title and description
  // based on the metadata of the gallery, we don't have to do it
  // explicitly here.
  return [
    {
      property: 'og:url',
      content: url,
    },
    {
      property: 'og:image',
      content: props.picture.file,
    },
  ];
};

const OnKeyDownHandler = ({
  handler,
}: {
  handler: (arg0: KeyboardEvent) => void;
}) => {
  useEffect(() => {
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handler]);
  return null;
};

const Taggees = ({ taggees }: { taggees: PublicUser[] }) => {
  if (taggees.length === 1) {
    return (
      <span>
        <span>med </span>
        <Link key={taggees[0].id} to={`/users/${taggees[0].username}`}>
          {taggees[0].fullName}
        </Link>
      </span>
    );
  } else {
    return (
      <span>
        <span>med </span>
        {taggees.map((taggee, index) => (
          <span key={taggee.id}>
            {taggees.length === index + 1 ? (
              <span>
                <span>{'og '}</span>
                <Link to={`/users/${taggee.username}`}>{taggee.fullName}</Link>
              </span>
            ) : (
              <span
                style={{
                  marginRight: '5px',
                }}
              >
                <Link to={`/users/${taggee.username}`}>{taggee.fullName}</Link>
                {taggees.length === index + 2 ? null : <span>,</span>}
              </span>
            )}
          </span>
        ))}
      </span>
    );
  }
};

const Swipeable = (props: {
  onSwiping: (arg0: { dir: string }) => void;
  children: ReactNode;
}) => {
  const handlers = useSwipeable({
    onSwiped: (eventData) => props.onSwiping(eventData),
  });
  return <div {...handlers}>{props.children}</div>;
};

const GalleryPictureModal = () => {
  const { galleryId, pictureId } = useParams<{
    galleryId: string;
    pictureId: string;
  }>();
  const pictures = useAppSelector((state) =>
    selectGalleryPicturesByGalleryId(state, galleryId),
  );
  const picture = useAppSelector((state) =>
    selectGalleryPictureById(state, pictureId),
  );
  const comments = useAppSelector((state) =>
    selectCommentsByIds(state, picture?.comments),
  );
  const fetching = useAppSelector(
    (state) => state.galleries.fetching || state.galleryPictures.fetching,
  );
  const { pagination } = useAppSelector(
    selectPaginationNext({
      endpoint: `/galleries/${galleryId}/pictures/`,
      entity: EntityType.GalleryPictures,
      query: {},
    }),
  );
  const gallery = useAppSelector((state) =>
    selectGalleryById<DetailedGallery>(state, galleryId),
  );
  const actionGrant = gallery?.actionGrant || [];

  let isFirstImage = false;
  let isLastImage = false;
  if (pictures.length > 0 && pictureId) {
    if (Number(pictures[0].id) === Number(pictureId)) {
      isFirstImage = true;
    }

    if (
      Number(pictures[pictures.length - 1].id) === Number(pictureId) &&
      !pagination.hasMore
    ) {
      isLastImage = true;
    }
  }

  const [showMore, setShowMore] = useState(false);
  const [clickedDeletePicture, setClickedDeletePicture] = useState(0);
  const [hasNext, setHasNext] = useState(!isLastImage);
  const [hasPrevious, setHasPrevious] = useState(!isFirstImage);

  const dispatch = useAppDispatch();

  usePreparedEffect(
    'fetchGalleryPicture',
    () =>
      galleryId &&
      Promise.allSettled([
        dispatch(fetchGallery(galleryId)),
        pictureId && dispatch(fetchGalleryPicture(galleryId, pictureId)),
      ]),
    [],
  );

  const navigate = useNavigate();

  if (!gallery || !picture) {
    return <LoadingPage loading={fetching} />;
  }

  const toggleDropdown = () => {
    setShowMore(!showMore);
    setClickedDeletePicture(0);
  };

  const onUpdate = () => {
    navigate(`/photos/${gallery.id}/picture/${picture.id}/edit`);
  };

  const onUpdateGalleryCover = () => {
    dispatch(updateGalleryCover(gallery.id, picture.id));
    toggleDropdown();
  };

  const handleDelete = (currentClickedDeletePicture: number) => {
    if (clickedDeletePicture === currentClickedDeletePicture) {
      dispatch(deletePicture(gallery.id, picture.id)).then(() => {
        navigate(`/photos/${gallery.id}`);
      });
    } else {
      setClickedDeletePicture(currentClickedDeletePicture);
    }
  };

  const siblingGalleryPicture = (next: boolean) => {
    return dispatch(
      fetchSiblingGallerPicture(gallery.id, pictureId, next),
    ).then((result) => {
      setHasNext(!!result.payload.next);
      setHasPrevious(!!result.payload.previous);
      return (
        result.payload.result.length > 0 &&
        navigate(`/photos/${gallery.id}/picture/${result.payload.result[0]}`)
      );
    });
  };

  const previousGalleryPicture = throttle(
    () => siblingGalleryPicture(false),
    500,
    {
      trailing: false,
    },
  );

  const nextGalleryPicture = throttle(() => siblingGalleryPicture(true), 500, {
    trailing: false,
  });

  const handleKeyDown = (e: KeyboardEvent): void => {
    // Don't handle events inside the comment form... :smile:
    if (
      e.target instanceof Element &&
      e.target.className === 'notranslate public-DraftEditor-content'
    ) {
      return;
    }

    switch (e.key) {
      case Keyboard.LEFT:
        e.preventDefault();
        previousGalleryPicture();
        break;

      case Keyboard.RIGHT:
        e.preventDefault();
        nextGalleryPicture();
        break;

      default:
    }
  };

  const handleSwipe = ({ dir }: { dir: string }) => {
    dir === RIGHT && previousGalleryPicture();
    dir === LEFT && nextGalleryPicture();
  };

  return (
    <Modal
      onOpenChange={(open) => !open && navigate(`/photos/${gallery.id}`)}
      isDismissable={false} // Avoid closing the modal when pressing something from the dropdown
      isOpen
      contentClassName={styles.content}
    >
      <PropertyHelmet
        propertyGenerator={propertyGenerator}
        options={{ gallery, picture }}
      >
        <title>{`${gallery.title} (${picture.id})`}</title>
        <link
          rel="canonical"
          href={`${config?.webUrl}/photos/${gallery.id}/picture/${picture.id}`}
        />
      </PropertyHelmet>

      <Swipeable onSwiping={handleSwipe}>
        <OnKeyDownHandler handler={handleKeyDown} />
        <Flex column gap="var(--spacing-md)">
          <Flex width="100%" justifyContent="space-between" alignItems="center">
            <Flex justifyContent="space-between" gap="var(--spacing-md)">
              <Image
                className={styles.galleryThumbnail}
                alt="Forsidebilde til album"
                src={gallery.cover?.thumbnail ?? ''}
              />

              <Flex column justifyContent="space-around">
                <Link to={`/photos/${gallery.id}`}>{gallery.title}</Link>
                <GalleryDetailsRow small gallery={gallery} />
              </Flex>
            </Flex>

            <Dropdown
              show={showMore}
              toggle={toggleDropdown}
              closeOnContentClick
              className={styles.dropdown}
              iconName="ellipsis-horizontal"
            >
              <Dropdown.List>
                <Dropdown.ListItem>
                  <a
                    href={picture.rawFile}
                    download
                    onClick={toggleDropdown}
                    className={styles.dropdownLink}
                  >
                    Last ned
                    <Icon iconNode={<Download />} size={24} />
                  </a>
                </Dropdown.ListItem>
                {actionGrant &&
                  actionGrant.includes('edit') && [
                    <Dropdown.ListItem key="edit">
                      <Link
                        to="#"
                        onClick={onUpdate}
                        className={styles.dropdownLink}
                      >
                        Rediger
                        <Icon iconNode={<Pencil />} size={24} />
                      </Link>
                    </Dropdown.ListItem>,
                    <Dropdown.ListItem key="cover">
                      <Link
                        onClick={onUpdateGalleryCover}
                        to="#"
                        className={styles.dropdownLink}
                      >
                        Sett som album cover
                        <Icon name="image-outline" size={24} />
                      </Link>
                    </Dropdown.ListItem>,
                    <Dropdown.Divider key="divider" />,
                    <Dropdown.ListItem
                      key="delete"
                      danger
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                    >
                      <button onClick={() => handleDelete(Number(pictureId))}>
                        {clickedDeletePicture === Number(pictureId)
                          ? 'Er du sikker?'
                          : 'Slett'}
                        <Icon name="trash-outline" />
                      </button>
                    </Dropdown.ListItem>,
                  ]}
              </Dropdown.List>
            </Dropdown>
          </Flex>

          <Flex className={styles.pictureContainer}>
            <ProgressiveImage
              key={picture.id}
              src={picture.file}
              alt={picture.description}
            />
          </Flex>

          {(picture.description || picture.taggees.length > 0) && (
            <span className={styles.pictureDescription}>
              {picture.description}
              {picture.taggees.length > 0 && (
                <Taggees taggees={picture.taggees} />
              )}
            </span>
          )}

          <Flex justifyContent="center" gap="var(--spacing-lg)">
            {hasPrevious && (
              <Icon
                onPress={previousGalleryPicture}
                name="arrow-back-outline"
                size={40}
              />
            )}
            {hasNext && (
              <Icon
                onPress={nextGalleryPicture}
                name="arrow-forward-outline"
                size={40}
              />
            )}
          </Flex>
          {picture.contentTarget && (
            <CommentView
              contentTarget={picture.contentTarget}
              comments={comments}
            />
          )}
        </Flex>
      </Swipeable>
    </Modal>
  );
};

export default GalleryPictureModal;
