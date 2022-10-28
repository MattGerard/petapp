import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

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

export default Pets;
