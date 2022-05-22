import './Console.css'
import Convert from "ansi-to-html";
import { useContext, useEffect, useRef, useState } from "react";
import { SocketContext } from '../Context/SocketContext';

const parser = new Convert();

function Console({containerID, meta, closeConsole, removeCounter}) {
    // Get socket from context
    const socket = useContext(SocketContext);

    // Declare states
    const [lines, setLines] = useState([]);
    const [highlight, setHighlight] = useState([]);
    const [maximized, setMaximized] = useState(false);
    const [markKey, setMarkKey] = useState("");
    const [pointer, setPointer] = useState(-1);
    const [caseSensitive, setCaseSensitive] = useState(false);

    // Declare refs
    const cons = useRef();
    const searchInput = useRef();
    const linesRef = useRef([]);

    const closeSelf = ()=>{
        socket.emit(containerID+'-unsubscribe');
        socket.on(containerID+'-unsubscribed', () => {
            socket.removeAllListeners(containerID+'-init');
            socket.removeAllListeners(containerID+'-line');
            socket.removeAllListeners(containerID+'-subscribed');
            socket.removeAllListeners(containerID+'-unsubscribed');
            closeConsole();
        });
        setPointer(-1);
        setHighlight([]);
        setLines([]);
    }

    const keyPress = (event) => {
        if(event.key === 'Enter'){
            mark();
        }
    }

    const mark = ()=>{
        if(searchInput.current.value.trim().length) {
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
        if(socket) {
            setLines([]);
            // Event triggered to subscribe to containerID
            socket.emit(containerID+'-subscribe');
    
            socket.on(containerID+'-subscribed', () => {
                socket.on(containerID+"-init", (data) => {
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
    
                socket.on(containerID+"-line", (line) => {
                    setLines(prev => {
                        return [...prev, parser.toHtml(line)];
                    });
                    setTimeout(()=>{
                        cons.current.scrollTop = cons.current.scrollHeight;
                    }, 50);
                });
            });
        }
    }, [containerID]);

    useEffect(()=>{
        mark();
    }, [caseSensitive]);

    useEffect(()=>{
        if(linesRef.current[highlight[pointer]]) {
            linesRef.current[highlight[pointer]].scrollIntoView();
        }
    }, [pointer]);

    return (
        meta[containerID] && <div 
            className={
                "mx-12 flex flex-col shadow" + 
                (maximized ? ' maximized':'')
            }
            style={{minWidth: "50vw", maxWidth: "650px", maxHeight: "650px", overflow: "hidden", borderRadius: ".75em"}} >
            
            <div className="mr-0 ml-auto border-0 shadow-sm my-5 py-0" >
                <div className='w-full mx-auto'>
                    <div className="mt-1 relative rounded-md shadow-sm">
                        <i 
                            onClick={()=>{setCaseSensitive(!caseSensitive)}}
                            style={{ cursor: "pointer" }}
                            className={"font-bold absolute inset-y-0 right-7 pl-3 pr-12 flex items-center"+(caseSensitive ? ' text-white':' text-slate-500')}>
                            Aa
                        </i>
                        <i 
                            onClick={()=>{findPrev()}}
                            style={{ cursor: "pointer" }}
                            className={"font-bold absolute inset-y-0 right-0 pl-3 pr-12 flex items-center fa fa-arrow-up"+(highlight.length ? ' text-white':' text-slate-500')}>
                        </i>
                        <i 
                            onClick={()=>{findNext()}}
                            style={{ cursor: "pointer" }}
                            className={"font-bold absolute inset-y-0 -right-7 pl-3 pr-12 flex items-center fa fa-arrow-down"+(highlight.length ? ' text-white':' text-slate-500')}>
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

            <div 
                className="flex shadow" 
                style={{ backgroundColor:"#181818", padding: ".85em" }} >

                <div onClick={()=>{closeSelf()}} className="mx-1 rounded-full bg-red-500 flex" style={{ height: "1em", width: "1em" }} >
                    <i className="fa fa-close font-bold text-white mx-auto my-auto" style={{ fontSize:".5em" }} ></i>
                </div>
                <div onClick={()=>{setMaximized(!maximized)}} className="mx-1 rounded-full bg-green-500 flex" style={{ height:"1em", width:"1em" }} >
                    <i className="fa fa-expand font-bold text-white mx-auto my-auto" style={{ fontSize: ".5em" }}></i>
                </div>

                {removeCounter && <span className="ml-3 my-auto beat"> Container removed. Closing in ... { removeCounter } </span>}

                <div className="ml-auto mr-3">

                    { !['restarting', 'removing'].includes(meta[containerID].state) && 
                    <div className="flex">

                        {!['running', 'removing'].includes(meta[containerID].state) && 
                            <span 
                                style={{cursor: "pointer"}}
                                className="text-blue-700 hover:text-white border border-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center mx-2 dark:border-blue-500 dark:text-blue-500 dark:hover:text-white dark:hover:bg-blue-600 dark:focus:ring-blue-800" 
                                onClick={()=>{ socket.emit(containerID+'-start') }}>
                                Start
                            </span>
                        }
                        
                        {meta[containerID].state === 'running' && 
                            <span 
                                style={{cursor: "pointer"}}
                                className="text-blue-700 hover:text-white border border-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center mx-2 dark:border-blue-500 dark:text-blue-500 dark:hover:text-white dark:hover:bg-blue-600 dark:focus:ring-blue-800" 
                                onClick={()=>{ socket.emit(containerID+'-restart') }}>
                                Restart
                            </span>
                        }
                        
                        {meta[containerID].state === 'running' &&
                            <span 
                                style={{cursor: "pointer"}}
                                className="text-blue-700 hover:text-white border border-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center mx-2 dark:border-blue-500 dark:text-blue-500 dark:hover:text-white dark:hover:bg-blue-600 dark:focus:ring-blue-800" 
                                onClick={()=>{ socket.emit(containerID+'-stop') }}>
                                Stop
                            </span>
                        }
                        
                        {meta[containerID].state === 'exited' && 
                            <span 
                                style={{cursor: "pointer"}}
                                className="text-blue-700 hover:text-white border border-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center mx-2 dark:border-blue-500 dark:text-blue-500 dark:hover:text-white dark:hover:bg-blue-600 dark:focus:ring-blue-800" 
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
                style={{ width:"100%", height:"100%", overflow:"auto", listStyle: "none", backgroundColor:"#1c1c1c" }}
                className="terminal p-12 m-0 text-white text-left block" >
                {
                    lines.map((line, idx)=>{
                        return <li 
                            id={idx} 
                            key={idx}
                            ref={el => linesRef.current[idx] = el}
                            className={(highlight[pointer] === idx) ? 'bg-highlight':''}
                            dangerouslySetInnerHTML={{__html: highlight.indexOf(idx) === -1 ? line : line.replace(toRegex(markKey), '<span class=\'bg-mark\'>$&</span>')}} ></li>
                    })
                }

                { meta[containerID].state === 'exited' &&
                    <li 
                        style={{ color: "tomato", marginLeft: "-1em", marginBottom: "-2em"}}>
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