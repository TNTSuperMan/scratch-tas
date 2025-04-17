import { BitmapAdapter } from "scratch-svg-renderer";
//@ts-ignore
import { ScratchStorage, DataFormat, AssetType } from "scratch-storage";
import ScratchRender from "scratch-render"
import ScratchAudio from "scratch-audio"
import ScratchVM from "scratch-vm"
import { useEffect, useRef, useState } from "preact/hooks";
import { HistoryControl, playHistory, PlayHistoryPayload } from "./history";

const loadVM = (c: HTMLCanvasElement)=>{
    const vm = new ScratchVM;
    vm.attachRenderer(new ScratchRender(c));
    vm.attachAudioEngine(new ScratchAudio);
    vm.attachStorage(new ScratchStorage);
    vm.attachV2BitmapAdapter(new BitmapAdapter);
    return vm;
}

export const Vm = ({data}: {data: ArrayBuffer}) => {
    const [vm, setVm] = useState<ScratchVM>();
    const [phis, setPhis] = useState<PlayHistoryPayload[]>([]);
    const [pos, setPos] = useState<[number, number]>([0, 0]);
    const [nowidx, setIdx] = useState(0);
    const [int, setInt] = useState(-1);
    const canvasEl = useRef<HTMLCanvasElement>(null);
    useEffect(()=>{
        if(!vm && canvasEl.current){
            const vm = loadVM(canvasEl.current);
            vm.loadProject(data).then(()=>{
                vm.runtime.currentStepTime = 33;
                vm.runtime._steppingInterval = 1;
                vm.runtime.emit("RUNTIME_STARTED");
                vm.runtime.greenFlag();
                setVm(vm);
            });
        }
    }, [canvasEl]);
    return <>
        {!vm && "loading"}
        <canvas ref={canvasEl} onClick={e=>{
            const wid=(e.target as HTMLCanvasElement).width;
            const hei=(e.target as HTMLCanvasElement).height;
            const x = e.offsetX / wid * 480 - 240;
            const y = e.offsetY / hei * 360 - 180;
            setPos([Math.round(x), Math.round(y)]);
        }} />
        <div class="histories">
            ({pos[0]}/{pos[1]})
            <button onClick={()=>{
                if(!vm) return;
                vm.loadProject(data).then(()=>{
                    vm.runtime.greenFlag();
                    let i = 0;
                    const int = setInterval(()=>{
                        if(!vm) return;
                        if(i == phis.length) clearInterval(int);
                        playHistory(vm, phis[i]);
                        setIdx(i++);
                    }, 1000 / 30);
                    setInt(int);
                })
            }}>Play</button>
            <button onClick={()=>clearInterval(int)}>Cancel</button>
            {phis.map((e,i)=>
                <HistoryControl key={e.sym} payload={e}
                    onchange={e=>(phis[i]=e,setPhis(phis))}
                    remove={()=>setPhis(phis.toSpliced(i, 1))}
                    play={()=>{
                        if(!vm) return;
                        console.clear();
                        if(nowidx < i){
                            console.log("now", nowidx, i);
                            for(let _i = 0;_i < (i-nowidx);_i++){
                                console.log(nowidx + _i + 1);
                                playHistory(vm, phis[nowidx + _i + 1]);
                            }
                            setIdx(i);
                        }else{
                            console.log("reload")
                            setVm(undefined);
                            vm.loadProject(data).then(()=>{
                                if(!vm) return;
                                vm.runtime.greenFlag();
                                for(let _i = 0;_i <= i;_i++)
                                    playHistory(vm, phis[_i])
                                setIdx(i);
                                setVm(vm);
                            })
                        }
                    }}/>)}
            <button onClick={()=>setPhis([...phis, {
                sym: Symbol(),
                greenFlag: false,
                stop: false,
                down: [],
                up: [],
                mouseX: 0,
                mouseY: 0,
                mouseDown: false
            }])}>+</button>
        </div>
    </>
}
