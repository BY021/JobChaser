'use client';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

type FormData = {
  email: string;
  password: string;
};

type ApiError = {
  message?: string;
  error?: string;
  errors?: Record<string, string[]>;
};

export default function Register() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    setSubmitError(null);
    
    try {
      const response = await fetch('http://localhost:3001/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData: ApiError = await response.json().catch(() => ({} as ApiError));
        const errorText = errorData.message
          || (typeof (errorData as { error?: unknown }).error === 'string' ? errorData.error : '')
          || '';
        const duplicateEmail =
          response.status === 409 ||
          errorText.toLowerCase().includes('exists') ||
          errorText.toLowerCase().includes('finns redan');

        const message = duplicateEmail
          ? 'Detta mejl finns redan registrerad.'
          : errorData.errors?.email?.[0]
            || errorText
            || 'Registration failed';

        setSubmitError(message);
        return;
      }
      
      router.push('/logga-in');
    } catch (error) {
      console.error('Registration error:', error);
      setSubmitError(
        error instanceof Error 
          ? error.message 
          : 'An unexpected error occurred. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="signup-signin">
      <h2>SKAPA ETT KONTO</h2>
      {submitError && (
        <div className="error-message" style={{ color: 'red', marginBottom: '1rem' }}>
          {submitError}
        </div>
      )}
      <form onSubmit={handleSubmit(onSubmit)}>
        <div>
          <input 
            {...register('email', { 
              required: 'Email is required',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Invalid email address'
              }
            })} 
            placeholder="E-post" 
          />
          {errors.email && (
            <span style={{ color: 'red', fontSize: '0.8rem' }}>{errors.email.message}</span>
          )}
        </div>
        
        <div>
          <input 
            {...register('password', { 
              required: 'Password is required',
              minLength: {
                value: 6,
                message: 'Password must be at least 6 characters'
              }
            })} 
            type="password" 
            placeholder="Lösenord" 
          />
          {errors.password && (
            <span style={{ color: 'red', fontSize: '0.8rem' }}>{errors.password.message}</span>
          )}
        </div>
        
        <button 
          type="submit" 
          disabled={isSubmitting}
          style={{ opacity: isSubmitting ? 0.7 : 1 }}
        >
          {isSubmitting ? 'Processing...' : 'Registrera'}
        </button>
      </form>
    </div>
  );
}