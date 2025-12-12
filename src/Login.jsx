import React, { useState } from "react";

const Login = ({ onLogin, switchToRegister }) => {
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError("");
		try {
			const res = await fetch("http://localhost:5000/login", {  
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ username, password }),  
			});
			const data = await res.json();  
			if (!res.ok) throw new Error(data.message);
			onLogin(data); 
		} catch (err) {
			setError(err.message);
		}
	};

	return (
		<div className="flex justify-center items-center min-h-screen bg-[#F5F6FA]">
			<form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow w-full max-w-sm">
				<h2 className="text-2xl font-bold mb-6 text-gray-900">Вход</h2>
				{error && <p className="text-red-500 mb-4">{error}</p>}
				<input
					type="text"
					placeholder="Username"
					value={username}
					onChange={e => setUsername(e.target.value)}
					className="w-full mb-4 px-4 py-2 border rounded-xl text-black placeholder-gray-400"
					required
				/>
				<input
					type="password"
					placeholder="Пароль"
					value={password}
					onChange={e => setPassword(e.target.value)}
					className="w-full mb-4 px-4 py-2 border rounded-xl text-black placeholder-gray-400"
					required
				/>
				<button
					type="submit"
					className="w-full py-2 bg-[#E7D6C8] text-white rounded-xl hover:bg-[#d9c1b2] transition"
				>
					Войти
				</button>
				<p className="mt-4 text-sm text-gray-500">
					Нет аккаунта?{" "}
					<button type="button" onClick={switchToRegister} className="text-blue-500 underline">
						Зарегистрироваться
					</button>
				</p>
			</form>
		</div>
	);
};

export default Login;
