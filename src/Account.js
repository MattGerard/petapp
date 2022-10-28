import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { Outlet } from 'react-router-dom';
import { DoubleNavbar } from './NavBar';

import {
	AppShell,
	Navbar,
	Header,
	Footer,
	Aside,
	Text,
	MediaQuery,
	Burger,
	useMantineTheme,
} from '@mantine/core';

const Pets = ({ session }) => {
	const [pets, setPets] = useState([]);

	const fetchPets = async () => {
		let { data: pets, error } = await supabase
			.from('pets')
			.select('*')
			.order('id', { ascending: false });
		if (error) console.log('error', error);
		else setPets(pets);
	};

	useEffect(() => {
		fetchPets().catch(console.error);
	}, []);

	return (
		<div>
			<h3>Pets</h3>
			{pets?.map((p) => {
				return <div>{p.name}</div>;
			})}
		</div>
	);
};

const NewPet = ({ session }) => {
	const [errorText, setError] = useState('');
	const [petName, setPetName] = useState('');
	const { user } = session;
	const addPet = async () => {
		if (petName.length <= 3) {
			setError('Pet Name length should be more than 3!');
		} else {
			let { data, error } = await supabase
				.from('pets')
				.insert({ name: petName, user_id: user.id })
				.select();
			if (error) setError(error.message);
			else {
				console.log({ data });
				setError(null);
				setPetName('');
			}
		}
	};

	return (
		<div>
			<input
				type='text'
				value={petName}
				onChange={(e) => setPetName(e.target.value)}
				className={'bg-gray-200 border px-2 border-gray-300 w-full mr-4'}
				placeholder='Pet Name'
			/>
			<button type='button' onClick={() => addPet()}>
				Add Pet
			</button>
		</div>
	);
};

const Account = ({ session }) => {
	const theme = useMantineTheme();
	const [opened, setOpened] = useState(false);

	const [loading, setLoading] = useState(true);
	const [username, setUsername] = useState(null);
	const [website, setWebsite] = useState(null);
	const [avatar_url, setAvatarUrl] = useState(null);

	useEffect(() => {
		getProfile();
		getPets();
	}, [session]);

	const getProfile = async () => {
		try {
			setLoading(true);
			const { user } = session;

			let { data, error, status } = await supabase
				.from('profiles')
				.select(`username, website, avatar_url`)
				.eq('id', user.id)
				.single();

			if (error && status !== 406) {
				throw error;
			}

			if (data) {
				setUsername(data.username);
				setWebsite(data.website);
				setAvatarUrl(data.avatar_url);
			}
		} catch (error) {
			alert(error.message);
		} finally {
			setLoading(false);
		}
	};

	const getPets = async () => {
		try {
			setLoading(true);
			const { user } = session;

			let { data, error, status } = await supabase
				.from('pets')
				.select(`id, name, created_at, user_id`)
				.eq('user_id', user.id);

			if (error && status !== 406) {
				throw error;
			}

			if (data) {
				console.log({ data });
				// setUsername(data.username);
				// setWebsite(data.website);
				// setAvatarUrl(data.avatar_url);
			}
		} catch (error) {
			alert(error.message);
		} finally {
			setLoading(false);
		}
	};

	const updateProfile = async (e) => {
		e.preventDefault();

		try {
			setLoading(true);
			const { user } = session;

			const updates = {
				id: user.id,
				username,
				website,
				avatar_url,
				updated_at: new Date(),
			};

			let { error } = await supabase.from('profiles').upsert(updates);

			if (error) {
				throw error;
			}
		} catch (error) {
			alert(error.message);
		} finally {
			setLoading(false);
		}
	};

	return (
		<AppShell
			styles={{
				main: {
					background:
						theme.colorScheme === 'dark'
							? theme.colors.dark[8]
							: theme.colors.gray[0],
				},
			}}
			navbarOffsetBreakpoint='sm'
			asideOffsetBreakpoint='sm'
			navbar={
				<Navbar
					p='md'
					hiddenBreakpoint='sm'
					hidden={!opened}
					width={{ sm: 250, lg: 300 }}
				>
					<DoubleNavbar />
				</Navbar>
			}
			header={
				<Header height={70} p='md'>
					<div
						style={{ display: 'flex', alignItems: 'center', height: '100%' }}
					>
						<MediaQuery largerThan='sm' styles={{ display: 'none' }}>
							<Burger
								opened={opened}
								onClick={() => setOpened((o) => !o)}
								size='sm'
								color={theme.colors.gray[6]}
								mr='xl'
							/>
						</MediaQuery>

						<Text>Pet Manager</Text>
					</div>
				</Header>
			}
		>
			<div>
				{loading ? (
					'Saving ...'
				) : (
					<form onSubmit={updateProfile} className='form-widget'>
						<div>Email: {session.user.email}</div>
						<div>
							<label htmlFor='username'>Name</label>
							<input
								id='username'
								type='text'
								value={username || ''}
								onChange={(e) => setUsername(e.target.value)}
							/>
						</div>
						<div>
							<label htmlFor='website'>Website</label>
							<input
								id='website'
								type='url'
								value={website || ''}
								onChange={(e) => setWebsite(e.target.value)}
							/>
						</div>
						<div>
							<button className='button primary block' disabled={loading}>
								Update profile
							</button>
						</div>
					</form>
				)}
				<button
					type='button'
					className='button block'
					onClick={() => supabase.auth.signOut()}
				>
					Sign Out
				</button>

				<NewPet session={session} />

				<Outlet />
			</div>
		</AppShell>
	);
};

export default Account;
