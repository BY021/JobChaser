'use client';
import { FaSearch } from "react-icons/fa";
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { setSearchTerm, setJobs, setLoading, setError } from '../redux/jobSearchSlice';
import { RootState } from '../redux/store';
import { useEffect } from 'react';

export default function Home() {
  const dispatch = useDispatch();
  const router = useRouter();
  
  const { searchTerm, jobs, loading, error } = useSelector((state: RootState) => state.jobSearch);

  useEffect(() => {
    const searchJobs = async () => {
      if (!searchTerm.trim()) {
        dispatch(setJobs([]));
        return;
      }

      dispatch(setLoading(true));
      dispatch(setError(null));
      
      try {
        const response = await fetch(`http://localhost:3001/api/jobs?q=${encodeURIComponent(searchTerm)}`);
        
        if (!response.ok) {
          throw new Error('Kunde inte hämta jobb');
        }

        const data = await response.json();
        dispatch(setJobs(data));
      } catch (err) {
        console.error('Search error:', err);
        dispatch(setError(err instanceof Error ? err.message : 'Ett fel uppstod'));
        dispatch(setJobs([]));
      } finally {
        dispatch(setLoading(false));
      }
    };

    const timer = setTimeout(searchJobs, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, dispatch]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setSearchTerm(e.target.value));
  };

  const noResults = !loading && searchTerm.trim() && jobs.length === 0;

  return (
    <div className="search-bar-container">
      <div className="input-wrapper">
        <FaSearch id="search-icon" />
        <input
          className="search-bar"
          name="search-jobs"
          type="text"
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder="Sök jobb..."
        />
      </div>
      
      {loading && <p>Laddar...</p>}
      {error && <p className="error-message">{error}</p>}

      <div className={`results-list ${!searchTerm.trim() ? "no-input" : ""}`}>
        {noResults ? ( 
          <div className="search-no-result">
            Inga jobb hittade för "{searchTerm}";
          </div>
        ) : (
          jobs.map(job => (
            <div 
              className="search-result" 
              onClick={() => router.push('/jobb')} 
              key={job.id}
            >
              {job.position} <span>hos</span> {job.company}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
