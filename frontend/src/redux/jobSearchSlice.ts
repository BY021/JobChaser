import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type Job = {
    id: number;
    company: string;
    position: string;
    role: string;
    level: string;
    location: string;
    contract: string;
    languages: string[] | null;
    tools: string[] | null;
  };
  
  interface JobSearchState {
    searchTerm: string;
    jobs: Job[];
    loading: boolean;
    error: string | null;
  }
  
const initialState: JobSearchState = {
  searchTerm: '',
  jobs: [],
  loading: false,
  error: null,
};

const jobSearchSlice = createSlice({
  name: 'jobSearch',
  initialState,
  reducers: {
    setSearchTerm: (state, action: PayloadAction<string>) => {
      state.searchTerm = action.payload;
    },
    setJobs: (state, action: PayloadAction<Job[]>) => {
      state.jobs = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const { setSearchTerm, setJobs, setLoading, setError } = jobSearchSlice.actions;
export default jobSearchSlice.reducer;
