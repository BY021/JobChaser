'use client';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';

type LoginFormData = {
    email: string;
    password: string;
  };

export default function Login() {
  const { register, handleSubmit } = useForm<LoginFormData>();
  const router = useRouter();

  const onSubmit = async (data: { email: string; password: string }) => {
    try {
      const response = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Fel E-post eller lösenord!');

      const { token } = await response.json();
      localStorage.setItem('token', token);
      window.location.href = '/jobb';
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message); // Visar "Fel E-post eller lösenord!" i en popup
      } else {
        alert('Ett okänt fel inträffade.');
    }
   }
  };

  return (
    <div className="signup-signin">
      <h2>LOGGA IN</h2>
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('email')} placeholder="E-post" required />
      <input {...register('password')} type="password" placeholder="Lösenord" required />
      <button type="submit">Logga in</button>
    </form>
    </div>
  );
}