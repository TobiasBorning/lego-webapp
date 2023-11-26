import { configureStore } from '@reduxjs/toolkit';
import { createBrowserHistory, createMemoryHistory } from 'history';
import { createReduxHistoryContext } from 'redux-first-history';
import { addToast } from 'app/actions/ToastActions';
import createRootReducer from 'app/store/createRootReducer';
import loggerMiddleware from 'app/store/middleware/loggerMiddleware';
import createMessageMiddleware from 'app/store/middleware/messageMiddleware';
import promiseMiddleware from 'app/store/middleware/promiseMiddleware';
import createSentryMiddleware from 'app/store/middleware/sentryMiddleware';
import { isTruthy } from 'app/utils';
import type { RootState } from 'app/store/createRootReducer';
import type { GetCookie } from 'app/types';

const createStore = (
  initialState: RootState | Record<string, never> = {},
  {
    Sentry,
    getCookie,
  }: {
    Sentry?: any;
    getCookie: GetCookie;
  }
) => {
  const { createReduxHistory, routerMiddleware } = createReduxHistoryContext({
    history: __CLIENT__ ? createBrowserHistory() : createMemoryHistory(),
    reduxTravelling: __DEV__,
  });

  const store = configureStore({
    preloadedState: initialState,
    reducer: createRootReducer(),
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        thunk: {
          extraArgument: {
            getCookie,
          },
        },
        serializableCheck: {
          ignoreActions: true,
        },
      })
        .prepend(promiseMiddleware())
        .concat(
          [
            routerMiddleware,
            createMessageMiddleware(
              (message) =>
                addToast({
                  message,
                }),
              Sentry
            ),
            Sentry && createSentryMiddleware(Sentry),
            __CLIENT__ &&
              require('app/store/middleware/websocketMiddleware').default(),
            __CLIENT__ && __DEV__ && loggerMiddleware,
          ].filter(isTruthy)
        ),
  });

  const connectedHistory = createReduxHistory(store);

  if (module.hot) {
    module.hot.accept('app/store/createRootReducer', () => {
      const nextReducer = require('app/store/createRootReducer').default;

      store.replaceReducer(nextReducer());
    });
  }

  return { connectedHistory, store };
};

export default createStore;

export type StoreWithHistory = ReturnType<typeof createStore>;
export type Store = StoreWithHistory['store'];
export type AppDispatch = Store['dispatch'];
