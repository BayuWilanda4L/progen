// import axios from 'axios';
import React, { Fragment, useEffect, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'


const DefaultContent = (props) => {
    const [apiKeyModalShown, setApiKeyModalShown] = useState(false)

    const [localApiKey, setLocalApiKey] = useState('')
    const [apiKey, setApiKey] = useState('')

    const maskingKey = (_apiKey) => {
        const firstPart = _apiKey.substring(0, 3); // get characters before position 4
        const middlePart = _apiKey.substring(3, 48).replace(/./g, '*'); // get characters 4 to 48 and replace them with *
        const lastPart = _apiKey.substring(48); // get characters after position 48

        const maskedKey = firstPart + middlePart + lastPart;

        return maskedKey
    }

    const saveApiKey = (_apiKey) => {
        localStorage.setItem('localApiKey', JSON.stringify(_apiKey))

        setApiKeyModalShown(false)
        setLocalApiKey(maskingKey(_apiKey))
        window.location.reload(false);
    }

    useEffect(() => {
        const storedLocalApiKey = localStorage.getItem('localApiKey')
        const localApiKeySaved = JSON.parse(storedLocalApiKey)

        const storedLocalLicenseKey = localStorage.getItem('localLicenseKey')
        const localLicenseKeySaved = JSON.parse(storedLocalLicenseKey)

        if (localApiKeySaved != null) {
            setLocalApiKey(maskingKey(localApiKeySaved))
        }

        if (localLicenseKeySaved != null) {
            console.log("LICENSE KEY => ", localLicenseKeySaved)
            setLocalLicenseKey(maskingKey(localLicenseKeySaved))
        }
    }, [])

    return (
        <div>
            <div className='mt-4'>
                <div className='flex items-center justify-center'>
                    <h1 className='text-slate-800 dark:text-white text-center text-5xl'>Pro</h1>
                    <div className="bg-gradient-to-r from-blue-500 to-cyan-500 text-transparent bg-clip-text">
                        <h1 className='text-5xl text-center font-semibold'>Gen</h1>
                    </div>
                    <button
                        disabled
                        className='flex shadow-md text-white rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 ml-2 py-1 px-3 text-xs'
                    >
                        <span>
                            Alpha
                        </span>
                    </button>
                </div>
                <p className='text-base font-thin text-slate-800 dark:text-white text-center mt-2 mb-2'>
                    Utilize Advanced AI Technology with ProGen
                </p>
            </div>

            <div className='w-64 justify-center items-center mx-auto mt-5'>
                <ul role="list" className="text-left  mx-auto">
                    <li className="flex space-x-3">
                        <svg className="flex-shrink-0 w-5 h-5 text-green-500 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                        </svg>
                        <span className='dark:text-white text-slate-800'>Free (bring your own key)</span>
                    </li>
                    <li className="flex space-x-3">
                        <svg className="flex-shrink-0 w-5 h-5 text-green-500 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                        </svg>
                        <span className='dark:text-white text-slate-800 '>Faster response</span>
                    </li>
                    <li className="flex items-center space-x-3">
                        <svg className="flex-shrink-0 w-5 h-5 text-green-500 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                        </svg>
                        <span className='dark:text-white text-slate-800'>No monthly fee</span>
                    </li>
                </ul>
            </div>

            <div className='my-5'>
                <p className='text-base font-light text-sm text-slate-800 dark:text-white text-center mt-2 mb-2'>
                    To get started, you need OpenAI API Key.
                </p>
                <div className="flex justify-center">
                    <button
                        onClick={() => setApiKeyModalShown(true)}
                        className='flex shadow-md text-white rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 mr-2 py-2 px-4 text-sm'

                    >
                        <span className='truncate text-center'>
                            {localApiKey !== '' ? localApiKey : 'Enter API Key'}
                        </span>
                    </button>
                </div>

                <p className='text-xs text-slate-800 dark:text-white text-center mt-2 mb-2'>
                    Your API Key is stored locally on your browser and never sent anywhere else.
                </p>

            </div>

            <Transition appear show={apiKeyModalShown} as={Fragment}>
                <Dialog as="div" className="relative z-10" onClose={() => setApiKeyModalShown(false)}>
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
                                        Enter you API Key
                                    </Dialog.Title>
                                    <div className="mt-2">
                                        <input
                                            value={apiKey}
                                            onChange={e => setApiKey(e.target.value)}
                                            placeholder='sk-***************'
                                            className='w-full bg-white hover:bg-gray-200  text-slate-800 text-left py-2 px-4 rounded outline outline-1 outline-gray-300 '
                                        />
                                        <div className="mt-2">
                                            <p className="text-sm text-gray-500">
                                                If you already have an API key saved, replacing it will overwrite the old key with the new one.
                                                <br />
                                                <a href='https://platform.openai.com/account/api-keys' target="_blank" className='text-sm text-lime-600 text-semibold underline'>
                                                    Get your API key from Open AI dashboard.
                                                </a>
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-4">
                                        <button
                                            type="button"
                                            className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                                            onClick={() => saveApiKey(apiKey)}
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

        </div>
    )
}

export default DefaultContent