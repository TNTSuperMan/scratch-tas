export interface PlayHistoryPayload{
    sym: symbol
    greenFlag: boolean
    stop: boolean
    down: string[]
    up: string[]
    mouseX: number
    mouseY: number
    mouseDown: boolean
};

export const playHistory = (vm: import("scratch-vm"), play: PlayHistoryPayload) =>{
    if(!play) return;
    if(play.greenFlag) vm.greenFlag();
    if(play.stop) vm.stopAll();
    play. up .forEach(key=>vm.postIOData("keyboard", { key, isDown: true  }));
    play.down.forEach(key=>vm.postIOData("keyboard", { key, isDown: false }));
    vm.postIOData("mouse", {
        x: play.mouseX + 240,
        y: play.mouseY + 180,
        canvasWidth: 480,
        canvasHeight: 360,
        isDown: play.mouseDown
    });

    vm.runtime._step();
}

export const HistoryControl = ({payload, onchange, play, remove}: {
    payload: PlayHistoryPayload,
    onchange: (e: PlayHistoryPayload) => void,
    play: () => void,
    remove: () => void
}) => <div class="history">
    <button onClick={play}>▶</button>
    <button onClick={remove}>X</button>
    🟩<input type="checkbox" checked={payload.greenFlag} onChange={e=>onchange({...payload,
        greenFlag: (e.target as HTMLInputElement).checked
    })} /><br/>

    マウス<input type="checkbox" checked={payload.mouseDown} onChange={e=>onchange({...payload,
        mouseDown: (e.target as HTMLInputElement).checked
    })} />
    <input type="number" min="-240" max="240" value={payload.mouseX} onChange={e=>onchange({...payload,
        mouseX: (e.target as HTMLInputElement).valueAsNumber
    })} />
    <input type="number" min="-180" max="180" value={payload.mouseY} onChange={e=>onchange({...payload,
        mouseY: (e.target as HTMLInputElement).valueAsNumber
    })} /><br/>

    キー↓ <input value={payload.down.join(",")} onChange={e=>(
        (payload.down=(e.target as HTMLInputElement).value.split(",")),
        onchange(payload))} />

    キー↑ <input value={payload.up.join(",")} onChange={e=>(
        (payload.up=(e.target as HTMLInputElement).value.split(",")),
        onchange(payload))} />
</div>
