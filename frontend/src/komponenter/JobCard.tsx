'use client';
import { formatDistanceToNow } from 'date-fns';
import { Job } from '@/types';

interface JobCardProps {
  job: Job;
  isSaved?: boolean;
  onSaveClick?: (jobId: number) => void;
  canSave?: boolean;
}
export default function JobCard({ job, isSaved = false, onSaveClick, canSave = false }: JobCardProps) {
  return (
    <div className="job-card">
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

      {canSave && onSaveClick && (
        <button 
          onClick={() => onSaveClick(job.id)}
          className={isSaved ? "saved" : "unsaved"}
          aria-label={isSaved ? "Remove from saved jobs" : "Save job"}
        >
          {isSaved 
            ? <span className="spara-ej-knapp">Ta bort från sparade jobb</span>
            : "Spara jobb"}
        </button>
      )}

      {!canSave && isSaved && (
        <button 
          onClick={() => onSaveClick?.(job.id)}
          className="remove-button"
          aria-label="Remove from saved jobs"
        >
          <span className="tabort-favorit">Ta Bort</span>
        </button>
      )}
    </div>
  );
}
