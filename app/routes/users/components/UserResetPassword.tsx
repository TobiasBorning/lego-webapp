import { Card, Page } from '@webkom/lego-bricks';
import qs from 'qs';
import { Field } from 'react-final-form';
import { useLocation, useNavigate } from 'react-router-dom';
import { resetPassword } from 'app/actions/UserActions';
import { TextInput } from 'app/components/Form';
import LegoFinalForm from 'app/components/Form/LegoFinalForm';
import { SubmitButton } from 'app/components/Form/SubmitButton';
import { useCurrentUser } from 'app/reducers/auth';
import { useAppDispatch } from 'app/store/hooks';
import { createValidator, required, sameAs } from 'app/utils/validation';
import { validPassword } from '../utils';
import PasswordField from './PasswordField';

const UserResetPasswordForm = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { search } = useLocation();
  const { token } = qs.parse(search, {
    ignoreQueryPrefix: true,
  });

  const onSubmit = (props) =>
    dispatch(
      resetPassword({
        token,
        ...props,
      }),
    ).then(() => {
      navigate('/');
    });

  const currentUser = useCurrentUser();
  const user = currentUser && {
    username: currentUser.username,
    firstName: currentUser.firstName,
    lastName: currentUser.lastName,
  };

  return (
    <Page title="Tilbakestill passord">
      {token ? (
        <LegoFinalForm onSubmit={onSubmit} validate={validate}>
          {({ handleSubmit }) => (
            <form onSubmit={handleSubmit}>
              <PasswordField label="Nytt passord" user={user} />
              <Field
                label="Gjenta nytt passord"
                autocomplete="new-password"
                name="retypeNewPassword"
                type="password"
                component={TextInput.Field}
              />

              <SubmitButton danger>Tilbakestill passord</SubmitButton>
            </form>
          )}
        </LegoFinalForm>
      ) : (
        <Card severity="danger">
          <Card.Header>Ingen token ...</Card.Header>
        </Card>
      )}
    </Page>
  );
};

const validate = createValidator(
  {
    password: [required(), validPassword()],
    retypeNewPassword: [
      required(),
      sameAs('password', 'Passordene er ikke like'),
    ],
  },
  undefined,
  true,
);

export default UserResetPasswordForm;
