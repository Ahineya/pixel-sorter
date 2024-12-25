import './App.css'
import {imageStore} from "./stores/image.store.ts";
import {imageFromFile} from "./helpers/image-data-from-file.ts";
import {ChangeEvent} from "react";
import {Drawer} from "./components/drawer/drawer.tsx";
import {Panel} from "./components/panel/panel.tsx";
import {FloatingPanel} from "./components/floating-panel/floating-panel.tsx";
import {Controls} from "./components/controls/controls.tsx";

function App() {
    const loadImage = async (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files![0];

        imageStore.setImage(await imageFromFile(file));
    }

    return (
        <Panel direction="column">
            <FloatingPanel>
                <input type="file" onChange={loadImage} accept="image/*"/>
            </FloatingPanel>
            <Drawer/>
            <Controls/>
        </Panel>
    )
}

export default App
