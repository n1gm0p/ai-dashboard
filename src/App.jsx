import React, { useState, useMemo, forwardRef } from 'react';
import { Grid2x2, Layers, PanelsTopLeft, CalendarSearch, ImageUp } from 'lucide-react';
import DatePicker, { registerLocale } from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import ru from 'date-fns/locale/ru';

import './datepicker.css';
import Filter from './Filter';
import DataPage from './DataPage';
import VerifyPage from './VerifyPage';
import { StateProvider } from './StateContext';
// import Login from './Login';
// import Register from './Register';

import {
	LineChart,
	Line,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
} from 'recharts';

registerLocale('ru', ru);

const CustomDateInput = forwardRef(({ value, onClick }, ref) => (
	<div className="relative w-32">
		<input
			type="text"
			value={value}
			onClick={onClick}
			readOnly
			ref={ref}
			className="p-2 pr-10 rounded-xl border border-gray-300 bg-[#FCFDFD] text-sm text-black w-full cursor-pointer"
		/>
		<CalendarSearch
			size={20}
			onClick={onClick}
			className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 cursor-pointer"
		/>
	</div>
));

const getWeekRange = (date) => {
	const d = new Date(date);
	const day = d.getDay() || 7;
	const monday = new Date(d);
	monday.setDate(d.getDate() - day + 1);
	monday.setHours(0, 0, 0, 0);
	const sunday = new Date(monday);
	sunday.setDate(monday.getDate() + 6);
	sunday.setHours(23, 59, 59, 999);
	return [monday, sunday];
};

const TYPES = ['Мусор', 'Конфликт', 'Консьерж'];

const Dashboard = ({ events, setEvents, chartStart, chartEnd, setChartStart, setChartEnd }) => {
	const today = new Date();
	const [periodType, setPeriodType] = useState('day');
	const [selectedDate, setSelectedDate] = useState(today);
	const [selectedWeek, setSelectedWeek] = useState(() => getWeekRange(today));
	const [hoveredWeek, setHoveredWeek] = useState(null);
	const [selectedTypes, setSelectedTypes] = useState([]);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [selectedImage, setSelectedImage] = useState('');
	

	const toggleType = (type) =>
		setSelectedTypes((prev) =>
			prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
		);

	const filteredEvents = useMemo(() => {
		const byType = (ev) => !selectedTypes.length || selectedTypes.includes(ev.type);

		if (periodType === 'day') {
			const dayStr = selectedDate.toISOString().split('T')[0];
			return events.filter((e) => e.date === dayStr && byType(e));
		}

		const [start, end] = selectedWeek;
		const startStr = start.toISOString().split('T')[0];
		const endStr = end.toISOString().split('T')[0];
		return events.filter(
			(e) => e.date >= startStr && e.date <= endStr && byType(e)
		);
	}, [events, selectedDate, selectedWeek, periodType, selectedTypes]);

	const trashEvents = events.filter(
		(e) => e.type === 'Мусор' && e.status === 'Ожидает уборки'
	);

	const handleCleaned = (eventId) => {

		setEvents((prevEvents) =>
			prevEvents.map((ev) =>
				ev.id === eventId ? { ...ev, status: 'Чисто' } : ev
			)
		);
	};

	const stats = useMemo(
		() => ({
			conflicts: filteredEvents.filter((e) => e.type === 'Конфликт').length,
			trash: filteredEvents.filter((e) => e.type === 'Мусор').length,
			concierge: filteredEvents.filter((e) => e.type === 'Консьерж').length,
		}),
		[filteredEvents]
	);

	const handleDayChange = (date) => setSelectedDate(date);
	const handleWeekChange = (date) => setSelectedWeek(getWeekRange(date));

	const renderWeekDay = (day, date) => {
		const onEnter = () => setHoveredWeek(getWeekRange(date));
		const onLeave = () => setHoveredWeek(null);
		const inSelectedWeek = selectedWeek && date >= selectedWeek[0] && date <= selectedWeek[1];
		const inHoveredWeek = hoveredWeek && date >= hoveredWeek[0] && date <= hoveredWeek[1];
		const cls = inSelectedWeek ? 'rd-day-selected-week' : inHoveredWeek ? 'rd-day-hover-week' : '';
		return (
			<div
				onMouseEnter={onEnter}
				onMouseLeave={onLeave}
				onClick={() => handleWeekChange(date)}
				className={`w-full h-full flex items-center justify-center ${cls}`}
			>
				{day}
			</div>
		);
	};

	const CustomTooltip = ({ active, payload }) => {
		if (active && payload && payload.length) {
			return (
				<div className="bg-white p-2 rounded-xl shadow border border-gray-300 text-sm">
					<p className="text-gray-900">Кол-во скриншотов: {payload[0].value}</p>
				</div>
			);
		}
		return null;
	};

	const chartData = useMemo(() => {
		const start = chartStart || new Date();
		const end = chartEnd || new Date();
		const daysMap = {};

		events.forEach((e) => {
			if (e.date >= start.toISOString().split('T')[0] && e.date <= end.toISOString().split('T')[0]) {
				daysMap[e.date] = (daysMap[e.date] || 0) + 1;
			}
		});

		const days = [];
		const current = new Date(start);
		while (current <= end) {
			const dateStr = current.toISOString().split('T')[0];
			days.push({
				day: `${('0' + current.getDate()).slice(-2)}.${('0' + (current.getMonth() + 1)).slice(-2)}`,
				value: daysMap[dateStr] || 0,
			});
			current.setDate(current.getDate() + 1);
		}

		return days;
	}, [events, chartStart, chartEnd]);

	const handleImageClick = (image) => {
		setSelectedImage(image);
		setIsModalOpen(true);
	};

	const closeModal = () => {
		setIsModalOpen(false);
		setSelectedImage('');
	};

	return (

			<div>
				<h1 className="text-3xl mb-6 text-gray-900">Dashboard</h1>

				<div className="bg-white p-6 rounded-xl shadow mb-6">
					<h2 className="text-2xl text-gray-900 mb-4">Уборка мусора</h2>
					<div className="overflow-x-auto">
						<table className="w-full table-auto border-collapse">
							<thead>
								<tr className="bg-gray-100">
									<th className="py-2 px-4 text-left text-sm font-semibold text-gray-700 rounded-tl-xl">Лобби и Время</th>
									<th className="py-2 pl-6 pr-6 text-left text-sm font-semibold text-gray-700">Фото</th>
									<th className="py-2 pr-8 text-right text-sm font-semibold text-gray-700 rounded-tr-xl">Действие</th>
								</tr>
							</thead>
							<tbody>
								{trashEvents.length > 0 ? (
									trashEvents.map((event) => (
										<tr key={event.id} className="border-t hover:bg-gray-50">
											<td className="py-3 px-4 text-sm text-gray-900">{event.lobby} - {event.time}</td>
											<td className="py-3 pl-4 pr-4">
												<img
													src={event.image}
													alt={`Мусор в ${event.lobby}`}
													className="w-12 h-12 object-cover rounded-xl cursor-pointer"
													onClick={() => handleImageClick(event.image)}
												/>
											</td>
											<td className="py-3 px-4 text-right"> 
												<button
													onClick={() => handleCleaned(event.id)}
													className="px-4 py-2 bg-[#E7D6C8] text-white rounded-xl"
												>
													Убрать
												</button>
											</td>
										</tr>

									))
								) : (
									<tr>
										<td colSpan="3" className="text-center py-3 text-gray-500">Нет мусора на уборку</td>
									</tr>
								)}
							</tbody>
						</table>
					</div>


					{isModalOpen && (
						<div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex justify-center items-center z-50">
							<div className="relative bg-white p-4 rounded-xl">
								<button
									onClick={closeModal}
									className="absolute top-2 right-2 text-sm text-gray-500"
								>
									×
								</button>
								<img
									src={selectedImage}
									alt="Большое изображение мусора"
									className="w-[500px] h-[500px] object-contain"
								/>
							</div>
						</div>
					)}
				</div>





				<div className="bg-white p-6 rounded-xl shadow mb-6 relative">
					<h2 className="absolute top-4 left-4 text-2xl text-gray-900">Статистика по выбранному периоду</h2>
					<div className="absolute top-4 right-10 flex gap-2" style={{ width: '280px', justifyContent: 'space-between' }}>
						<DatePicker
							selected={chartStart}
							onChange={setChartStart}
							customInput={<CustomDateInput />}
							dateFormat="dd.MM.yyyy"
							selectsStart
							startDate={chartStart}
							endDate={chartEnd}
							locale="ru"
						/>
						<DatePicker
							selected={chartEnd}
							onChange={setChartEnd}
							customInput={<CustomDateInput />}
							dateFormat="dd.MM.yyyy"
							selectsEnd
							startDate={chartStart}
							endDate={chartEnd}
							locale="ru"
						/>
					</div>
					<div className="w-full h-[260px] mt-10">
						<ResponsiveContainer width="100%" height="100%">
							<LineChart data={chartData}>
								<CartesianGrid horizontal vertical={false} stroke="#eee" />
								<XAxis dataKey="day" tick={{ fill: '#636566', fontSize: 14 }} />
								<YAxis domain={[0, 10]} ticks={[0, 2, 4, 6, 8, 10]} axisLine={false} tickLine={false} tick={{ fill: '#636566', fontSize: 14 }} />
								<Tooltip content={<CustomTooltip />} />
								<Line type="monotone" dataKey="value" stroke="#9D9086" strokeWidth={2} dot={{ fill: '#9D9086' }} />
							</LineChart>
						</ResponsiveContainer>
					</div>
				</div>

				<div className="flex items-center gap-4 mb-5 relative z-10">
					<span className="font-semibold text-gray-900">Выберите тип периода:</span>
					<button
						onClick={() => setPeriodType('day')}
						className={`h-10 px-3 rounded-xl border ${periodType === 'day' ? 'bg-[#E7D6C8] text-white border-[#E7D6C8]' : 'bg-white text-black border-[#E7D6C8]'}`}
					>
						<span className="relative top-[-4px]">День</span>
					</button>
					<button
						onClick={() => setPeriodType('week')}
						className={`h-10 px-3 rounded-xl border ${periodType === 'week' ? 'bg-[#E7D6C8] text-white border-[#E7D6C8]' : 'bg-white text-black border-[#E7D6C8]'}`}
					>
						<span className="relative top-[-4px]">Неделя</span>
					</button>
					{periodType === 'day' && (
						<div className="ml-4 relative z-50">
							<DatePicker
								selected={selectedDate}
								onChange={handleDayChange}
								customInput={<CustomDateInput />}
								dateFormat="dd.MM.yyyy"
								locale="ru"
								calendarStartDay={1}
								minDate={new Date(2025, 0, 1)}
								maxDate={new Date(2025, 11, 31)}
							/>
						</div>
					)}
					{periodType === 'week' && (
						<div className="ml-4 relative z-50">
							<DatePicker
								selected={selectedWeek[0]}
								onChange={handleWeekChange}
								customInput={<CustomDateInput />}
								dateFormat="dd.MM.yyyy"
								locale="ru"
								calendarStartDay={1}
								renderDayContents={renderWeekDay}
								minDate={new Date(2025, 0, 1)}
								maxDate={new Date(2025, 11, 31)}
							/>
						</div>
					)}
				</div>

				<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
					<div className="bg-white p-5 rounded-xl shadow">
						<h2 className="text-[#636566]">Конфликты</h2>
						<p className="text-3xl font-semibold text-[#202224]">{stats.conflicts}</p>
					</div>
					<div className="bg-white p-5 rounded-xl shadow">
						<h2 className="text-[#636566]">Мусор</h2>
						<p className="text-3xl font-semibold text-[#202224]">{stats.trash}</p>
					</div>
					<div className="bg-white p-5 rounded-xl shadow">
						<h2 className="text-[#636566]">Консьерж</h2>
						<p className="text-3xl font-semibold text-[#202224]">{stats.concierge}</p>
					</div>
				</div>

				<h2 className="text-2xl mb-4 text-gray-900">Последние события</h2>
				<div className="bg-white rounded-xl shadow overflow-auto">
					<table className="w-full text-left border-collapse min-w-[500px]">
						<thead>
							<tr className="border-b border-gray-200">
								<th className="p-3 text-gray-600">Тип</th>
								<th className="p-3 text-gray-600">Лобби</th>
								<th className="p-3 text-gray-600">Время</th>
								<th className="p-3 text-gray-600">Статус</th>
							</tr>
						</thead>
						<tbody>
							{filteredEvents.length ? (
								filteredEvents.map((e) => (
									<tr key={e.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
										<td className="p-3 text-gray-900">{e.type}</td>
										<td className="p-3 text-gray-900">{e.lobby}</td>
										<td className="p-3 text-gray-900">{e.time}</td>
										<td className="p-3 text-gray-900">{e.status}</td>
									</tr>
								))
							) : (
								<tr>
									<td colSpan="4" className="text-center p-4 text-gray-500">
										Нет событий за выбранный период
									</td>
								</tr>
							)}
						</tbody>
					</table>
				</div>
			</div>

	);
};


function App() {
	const [page, setPage] = useState('dashboard');
	const [events, setEvents] = useState([
		{ id: 1, image: '/images/1.jpg', type: 'Мусор', lobby: 'Лобби 1', time: '12:00', status: '', date: '2025-12-01' },
		{ id: 2, image: '/images/2.jpg', type: 'Мусор', lobby: 'Лобби 2', time: '13:30', status: '', date: '2025-12-02' },
		{ id: 3, image: '/images/3.jpg', type: 'Мусор', lobby: 'Лобби 3', time: '09:15', status: '', date: '2025-12-03' },
		{ id: 4, image: '/images/4.jpg', type: 'Мусор', lobby: 'Лобби 1', time: '14:45', status: '', date: '2025-12-04' },
		{ id: 5, image: '/images/5.jpg', type: 'Мусор', lobby: 'Лобби 2', time: '10:20', status: '', date: '2025-12-05' },
		{ id: 6, image: '/images/6.jpg', type: 'Мусор', lobby: 'Лобби 3', time: '11:10', status: '', date: '2025-12-06' },
		{ id: 7, image: '/images/7.jpg', type: 'Мусор', lobby: 'Лобби 1', time: '16:00', status: '', date: '2025-12-07' },
		{ id: 8, image: '/images/8.jpg', type: 'Мусор', lobby: 'Лобби 2', time: '17:30', status: '', date: '2025-12-08' },
		{ id: 9, image: '/images/9.jpg', type: 'Мусор', lobby: 'Лобби 3', time: '08:50', status: '', date: '2025-12-09' },
		{ id: 10, image: '/images/10.jpg', type: 'Мусор', lobby: 'Лобби 1', time: '15:25', status: '', date: '2025-12-10' },
	]);

	const [chartStart, setChartStart] = useState(new Date('2025-12-01'));
	const [chartEnd, setChartEnd] = useState(new Date('2025-12-10'));

	return (
		<StateProvider>
			<div className="flex h-screen bg-[#F5F6FA]">

				<div className="fixed left-0 top-0 h-full w-20 bg-white z-20 flex flex-col items-center py-4 border-r border-gray-200 shadow">
					<div className="mb-8 text-center font-bold text-[#202224] text-xl">C&U</div>
					<button className="sidebar-button mb-4" onClick={() => setPage('dashboard')}>
						<Grid2x2 size={26} color={page === 'dashboard' ? '#E7D6C8' : '#B2B2B2'} />
					</button>
					<button className="sidebar-button mb-4" onClick={() => setPage('verify')}>
						<ImageUp size={26} color={page === 'verify' ? '#E7D6C8' : '#B2B2B2'} />
					</button>
					<button className="sidebar-button mb-4" onClick={() => setPage('violations')}>
						<Layers size={26} color={page === 'violations' ? '#E7D6C8' : '#B2B2B2'} />
					</button>
					<button className="sidebar-button mb-4" onClick={() => setPage('data')}>
						<PanelsTopLeft size={26} color={page === 'data' ? '#E7D6C8' : '#B2B2B2'} />
					</button>
				</div>

				<div className="flex flex-col flex-1 ml-20">

					<div className="bg-white w-full p-3 flex justify-end shadow z-10">
						<div className="text-right">
							<p className="font-bold text-gray-900">Админ</p>
							<p className="text-sm text-gray-500">Администратор</p>
						</div>
					</div>


					<div className="flex-1 p-6 overflow-auto">
						{page === 'dashboard' && (
							<Dashboard
								events={events}
								setEvents={setEvents}
								chartStart={chartStart}
								chartEnd={chartEnd}
								setChartStart={setChartStart}
								setChartEnd={setChartEnd}
							/>
						)}
						{page === 'violations' && <Filter events={events} setEvents={setEvents} />}
						{page === 'data' && <DataPage events={events} setEvents={setEvents} />}
						{page === 'verify' && <VerifyPage events={events} setEvents={setEvents} />}
					</div>
				</div>
			</div>
		</StateProvider>
	);
}

export default App;
