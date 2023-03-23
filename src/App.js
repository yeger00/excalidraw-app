import logo from './logo.svg';
import './App.css';
import React, { useState, useHistory, useCallback } from "react";
import { Excalidraw, Sidebar } from "@excalidraw/excalidraw";
import { vi, VI_LINK } from "./vi";
var snippets = require('./snippets');
var init_state = require('./init_state.json');


// All mu globals
var g_elements_orig = init_state.elements;
var g_custome_sidebar_open = false
var g_custome_sidebar_header = "Nothing to see here"
var g_custome_sidebar_content = "yet..."

function create_vi_id_for_element(element) {
	if (element.id.endsWith("_vi")) {
		return element.id
	}
	return element.id + "_vi";
}

function create_vi_for_elemnt(element) {
      let vi_copy = JSON.parse(JSON.stringify(vi));
      vi_copy.x = element.x + 2;
      vi_copy.y = element.y;
      vi_copy.id = create_vi_id_for_element(element);
      return vi_copy;
}

function is_vi_click(element) {
	const link = element.link;
	return link == VI_LINK;
}

function is_open_sidebar(element) {
	const link = element.link;
	return link == "open_sidebar";
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
    const onChange = useCallback(
    (
      element: NonDeletedExcalidrawElement,
      event: CustomEvent<{
        nativeEvent: MouseEvent | React.PointerEvent<HTMLCanvasElement>;
      }>
    ) => {
	    console.log("called");
    },
    [excalidrawAPI]
  );
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
      if (is_vi_click(element)) {
      	var viewModeEnabled = excalidrawAPI.getAppState().viewModeEnabled;
      	if (!viewModeEnabled) {
      	      // Don't do anything when editing.
      	      event.preventDefault();
      	      return;
      	}
      	add_remove_vi(element);
      } else if (is_open_sidebar(element)) {
	if (g_custome_sidebar_open) { 
		if (g_custome_sidebar_header == element.text) {
			// Open on the same element - need to close
			excalidrawAPI.toggleMenu("customSidebar");
		} else {
			// Open, but different element - need to change
			g_custome_sidebar_header = element.text;
			var snippet = snippets[element.text.toLowerCase()];
			if (snippet !== undefined) {
				g_custome_sidebar_content = snippet.text;
			}
		}
	} else {
		// Closed. Need to open
		g_custome_sidebar_header = element.text;
		var snippet = snippets[element.text.toLowerCase()];
		if (snippet !== undefined) {
			g_custome_sidebar_content = snippet.text;
		}
		excalidrawAPI.toggleMenu("customSidebar");	
	}
      }
      const sceneData = {
        elements: g_elements_orig,
        appState: {
        },
      };
      excalidrawAPI.updateScene(sceneData);
      event.preventDefault();
    },
    [excalidrawAPI]
  );

//	Snippet to toggle sidebar
//	<button className="custom-button" onClick={() => {
//		excalidrawAPI.toggleMenu("customSidebar"); 
//	}}>
//        {" "}
//        Toggle Custom Sidebar{" "}
//      </button>
  return (
    <div style={{ height: "500px" }}>
      <center>
      <p style={{ fontSize: "16px" }}> Web Dev Roadmap </p>
      </center>
      <Excalidraw 
	  onLinkOpen={onLinkOpen}
	  onChange={onChange}
	  ref={(api) => setExcalidrawAPI(api)} 
	  initialData={{
          	elements: g_elements_orig,
          	appState: {
          	      //viewModeEnabled: true,
          	      zenModeEnabled: true,
          	      viewBackgroundColor: "#f8f9fa",
		      zoom: 0.5,
          	},
          	scrollToContent: true
          }}
	  renderSidebar={() => {
            return (
              <Sidebar dockable={true}>
                <Sidebar.Header>{g_custome_sidebar_header}</Sidebar.Header>
                <pre style={{ padding: "1rem" }}> {g_custome_sidebar_content} </pre>
              </Sidebar>
            );
          }}
	  />
    </div>
  );
}

export default App;
