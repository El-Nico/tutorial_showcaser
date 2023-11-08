import { configureStore } from "@reduxjs/toolkit";
import {
  showcasesSlice,
  initializeShowcases,
} from "./features/showcases/showcasesSlice";
import { applicationStateSlice } from "./features/application_state/application_state_slice";
import {
  setShowcasesMiddleware,
  setSelectedShowcaseMiddleware,
  setSelectedSubchannelMiddleware,
  setSubchannelsMiddleware,
} from "./features/showcases/showcasesMiddlewares";

export const store = configureStore({
  reducer: {
    applicationState: applicationStateSlice.reducer,
    showcases: showcasesSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().prepend(
      setShowcasesMiddleware.middleware,
      setSelectedShowcaseMiddleware.middleware,
      setSubchannelsMiddleware.middleware,
      setSelectedSubchannelMiddleware.middleware
    ),
});

store.dispatch(initializeShowcases());
