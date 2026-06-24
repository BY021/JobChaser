'use client';
import { useState, useEffect } from 'react';
import CreateJobForm from '@/komponenter/SkapaJobb';
import JobCard from '@/komponenter/JobCard';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import { Job, User } from '@/types';

export default function Jobb() {
  const [activeTab, setActiveTab] = useState(0);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [savedJobs, setSavedJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState({
    jobs: false,
    savedJobs: false
});

  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);

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
      const savedJobsResponse = await fetch('http://localhost:3001/api/user/saved-jobs', {
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

    const endpoint = `http://localhost:3001/api/jobs/${jobId}/save`;
    const response = await fetch(endpoint, {
      method: isCurrentlySaved ? 'DELETE' : 'POST',
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

    const savedJobsResponse = await fetch('http://localhost:3001/api/user/saved-jobs', {
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
      {error && (
        <div className="status-msg">
          <p>{error}</p>
        </div>
      )}
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
              {jobs.map(job => {
                const isSaved = savedJobs.some(savedJob => savedJob.id === job.id);
                return (
                  <JobCard
                    key={job.id}
                    job={job}
                    isSaved={isSaved}
                    canSave={!!user}
                    onSaveClick={(jobId) => handleSaveJob(jobId, isSaved)}
                  />
                );
              })}
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
          <JobCard
            key={job.id}
            job={job}
            isSaved={true}
            canSave={false}
            onSaveClick={(jobId) => handleSaveJob(jobId, true)}
          />
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