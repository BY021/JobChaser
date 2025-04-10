'use client';
import { useState, useEffect } from 'react';
import { useForm, FieldValues, FieldErrors, SubmitHandler } from 'react-hook-form';

type JobFormData = {
  company: string;
  logo: FileList | null;
  position: string;
  role: string;
  level: string;
  postedAt: string;
  contract: string;
  location: string;
  languages?: string;
  tools?: string;
};

const inputFields: { name: keyof JobFormData; label: string; type?: string; required?: boolean }[] = [
  { name: 'company', label: 'Company*', required: true },
  { name: 'logo', label: 'Logo*', type: 'file', required: true },
  { name: 'position', label: 'Position*', required: true },
  { name: 'role', label: 'Role*', required: true },
  { name: 'level', label: 'Level*', required: true },
  { name: 'postedAt', label: 'Posted At', required: false },
  { name: 'contract', label: 'Contract*', required: true },
  { name: 'location', label: 'Location*', required: true },
  { name: 'languages', label: 'Languages', required: false },
  { name: 'tools', label: 'Tools', required: false },
];

export default function CreateJobForm() {
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<JobFormData>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    const currentDate = new Date().toISOString().split('T')[0];
    setValue('postedAt', currentDate);
  }, [setValue]);

  const onSubmit: SubmitHandler<JobFormData> = async (data) => {
    const formData = new FormData();
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const token = localStorage.getItem('token');

      if (!token) throw new Error('Not authenticated');

      const formData = new FormData();
      formData.append('company', data.company);
      formData.append('logo', data.logo ? data.logo[0] : '');
      formData.append('position', data.position);
      formData.append('role', data.role);
      formData.append('level', data.level);
      formData.append('postedAt', new Date(data.postedAt).toISOString());
      formData.append('contract', data.contract);
      formData.append('location', data.location);
      formData.append('languages', data.languages || '');
      formData.append('tools', data.tools || '');

      const response = await fetch('http://localhost:3001/api/jobs', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server response error:', errorText);
        throw new Error(errorText || 'Failed to create job');
      }

      const result = await response.json();
      setSubmitSuccess(true);
      reset();
    } catch (error) {
      console.error('Submission error:', error);
      setSubmitError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setTimeout(() => {
        setSubmitSuccess(false);
      }, 5000);
      formData.append('postedAt', new Date(data.postedAt).toISOString());
    }
  };

  return (
    <div className="job-form-container">
      <h2 className="form-title">Skapa ny jobbannons</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="form-fields">
      {inputFields.map((field) => (
  <div key={field.name} className="input-group">
    <label htmlFor={field.name} className="form-label">{field.label}</label>
    {field.type === 'file' ? (
      <input
        type="file"
        {...register(field.name, { 
          required: field.required ? `${field.label.replace('*', '')} är obligatorisk` : false 
        })}
      />
    ) : (
      <input
        {...register(field.name, { 
          required: field.required ? `${field.label.replace('*', '')} är obligatorisk` : false 
        })}
        readOnly={field.name === 'postedAt'}
      />
    )}
            {errors[field.name] && <p className="error-message">{(errors as FieldErrors<JobFormData>)[field.name]?.message}</p>}
          </div>
        ))}

        <button
          type="submit"
          disabled={isSubmitting}
          className="submit-btn"
        >
          {isSubmitting ? 'Skickar...' : 'Skapa jobb'}
        </button>

        {submitError && <p className="submit-error">{submitError}</p>}
        {submitSuccess && <p className="submit-success">Jobb skapat!</p>}
      </form>
    </div>
  );
}
