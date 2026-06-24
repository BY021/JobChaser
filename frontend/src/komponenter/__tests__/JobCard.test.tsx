import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import JobCard from '../JobCard';

const mockJob = {
  id: 1,
  company: 'Tech Corp',
  logo: '/logos/techcorp.png',
  position: 'Frontend Developer',
  role: 'Full Stack',
  level: 'Senior',
  postedAt: new Date().toISOString(),
  contract: 'Full Time',
  location: 'Remote',
  languages: ['JavaScript', 'TypeScript'],
  tools: ['React', 'Next.js'],
  savedBy: [],
};

describe('JobCard Component', () => {
  it('renders job information correctly', () => {
    render(<JobCard job={mockJob} canSave={false} />);

    expect(screen.getByText('Frontend Developer')).toBeInTheDocument();
    expect(screen.getByText('Tech Corp')).toBeInTheDocument();
    expect(screen.getByText('Senior')).toBeInTheDocument();
    expect(screen.getByText('Remote')).toBeInTheDocument();
  });

  it('displays save button when canSave is true', () => {
    const mockOnSaveClick = jest.fn();
    render(
      <JobCard 
        job={mockJob} 
        canSave={true} 
        onSaveClick={mockOnSaveClick}
      />
    );

    expect(screen.getByLabelText('Save job')).toBeInTheDocument();
  });

  it('displays unsaved button when job is not saved', () => {
    const mockOnSaveClick = jest.fn();
    render(
      <JobCard 
        job={mockJob} 
        canSave={true} 
        isSaved={false}
        onSaveClick={mockOnSaveClick}
      />
    );

    const button = screen.getByLabelText('Save job');
    expect(button).toHaveClass('unsaved');
  });

  it('displays saved button when job is saved', () => {
    const mockOnSaveClick = jest.fn();
    render(
      <JobCard 
        job={mockJob} 
        canSave={true} 
        isSaved={true}
        onSaveClick={mockOnSaveClick}
      />
    );

    const button = screen.getByLabelText('Remove from saved jobs');
    expect(button).toHaveClass('saved');
  });

  it('calls onSaveClick when button is clicked', async () => {
    const user = userEvent.setup();
    const mockOnSaveClick = jest.fn();
    
    render(
      <JobCard 
        job={mockJob} 
        canSave={true}
        isSaved={false}
        onSaveClick={mockOnSaveClick}
      />
    );

    const button = screen.getByLabelText('Save job');
    await user.click(button);

    expect(mockOnSaveClick).toHaveBeenCalledWith(mockJob.id);
    expect(mockOnSaveClick).toHaveBeenCalledTimes(1);
  });

  it('displays languages and tools', () => {
    render(<JobCard job={mockJob} canSave={false} />);

    expect(screen.getByText('JavaScript, TypeScript')).toBeInTheDocument();
    expect(screen.getByText('React, Next.js')).toBeInTheDocument();
  });
});
