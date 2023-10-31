import { configureStore, nanoid } from "@reduxjs/toolkit";
import {
  initializeShowcases,
  setSelectedShowcaseMiddleware,
  setSelectedSubchannelMiddleware,
  setSubchannelsMiddleware,
  showcasesSlice,
} from "./features/showcases/showcasesSlice";
import { applicationStateSlice } from "./features/application_state/application_state_slice";

export const store = configureStore({
  reducer: {
    applicationState: applicationStateSlice.reducer,
    showcases: showcasesSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().prepend(
      setSelectedShowcaseMiddleware.middleware,
      setSubchannelsMiddleware.middleware,
      setSelectedSubchannelMiddleware.middleware
    ),
});

store.dispatch(initializeShowcases());
