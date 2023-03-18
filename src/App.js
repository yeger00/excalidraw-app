import logo from './logo.svg';
import './App.css';
import React, { useState, useHistory, useCallback } from "react";
import { Excalidraw } from "@excalidraw/excalidraw";
import { vi, VI_LINK } from "./vi";
import { init_state } from "./init_state";

var g_elements_orig = init_state;

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

function create_vi_id_for_element(element) {
	if (element.id.endsWith("_vi")) {
		return element.id
	}
	return element.id + "_vi";
}

function create_vi_for_elemnt(element) {
      let vi_copy = JSON.parse(JSON.stringify(vi));
      vi_copy.x = element.x + 2;
      vi_copy.y = element.y - 5;
      vi_copy.id = create_vi_id_for_element(element);
      return vi_copy;
}

function is_vi_click(element) {
	const link = element.link;
	return link == VI_LINK;
}

function add_remove_vi(element) {
	const num_of_elements = g_elements_orig.length;
	const vi_id = create_vi_id_for_element(element);
	// Create a new list without the vi
	g_elements_orig = g_elements_orig.filter(function( obj ) {
  	  return obj.id !== vi_id;
	});
	
	const new_num_of_elements = g_elements_orig.length;

	if (new_num_of_elements == num_of_elements) {
		// Didn't find vi, let's add it
		var vi_copy = create_vi_for_elemnt(element);
		g_elements_orig.push(vi_copy);
	}
}


function App() {

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
      add_remove_vi(element);
      const sceneData = {
        elements: g_elements_orig,
        appState: {
        },
      };
      excalidrawAPI.updateScene(sceneData);
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
      <center>
      <p style={{ fontSize: "16px" }}> Web Dev Roadmap </p>
      </center>
      <Excalidraw 
	  onLinkOpen={onLinkOpen}
	  ref={(api) => setExcalidrawAPI(api)} 
	  initialData={{
          	elements: g_elements_orig,
          	appState: {
          	      viewModeEnabled: true,
          	      zenModeEnabled: true,
          	      viewBackgroundColor: "#f8f9fa"
          	},
          	scrollToContent: true
          }}
	  />
    </div>
  );
}

export default App;
