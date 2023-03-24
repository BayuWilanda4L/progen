import React, { useState } from 'react';

import Sidebar from '../partials/Sidebar';
import Header from '../partials/Header';
import Chat from '../partials/dashboard/Chat';

function Dashboard() {

	const [sidebarOpen, setSidebarOpen] = useState(false);
	const [loadedMessage, setLoadedMessage] = useState(null)
	const [messageDetail, setMessageDetail] = useState(null)

	const handleLoadMessage = (_idMessage) => {
		setLoadedMessage(_idMessage)
	}

	const handleMessageDetail = (_messageDetail) => {
		setMessageDetail(_messageDetail)
	}

	return (
		<div className="flex h-screen overflow-hidden">

			{/* Sidebar */}
			<Sidebar
				sidebarOpen={sidebarOpen}
				setSidebarOpen={setSidebarOpen}
				onMessageLoad={handleLoadMessage}
				onMessageDetail={handleMessageDetail}
			/>

			{/* Content area */}
			<div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden dark:bg-slate-700">

				{/*  Site header */}
				<Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} loadedMessageDetail={messageDetail}/>

				<main>
					<Chat
						idChat={loadedMessage}
					/>
				</main>

			</div>
		</div>
	);
}

export default Dashboard;