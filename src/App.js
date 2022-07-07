import './App.css';
import { useState, useEffect } from 'react';
import Login from './Login/Login';
import Containers from './Containers/Containers';
import { SocketContext } from './Context/SocketContext';
import { useMeta, useRemove } from './Socket/socket';

function App() {
    const [socket, setSocket] = useState(null);
    const [loggedIn, setLoggedIn] = useState(false);    
    const [meta, setMeta] = useMeta(socket);
    const [remove] = useRemove(socket);

    const loggedInEvent = (sock) => {
        setSocket(sock);
        setLoggedIn(true);
    }

    const removeCompleteEvent = () => {
        setMeta((prev)=>{
            let tmp = {...prev};
            delete tmp[remove];
            return tmp;
        });
    }
    
    return (
        <div className='h-screen grid place-content-center bg-slate-900 bg-[#121212]' >

            {!loggedIn && <Login loggedInEvent={loggedInEvent} />}
            {loggedIn && meta && socket &&
                <SocketContext.Provider value={socket} >
                   <Containers meta={meta} remove={remove} removeComplete={removeCompleteEvent} />
                </SocketContext.Provider>
            }

        </div>
    );
}

export default App;