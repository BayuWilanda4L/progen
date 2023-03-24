import axios from 'axios';
import React, { useState, useEffect, useRef, Fragment } from 'react';
import Models from '../Data/Models';
import { BsPlus, BsChatRightDots } from "react-icons/bs";
import { VscGear, VscChevronDown, VscEdit, VscTrash, VscTextSize, VscSignOut } from "react-icons/vsc";

import { db } from "../config/firebase";
import { onValue, ref, set } from "firebase/database";
import Dropdown from 'react-bootstrap/Dropdown';
import Modal from 'react-bootstrap/Modal';
import { Dialog, Menu, Transition } from '@headlessui/react'

// import SidebarLinkGroup from './SidebarLinkGroup';

function Sidebar({ sidebarOpen, setSidebarOpen, onMessageLoad, onMessageDetail }) {

	function handleMessageLoad(_idMessage) {
		onMessageLoad(_idMessage)
	}

	function handleMessageDetail(_messageDetail) {
		console.log("handleMessageDetail => ", _messageDetail)
		onMessageDetail(_messageDetail)
	}

	const initChat =
	{
		id: new Date().getTime(),
		chatTitle: "New Chat",
		model: "gpt-3.5-turbo",
		systemMessage: "You are ChatGPT. A helpful assistant.",
		messages: [
			{
				role: "system",
				content: "You are ChatGPT. A helpful assistant."
			},
		]
	}


	const [temperature, setTemperature] = useState(50)

	const trigger = useRef(null);
	const sidebar = useRef(null);

	const [selectedOption, setSelectedOption] = useState("chat");

	const storedSidebarExpanded = localStorage.getItem('sidebar-expanded');
	const [sidebarExpanded, setSidebarExpanded] = useState(storedSidebarExpanded === null ? false : storedSidebarExpanded === 'true');

	const [localApiKey, setLocalApiKey] = useState('')
	const [openAIModels, setOpenAIModels] = useState([])

	const [chatTitle, setChatTitle] = useState("")
	const [chatId, setChatId] = useState()

	const [chatList, setChatList] = useState([]);
	const [userEmail, setUserEmail] = useState("")

	const [detail, setDetail] = useState(null)

	const [enterEmailModal, setEnterEmailModal] = useState(false)

	const handleChange = (event) => {
		setSelectedOption(event.target.value);
	};

	const handleEnterEmailModalClose = () => setEnterEmailModal(false);

	const saveUserEmail = (_userEmail) => {
		if (_userEmail.length > 6) {
			let result = _userEmail.replace("-", "");
			result = result.replace(".", "");
			result = result.replace("@", "");
			// alert(result)
			localStorage.setItem('userEmail', result)
			setEnterEmailModal(false)
			window.location.reload(false);
		} else {
			alert("Invalid email!")
		}

	}

	const createNewChat = () => {
		const storedUserEmail = localStorage.getItem('userEmail')

		if (storedUserEmail == null) {
			setEnterEmailModal(true)
		} else {
			// set(ref(db, 'chats/' + storedUserEmail), [...chatList, initChat]).then((res) => {
			// 	console.log("HABIS NAMBABH CHAT => ", res)
			// })
			set(ref(db, 'chats/' + storedUserEmail), [
				...chatList,
				initChat
			]).then((res) => {
				const getChats = ref(db, 'chats/' + storedUserEmail);
				onValue(getChats, (snapshot) => {
					const data = snapshot.val();
					// console.log("yukk pindah ", data[data.length-1].id)
					handleMessageLoad(data[data.length - 1].id)
				});
			}).catch((error) => {
				alert("gagal", err)
				// The write failed...
			});
		}
	}

	// close on click outside
	useEffect(() => {
		const clickHandler = ({ target }) => {
			if (!sidebar.current || !trigger.current) return;
			if (!sidebarOpen || sidebar.current.contains(target) || trigger.current.contains(target)) return;
			setSidebarOpen(false);
		};
		document.addEventListener('click', clickHandler);
		return () => document.removeEventListener('click', clickHandler);
	});

	// close if the esc key is pressed
	useEffect(() => {
		const keyHandler = ({ keyCode }) => {
			if (!sidebarOpen || keyCode !== 27) return;
			setSidebarOpen(false);
		};
		document.addEventListener('keydown', keyHandler);
		return () => document.removeEventListener('keydown', keyHandler);
	});

	useEffect(() => {
		localStorage.setItem('sidebar-expanded', sidebarExpanded);
		if (sidebarExpanded) {
			document.querySelector('body').classList.add('sidebar-expanded');
		} else {
			document.querySelector('body').classList.remove('sidebar-expanded');
		}
	}, [sidebarExpanded]);

	useEffect(() => {
		// const storedUserEmail = localStorage.getItem('userEmail')
		const storedUserEmail = localStorage.getItem('userEmail')

		const getChats = ref(db, 'chats/' + storedUserEmail);
		onValue(getChats, (snapshot) => {
			const data = snapshot.val();
			// console.log(data)
			if (data == null) {
				// set(ref(db, 'chats/' + storedUserEmail), [initChat]);
				// 	setChatList([initChat])
			} else {
				setChatList(data)
			}
		});
	}, []);

	useEffect(() => {
		const storedLocalApiKey = localStorage.getItem('localApiKey')
		const localApiKeySaved = JSON.parse(storedLocalApiKey)

		if (localApiKeySaved != null) {
			setLocalApiKey(localApiKeySaved)

			// axios.get('https://api.openai.com/v1/models', {
			// 	headers: {
			// 		'Content-Type': 'application/json',
			// 		'Authorization': "Bearer " + localApiKeySaved
			// 	}
			// 	// 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 CHAR=51
			// }).then((res) => {
			// 	// console.log(JSON.stringify(res.data.data))
			// 	setOpenAIModels(res.data.data)
			// }).catch((err) => {
			// 	console.log("error => ", err.response.data.error.message)
			// 	setOpenAIModels(Models)
			// })
			setOpenAIModels(Models)
		} else {
			setOpenAIModels(Models)
		}

	}, [])

	const [showRenameModal, setShowRenameModal] = useState(false);
	const [showDeleteChatModal, setShowDeleteChatModal] = useState(false);

	const renameTitle = (_id, _title, _messageDetail) => {
		// console.log(_id)
		setChatTitle(_title)
		setChatId(_id)
		setShowRenameModal(true)
		setDetail(_messageDetail)
	}
	const saveTitle = (_id, _newTitle, _messageDetail) => {
		const storedUserEmail = localStorage.getItem('userEmail')
		console.log("HALLOO => ", chatTitle)

		const newDetail = {
			id: _messageDetail.id,
			chatTitle: chatTitle,
			model: _messageDetail.model,
			systemMessage: _messageDetail.systemMessage,
			messages: _messageDetail.messages
		}

		handleMessageDetail(newDetail)

		const getChats = ref(db, 'chats/' + storedUserEmail);
		onValue(getChats, (snapshot) => {
			const data = snapshot.val();
			// console.log("save title => ", _id)
			for (let index = 0; index < data.length; index++) {
				if (data[index].id == _id) {
					set(ref(db, 'chats/' + storedUserEmail + '/' + index), {
						id: _id,
						chatTitle: _newTitle,
						model: "gpt-3.5-turbo",
						systemMessage: "You are ChatGPT. A helpful assistant.",
						messages: data[index].messages
					})
				}
			}
		});

		handleRenameModalClose()
	}

	const deleteChatModal = (_id) => {
		setShowDeleteChatModal(true)
		setChatId(_id)
	}

	const deleteChat = (_id) => {
		// alert(_id)
		const storedUserEmail = localStorage.getItem('userEmail')

		var arr = []

		const getChats = ref(db, 'chats/' + storedUserEmail);
		onValue(getChats, (snapshot) => {
			const data = snapshot.val();
			for (let index = 0; index < data.length; index++) {
				if (data[index].id !== _id) {
					arr.push(data[index])
				}
			}
		});

		// console.log(arr)
		set(ref(db, 'chats/' + storedUserEmail), arr);

		handleDeleteChatModalClose()
	}

	const handleRenameModalClose = () => setShowRenameModal(false);
	const handleDeleteChatModalClose = () => setShowDeleteChatModal(false);
	// const handleRenameModalShow = () => setShowRenameModal(true);

	return (
		<div>
			{/* Sidebar backdrop (mobile only) */}
			<div
				className={`fixed inset-0 border-l-white bg-slate-900 bg-opacity-30 z-40 lg:hidden lg:z-auto transition-opacity duration-200 ${sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
					}`}
				aria-hidden="true"
			></div>

			{/* Sidebar */}
			<div
				id="sidebar"
				ref={sidebar}
				className={`border-r-2 border-[#81BB94] flex flex-col absolute z-40 left-0 top-0 lg:static lg:left-auto lg:top-auto lg:translate-x-0 h-screen overflow-y-scroll lg:overflow-y-auto no-scrollbar w-64 lg:w-20 lg:sidebar-expanded:!w-64 2xl:!w-64 shrink-0 bg-[#1F2937] transition-all duration-200 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-64'
					}`}
			>
				{/* Sidebar header */}
				<div className="flex justify-between mb-10 pr-3 sm:px-2">
					{/* Close button */}
					<button
						ref={trigger}
						className="lg:hidden text-slate-500 hover:text-slate-400"
						onClick={() => setSidebarOpen(!sidebarOpen)}
						aria-controls="sidebar"
						aria-expanded={sidebarOpen}
					>
						<span className="sr-only">Close sidebar</span>
						<svg className="w-6 h-6 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
							<path d="M10.7 18.7l1.4-1.4L7.8 13H20v-2H7.8l4.3-4.3-1.4-1.4L4 12z" />
						</svg>
					</button>
					{/* Logo */}
					{/* <NavLink end to="/" className="block">
						<svg width="32" height="32" viewBox="0 0 32 32">
							<defs>
								<linearGradient x1="28.538%" y1="20.229%" x2="100%" y2="108.156%" id="logo-a">
									<stop stopColor="#A5B4FC" stopOpacity="0" offset="0%" />
									<stop stopColor="#A5B4FC" offset="100%" />
								</linearGradient>
								<linearGradient x1="88.638%" y1="29.267%" x2="22.42%" y2="100%" id="logo-b">
									<stop stopColor="#38BDF8" stopOpacity="0" offset="0%" />
									<stop stopColor="#38BDF8" offset="100%" />
								</linearGradient>
							</defs>
							<rect fill="#6366F1" width="32" height="32" rx="16" />
							<path d="M18.277.16C26.035 1.267 32 7.938 32 16c0 8.837-7.163 16-16 16a15.937 15.937 0 01-10.426-3.863L18.277.161z" fill="#4F46E5" />
							<path
								d="M7.404 2.503l18.339 26.19A15.93 15.93 0 0116 32C7.163 32 0 24.837 0 16 0 10.327 2.952 5.344 7.404 2.503z"
								fill="url(#logo-a)"
							/>
							<path
								d="M2.223 24.14L29.777 7.86A15.926 15.926 0 0132 16c0 8.837-7.163 16-16 16-5.864 0-10.991-3.154-13.777-7.86z"
								fill="url(#logo-b)"
							/>
						</svg>
					</NavLink> */}
				</div>

				{/* Links */}
				<div className="space-y-8">
					{/* Pages group */}
					<div>
						{/* New Chat */}
						<div className="px-3 py-2 rounded-sm mb-0.5 last:mb-0">
							<button
								onClick={() => createNewChat()}
								className="flex items-center w-full bg-transparent hover:bg-gray-700 text-white text-sm text-left py-2 px-4 rounded outline outline-2 outline-[#81BB94]"
							>
								<BsPlus size={24} />
								&nbsp; New Chat
							</button>
							<Modal show={enterEmailModal} onHide={handleEnterEmailModalClose}>
								<div className="px-6 bg-slate-700 py-4 rounded-md">
									<label className='font-bold text-sm w-full text-white'>Email address</label>
									<input
										value={userEmail}
										onChange={e => setUserEmail(e.target.value)}
										placeholder='Your email address here'
										className='w-full cursor-pointer bg-transparent text-white text-sm text-left mt-2 py-2 px-4 rounded outline outline-1'
									/>
									<div className='text-xs text-gray-300 my-3'>
										Why do we need your email? Well, we use it to identify you and load up your chat history! But don't worry, your API key and license are still safely stored in your browser.
									</div>
									<div className='justify-center items-center'>
										<button
											onClick={() => saveUserEmail(userEmail)}
											className='w-full text-white rounded-md bg-gradient-to-r from-blue-500 to-cyan-500 py-2 px-4'
										>
											Save
										</button>
									</div>
								</div>
							</Modal>
						</div>

						<div>
							<h3 className="flex justify-between text-xs uppercase text-slate-500 font-semibold pl-3 mt-4 ">
								<span className="hidden lg:block lg:sidebar-expanded:hidden 2xl:hidden text-center w-6" aria-hidden="true">
									•••
								</span>
								<span className="lg:hidden lg:sidebar-expanded:block 2xl:block">Chats</span>
								{/* <a href='#' onClick={() => { localStorage.removeItem('userEmail'); window.location.reload(false) }} className="lg:hidden text-xs text-white lg:sidebar-expanded:block 2xl:block">Logout</a> */}
							</h3>
							{
								chatList.length != 0 ?
									chatList.map((item, index) => {
										return (
											<div key={index} className="flex px-3 py-1 rounded-sm mb-0.5 last:mb-0">
												<Menu as="div" className="relative inline-block text-left">
													<div className='flex w-56 justify-between items-center rounded-md bg-black bg-opacity-20 px-4 py-2 text-sm font-medium text-white hover:bg-opacity-30 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75'>
														<span
															onClick={() => {
																handleMessageLoad(item.id)
																handleMessageDetail(item)
															}}
															className="cursor-pointer"
														>
															{item.chatTitle}
														</span>
														<Menu.Button className="">
															<VscChevronDown
																className="ml-2 -mr-1 h-5 w-5 text-violet-200 hover:text-violet-100"
																aria-hidden="true"
															/>
														</Menu.Button>
													</div>
													<Transition
														as={Fragment}
														enter="transition ease-out duration-100"
														enterFrom="transform opacity-0 scale-95"
														enterTo="transform opacity-100 scale-100"
														leave="transition ease-in duration-75"
														leaveFrom="transform opacity-100 scale-100"
														leaveTo="transform opacity-0 scale-95"
													>
														<Menu.Items className="absolute z-10 right-0 mt-2 w-full origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
															<div className="px-1 py-1 ">
																<Menu.Item>
																	{({ active }) => (
																		<button
																			onClick={() => renameTitle(item.id, item.chatTitle, item)}
																			className={`${active ? 'bg-gray-200 text-slate-800' : 'text-gray-900'
																				} group flex w-full items-center rounded-md px-2 py-2 text-sm text-blue-500`}
																		>
																			{active ? (
																				<VscTextSize
																					className="mr-2 h-5 w-5"
																					aria-hidden="true"
																				/>
																			) : (
																				<VscTextSize
																					className="mr-2 h-5 w-5"
																					aria-hidden="true"
																				/>
																			)}
																			Rename
																		</button>
																	)}
																</Menu.Item>
																<Menu.Item>
																	{({ active }) => (
																		<button
																			onClick={() => deleteChatModal(item.id)}
																			className={`${active ? 'bg-red-500 text-white' : 'text-gray-900'
																				} group flex w-full items-center rounded-md px-2 py-2 text-sm text-blue-500`}
																		>
																			{active ? (
																				<VscTrash
																					className="mr-2 h-5 w-5"
																					aria-hidden="true"
																				/>
																			) : (
																				<VscTrash
																					className="mr-2 h-5 w-5"
																					aria-hidden="true"
																				/>
																			)}
																			Delete
																		</button>
																	)}
																</Menu.Item>
															</div>
														</Menu.Items>
													</Transition>
												</Menu>

												<Transition appear show={showRenameModal} as={Fragment}>
													<Dialog as="div" className="relative z-10" onClose={() => handleRenameModalClose}>
														<Transition.Child
															as={Fragment}
															enter="ease-out duration-300"
															enterFrom="opacity-0"
															enterTo="opacity-100"
															leave="ease-in duration-200"
															leaveFrom="opacity-100"
															leaveTo="opacity-0"
														>
															<div className="fixed inset-0 bg-black bg-opacity-25" />
														</Transition.Child>

														<div className="fixed inset-0 overflow-y-auto">
															<div className="flex min-h-full items-center justify-center p-4 text-center">
																<Transition.Child
																	as={Fragment}
																	enter="ease-out duration-300"
																	enterFrom="opacity-0 scale-95"
																	enterTo="opacity-100 scale-100"
																	leave="ease-in duration-200"
																	leaveFrom="opacity-100 scale-100"
																	leaveTo="opacity-0 scale-95"
																>
																	<Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
																		<Dialog.Title
																			as="h3"
																			className="text-lg font-medium leading-6 text-gray-900"
																		>
																			Rename chat title
																		</Dialog.Title>
																		<div className="mt-2">
																			<input
																				value={chatTitle}
																				onChange={e => setChatTitle(e.target.value)}
																				placeholder=''
																				className='w-full bg-white hover:bg-gray-200  text-slate-800 text-left py-2 px-4 rounded outline outline-1 outline-gray-300 '
																			/>
																		</div>

																		<div className="mt-4">
																			<button
																				type="button"
																				className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
																				// onClick={handleRenameModalClose}
																				onClick={() => saveTitle(chatId, chatTitle, detail)}
																			>
																				Save
																			</button>
																		</div>
																	</Dialog.Panel>
																</Transition.Child>
															</div>
														</div>
													</Dialog>
												</Transition>

												<Transition appear show={showDeleteChatModal} as={Fragment}>
													<Dialog as="div" className="relative z-10" onClose={handleDeleteChatModalClose}>
														<Transition.Child
															as={Fragment}
															enter="ease-out duration-300"
															enterFrom="opacity-0"
															enterTo="opacity-100"
															leave="ease-in duration-200"
															leaveFrom="opacity-100"
															leaveTo="opacity-0"
														>
															<div className="fixed inset-0 bg-black bg-opacity-25" />
														</Transition.Child>

														<div className="fixed inset-0 overflow-y-auto">
															<div className="flex min-h-full items-center justify-center p-4 text-center">
																<Transition.Child
																	as={Fragment}
																	enter="ease-out duration-300"
																	enterFrom="opacity-0 scale-95"
																	enterTo="opacity-100 scale-100"
																	leave="ease-in duration-200"
																	leaveFrom="opacity-100 scale-100"
																	leaveTo="opacity-0 scale-95"
																>
																	<Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
																		<Dialog.Title
																			as="h3"
																			className="text-lg font-medium leading-6 text-gray-900"
																		>
																			Delete chat
																		</Dialog.Title>
																		<div className="mt-2">
																			<p className="text-sm text-gray-500">
																				This will delete this chat permanently. You cannot undo this action.
																			</p>
																		</div>

																		<div className="mt-4">
																			<button
																				type="button"
																				className="inline-flex justify-center rounded-md border border-transparent bg-red-100 px-4 py-2 text-sm font-medium text-red-900 hover:bg-red-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
																				onClick={() => deleteChat(chatId)}
																			>
																				Delete
																			</button>
																		</div>
																	</Dialog.Panel>
																</Transition.Child>
															</div>
														</div>
													</Dialog>
												</Transition>

											</div>
										)
									})
									: (
										<div>
											<p className="px-3 text-slate-400 text-xs">
												No chat yet. Make a new chat by enter you email address then click the New Chat button above.
											</p>
										</div>
									)
							}
						</div>
					</div>
				</div>

				{/* Expand / collapse button */}
				<div className="pt-3 hidden lg:inline-flex 2xl:hidden justify-end mt-auto">
					<div className="px-3 py-2">
						<button onClick={() => setSidebarExpanded(!sidebarExpanded)}>
							<span className="sr-only">Expand / collapse sidebar</span>
							<svg className="w-6 h-6 fill-current sidebar-expanded:rotate-180" viewBox="0 0 24 24">
								<path className="text-slate-400" d="M19.586 11l-5-5L16 4.586 23.414 12 16 19.414 14.586 18l5-5H7v-2z" />
								<path className="text-slate-600" d="M3 23H1V1h2z" />
							</svg>
						</button>
					</div>
				</div>

				{/* <div className='fixed bottom-0'> */}
				<div className="px-3 py-2 rounded-sm mb-0.5 last:mb-0">
					<div className='fixed bottom-4 w-56'>

						<button
							onClick={() => { localStorage.removeItem('userEmail'); window.location.reload(false) }}
							className="flex items-center justify-between w-full bg-transparent hover:bg-gray-700 text-white text-sm text-left py-2 px-4 rounded outline outline-2 outline-[#81BB94]"
						>
							<span>
								Logout
							</span>
							<span>
								<VscSignOut size={20} />
							</span>
						</button>
					</div>
				</div>
				{/* </div> */}
			</div>
		</div >
	);
}

export default Sidebar;
