import {Panel} from "../panel/panel.tsx";
import {imageStore} from "../../stores/image.store.ts";
import {FloatingPanel} from "../floating-panel/floating-panel.tsx";
import {useStoreSubscribe} from "@dgaa/use-store-subscribe";

export const Controls = () => {
    const lightThreshold = useStoreSubscribe(imageStore.lightThreshold);
    const darkThreshold = useStoreSubscribe(imageStore.darkThreshold);

    return (
        <FloatingPanel style={{
            right: 20
        }}>
            <Panel direction="column">
                <button onClick={() => imageStore.setSortMethod('brightness')}>Sort by brightness</button>
                <button onClick={() => imageStore.setSortMethod('hue')}>Sort by hue</button>
                <button onClick={() => imageStore.setSortMethod('saturation')}>Sort by saturation</button>
                <button onClick={() => imageStore.setSortMethod('value')}>Sort by value</button>
                <label>Light: {lightThreshold}</label>
                <input type="range" min="0" max="1" step={0.01} value={lightThreshold} onChange={(e) => {
                    imageStore.setLightThreshold(Number(e.target.value));
                }}/>
                <label>Dark: {darkThreshold}</label>
                <input type="range" min="0" max="1" step={0.01} value={darkThreshold} onChange={(e) => {
                    imageStore.setDarkThreshold(Number(e.target.value));
                }}/>
                <button onClick={() => imageStore.saveImage()}>Save</button>
            </Panel>
        </FloatingPanel>
    )
}