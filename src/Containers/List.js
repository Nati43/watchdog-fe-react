import { useContext, useEffect, useState } from "react";
import { SocketContext } from '../Context/SocketContext';
import { useSelected } from "../Socket/socket";

function List({meta, openConsoleEvent}) {
    const socket = useContext(SocketContext);
    const [containerID, setContainerID] = useState(null);
    const [selected] = useSelected(socket, containerID);

    useEffect(()=>{
        openConsoleEvent(selected);
    }, [selected]);

    return (
        <div
            className="mx-auto flex flex-col justify-center max-w-[45%]" >
            <div className="form-header px-4 py-0 my-3 mb-7" >
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

            <div className='text-slate-500 flex flex-wrap align-center justify-center' > 
                { meta &&
                    Object.keys(meta).map((containerID) =>
                        <div 
                            onClick={()=>{setContainerID(containerID)}}
                            className="flex align-center p-3 m-2 button shadow-sm bg-neutral-900 hover:bg-stone-800 rounded-2xl w-[15em] cursor-pointer" 
                            key={containerID}>
                            <div className="p-3 pl-6 grid place-content-center">
                                <i className={ 
                                    'fa fa-microchip text-base ' + 
                                    (meta[containerID].state === 'starting' ? 'text-slate-300':'') +
                                    (meta[containerID].state === 'running' ? 'text-green-500':'') +
                                    (meta[containerID].state === 'restarting' ? 'text-orange-500':'') +
                                    (meta[containerID].state === 'paused' ? 'text-sky-500':'') +
                                    (meta[containerID].state === 'removing' ? 'text-red-500':'') +
                                    (['exited', 'dead'].includes(meta[containerID].state) ? 'text-grey-500':'')
                            }></i>
                            </div>
                            <div className="p-3 flex flex-col">
                                <span className="my-auto font-bold text-white"> {parseName(meta[containerID].name)} </span>
                                <span className="my-auto" > {meta[containerID].state} </span>
                            </div>
                        </div>
                    )
                }
            </div>
        </div>
    )
}

export default List;

function parseName(fullname) {
    let nameParts = fullname.split('/').filter(x => x.length > 0);
    let name = nameParts.join('-');
    return name.length > 15 ? name.substring(0, 15)+'..' : name;
}