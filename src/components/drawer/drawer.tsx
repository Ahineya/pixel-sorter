import {FC} from "react";
import {useStoreSubscribe} from "@dgaa/use-store-subscribe";
import {imageStore} from "../../stores/image.store.ts";
import {ImageViewer} from "../image-viewer/image-viewer.tsx";
import {Panel} from "../panel/panel.tsx";
import {EditorController} from "../editor-controller/editor-controller.tsx";

export const Drawer: FC = () => {
    const image = useStoreSubscribe(imageStore.image);
    const originalImage = useStoreSubscribe(imageStore.originalImage);

    const scale = 1;
    const offset = {x: 0, y: 0};

    return (
        <Panel direction="row">
            <Panel style={{position: "relative"}}>
                <ImageViewer image={originalImage} scale={1} offsetX={0} offsetY={0}/>
            </Panel>
            <Panel style={{position: "relative"}}>
            <ImageViewer image={image} scale={1} offsetX={0} offsetY={0}/>
            {
                image &&
                <EditorController
                    scale={scale}
                    offsetX={offset.x}
                    offsetY={offset.y}
                    onScaleOffsetChange={(scale, offsetX, offsetY) => {
                        console.log(scale, offsetX, offsetY);
                        // uiStateStore.setZoom(_ => scale);
                        // uiStateStore.setPan(_ => ({x: offsetX, y: offsetY}));
                    }}
                />
            }
            </Panel>
        </Panel>
    )
}
