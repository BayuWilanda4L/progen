import axios from 'axios';
import React, { useState, useEffect, useRef, Fragment } from 'react'
import DefaultContent from './DefaultContent';

import { VscGear } from "react-icons/vsc";

import { db } from "../../config/firebase";
import { onValue, ref, set } from "firebase/database";
import Modal from 'react-bootstrap/Modal';

import OpenAILogo from "../../images/openai_logo.jpg"
import UserPhoto from "../../images/user01.gif"
import { Dialog, Menu, Transition } from '@headlessui/react'

const ChatBubble = ({ message, chatDetail }) => {
    return (
        <div className="max-w-3xl w-full mx-auto my-3">
            <div className="flex">
                <div className="flex-shrink-0 mr-4">
                    {
                        message.role == "system" ? (
                            <VscGear className='bg-white p-2 w-10 h-10 shadow-lg rounded-lg' />
                        ) : message.role == "user" ? (
                            <img
                                className="h-10 w-10 rounded-lg shadow-lg"
                                src={UserPhoto}
                                alt="Profile photo"
                            />
                        ) : (
                            <img
                                className="h-10 w-10 rounded-lg shadow-lg"
                                src={OpenAILogo}
                                alt="Profile photo"
                            />
                        )
                    }

                </div>
                <div className={`${message.role == 'user' ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg' : 'bg-white shadow-sm text-slate-700'} rounded-lg pt-3 px-4 max-w-full break-words`}>
                    {/* <p className="text-base">
                        {message.role == "system" ? "Model: " + chatDetail.model + "\n" : null}
                        {message.content}
                    </p> */}
                    <pre className='whitespace-pre-wrap text-sm'>
                        <code>
                            {message.role == "system" ? "Model: " + chatDetail.model + "\n" : null}
                            {message.content}
                        </code>
                    </pre>
                </div>
            </div>
        </div>
    );
};

const Chat = ({ idChat }) => {
    const bottomRef = useRef(null);

    const [chats, setChats] = useState([])
    const [chatDetail, setChatDetail] = useState(null)
    const [message, setMessage] = useState('');
    const [localApiKey, setLocalApiKey] = useState('')

    const [localUserEmail, setLocalUserEmail] = useState('')
    const [localUserEmailSaved, setLocalUserEmailSaved] = useState('')

    const [enterEmailModal, setEnterEmailModal] = useState(false)

    const [modalAlert, setModalAlert] = useState(false)
    const [modalAlertWrongKey, setModalAlertWrongKey] = useState(false)
    const [errorMessage, setErrorMessage] = useState("")

    useEffect(() => {
        const storedLocalApiKey = localStorage.getItem('localApiKey')
        const localApiKeySaved = JSON.parse(storedLocalApiKey)
        if (localApiKey != null) {
            setLocalApiKey(localApiKeySaved)
        }

        const storedUserEmail = localStorage.getItem('userEmail')
        if (storedUserEmail != null) {
            setLocalUserEmailSaved(storedUserEmail)
        } else {
            setLocalUserEmailSaved('')
        }

    }, [])

    useEffect(() => {
        const getChats = ref(db, 'chats/' + localUserEmailSaved);
        onValue(getChats, (snapshot) => {
            const data = snapshot.val();
            // console.log(data)
            for (let index = 0; index < data.length; index++) {
                // console.log(data[index])
                if (data[index].id == idChat) {
                    setChats(data[index].messages)
                    setChatDetail(data[index])
                }
                // const chat = data[index].id == idChat;
            }
        })
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });

        // return null
    }, [idChat])


    //UDAH BENER YAA
    const executeResponse = (_chats, _message) => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });

        if (localUserEmailSaved == null) {
            // alert("Email kamu kosong!")
            setEnterEmailModal(true)
        } else {
            setLocalUserEmailSaved(localUserEmailSaved)
            console.log(localUserEmailSaved)

            setMessage('')
            var arr = _chats
            const body = {
                role: "user",
                content: _message,
            }
            arr.push(body)

            axios.post('https://api.openai.com/v1/chat/completions', {
                model: "gpt-3.5-turbo",
                messages: arr
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': "Bearer " + localApiKey
                }
            }).then((res) => {
                console.log("BALASAN => ", JSON.stringify(res.data))

                let arr = _chats

                const body = {
                    role: res.data.choices[0].message.role,
                    content: res.data.choices[0].message.content.replace(/(<pre>|<\/pre>)/gi, "")
                }

                arr.push(body)
                setMessage(' ')

                // //update to firebase
                var newStructure = {
                    id: new Date().getTime(),
                    chatTitle: "New Chat",
                    model: "gpt-3.5-turbo",
                    systemMessage: "You are ChatGPT. A helpful assistant.",
                    messages: [
                        {
                            role: "system",
                            content: "You are ChatGPT. A helpful assistant."
                        },
                        ...arr
                    ]
                }

                if (chatDetail == null) {
                    newStructure = {
                        id: new Date().getTime(),
                        chatTitle: "New Chat",
                        model: "gpt-3.5-turbo",
                        systemMessage: "You are ChatGPT. A helpful assistant.",
                        messages: [
                            {
                                role: "system",
                                content: "You are ChatGPT. A helpful assistant."
                            },
                            ...arr
                        ]
                    }
                    console.log("chat detail null =>", newStructure)
                } else {
                    newStructure = {
                        id: chatDetail.id,
                        chatTitle: chatDetail.chatTitle,
                        model: chatDetail.model,
                        systemMessage: chatDetail.systemMessage,
                        messages: arr
                    }
                    console.log("chat detail isi =>", newStructure)

                }

                const getChats = ref(db, 'chats/' + localUserEmailSaved);
                // console.log(get)

                var indexKe
                onValue(getChats, (snapshot) => {
                    const data = snapshot.val();
                    //     console.log("execute => ", data)
                    for (let index = 0; index < data.length; index++) {
                        if (data[index].id == idChat) {
                            indexKe = index
                        }
                    }
                });

                set(ref(db, 'chats/' + localUserEmailSaved + '/' + indexKe), newStructure)

                setMessage('')
                bottomRef.current?.scrollIntoView({ behavior: 'smooth' });

            }).catch((err) => {
                console.log("error => ", err)
                setErrorMessage(err.response.data.error.message)
                setModalAlertWrongKey(true)
                // let arr = _chats.messages

                // const body = {
                //     role: "system",
                //     content: err.response.data.error.message,
                // }
                // console.log(arr)
                // setMessage(' ')
            })
        }
    }

    const handleMessageChild = (_message) => {
        setMessage(_message)
    }

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
    return (
        <div className=" dark:bg-slate-700 w-full">
            <div className="">
                {
                    // chats.length == null ? (
                    idChat == null ? (
                        <div className="max-w-3xl w-full mx-auto px-4 bottom-10 mt-2">
                            <DefaultContent
                                onMessageChild={handleMessageChild}
                            />
                            <div className="flex justify-center dark:bg-slate-600 bg-gray-200 dark:text-white text-slate-800 rounded-md">
                                <span className='py-2 font-semibold'>
                                    To start a new chat, just click the 'New Chat' button in the top-left corner!
                                </span>
                                {/* </button> */}
                            </div>

                        </div>
                    ) : (
                        <div className="">
                            <div className="max-w-3xl w-full mx-auto px-4 bottom-10 mt-2">
                                <DefaultContent
                                    onMessageChild={handleMessageChild}
                                />
                            </div>
                            {
                                (chats).map((item, index) => {
                                    return (
                                        <ChatBubble
                                            key={index}
                                            message={item}
                                            chatDetail={chatDetail}
                                        // isSent={item.type == 'send' ? true : false}
                                        />
                                    )
                                })
                            }
                            <div ref={bottomRef} />
                        </div>
                    )
                }
            </div>
            <Modal show={enterEmailModal} onHide={handleEnterEmailModalClose}>
                <div className="px-6 bg-slate-700 py-4 rounded-md">
                    <label className='font-bold text-sm w-full text-white'>Email address</label>
                    <input
                        value={localUserEmail}
                        onChange={e => setLocalUserEmail(e.target.value)}
                        placeholder='Your email address here'
                        className='w-full cursor-pointer bg-transparent text-white text-sm text-left mt-2 py-2 px-4 rounded outline outline-1'
                    />
                    <div className='text-xs text-gray-300 my-3'>
                        Why do we need your email? Well, we use it to identify you and load up your chat history! But don't worry, your API key and license are still safely stored in your browser.
                    </div>
                    <div className='justify-center items-center'>
                        <button
                            onClick={() => saveUserEmail(localUserEmail)}
                            className='w-full text-white rounded-md bg-gradient-to-r from-blue-500 to-cyan-500 py-2 px-4'
                        >
                            Save
                        </button>
                    </div>
                </div>
            </Modal>

            <Transition appear show={modalAlert} as={Fragment}>
                <Dialog as="div" className="relative z-10" onClose={() => setModalAlert(true)}>
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
                                        Warning!
                                    </Dialog.Title>
                                    <div className="mt-2">
                                        <p className="text-sm text-gray-500">
                                            You need to enter the OpenAI API key.
                                        </p>
                                    </div>

                                    <div className="mt-4">
                                        <button
                                            type="button"
                                            className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                                            onClick={() => {setModalAlert(false)}}
                                        >
                                            Okay
                                        </button>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>

            <Transition appear show={modalAlertWrongKey} as={Fragment}>
                <Dialog as="div" className="relative z-10" onClose={() => setModalAlertWrongKey(false)}>
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
                                        Error!
                                    </Dialog.Title>
                                    <div className="mt-2">
                                        <p className="text-sm text-gray-500">
                                            {errorMessage}
                                        </p>
                                    </div>

                                    <div className="mt-4">
                                        <button
                                            type="button"
                                            className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                                            onClick={() => {setModalAlertWrongKey(false)}}
                                        >
                                            Okay
                                        </button>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>

            {
                idChat == null ? null : (
                    <footer className='sticky text-blue-500 left-0 bottom-0 justify-center items-center w-full'>
                        <div className="max-w-3xl w-full mx-auto">
                            <div className='flex'>
                                <input
                                    disabled={idChat == null ? true : false}
                                    value={message}
                                    onChange={text => setMessage(text.target.value)}
                                    className="w-full h-10 py-2 px-4 rounded outline outline-1 outline-gray-300 dark:outline-slate-600 bg-white dark:bg-slate-700 text-slate-800"
                                    rows={2}
                                />
                                <button
                                    disabled={idChat == null ? true : false}
                                    onClick={
                                        localApiKey !== '' ?
                                            () => {
                                                executeResponse(chats, message)
                                            }
                                            : () => setModalAlert(true)
                                    }
                                    className="h-10 py-2 px-4 ml-4 rounded-md outline outline-1 outline-gray-300 bg-white dark:bg-slate-700 text-slate-800"
                                >
                                    Send
                                </button>
                            </div>
                        </div >

                    </footer >
                )
            }

        </div >

    )
}

export default Chat
