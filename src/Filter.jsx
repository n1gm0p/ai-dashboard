import React, { useState, useMemo, useEffect } from "react";
import DatePicker, { registerLocale } from "react-datepicker";
import ru from "date-fns/locale/ru";
import "react-datepicker/dist/react-datepicker.css";
import "./datepicker.css";

registerLocale("ru", ru);

const TYPES = ["Мусор", "Консьерж", "Конфликт"];
const STATUS = ["Подтверждено", "В процессе", "Отклонено", "Ожидает уборки", "Ещё не опознано", "Чисто"];

const CustomDateInput = React.forwardRef(({ value, onClick, placeholder }, ref) => (
	<button
		ref={ref}
		onClick={onClick}
		className="h-10 px-3 text-sm rounded-xl border border-[#E7D6C8] bg-white text-black transition w-40 text-left"
	>
		{value || placeholder}
	</button>
));

const Filter = ({ events, setEvents }) => {

	const [start, setStart] = useState(
		localStorage.getItem('start') ? new Date(localStorage.getItem('start')) : null
	);
	const [end, setEnd] = useState(
		localStorage.getItem('end') ? new Date(localStorage.getItem('end')) : null
	);
	const [selectedTypes, setSelectedTypes] = useState(
		JSON.parse(localStorage.getItem('selectedTypes')) || []
	);
	const [selectedStatus, setSelectedStatus] = useState(
		JSON.parse(localStorage.getItem('selectedStatus')) || []
	);


	useEffect(() => {
		if (start) localStorage.setItem('start', start.toISOString());
		if (end) localStorage.setItem('end', end.toISOString());
		localStorage.setItem('selectedTypes', JSON.stringify(selectedTypes));
		localStorage.setItem('selectedStatus', JSON.stringify(selectedStatus));
	}, [start, end, selectedTypes, selectedStatus]);

	const toggleType = (type) => {
		setSelectedTypes((prev) =>
			prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
		);
	};

	const toggleStatus = (status) => {
		setSelectedStatus((prev) =>
			prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]
		);
	};

	const filtered = useMemo(() => {
		return events.filter((item) => {
			const itemDate = new Date(item.date);
			itemDate.setHours(0, 0, 0, 0);
			const okStart = start ? itemDate >= new Date(start.setHours(0, 0, 0, 0)) : true;
			const okEnd = end ? itemDate <= new Date(end.setHours(0, 0, 0, 0)) : true;
			const okType = selectedTypes.length ? selectedTypes.includes(item.type) : true;
			const okStatus = selectedStatus.length ? selectedStatus.includes(item.status) : true;
			return okStart && okEnd && okType && okStatus;
		});
	}, [events, start, end, selectedTypes, selectedStatus]);

	const resetFilters = () => {
		setStart(null);
		setEnd(null);
		setSelectedTypes([]);
		setSelectedStatus([]);
		localStorage.removeItem('start');
		localStorage.removeItem('end');
		localStorage.removeItem('selectedTypes');
		localStorage.removeItem('selectedStatus');
	};

	const checkboxClass =
		"h-10 px-3 flex items-center justify-center rounded-xl border border-[#E7D6C8] text-sm cursor-pointer transition";


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
		<div className="flex-1 p-6 flex flex-col gap-6 bg-[#F5F6FA]">
			<h2 className="text-2xl ml-[9px] font-700 text-gray-900">Списки нарушений</h2>

			<div className="bg-white p-6 rounded-2xl shadow flex flex-wrap gap-3 items-end max-w-full">
				<DatePicker
					selected={start}
					onChange={setStart}
					placeholderText="Начало"
					locale="ru"
					dateFormat="dd.MM.yyyy"
					customInput={<CustomDateInput placeholder="Начало" />}
					selectsStart
					startDate={start}
					endDate={end}
				/>
				<DatePicker
					selected={end}
					onChange={setEnd}
					placeholderText="Конец"
					locale="ru"
					dateFormat="dd.MM.yyyy"
					customInput={<CustomDateInput placeholder="Конец" />}
					selectsEnd
					startDate={start}
					endDate={end}
					minDate={start}
				/>

				<div className="flex gap-2 items-center ml-[10px]">
					<span className="text-gray-700 text-sm font-medium">Тип нарушения:</span>
					{TYPES.map((t) => (
						<label
							key={t}
							className={`${checkboxClass} ${selectedTypes.includes(t)
								? "bg-[#E7D6C8] text-white border-[#E7D6C8]"
								: "bg-white text-black border-[#E7D6C8]"
								}`}
						>
							<input
								type="checkbox"
								className="hidden"
								checked={selectedTypes.includes(t)}
								onChange={() => toggleType(t)}
							/>
							{t}
						</label>
					))}
				</div>

				<div className="flex gap-2 items-center ml-[10px]">
					<span className="text-gray-700 text-sm font-medium">Статус:</span>
					<label
						key="Подтверждено"
						className={`${checkboxClass} ${selectedStatus.includes("Подтверждено")
							? "bg-[#E7D6C8] text-white border-[#E7D6C8]"
							: "bg-white text-black border-[#E7D6C8]"}`}
					>
						<input
							type="checkbox"
							className="hidden"
							checked={selectedStatus.includes("Подтверждено")}
							onChange={() => toggleStatus("Подтверждено")}
						/>
						Подтверждено
					</label>


					<label
						key="В процессе"
						className={`${checkboxClass} ${selectedStatus.includes("В процессе")
							? "bg-[#E7D6C8] text-white border-[#E7D6C8]"
							: "bg-white text-black border-[#E7D6C8]"}`}
					>
						<input
							type="checkbox"
							className="hidden"
							checked={selectedStatus.includes("В процессе")}
							onChange={() => toggleStatus("В процессе")}
						/>
						В процессе
					</label>


					<label
						key="Отклонено"
						className={`${checkboxClass} ${selectedStatus.includes("Отклонено")
							? "bg-[#E7D6C8] text-white border-[#E7D6C8]"
							: "bg-white text-black border-[#E7D6C8]"}`}
					>
						<input
							type="checkbox"
							className="hidden"
							checked={selectedStatus.includes("Отклонено")}
							onChange={() => toggleStatus("Отклонено")}
						/>
						Отклонено
					</label>


					<div className="border-l-2 border-gray-300 h-8 mx-2" />


					<label
						key="Ожидает уборки"
						className={`${checkboxClass} ${selectedStatus.includes("Ожидает уборки")
							? "bg-[#E7D6C8] text-white border-[#E7D6C8]"
							: "bg-white text-black border-[#E7D6C8]"}`}
					>
						<input
							type="checkbox"
							className="hidden"
							checked={selectedStatus.includes("Ожидает уборки")}
							onChange={() => toggleStatus("Ожидает уборки")}
						/>
						Ожидает уборки
					</label>


					<label
						key="Ещё не опознано"
						className={`${checkboxClass} ${selectedStatus.includes("Ещё не опознано")
							? "bg-[#E7D6C8] text-white border-[#E7D6C8]"
							: "bg-white text-black border-[#E7D6C8]"}`}
					>
						<input
							type="checkbox"
							className="hidden"
							checked={selectedStatus.includes("Ещё не опознано")}
							onChange={() => toggleStatus("Ещё не опознано")}
						/>
						Ещё не опознано
					</label>

					<label
						key="Чисто"
						className={`${checkboxClass} ${selectedStatus.includes("Чисто")
							? "bg-[#E7D6C8] text-white border-[#E7D6C8]"
							: "bg-white text-black border-[#E7D6C8]"}`}
					>
						<input
							type="checkbox"
							className="hidden"
							checked={selectedStatus.includes("Чисто")}
							onChange={() => toggleStatus("Чисто")}
						/>
						Чисто
					</label>
				</div>


				<button
					onClick={resetFilters}
					className="h-10 px-4 bg-[#D1BBAE] text-white rounded-xl text-sm hover:bg-[#D1BBAE] transition"
				>
					Сбросить
				</button>
			</div>

			<h2 className="text-2xl mb-4 text-gray-900">Списки нарушений</h2>
			<div className="bg-white rounded-xl shadow overflow-auto">
				<table className="w-full text-left table-fixed border-collapse">
					<thead>
						<tr className="border-b border-gray-200">
							<th className="p-3 w-16 text-gray-600">ID</th>
							<th className="p-3 w-48 text-gray-600">Адрес</th>
							<th className="p-3 w-32 text-gray-600">Дата</th>
							<th className="p-3 w-32 text-gray-600">Тип</th>
							<th className="p-3 w-32 text-gray-600">Статус</th>
						</tr>
					</thead>
					<tbody>
						{filtered.length ? (
							filtered.map((item) => (
								<tr
									key={item.id}
									className="border-b border-gray-100 hover:bg-gray-50 transition"
								>
									<td className="p-3 text-gray-900">{item.id}</td>
									<td className="p-3 text-gray-900">{item.address || item.lobby}</td>
									<td className="p-3 text-gray-900">
										{new Date(item.date).toLocaleDateString("ru-RU")}
									</td>
									<td className="p-3 text-gray-900">{item.type}</td>
									<td className="p-3">
										<span className={`inline-block rounded-xl ${getStatusClass(item.status)} px-3 py-2`}>
											{item.status || 'Ещё не опознано'}
										</span>
									</td>
								</tr>
							))
						) : (
							<tr>
								<td colSpan="5" className="text-center p-4 text-gray-500">
									Нет нарушений по выбранным фильтрам
								</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>
		</div>
	);
};

export default Filter;
