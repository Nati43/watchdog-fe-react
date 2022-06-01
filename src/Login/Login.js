import './Login.css'
import {useRef, useState} from 'react'
import {io} from 'socket.io-client'

function Login({loggedInEvent}) {
    const pinInput = useRef();
    const [loggingIn, setLoggingIn] = useState(false);
    const [pinError, setPinError] = useState(null);

    const login = () => {
        setLoggingIn(true);
        
        const socket = io('localhost:9999/meta', { query: "pin=" + pinInput.current.value });

        socket.on('connect', () => {
            setPinError(null);
            loggedInEvent(socket);
            setLoggingIn(false);
        });

        socket.on('disconnect', () => {
            setPinError('Incorrect pin :(');
            setLoggingIn(false);
        });
    }

    return (
        <div 
            id="app" 
            className="flex flex-col items-stretch justify-content-center my-auto shadow-lg p-5 bg-[#171717] rounded-2xl" >
            <div className="form-header px-4 py-0 my-3" >
                <p className="text-xl px-0 py-0 logo-text flex content-center justify-center font-bold"> 
                    <span className='my-auto'>Watch..</span>
                    <svg className="mx-2 leading-none"
                        height="50px"
                        width="34px"
                        version="1.1"
                        viewBox="0 0 234 250"
                        xmlns="http://www.w3.org/2000/svg" >
                        <g fill="tomato" fillRule="nonzero" id="logo">
                            <path id="Shape" d="M232.237912,124.63958 L207.054086,87.2418902 L209.962149,5.64164223 C210.078472,3.66415939 209.08973,1.7448378 207.403054,0.756096381 C205.716377,-0.23264504 203.56441,-0.23264504 201.935895,0.814257642 C182.33555,14.540315 137.493219,48.3901684 122.720259,93.0580162 L145.984763,87.2418902 C145.984763,87.2418902 99.1649485,135.22493 81.6002479,210.369278 C81.6002479,210.369278 79.2156363,220.838305 78.5758624,227.875817 C79.4482813,229.911461 80.3788615,232.063428 81.1931191,234.273556 C81.2512804,234.44804 84.1593434,242.29981 85.3807298,246.312937 C86.078665,248.523064 88.1724703,250.093418 90.4989207,250.093418 L143.309345,250.093418 C145.635795,250.093418 147.729601,248.523064 148.427536,246.312937 C168.318687,181.230487 211.416181,170.528815 213.21918,170.179847 C214.847695,169.772718 216.243565,168.609493 216.9415,167.039139 L232.819524,129.757771 C233.517459,128.071095 233.342976,126.093612 232.237912,124.63958 Z M116.904133,221.012788 L99.4557548,191.932158 L134.352511,191.932158 L116.904133,221.012788 Z M160.17611,151.219276 C144.705215,151.219276 134.352511,151.219276 134.352511,151.219276 L180.881519,122.138646 C180.881519,122.138646 175.705167,151.219276 160.17611,151.219276 Z M87.8235028,52.3451341 C76.6565408,64.6753212 45.7147505,105.620848 36.9324002,151.219276 L53.1012305,151.219276 L49.4370711,173.262394 L47.4595883,185.185452 C43.3883,181.812099 35.5365299,176.752069 35.2457236,176.635747 C26.6960184,171.633879 20.7635699,170.238008 20.5890861,170.179847 C18.9605708,169.772718 17.5647006,168.609493 16.8667654,167.039139 L0.988741422,129.757771 C0.290806301,128.071095 0.465290081,126.093612 1.57035402,124.63958 L26.7541797,87.2418902 L23.8461166,5.64164223 C23.7297941,3.48967561 24.8930193,1.4540315 26.8705022,0.523451341 C28.7316625,-0.407128821 31.0581129,-0.0581612601 32.6866282,1.39587024 L87.8235028,52.3451341 Z M99.4557548,151.219276 C99.4557548,151.219276 89.1204989,151.219276 73.6088908,151.219276 C58.0972827,151.219276 52.9267467,122.138646 52.9267467,122.138646 L99.4557548,151.219276 Z" />
                        </g>
                    </svg>
                    <span className='my-auto'>..dog</span>
                </p>
            </div>

            <div className="mx-auto border-0 shadow-sm my-5 py-0" >
                <div className='w-4/5 mx-auto'>
                    <div className="mt-1 relative rounded-md shadow-sm">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"> 🔑 </span>
                        <input
                            type="password"
                            name="pin"
                            id="pin"
                            ref={pinInput}
                            className="block w-full pl-12 pr-12 py-3 border-gray-300 shadow rounded-md focus:ring-indigo-500 focus:border-indigo-500 border-2 border-slate-500 bg-transparent text-white"
                            placeholder="Pin" 
                        />
                    </div>
                </div>
            </div>
            
            {pinError && <p className='text-center text-sm text-red-500'> {pinError} </p>}

            <div className="flex items-center my-5">
                { /** Before login clicked */
                !loggingIn && <button 
                    onClick={login}
                    type="button" 
                    className="text-blue-700 hover:text-white border border-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center mx-auto dark:border-blue-500 dark:text-blue-500 dark:hover:text-white dark:hover:bg-blue-600 dark:focus:ring-blue-800" >
                    LogIn
                </button>}

                {/* When login clicked */}
                {loggingIn && <button 
                    disabled 
                    type="button" 
                    className="py-2.5 px-5 mx-auto text-sm font-medium text-gray-900 bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:outline-none focus:ring-blue-700 focus:text-blue-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700 inline-flex items-center" >
                    <svg role="status" className="inline w-4 h-4 mr-2 text-gray-200 animate-spin dark:text-gray-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                    <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="#1C64F2"/>
                    </svg>
                    Loading...
                </button>}
            </div>

        </div>
    )
}

export default Login