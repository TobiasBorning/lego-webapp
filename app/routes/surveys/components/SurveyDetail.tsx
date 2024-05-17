import {
  LinkButton,
  LoadingIndicator,
  Page,
  PageCover,
} from '@webkom/lego-bricks';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ContentSection, ContentMain } from 'app/components/Content';
import Time from 'app/components/Time';
import { useFetchedSurvey } from 'app/reducers/surveys';
import { displayNameForEventType } from 'app/routes/events/utils';
import { useAppSelector } from 'app/store/hooks';
import { guardLogin } from 'app/utils/replaceUnlessLoggedIn';
import { DetailNavigation } from '../utils';
import AdminSideBar from './AdminSideBar';
import StaticSubmission from './StaticSubmission';
import styles from './surveys.css';

type SurveyDetailPageParams = {
  surveyId: string;
};
const SurveyDetailPage = () => {
  const { surveyId } =
    useParams<SurveyDetailPageParams>() as SurveyDetailPageParams;
  const { survey, event } = useFetchedSurvey('surveyDetail', surveyId);
  const fetching = useAppSelector((state) => state.surveys.fetching);
  const actionGrant = survey?.actionGrant;

  const navigate = useNavigate();

  if (fetching || !event || !actionGrant) {
    return <LoadingIndicator loading />;
  }

  if (!actionGrant?.includes('edit')) {
    navigate(`/surveys/${surveyId}/answer`);
  }

  return (
    <Page
      cover={
        <PageCover
          image={survey.templateType ? undefined : event.cover}
          imagePlaceholder={
            survey.templateType ? undefined : event.coverPlaceholder
          }
        />
      }
      title={survey.title}
      back={{ href: '/surveys' }}
    >
      <Helmet title={survey.title} />
      <DetailNavigation surveyId={Number(survey.id)} />

      <ContentSection>
        <ContentMain>
          {survey.templateType ? (
            <h2
              style={{
                color: 'var(--lego-red-color)',
              }}
            >
              Dette er malen for arrangementer av type{' '}
              {displayNameForEventType(survey.templateType)}
            </h2>
          ) : (
            <div>
              <div className={styles.surveyTime}>
                Spørreundersøkelse for{' '}
                <Link to={`/events/${event.id}`}>{event.title}</Link>
              </div>

              <div className={styles.surveyTime}>
                Aktiv fra <Time time={survey.activeFrom} format="ll HH:mm" />
              </div>

              <LinkButton
                href={`/surveys/${survey.id}/answer`}
                style={{
                  marginTop: '30px',
                }}
              >
                Svar på undersøkelsen
              </LinkButton>
            </div>
          )}
          <StaticSubmission survey={survey} />
        </ContentMain>

        <AdminSideBar
          surveyId={survey.id}
          actionGrant={actionGrant}
          token={survey.token}
        />
      </ContentSection>
    </Page>
  );
};

export default guardLogin(SurveyDetailPage);
