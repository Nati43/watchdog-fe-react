import { useEffect, useState } from 'react'
import Console from './Console';
import List from './List'

function Containers({meta, remove, removeComplete}) {
    const [selected, setSelected] = useState(null);
    const [removeCounter, setRemoveCounter] = useState(null);

    useEffect(()=>{
        if(remove === selected) {
            setRemoveCounter(5);
        }
    }, [remove]);

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

        setSelected(containerID);
    }

    const closeConsole = () => {
        setSelected(null);
    }

    return (
        <div className='flex flex-wrap content-center justify-center'>

            <List meta={meta} openConsoleEvent={openConsole} />
            { selected && <Console meta={meta} containerID={selected} closeConsole={closeConsole} removeCounter={removeCounter} /> }

        </div>
    )
}

export default Containers;