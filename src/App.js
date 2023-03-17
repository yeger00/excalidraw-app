import logo from './logo.svg';
import './App.css';
import React, { useState, useHistory, useCallback } from "react";
import { Excalidraw } from "@excalidraw/excalidraw";


var g_elements_orig = [
            {
              type: "rectangle",
              version: 141,
              versionNonce: 361174001,
              isDeleted: false,
              id: "oDVXy8D6rom3H1-LLH2-f",
              fillStyle: "hachure",
              strokeWidth: 1,
              strokeStyle: "solid",
              roughness: 1,
              opacity: 100,
              angle: 0,
              x: 100.50390625,
              y: 93.67578125,
              strokeColor: "#000000",
              backgroundColor: "transparent",
              width: 186.47265625,
              height: 141.9765625,
              seed: 1968410350,
              groupIds: [],
		link: "http://google.com",
            },
          ]

var g_elements_override = [
            {
              type: "ellipse",
              version: 141,
              versionNonce: 361174001,
              isDeleted: false,
              id: "oDVXy8D6rom3H1-LLH2-f",
              fillStyle: "hachure",
              strokeWidth: 1,
              strokeStyle: "solid",
              roughness: 1,
              opacity: 100,
              angle: 0,
              x: 100.50390625,
              y: 93.67578125,
              strokeColor: "#000000",
              backgroundColor: "transparent",
              width: 186.47265625,
              height: 141.9765625,
              seed: 1968410350,
              groupIds: [],
		link: "http://google.com",
            },
          ]




function App() {

  const updateSceneOuter = () => {
    console.log("get in here");
    const sceneData = {
      elements: g_elements_override,
      appState: {
        viewBackgroundColor: "#edf2ff",
      },
    };
    excalidrawAPI.updateScene(sceneData);
  };
  const [excalidrawAPI, setExcalidrawAPI] = useState(null);

    const onLinkOpen = useCallback(
    (
      element: NonDeletedExcalidrawElement,
      event: CustomEvent<{
        nativeEvent: MouseEvent | React.PointerEvent<HTMLCanvasElement>;
      }>
    ) => {
      const link = element.link;
      const { nativeEvent } = event.detail;
      const isNewTab = nativeEvent.ctrlKey || nativeEvent.metaKey;
      const isNewWindow = nativeEvent.shiftKey;
      updateSceneOuter();
      event.preventDefault();

      //const isInternalLink =
      //  link.startsWith("/") || link.includes(window.location.origin);
      //if (isInternalLink && !isNewTab && !isNewWindow) {
      //  // signal that we're handling the redirect ourselves
      //  event.preventDefault();
      //  // do a custom redirect, such as passing to react-router
      //  // ...
      //}
    },
    [excalidrawAPI]
  );

  return (
    <div style={{ height: "500px" }}>
      <p style={{ fontSize: "16px" }}> Click to update the scene</p>
      <button className="custom-button" onClick={updateSceneOuter}>Update Scene</button>
      <Excalidraw 
	  onLinkOpen={onLinkOpen}
	  ref={(api) => setExcalidrawAPI(api)} 
	  initialData={{
          	elements: g_elements_orig,
          	appState: {
          	      viewModeEnabled: true,
          	      zenModeEnabled: true,
          	      viewBackgroundColor: "#a5d8ff"
          	},
          	scrollToContent: true
          }}
	  />
    </div>
  );
}

export default App;
