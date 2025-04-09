'use client';
import { useState, useEffect } from 'react';
import { FaSearch } from "react-icons/fa";
import { useRouter } from 'next/navigation';

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

export default function Home() {
  const [searchTerm, setSearchTerm] = useState('');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const searchJobs = async () => {
      if (!searchTerm.trim()) {
        setJobs([]);
        return;
      }

      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`http://localhost:3001/api/jobs?q=${encodeURIComponent(searchTerm)}`);
        
        if (!response.ok) {
          throw new Error('Kunde inte hämta jobb');
        }

        const data = await response.json();
        setJobs(data);
      } catch (err) {
        console.error('Search error:', err);
        setError(err instanceof Error ? err.message : 'Ett fel uppstod');
        setJobs([]);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(searchJobs, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

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
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Sök jobb..."
        />
      </div>
      
      {loading && <p>Laddar...</p>}
      {error && <p className="error-message">{error}</p>}

      <div className={`results-list ${!searchTerm.trim() ? "no-input" : ""}`}>
        {noResults ? ( 
          <div className="search-no-result">
            Inga jobb hittade för "{searchTerm}"
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