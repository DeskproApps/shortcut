import { createContext, FC, ReactNode } from "react";
import { State, Dispatch } from "./types";
import { reducer, initialState } from "./reducer";
import { useStoreReducer } from "./hooks";
import { useDeskproAppClient, LoadingSpinner } from "@deskpro/app-sdk";

export const StoreContext = createContext<[State, Dispatch]>([initialState, () => {}]);

export interface StoreProviderProps {
  children: ReactNode | JSX.Element;
}

export const StoreProvider: FC<StoreProviderProps> = ({ children }: StoreProviderProps) => {
  const { client } = useDeskproAppClient();

  const [state, dispatch] = useStoreReducer(reducer, initialState);

  if (client === null) {
    return (<LoadingSpinner />);
  }

  return (
    <StoreContext.Provider value={[state, dispatch]}>
      {children}
    </StoreContext.Provider>
  );
};
