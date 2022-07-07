import './Console.css'
import Convert from "ansi-to-html";
import { useContext, useEffect, useRef, useState } from "react";
import { SocketContext } from '../Context/SocketContext';

const parser = new Convert();

function Console({containerID, meta, closeConsole, removeCounter, maximize}) {
    // Get socket from context
    const socket = useContext(SocketContext);
    const prevContainerID = useRef()

    // Declare states
    const [lines, setLines] = useState([]);
    const [highlight, setHighlight] = useState([]);
    const [maximized, setMaximized] = useState(false);
    const [markKey, setMarkKey] = useState("");
    const [pointer, setPointer] = useState(-1);
    const [caseSensitive, setCaseSensitive] = useState(false);

    useEffect(()=>{
        return ()=>{
            setLines([]);
            setHighlight([]);
            setMarkKey("");
            setPointer(-1);
            setCaseSensitive(false);
            if(containerID) {
                socket.removeAllListeners(containerID+'-subscribed');
                socket.removeAllListeners(containerID+'-unsubscribed');
                socket.removeAllListeners(containerID+'-init');
                socket.removeAllListeners(containerID+'-line');
            }
        }
    }, [])
    
    useEffect(() => {
        if(containerID) {
            socket.removeAllListeners(prevContainerID.current+'-subscribed');
            socket.removeAllListeners(prevContainerID.current+'-unsubscribed');
            socket.removeAllListeners(prevContainerID.current+'-init');
            socket.removeAllListeners(prevContainerID.current+'-line');
            prevContainerID.current = containerID;
        }

        setLines([]);
        setHighlight([]);
        setMarkKey("");
        setPointer(-1);
        setCaseSensitive(false);

        // Event triggered to subscribe to containerID
        socket?.emit(containerID+'-subscribe');

        socket?.on(containerID+'-subscribed', () => {
            socket?.on(containerID+'-init', (data) => {
                let tempLines = [];
                data.forEach(line => {
                    var log;
                    try {
                        log = JSON.parse(line).log;
                    } catch (err) {
                        log = line;
                    }
                    tempLines.push(parser.toHtml(log));
                });
                setLines(prev => {
                    return [...tempLines];
                });
                setTimeout(()=>{
                    cons.current.scrollTop = cons.current.scrollHeight;
                }, 50);
            });

            socket?.on(containerID+'-line', (line) => {
                setLines(prev => {
                    return [...prev, parser.toHtml(line)];
                });
                setTimeout(()=>{
                    cons.current.scrollTop = cons.current.scrollHeight;
                }, 50);
            });
        });
    }, [containerID]);

    // Declare refs
    const cons = useRef();
    const searchInput = useRef();
    const linesRef = useRef([]);

    const keyPress = (event) => {
        if(event.key === 'Enter'){
            mark();
        }
    }

    const mark = ()=>{
        if(searchInput.current && searchInput.current.value.trim().length) {
            let indices = [];
            lines.forEach((line, idx) => {
                if(line.match(toRegex(searchInput.current.value)))
                    indices.push(idx);
            });
            setHighlight((prev) => {
                return indices;
            });
            setMarkKey(searchInput.current.value);
        }
    }

    const findNext = ()=>{
        if(pointer === -1)
            setPointer(0);
        else
            setPointer(pointer+1);

        if(pointer >= highlight.length)
            setPointer(0)
    }

    const findPrev = ()=>{
        if(pointer === -1)
            setPointer(highlight.length - 1);
        else
            setPointer(pointer - 1);
            
        if(pointer < 0)
            setPointer(highlight.length - 1);
    }

    const toRegex = (key) => {
        if(caseSensitive) {
            return new RegExp(`${key}`,"g");
        }else {
            return new RegExp(`${key}`,"gi");
        }
    }

    useEffect(()=>{
        mark();
    }, [caseSensitive]);

    useEffect(()=>{
        if(linesRef.current[highlight[pointer]]) {
            linesRef.current[highlight[pointer]].scrollIntoView();
        }
    }, [pointer]);

    useEffect(()=>{
        maximize(maximized)
    }, [maximized]);

    return (
        meta[containerID] && 
        <div 
            className={
                "mx-12 flex flex-col shadow transition-all delay-150 duration-300 ease-in-out" + 
                (maximized ? ' max-w-none max-h-none w-[70vw] h-[45vw]':' min-w-[50vw] max-w-[650px] max-h-[650px] overflow-hidden rounded-xl')
            } >
            
            <div className="mr-0 ml-auto border-0 shadow-sm my-5 py-0" >
                <div className='w-full mx-auto'>
                    <div className="mt-1 relative rounded-md shadow-sm">
                        <i 
                            onClick={()=>{setCaseSensitive(!caseSensitive)}}
                            className={"cursor-pointer font-bold absolute inset-y-0 right-7 pl-3 pr-12 flex items-center"+(caseSensitive ? ' text-white':' text-slate-500')}>
                            Aa
                        </i>
                        <i 
                            onClick={()=>{findPrev()}}
                            className={"cursor-pointer font-bold absolute inset-y-0 right-0 pl-3 pr-12 flex items-center fa fa-arrow-up"+(highlight.length ? ' text-white':' text-slate-500')}>
                        </i>
                        <i 
                            onClick={()=>{findNext()}}
                            className={"cursor-pointer font-bold absolute inset-y-0 -right-7 pl-3 pr-12 flex items-center fa fa-arrow-down"+(highlight.length ? ' text-white':' text-slate-500')}>
                        </i>
                        <input
                            type="text"
                            name="pin"
                            id="pin"
                            ref={searchInput}
                            onKeyUp={keyPress}
                            className="block w-full pl-3 pr-28 py-3 border-gray-300 shadow rounded-md focus:ring-indigo-500 focus:border-indigo-500 border-2 border-slate-500 bg-transparent text-white"
                            placeholder="search" 
                        />
                    </div>
                </div>
            </div>

            <div className="flex shadow bg-[#181818] p-3.5" >

                <div onClick={()=>{setMaximized(false);closeConsole()}} className="mx-1 rounded-full bg-red-500 flex h-[1em] w-[1em]" >
                    <i className="fa fa-close font-bold text-white mx-auto my-auto text-[.5em] cursor-pointer"></i>
                </div>
                <div onClick={()=>{setMaximized(!maximized)}} className="mx-1 rounded-full bg-green-500 flex h-[1em] w-[1em]" >
                    <i className="fa fa-expand font-bold text-white mx-auto my-auto text-[.5em] cursor-pointer"></i>
                </div>

                {removeCounter && <span className="ml-3 my-auto text-[tomato] animate-ping"> Container removed. Closing in ... { removeCounter } </span>}

                <div className="ml-auto mr-3">

                    { !['restarting', 'removing'].includes(meta[containerID].state) && 
                    <div className="flex">

                        {!['running', 'removing'].includes(meta[containerID].state) && 
                            <span 
                                className="cursor-pointer text-blue-700 hover:text-white border border-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center mx-2 dark:border-blue-500 dark:text-blue-500 dark:hover:text-white dark:hover:bg-blue-600 dark:focus:ring-blue-800" 
                                onClick={()=>{ socket.emit(containerID+'-start') }}>
                                Start
                            </span>
                        }
                        
                        {meta[containerID].state === 'running' && 
                            <span 
                                className="cursor-pointer text-blue-700 hover:text-white border border-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center mx-2 dark:border-blue-500 dark:text-blue-500 dark:hover:text-white dark:hover:bg-blue-600 dark:focus:ring-blue-800" 
                                onClick={()=>{ socket.emit(containerID+'-restart') }}>
                                Restart
                            </span>
                        }
                        
                        {meta[containerID].state === 'running' &&
                            <span 
                                className="cursor-pointer text-blue-700 hover:text-white border border-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center mx-2 dark:border-blue-500 dark:text-blue-500 dark:hover:text-white dark:hover:bg-blue-600 dark:focus:ring-blue-800" 
                                onClick={()=>{ socket.emit(containerID+'-stop') }}>
                                Stop
                            </span>
                        }
                        
                        {meta[containerID].state === 'exited' && 
                            <span 
                                className="cursor-pointer text-blue-700 hover:text-white border border-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center mx-2 dark:border-blue-500 dark:text-blue-500 dark:hover:text-white dark:hover:bg-blue-600 dark:focus:ring-blue-800" 
                                onClick={()=>{ socket.emit(containerID+'-remove') }}>
                                Remove
                            </span>
                        }
                        
                    </div>
                    }
                </div>
                
                <span className="ml-3 mr-3 my-auto text-white" > Service log - <span className="font-bold"> { parseName(meta[containerID].name) } </span> </span>
            </div>

            <pre
                ref={cons}
                id="console"
                className="terminal p-12 m-0 text-white text-left block w-full h-full overflow-auto list-none bg-[#1c1c1c]" >
                {
                    lines.map((line, idx)=>{
                        return <li 
                            id={idx} 
                            key={idx}
                            ref={el => linesRef.current[idx] = el}
                            className={(highlight[pointer] === idx) ? 'bg-[#0005] text-white heartbeat':''}
                            dangerouslySetInnerHTML={{__html: highlight.indexOf(idx) === -1 ? line : line.replace(toRegex(markKey), '<span class=\'bg-[tomato] text-white font-bold\'>$&</span>')}} ></li>
                    })
                }

                { meta[containerID].state === 'exited' &&
                    <li 
                        className="text-[tomato] -ml-4 -mb-8" >
                        Service is down ...!
                    </li>
                }
            </pre>
        </div>
    )
}

export default Console;

function parseName(fullname) {
    let nameParts = fullname.split('/').filter(x => x.length > 0);
    let name = nameParts.join('-');
    return name.length > 15 ? name.substring(0, 15)+'..' : name;
}