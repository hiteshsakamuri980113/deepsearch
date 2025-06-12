import { configureStore } from "@reduxjs/toolkit";
import playlistReducer from "../state/playlistSlice";
import userReducer from "../state/userSlice";

export const store = configureStore({
  reducer: {
    playlists: playlistReducer,
    user: userReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
