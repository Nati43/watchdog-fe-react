import { useState, useEffect, useRef } from "react";

import Convert from "ansi-to-html";
import { sortObject } from "../utils";
const parser = new Convert();

export const useMeta = (socket) => {
    const [meta, setMeta] = useState({});
    
    useEffect(() => {
        socket?.emit('meta');

        socket?.on('meta', (data) => {
            setMeta({ ...sortObject(data) });
        });

        socket?.removeAllListeners('state-change');
        socket?.on("state-change", (data) => {
            setMeta(prev => {
                const tmp = { ...prev };
                tmp[data.id].state = data.state;
                return tmp;
            });
        });
    
        socket?.on("added", (container)=> {
            setMeta((prev)=>{
                const tmp = {...prev};
                tmp[container.id] = container;
                return tmp;
            })
        });

        return ()=>{
            setMeta({});
            return () => {
                socket?.removeAllListeners();
                socket?.disconnect();
            };
        }
    }, [socket]);
    
    return [meta, setMeta];
}

export const useRemove = (socket) => {
    const [cid, setCID] = useState('');
    
    useEffect(() => { 
        socket?.on("removed", (containerID)=> {
            socket.emit(containerID+'-unsubscribe');
            socket.removeAllListeners(containerID+'-init');
            socket.removeAllListeners(containerID+'-line');
            socket.removeAllListeners(containerID+'-subscribed');
            socket.removeAllListeners(containerID+'-unsubscribed');
            setCID(containerID);
        });
        
        return ()=>{
            setCID("");
        }
    }, [socket]);
    
    return [cid];
}

export const useLines = (socket, containerID) => {
  const [lines, setLines] = useState([]);
  const prevContainerID = useRef();

  useEffect(() => {
    if(containerID) {
        socket?.removeAllListeners(prevContainerID.current+'-subscribed');
        socket?.removeAllListeners(prevContainerID.current+'-unsubscribed');
        socket?.removeAllListeners(prevContainerID.current+'-init');
        socket?.removeAllListeners(prevContainerID.current+'-line');
        prevContainerID.current = containerID;
    }

    setLines([]);

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
            setLines(() => [...tempLines]);
        });

        socket?.on(containerID+'-line', (line) => {
            setLines(prev => {
                return [...prev, parser.toHtml(line)];
            });
        });
    });
    
    return ()=>{
        setLines([]);
        if(containerID) {
            socket?.removeAllListeners(containerID+'-subscribed');
            socket?.removeAllListeners(containerID+'-unsubscribed');
            socket?.removeAllListeners(containerID+'-init');
            socket?.removeAllListeners(containerID+'-line');
        }
    }
  }, [containerID]);

  return [lines];
}

export const useSelected = (socket, containerID) => {
    const [selected, setSelected] = useState(null);
    
    useEffect(() => { 
        if(selected) {
            socket?.emit(selected+'-unsubscribe');
            socket?.on(selected+'-unsubscribed', () => {
                socket?.removeAllListeners(selected+'-init');
                socket?.removeAllListeners(selected+'-line');
                socket?.removeAllListeners(selected+'-subscribed');
                socket?.removeAllListeners(selected+'-unsubscribed');
                setSelected(containerID);
            });
        } else {
            setSelected(containerID);
        }
        
        return ()=>{
            setSelected(null);
        }
    }, [containerID]);
    
    return [selected];
}