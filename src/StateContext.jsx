import React, { createContext, useContext, useState, useEffect } from 'react';


const StateContext = createContext();

export const useStateContext = () => {
	return useContext(StateContext);
};

export const StateProvider = ({ children }) => {
	const [selectedStatus, setSelectedStatus] = useState(
		JSON.parse(localStorage.getItem('selectedStatus')) || []
	);
	const [selectedTypes, setSelectedTypes] = useState(
		JSON.parse(localStorage.getItem('selectedTypes')) || []
	);
	const [currentEventIndex, setCurrentEventIndex] = useState(
		JSON.parse(localStorage.getItem('currentEventIndex')) || 0
	);


	useEffect(() => {
		localStorage.setItem('selectedStatus', JSON.stringify(selectedStatus));
		localStorage.setItem('selectedTypes', JSON.stringify(selectedTypes));
		localStorage.setItem('currentEventIndex', JSON.stringify(currentEventIndex));
	}, [selectedStatus, selectedTypes, currentEventIndex]);

	const toggleStatus = (status) => {
		setSelectedStatus((prev) =>
			prev.includes(status)
				? prev.filter((s) => s !== status)
				: [...prev, status]
		);
	};

	const toggleType = (type) => {
		setSelectedTypes((prev) =>
			prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
		);
	};

	const setIndex = (index) => {
		setCurrentEventIndex(index);
	};

	return (
		<StateContext.Provider
			value={{
				selectedStatus,
				selectedTypes,
				toggleStatus,
				toggleType,
				currentEventIndex,
				setIndex,
			}}
		>
			{children}
		</StateContext.Provider>
	);
};
