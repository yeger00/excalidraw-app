import './App.css';
import React, { useState, useCallback } from "react";
import { Excalidraw, Sidebar } from "@excalidraw/excalidraw";
import { vi, VI_LINK } from "./vi";
import MarkdownView from 'react-showdown';
var init_state = require('./init_state.json');


// All globals
var g_elements_orig = init_state.elements;
var g_custome_sidebar_open = false;
var g_custome_sidebar_header = "Nothing to see here"
var g_custome_sidebar_content = "yet..."
var g_current_elemnt = {};
var g_vi_elements = {};
var g_edit_mode = false;
var g_name = "main";
var g_display = 'none';

function init() {
	const params = new Proxy(new URLSearchParams(window.location.search), {
	  get: (searchParams, prop) => searchParams.get(prop),
	});
	g_edit_mode = params.edit === "true";
	if (undefined != params.file) {
		g_name = params.file;
	}
	if (g_edit_mode) {
		g_display = 'visible';
	}
	g_elements_orig = init_vi_for_elements(g_elements_orig);
}

function create_vi_id_for_element(id) {
	if (id.endsWith("_vi")) {
		return id
	}
	return id + "_vi";
}

function create_element_id_for_vi(id) {
	if (id.endsWith("_vi")) {
		return id.substr(0, id.length-3);
	}
	return id;
}

function create_vi_for_elemnt(element, y_offset) {
	let vi_copy = JSON.parse(JSON.stringify(vi));
	vi_copy.x = element.x + 2;
	vi_copy.y = element.y + y_offset;
	console.log(vi_copy);
	vi_copy.id = create_vi_id_for_element(element.id);
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
	const vi_id = create_vi_id_for_element(element.id);
	// Create a new list without the vi
	all_elements = all_elements.filter(function( obj ) {
  	  return obj.id !== vi_id;
	});
	
	const new_num_of_elements = all_elements.length;

	if (new_num_of_elements === num_of_elements) {
		// Didn't find vi, let's add it
		var vi_copy = create_vi_for_elemnt(element, 0);
		all_elements.push(vi_copy);
		add_vi_to_strage(element.id);
	} else {
		remove_vi_from_strage(create_element_id_for_vi(element.id));
	}
	return all_elements;
}

function add_vi_to_strage(vi_id) {
	try {
		g_vi_elements[g_name].push(vi_id);
	} catch (error) {
                g_vi_elements = {g_name: []};
        }
	localStorage.setItem("vi_elements", JSON.stringify(g_vi_elements));
}

function remove_vi_from_strage(vi_id) {
	try {
		const index = g_vi_elements[g_name].indexOf(vi_id);
		if (index > -1) {
			g_vi_elements[g_name].splice(index, 1);
		}
	} catch (error) {
                g_vi_elements = {g_name: []};
        }
	localStorage.setItem("vi_elements", JSON.stringify(g_vi_elements));
}

function init_vi_for_elements(all_elements) {
	try {
		g_vi_elements = localStorage.getItem("vi_elements");
		if (undefined == g_vi_elements) {
			// First time, let's add a default
			g_vi_elements = {g_name: []}
		} else {
			g_vi_elements = JSON.parse(g_vi_elements);
			if (undefined == g_vi_elements[g_name]) {
				g_vi_elements[g_name] = []
			} else {
				// Need to init these ids
				var new_vis = [];
				all_elements.forEach(element => {
					if (-1 != g_vi_elements[g_name].indexOf(element.id)) {
						var vi_copy = create_vi_for_elemnt(element, -4);
						new_vis.push(vi_copy);
					}
				});
				all_elements = all_elements.concat(new_vis);
			}

		}
	} catch (error) {
		g_vi_elements = {g_name: []};
	}
	localStorage.setItem("vi_elements", JSON.stringify(g_vi_elements));
	return all_elements;
}

init();
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
	height: "100vh" 
    }}>
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
