import { useRouteMatch, Route, Switch } from 'react-router-dom';
import { CompatRoute } from 'react-router-dom-v5-compat';
import RouteWrapper from 'app/components/RouteWrapper';
import { UserContext } from 'app/routes/app/AppRoute';
import PageNotFound from '../pageNotFound';
import StudentConfirmationRoute from './StudentConfirmationRoute';
import UserSettingsOAuth2CreateRoute from './UserSettingsOAuth2CreateRoute';
import UserSettingsOAuth2EditRoute from './UserSettingsOAuth2EditRoute';
import UserSettingsOAuth2Route from './UserSettingsOAuth2Route';
import UserSettingsRoute from './UserSettingsRoute';
import UserConfirmationForm from './components/UserConfirmation';
import UserProfile from './components/UserProfile';
import UserResetPasswordForm from './components/UserResetPassword';
import UserSettingsIndex from './components/UserSettingsIndex';
import UserSettingsNotifications from './components/UserSettingsNotifications';

const UsersRoute = () => {
  const { path } = useRouteMatch();

  return (
    <UserContext.Consumer>
      {({ currentUser, loggedIn }) => (
        <Switch>
          <Route
            exact
            path={`${path}/registration`}
            component={UserConfirmationForm}
          />
          <CompatRoute
            exact
            path={`${path}/reset-password`}
            component={UserResetPasswordForm}
          />
          <Route exact path={`${path}/:username`} component={UserProfile} />
          <Route path={`${path}/:username/settings`}>
            <UserSettingsIndex>
              <RouteWrapper
                exact
                path={`${path}/profile`}
                passedProps={{
                  currentUser,
                  loggedIn,
                }}
                Component={UserSettingsRoute}
              />
              <Route
                exact
                path={`${path}/notifications`}
                component={UserSettingsNotifications}
              />
              <RouteWrapper
                exact
                path={`${path}/oauth2`}
                passedProps={{
                  currentUser,
                  loggedIn,
                }}
                Component={UserSettingsOAuth2Route}
              />
              <RouteWrapper
                exact
                path={`${path}/oauth2/new`}
                passedProps={{
                  currentUser,
                  loggedIn,
                }}
                Component={UserSettingsOAuth2CreateRoute}
              />
              <RouteWrapper
                exact
                path={`${path}/oauth2/:applicationId(\\d+)`}
                passedProps={{
                  currentUser,
                  loggedIn,
                }}
                Component={UserSettingsOAuth2EditRoute}
              />
              <RouteWrapper
                exact
                path={`${path}/student-confirmation`}
                passedProps={{
                  currentUser,
                  loggedIn,
                }}
                Component={StudentConfirmationRoute}
              />
            </UserSettingsIndex>
          </Route>
          <Route component={PageNotFound} />
        </Switch>
      )}
    </UserContext.Consumer>
  );
};

export default function Users() {
  return <Route path="/users" component={UsersRoute} />;
}
