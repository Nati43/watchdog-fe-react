import { useEffect, useState } from 'react'
import { useTransition, animated, config } from 'react-spring';
import Console from './Console';
import List from './List'

function Containers({meta, remove, removeComplete}) {
    const [selected, setSelected] = useState(null);
    const [removeCounter, setRemoveCounter] = useState(null);
    const [maximized, setMaximized] = useState(false);
    
    useEffect(()=>{
        return () => {
            setSelected(null);
            setRemoveCounter(null);
            setMaximized(false);
        }
    }, []);

    const [isVisible, setIsVisible] = useState(false);
    const mountTransition = useTransition(isVisible, {
        from: { transform: 'scale(0.75)' },
        enter: { transform: 'scale(1)' },
        leave: { transform: 'scale(0)' },
        config: config.stiff
    });

    useEffect(()=>{
        if(remove === selected) {
            setRemoveCounter(5);
        }
    }, [remove]);

    useEffect(()=>{
        if(selected)
            setIsVisible(true);
    }, [selected]);

    useEffect(()=>{
        if(removeCounter > 0) {
            setTimeout(()=>{ setRemoveCounter(removeCounter - 1) }, 1000);
        } else if(removeCounter === 0) {
            closeConsole();
            removeComplete();
            setRemoveCounter(null);
        }
    }, [removeCounter])

    const openConsole = (containerID) => {
        if(selected && selected === containerID)
            return;

        setIsVisible(false);
        setTimeout(()=>{
            setSelected(containerID);
        }, 50);
    }

    const closeConsole = () => {
        setSelected(null);
    }

    const maximize = (val) => {
        setMaximized(val);
    }

    return (
        <div className='flex flex-wrap content-center justify-center'>

            {!maximized && <List meta={meta} openConsoleEvent={openConsole} />}
            {selected && mountTransition((style, item) =>
                item ? 
                <animated.div style={style}>
                    <Console meta={meta} containerID={selected} closeConsole={closeConsole} removeCounter={removeCounter} maximize={maximize} /> 
                </animated.div> : ''
            )}

        </div>
    )
}

export default Containers;