import React, { useState } from 'react';

const STATUSES = ['Подтверждено', 'В процессе', 'Отклонено'];

const VerifyPage = ({ events, setEvents }) => {
	const [currentIndex, setCurrentIndex] = useState(0);

	const handleStatusChange = (id, newStatus) => {

		setEvents(events.map(ev => ev.id === id ? { ...ev, status: newStatus } : ev));

		if (currentIndex < events.length - 1) {
			setCurrentIndex(currentIndex + 1);
		}
	};

	if (!events.length) return <p className="text-center text-gray-500 mt-10">Нет событий для проверки</p>;

	const ev = events[currentIndex];
	const displayStatus = ev.status || 'Ещё не опознано';

	return (
		<div className="flex-1 p-6 bg-[#F5F6FA] flex flex-col items-center">
			<h1 className="text-3xl mb-6 text-gray-900">Проверка событий</h1>

			<div className="bg-white p-6 rounded-2xl shadow w-full max-w-lg flex flex-col items-center">
				<div className="w-full flex justify-center mb-4">
					<img
						src={ev.image}
						alt={`Событие ${ev.id}`}
						className="max-w-full max-h-[500px] object-contain rounded-xl"
					/>
				</div>

				<p className="text-gray-900 font-semibold text-lg mb-1 text-center">
					{ev.type} - {ev.lobby}
				</p>
				<p className="text-gray-500 mb-4 text-center">{ev.time} | {displayStatus}</p>

				<div className="flex gap-4 mb-4">
					{STATUSES.map(status => (
						<button
							key={status}
							className={`px-4 py-2 rounded-xl text-sm border font-medium transition
								${ev.status === status
									? 'bg-[#E7D6C8] text-white border-[#E7D6C8]'
									: 'bg-white text-black border-gray-300 hover:bg-gray-100'
								}`}
							onClick={() => handleStatusChange(ev.id, status)}
						>
							{status}
						</button>
					))}
				</div>

				<p className="text-gray-500 text-sm">
					Событие {currentIndex + 1} из {events.length}
				</p>
			</div>
		</div>
	);
};

export default VerifyPage;
