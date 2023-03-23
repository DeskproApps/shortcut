import { __, match } from "ts-pattern";
import { State, Action, StoreReducer, TicketContext } from "./types";

export const initialState: State = {
  _error: undefined,
};

export const reducer: StoreReducer = (state: State, action: Action): State => {
  return match<[State, Action]>([state, action])
    .with([__, { type: "changePage" }],  ([prevState, action]) => ({
      ...prevState,
      page: action.page,
      pageParams: action.params,
    }))
    .with([__, { type: "loadContext" }],  ([prevState, action]) => ({
      ...prevState,
      context: action.context as TicketContext,
    }))
    .with([__, { type: "linkStorySearchListLoading" }],  ([prevState]) => ({
      ...prevState,
      linkStorySearchResults: {
        loading: true,
        list: [],
      },
    }))
    .with([__, { type: "linkStorySearchList" }],  ([prevState, action]) => ({
      ...prevState,
      linkStorySearchResults: {
        loading: false,
        list: action.list,
      },
    }))
    .with([__, { type: "linkStorySearchListReset" }],  ([prevState]) => ({
      ...prevState,
      linkStorySearchResults: {
        loading: false,
        list: [],
      },
    }))
    .with([__, { type: "linkedStoriesListLoading" }],  ([prevState]) => ({
      ...prevState,
      linkedStoriesResults: {
        list: [],
        loading: true,
      },
    }))
    .with([__, { type: "linkedStoriesList" }],  ([prevState, action]) => ({
      ...prevState,
      linkedStoriesResults: {
        list: action.list,
        loading: false,
      },
    }))
    .with([__, { type: "loadDataDependencies" }],  ([prevState, action]) => ({
      ...prevState,
      dataDependencies: action.deps,
    }))
    //
    .with([__, { type: "relationsStoriesListLoading" }],  ([prevState]) => ({
      ...prevState,
      relationsStoriesResults: {
        list: [],
        loading: true,
      },
    }))
    .with([__, { type: "relationsStoriesList" }],  ([prevState, action]) => ({
      ...prevState,
      relationsStoriesResults: {
        list: action.list,
        loading: false,
      },
    }))

    // ...

    .with([__, { type: "error" }],  ([prevState, action]) => ({
      ...prevState,
      _error: action.error,
    }))
    .otherwise(() => state)
  ;
};
