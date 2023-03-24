import React, { useEffect, useState } from 'react';
import { BsFillMoonStarsFill, BsFillSunFill } from "react-icons/bs";

function Header({
    sidebarOpen,
    setSidebarOpen,
    loadedMessageDetail
}) {
    const [theme, setTheme] = useState("light")
    const element = document.documentElement

    useEffect(() => {
        const themeSaved = localStorage.getItem('theme');

        console.log("side bar => ", sidebarOpen)

        if (themeSaved == null) {
            setTheme("light")
            localStorage.setItem("theme", "light");
        } else {
            if (themeSaved == "light") {
                element.classList.remove("dark")
            } else {
                element.classList.add("dark")
            }
        }
    }, [])

    const changeTheme = (_theme) => {
        if (_theme == "dark") {
            setTheme("dark")
            element.classList.add("dark")
            localStorage.setItem("theme", "dark");
        } else {
            setTheme("light")
            element.classList.remove("dark")
            localStorage.setItem("theme", "light");
        }
    }


    return (
        <header className="dark:bg-slate-800 bg-white sticky top-0 z-30 shadow-md"> {/* bg-slate-800 */}
            <div className="flex justify-between items-center dark:bg-slate-800 px-4 py-2">
                <div className="flex items-center">
                    {/* left component */}
                    <button className="py-2 bg-transparent dark:bg-slate-800 text-transparent dark:text-slate-800" disabled>
                        Left
                    </button>

                    <button
                        className="text-slate-500 hover:text-slate-600 lg:hidden px-2 py-2 mr-10 bg-gray-200 dark:bg-slate-700 rounded-md absolute"
                        aria-controls="sidebar"
                        aria-expanded={sidebarOpen}
                        onClick={(e) => { e.stopPropagation(); setSidebarOpen(!sidebarOpen); }}
                    >
                        <span className="sr-only">Open sidebar</span>
                        <svg className="w-6 h-6 fill-[#81BB94]" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <rect x="4" y="5" width="17" height="2" />
                            <rect x="4" y="11" width="17" height="2" />
                            <rect x="4" y="17" width="17" height="2" />
                        </svg>
                    </button>
                </div>
                <div className="flex items-center">
                    {/* center component */}
                    <div className='text-center text-slate-800 dark:text-white text-sm'>
                        <span>{loadedMessageDetail?.chatTitle || 'New chat'}</span><br />
                        <span className='text-xs'>Model: {loadedMessageDetail?.model || 'gpt-3.5-turbo'}</span>
                    </div>
                </div>
                <div className="flex items-center">
                    {/* right component */}
                    {/* <button className="px-4 py-2 bg-red-500 text-white rounded-lg">
                        Right
                    </button> */}
                    <button
                        className='rounded-md bg-gray-200 dark:bg-slate-700 p-2'
                        onClick={() => changeTheme(theme == "light" ? "dark" : "light")}
                    >
                        {
                            theme == "dark" ? (
                                <BsFillSunFill className="text-white w-6 h-6" />
                            ) : (
                                <BsFillMoonStarsFill className="text-slate-700 w-6 h-6" />
                            )
                        }
                    </button>
                    
                </div>
            </div>
        </header>
    );
}

export default Header;