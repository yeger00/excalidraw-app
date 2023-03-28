import './App.css';
import React, { useState, useCallback } from "react";
import { Excalidraw, Sidebar } from "@excalidraw/excalidraw";
import { vi, VI_LINK } from "./vi";
import MarkdownView from 'react-showdown';
var snippets = require('./snippets');
var init_state = require('./init_state.json');


// All mu globals
var g_elements_orig = init_state.elements;
var g_custome_sidebar_open = false;
var g_custome_sidebar_header = "Nothing to see here"
var g_custome_sidebar_content = "yet..."
var g_current_elemnt = {};

const params = new Proxy(new URLSearchParams(window.location.search), {
  get: (searchParams, prop) => searchParams.get(prop),
});
var g_edit_mode = params.edit_mode === "true";
var g_display = 'none';
if (g_edit_mode) {
	g_display = 'visible';
}

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
	return link === VI_LINK || link === "cmd://" + VI_LINK;
}

function is_open_sidebar(element) {
	const link = element.link;
	return link === "cmd://open_sidebar" || link === "open_sidebar";
}

function add_remove_vi(element, all_elements) {
	const num_of_elements = all_elements.length;
	const vi_id = create_vi_id_for_element(element);
	// Create a new list without the vi
	all_elements = all_elements.filter(function( obj ) {
  	  return obj.id !== vi_id;
	});
	
	const new_num_of_elements = all_elements.length;

	if (new_num_of_elements === num_of_elements) {
		// Didn't find vi, let's add it
		var vi_copy = create_vi_for_elemnt(element);
		all_elements.push(vi_copy);
	}
	return all_elements;
}

function App() {
  const [excalidrawAPI, setExcalidrawAPI] = useState(null);
    const onTextAreaChange = useCallback(
    (
	    event
    ) => {
	g_custome_sidebar_content = event.target.value;
        var snippet = g_current_elemnt.customData;
	if (snippet !== undefined) {
		snippet.text = event.target.value;
	} else {
		g_current_elemnt.customData = {};
		g_current_elemnt.customData.text = event.target.value;
	}
        var all_elements = excalidrawAPI.getSceneElements();
      const sceneData = {
        elements: all_elements,
        appState: {
        },
      };
      excalidrawAPI.updateScene(sceneData);
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
      const { nativeEvent } = event.detail;
      var all_elements = excalidrawAPI.getSceneElements();
      if (is_vi_click(element)) {
      	var viewModeEnabled = excalidrawAPI.getAppState().viewModeEnabled;
      	if (!viewModeEnabled) {
      	      // Don't do anything when editing.
      	      event.preventDefault();
      	      return;
      	}
      	all_elements = add_remove_vi(element, all_elements);
      } else if (is_open_sidebar(element)) {
	const current_custome_sidebar_header = g_custome_sidebar_header;
	g_custome_sidebar_header = element.text;
	g_current_elemnt = element;
	var snippet = g_current_elemnt.customData;
	if (g_custome_sidebar_open) { 
		if (current_custome_sidebar_header === element.text) {
			// Open on the same element - need to close
			excalidrawAPI.toggleMenu("customSidebar");
		} else {
			// Open, but different element - need to change
			if (snippet !== undefined) {
				g_custome_sidebar_content = snippet.text.toString();
			} else {
				g_custome_sidebar_content = "";
			}
		}
	} else {
		g_custome_sidebar_open = true;
		// Closed. Need to open
		if (snippet !== undefined) {
			g_custome_sidebar_content = snippet.text.toString();
		} else {
			g_custome_sidebar_content = "";
		}
		excalidrawAPI.toggleMenu("customSidebar");	
	}
      }
      const sceneData = {
        elements: all_elements,
        appState: {
        },
      };
      excalidrawAPI.updateScene(sceneData);
      event.preventDefault();
    },
    [excalidrawAPI]
  );

  return (
    <div style={{ 
	height: "500px" 
    }}>
      <center>
      <p style={{ fontSize: "16px" }}> Web Dev Flow - using Excalidraw</p>
      </center>
      <Excalidraw 
	  onLinkOpen={onLinkOpen}
	  ref={(api) => setExcalidrawAPI(api)} 
	  initialData={{
          	elements: g_elements_orig,
          	appState: {
          	      viewModeEnabled: !g_edit_mode,
          	      zenModeEnabled: !g_edit_mode,
          	      viewBackgroundColor: "#f8f9fa",
		      zoom: 0.5,
          	},
          	scrollToContent: true
          }}
	  renderSidebar={() => {
	    const divStyle={
    		overflowY: 'scroll',
    		//border:'1px solid red',
		padding: "1rem",
    		float: 'center',
    		height:'400px',
   		position:'relative'
  	    };
	    const textStyle={
		position:'relative',
		height:'400px',
		display: g_display
  	    };

            return (
              <Sidebar dockable={true}>
                <Sidebar.Header>{g_custome_sidebar_header}</Sidebar.Header>
		    <div style={divStyle}>
		    <MarkdownView
      			markdown={g_custome_sidebar_content}
      			options={{ tables: true, emoji: true }}
    		    />
 		    <textarea 
 		    	defaultValue={g_custome_sidebar_content}
 		    	style={textStyle}
		    	onChange={onTextAreaChange}
 		    ></textarea>
		    </div>
              </Sidebar>
            );
          }}
	  />
    </div>
  );
}

export default App;
