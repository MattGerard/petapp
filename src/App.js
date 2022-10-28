import './index.css';
import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import Auth from './Auth';
import Account from './Account';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Pets from './Pets';

export default function App() {
	const [session, setSession] = useState(null);
	console.log({ session });
	useEffect(() => {
		supabase.auth.getSession().then(({ data: { session } }) => {
			setSession(session);
		});

		supabase.auth.onAuthStateChange((_event, session) => {
			setSession(session);
		});
	}, []);

	const router = createBrowserRouter([
		{
			path: '/',
			element: !session ? (
				<Auth />
			) : (
				<Account key={session?.user?.id} session={session} />
			),

			children: [
				{
					path: 'pets',
					element: <Pets key={session?.user?.id} session={session} />,
				},
			],
		},
	]);

	//   <div className="container" style={{ padding: '50px 0 100px 0' }}>
	//   {!session ? (
	//     <Auth />
	//   ) : (
	//     <Account key={session.user.id} session={session} />
	//   )}
	// </div>
	return <RouterProvider router={router} />;
}
