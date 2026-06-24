import { configureStore } from '@reduxjs/toolkit';
import { 
  jobSearchSlice,
  setSearchTerm, 
  setJobs, 
  setLoading, 
  setError 
} from '../jobSearchSlice';

describe('jobSearchSlice', () => {
  let store: ReturnType<typeof configureStore>;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        jobSearch: jobSearchSlice.reducer,
      },
    });
  });

  it('has correct initial state', () => {
    const state = store.getState().jobSearch;
    expect(state.searchTerm).toBe('');
    expect(state.jobs).toEqual([]);
    expect(state.loading).toBe(false);
    expect(state.error).toBe(null);
  });

  it('updates searchTerm correctly', () => {
    store.dispatch(setSearchTerm('React Developer'));
    const state = store.getState().jobSearch;
    expect(state.searchTerm).toBe('React Developer');
  });

  it('updates loading state', () => {
    store.dispatch(setLoading(true));
    expect(store.getState().jobSearch.loading).toBe(true);

    store.dispatch(setLoading(false));
    expect(store.getState().jobSearch.loading).toBe(false);
  });

  it('updates error state', () => {
    const errorMessage = 'Failed to fetch jobs';
    store.dispatch(setError(errorMessage));
    expect(store.getState().jobSearch.error).toBe(errorMessage);

    store.dispatch(setError(null));
    expect(store.getState().jobSearch.error).toBe(null);
  });

  it('sets jobs correctly', () => {
    const mockJobs = [
      {
        id: 1,
        company: 'Tech Corp',
        position: 'Developer',
        role: 'Full Stack',
        level: 'Senior',
        location: 'Remote',
        contract: 'Full Time',
        languages: ['JavaScript'],
        tools: ['React'],
      },
    ];

    store.dispatch(setJobs(mockJobs));
    const state = store.getState().jobSearch;
    expect(state.jobs).toEqual(mockJobs);
    expect(state.jobs.length).toBe(1);
  });

  it('clears jobs array when setting empty array', () => {
    const mockJobs = [
      {
        id: 1,
        company: 'Tech Corp',
        position: 'Developer',
        role: 'Full Stack',
        level: 'Senior',
        location: 'Remote',
        contract: 'Full Time',
        languages: [],
        tools: [],
      },
    ];

    store.dispatch(setJobs(mockJobs));
    expect(store.getState().jobSearch.jobs.length).toBe(1);

    store.dispatch(setJobs([]));
    expect(store.getState().jobSearch.jobs.length).toBe(0);
  });
});
