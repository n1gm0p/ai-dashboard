import React, { useState } from "react";

const Register = ({ onRegister, switchToLogin }) => {
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError("");
		try {
			const res = await fetch("http://localhost:5000/register", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ username, password }),
			});
			const data = await res.json();
			if (!res.ok) throw new Error(data.message);
			onRegister(data); 
		} catch (err) {
			setError(err.message);
		}
	};

	return (
		<div className="flex justify-center items-center min-h-screen bg-[#F5F6FA]">
			<form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow w-full max-w-sm">
				<h2 className="text-2xl font-bold mb-6 text-gray-900">Регистрация</h2>
				{error && <p className="text-red-500 mb-4">{error}</p>}
				<input
					type="text"
					placeholder="Username"
					value={username}
					onChange={(e) => setUsername(e.target.value)}
					className="w-full mb-4 px-4 py-2 border rounded-xl text-black placeholder-gray-400"
					required
				/>
				<input
					type="password"
					placeholder="Пароль"
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					className="w-full mb-4 px-4 py-2 border rounded-xl text-black placeholder-gray-400"
					required
				/>
				<button
					type="submit"
					className="w-full py-2 bg-[#E7D6C8] text-white rounded-xl hover:bg-[#d9c1b2] transition"
				>
					Зарегистрироваться
				</button>
				<p className="mt-4 text-sm text-gray-500">
					Уже есть аккаунт?{" "}
					<button type="button" onClick={switchToLogin} className="text-blue-500 underline">
						Войти
					</button>
				</p>
			</form>
		</div>
	);
};

export default Register;
