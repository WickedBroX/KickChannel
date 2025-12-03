import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

export const Signup = () => {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signup({ email, username, password });
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Signup failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-950">
      <div className="bg-dark-900 p-8 rounded-xl shadow-xl w-full max-w-md border border-gray-800">
        <h2 className="text-2xl font-bold mb-6 text-center text-primary-500">Sign Up</h2>
        {error && <div className="bg-red-500/10 text-red-500 p-3 rounded mb-4 text-sm">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-dark-800 border border-gray-700 rounded p-2 text-white focus:outline-none focus:border-primary-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-dark-800 border border-gray-700 rounded p-2 text-white focus:outline-none focus:border-primary-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-dark-800 border border-gray-700 rounded p-2 text-white focus:outline-none focus:border-primary-500"
              required
            />
          </div>
          <button type="submit" className="w-full bg-primary-600 hover:bg-primary-500 text-white p-2 rounded transition-colors font-medium">
            Create Account
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-400">
          Already have an account? <Link to="/login" className="text-primary-400 hover:underline">Login</Link>
        </p>
      </div>
    </div>
  );
};
