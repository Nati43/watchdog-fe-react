import './App.css';
import { useState, useEffect } from 'react';
import Login from './Login/Login';
import Containers from './Containers/Containers';
import { SocketContext } from './Context/SocketContext';

function App() {
    const [socket, setSocket] = useState(null);
    const [loggedIn, setLoggedIn] = useState(false);
    const [meta, setMeta] = useState({});
    const [remove, setRemove] = useState({});

    useEffect(() => {
        if(socket) {
            socket.emit('meta');

            socket.on('meta', (data) => {
                setMeta(() => {
                    return { ...sortObject(data) };
                });
            });

            socket.removeAllListeners('state-change');
            socket.on("state-change", (data) => {
                setMeta(prev => {
                    const tmp = { ...prev };
                    tmp[data.id].state = data.state;
                    return tmp;
                });
            });
        
			socket.on("added", (container)=> {
                setMeta((prev)=>{
                    const tmp = {...prev};
                    tmp[container.id] = container;
                    return tmp;
                })
			});

			socket.on("removed", (containerID)=> {
				socket.emit(containerID+'-unsubscribe');
				socket.removeAllListeners(containerID+'-init');
				socket.removeAllListeners(containerID+'-line');
				socket.removeAllListeners(containerID+'-subscribed');
				socket.removeAllListeners(containerID+'-unsubscribed');
                setRemove(containerID);
			});
		
        }
    }, [loggedIn]);

    
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

function sortObject(data) {
    let sortable = [];
    // Convert to array
    Object.values(data).forEach((container) => {
        sortable.push(container);
    });
    // Sort
    sortable.sort((a, b) => {
        if (a.name < b.name)
            return -1;
        if (a.name > b.name)
            return 1;
        return 0;
    });
    // Convert back to object
    let sortedData = {};
    sortable.forEach(container => {
        sortedData[container.id] = container;
    });

    return sortedData;
}