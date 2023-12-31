'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSignUp } from '@clerk/nextjs';

const RegistrationPage = () => {
	const { isLoaded, signUp, setActive } = useSignUp();
	const [email, setEmail] = useState('');
	const [firstName, setFirstName] = useState('');
	const [lastName, setLastName] = useState('');
	const [password, setPassword] = useState('');
	const [pendingVerification, setPendingVerification] = useState(false);
	const [code, setCode] = useState('');
	const router = useRouter();

	/* form submit start */
	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault();

		if (!isLoaded) {
			return;
		}

		try {
			await signUp.create({
				firstName: firstName,
				lastName: lastName,
				emailAddress: email,
				password,
			});

			/* send the email */
			await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });

			/* change the UI to our pending section */
			setPendingVerification(true);
		} catch (err) {
			console.error(err);
		}
	};
	/* form submit end */

	/* verify user email code start */
	const onPressVerify = async (e: FormEvent) => {
		e.preventDefault();
		if (!isLoaded) {
			return;
		}

		try {
			const completeSignUp = await signUp.attemptEmailAddressVerification({
				code,
			});

			if (completeSignUp.status !== 'complete') {
				/* investigate the response, see if there was an error or if the user needs to complete the process */
				console.log(JSON.stringify(completeSignUp, null, 2));
			}

			if (completeSignUp.status === 'complete') {
				await setActive({ session: completeSignUp.createdSessionId });
				router.push('/');
			}
		} catch (err) {
			console.error(JSON.stringify(err, null, 2));
		}
	};
	/* verify user email code end */

	return (
		<div className="border p-5 rounded" style={{ width: '500px' }}>
			<h1 className="text-2xl mb-4">Register</h1>

			{!pendingVerification && (
				<form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
					<div>
						<label htmlFor="firstName" className="block mb-2 text-sm font-medium">
							First Name
						</label>
						<input
							type="text"
							name="firstName"
							id="firstName"
							onChange={(e) => setFirstName(e.target.value)}
							className="bg-gray-50 border border-gray-300 sm:text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5"
							required={true}
						/>
					</div>

					<div>
						<label htmlFor="lastName" className="block mb-2 text-sm font-medium">
							Last Name
						</label>
						<input
							type="text"
							name="lastName"
							id="lastName"
							onChange={(e) => setLastName(e.target.value)}
							className="bg-gray-50 border border-gray-300 sm:text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5"
							required={true}
						/>
					</div>

					<div>
						<label htmlFor="email" className="block mb-2 text-sm font-medium">
							Email Address
						</label>
						<input
							type="email"
							name="email"
							id="email"
							onChange={(e) => setEmail(e.target.value)}
							className="bg-gray-50 border border-gray-300 sm:text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5"
							placeholder="name@company.com"
							required={true}
						/>
					</div>

					<div>
						<label htmlFor="password" className="block mb-2 text-sm font-medium">
							Password
						</label>
						<input
							type="password"
							name="password"
							id="password"
							onChange={(e) => setPassword(e.target.value)}
							className="bg-gray-50 border border-gray-300 sm:text-sm rounded-lg block w-full p-2.5"
							required={true}
						/>
					</div>

					<button
						type="submit"
						className="w-full text-white bg-sky-800 hover:bg-sky-900 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
					>
						Create an account
					</button>
				</form>
			)}

			{pendingVerification && (
				<div>
					<form className="space-y-4 md:space-y-6">
						<input
							value={code}
							className="bg-gray-50 border border-gray-300 sm:text-sm rounded-lg block w-full p-2.5"
							placeholder="Enter Verification Code..."
							onChange={(e) => setCode(e.target.value)}
						/>
						<button
							type="submit"
							onClick={onPressVerify}
							className="w-full text-white bg-sky-800 hover:bg-sky-900 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
						>
							Verify Email
						</button>
					</form>
				</div>
			)}
		</div>
	);
};

export default RegistrationPage;
