import React, { useState } from 'react';
import { FolderOpen, Trash } from 'lucide-react';

const STATUSES = ['Подтверждено', 'В процессе', 'Отклонено'];

const DataPage = ({ events, setEvents }) => {
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [currentImage, setCurrentImage] = useState(null);

	const handleDelete = (id) => {
		setEvents(events.filter(ev => ev.id !== id));
	};

	const handleDownload = (image, filename) => {
		const a = document.createElement("a");
		a.href = image;
		a.download = filename || "download";
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
	};

	const handleImageClick = (image) => {
		setCurrentImage(image);
		setIsModalOpen(true);
	};

	const handleCloseModal = () => {
		setIsModalOpen(false);
	};


	const getStatusClass = (status) => {
		switch (status) {
			case 'Подтверждено':
				return 'bg-green-100 text-[#38AD4D]';
			case 'Чисто':
				return 'bg-green-100 text-[#38AD4D]';
			case 'В процессе':
				return 'bg-yellow-100 text-[#CAC52C]';
			case 'Отклонено':
				return 'bg-red-100 text-red-600';
			default:
				return 'bg-gray-100 text-gray-500';
		}
	};

	return (
		<div>
			<h1 className="text-3xl mb-6 text-gray-900">Данные событий</h1>
			<div className="bg-white rounded-xl shadow overflow-auto">
				<table className="w-full text-left border-collapse min-w-[500px]">
					<thead>
						<tr className="border-b border-gray-200">
							<th className="p-3 text-gray-600">Изображение</th>
							<th className="p-3 text-gray-600">Тип</th>
							<th className="p-3 text-gray-600">Лобби</th>
							<th className="p-3 text-gray-600">Время</th>
							<th className="p-3 text-gray-600">Статус</th>
							<th className="p-3 text-gray-600">Дата</th>
							<th className="p-3 text-gray-600">Действие</th>
						</tr>
					</thead>
					<tbody>
						{events.length ? events.map(ev => (
							<tr key={ev.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
								<td className="p-3">
									<img
										src={ev.image}
										alt={`Событие ${ev.id}`}
										className="w-20 h-12 object-cover rounded cursor-pointer"
										onClick={() => handleImageClick(ev.image)}
									/>
								</td>
								<td className="p-3 text-gray-900">{ev.type}</td>
								<td className="p-3 text-gray-900">{ev.lobby}</td>
								<td className="p-3 text-gray-900">{ev.time}</td>

								<td className="p-3">
									<span className={`inline-block rounded-xl ${getStatusClass(ev.status)} px-3 py-2`}>
										{ev.status || 'Ещё не опознано'}
									</span>
								</td>

								<td className="p-3 text-gray-900">{ev.date}</td>
								<td className="p-3 flex gap-2">
									<button
										onClick={() => handleDownload(ev.image, `event_${ev.id}.jpg`)}
										className="p-2 rounded-xl bg-[#E7D6C8] hover:bg-[#d9c1b2] transition"
									>
										<FolderOpen size={18} color="white" />
									</button>
									<button
										onClick={() => handleDelete(ev.id)}
										className="p-2 rounded-xl bg-[#F87171] hover:bg-[#e55a5a] transition"
									>
										<Trash size={18} color="white" />
									</button>
								</td>
							</tr>
						)) : (
							<tr>
								<td colSpan="7" className="text-center p-4 text-gray-500">Нет событий</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>

			{isModalOpen && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
					<div className="relative bg-white p-6 rounded-lg">
						<button
							className="absolute top-2 right-2 text-sm text-gray-500"
							onClick={handleCloseModal}
						>
							x
						</button>
						<img src={currentImage} alt="Большое изображение" className="max-w-full max-h-[80vh] object-contain" />
					</div>
				</div>
			)}
		</div>
	);
};

export default DataPage;
