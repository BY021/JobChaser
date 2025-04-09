'use client';
import { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import CreateJobForm from '@/komponenter/SkapaJobb';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';


//Types
type Job = {
  savedBy: any;
  id: number;
  company: string;
  logo: string;
  position: string;
  role: string;
  level: string;
  postedAt: string;
  contract: string;
  location: string;
  languages: string[];
  tools: string[];
};

type User = {
  id: number;
  email: string;
  role: string;
};

export default function Jobb() {
  const [activeTab, setActiveTab] = useState(0);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [savedJobs, setSavedJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState({
    jobs: false,
    savedJobs: false
});

  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const response = await fetch('http://localhost:3001/api/user', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, []);

useEffect(() => {
  const fetchJobs = async () => {
    try {
      setLoading(prev => ({ ...prev, jobs: true }));
      const jobsResponse = await fetch('http://localhost:3001/api/jobs');
      
      if (!jobsResponse.ok) throw new Error('Failed to fetch jobs');
      
      const jobsData = await jobsResponse.json();
      setJobs(jobsData);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch jobs');
    } finally {
      setLoading(prev => ({ ...prev, jobs: false }));
    }
  };

  const fetchSavedJobs = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setSavedJobs([]);
      return;
    }

    try {
      setLoading(prev => ({ ...prev, savedJobs: true }));
      const savedJobsResponse = await fetch('http://localhost:3001/api/saved-jobs', {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (savedJobsResponse.status === 401) {
        localStorage.removeItem('token');
        setSavedJobs([]);
        return;
      }

      if (!savedJobsResponse.ok) throw new Error('Failed to fetch saved jobs');
      
      const savedJobsData = await savedJobsResponse.json();
      setSavedJobs(savedJobsData || []);
    } catch (error) {
      if (error instanceof Error && error.message.includes('token')) {
        localStorage.removeItem('token');
      }
      setSavedJobs([]);
    } finally {
      setLoading(prev => ({ ...prev, savedJobs: false }));
    }
  };

  fetchJobs();
  fetchSavedJobs();
}, []);

const handleSaveJob = async (jobId: number, isCurrentlySaved: boolean) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Please log in to save jobs');
    }

    const endpoint = `http://localhost:3001/api/jobs/${jobId}/${isCurrentlySaved ? 'unsave' : 'save'}`;
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.status === 401) {
      localStorage.removeItem('token');
      throw new Error('Session expired. Please log in again.');
    }

    if (!response.ok) throw new Error('Failed to update saved status');

    const updatedJobsResponse = await fetch('http://localhost:3001/api/jobs');
    const updatedJobsData = await updatedJobsResponse.json();
    setJobs(updatedJobsData);

    const savedJobsResponse = await fetch('http://localhost:3001/api/saved-jobs', {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    const savedJobsData = await savedJobsResponse.json();
    setSavedJobs(savedJobsData || []);
  } catch (error) {
    setError(error instanceof Error ? error.message : 'Failed to update saved status');
  }
};

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <div>
      <Box className="tabs-container">
    <Tabs value={activeTab} onChange={handleTabChange}>
      <Tab label="Alla Jobb" />
      {user && <Tab label="Sparade Jobb" />}
      {user?.role === 'admin' && <Tab label="Skapa Jobb" />}
    </Tabs>
  </Box>

      {activeTab === 0 && (
        <div className="jobs-list">
          {loading.jobs ? (
            <div className="status-msg"><p>Laddar alla jobb...</p></div>
          ) : (
            <div className="jobs-list">
              {jobs.map(job => (
                <div className="job-card" key={job.id}>
                <img src={`http://localhost:3001${job.logo}`} alt={job.company} />
                <div className="position">
                  <h3>{job.position}</h3>
                  <p><span>at</span> {job.company}</p>
                </div>
                <div className="info">
                  <p>{formatDistanceToNow(new Date(job.postedAt), { addSuffix: true })}</p>
                  <p>{job.contract}</p>
                  <p>{job.location}</p>
                  <p>{job.level}</p>
                  <p>{job.role}</p>
                  {job.languages.length > 0 && <p>{job.languages.join(", ")}</p>}
                  {job.tools.length > 0 && <p>{job.tools.join(", ")}</p>}
                </div>
                
                {user && (
                  <button 
                    onClick={() => {
                      const isSaved = savedJobs.some(savedJob => savedJob.id === job.id);
                      handleSaveJob(job.id, isSaved);
                    }}
                    className={savedJobs.some(savedJob => savedJob.id === job.id) ? "saved" : "unsaved"}
                  >
                    {savedJobs.some(savedJob => savedJob.id === job.id) 
                      ? <span className="spara-ej-knapp">Ta bort från sparade jobb</span>
                      : "Spara jobb"}
                  </button>
                )}
              </div>
              ))}
            </div>
          )}
        </div>
      )}

{activeTab === 1 && (
  <div className="jobs-list">
    {!localStorage.getItem('token') ? (
      <div className="redirect-message">
        <p>Vänligen <a href="/logga-in">logga in</a> för att se dina sparade jobb</p>
      </div>
    ) : loading.savedJobs ? (
      <div className="status-msg"><p>Laddar sparade jobb...</p></div>
    ) : savedJobs.length === 0 ? (
      <div className="status-msg"><p>Du har ej sparat några jobb!</p></div>
    ) : (
      <div className="jobs-list">
        {savedJobs.map(job => (
                <div className="job-card" key={job.id}>
                  <img src={`http://localhost:3001${job.logo}`} alt={job.company} />
                  <div className="position">
                    <h3>{job.position}</h3>
                    <p><span>at</span> {job.company}</p>
                  </div>
                  <div className="info">
                    <p>{formatDistanceToNow(new Date(job.postedAt), { addSuffix: true })}</p>
                    <p>{job.contract}</p>
                    <p>{job.location}</p>
                    <p>{job.level}</p>
                    <p>{job.role}</p>
                    {job.languages.length > 0 && <p>{job.languages.join(", ")}</p>}
                    {job.tools.length > 0 && <p>{job.tools.join(", ")}</p>}
                  </div>
                  <button onClick={() => handleSaveJob(job.id, true)}>
                    <span className="tabort-favorit">Ta Bort</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

{activeTab === 2 && (
    user?.role === 'admin' ? (
      <CreateJobForm />
    ) : (
      <div className="error-message">
        <p>Måste vara admin för att skapa jobb!</p>
      </div>
    )
  )}
    </div>
  );
}