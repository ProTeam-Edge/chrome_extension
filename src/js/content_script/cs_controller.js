
	function controller () {

		var _app = null;
		var _exec = null;

		var _data = {

			selectors: {

				gmail: {

					attachment: ".aZo",
					attachment_icons_container: ".aZo .aQw",

					preview_container: ".aLF-aPX-aPk-aMh.aLF-aPX-Jq-aPn",
					preview_file_name: "div.aLF-aPX-aPU-awE[data-tooltip-class]",

					download_icon: ".aLF-aPX-JX.aLF-aPX-Mw-I-JX.aLF-aPX-aYT-JX",
					small_download_icon: '.aSK.J-J5-Ji.aYr',

				},

				common: {

					openwithmenu_web_store_icon: `div[role='menu'] div[style*='//ssl.gstatic.com/images/icons/product/chrome_web_store-16.png'], div[role='menu'] div[style*='https://ssl.gstatic.com/docs/doclist/images/mediatype/icon_11_presentation_x32.png']`,
					download_icon: ".ndfHFb-c4YZDc-Bz112c.ndfHFb-c4YZDc-C7uZwb-LgbsSe-Bz112c.ndfHFb-c4YZDc-nupQLb-Bz112c, .aLF-aPX-JX.aLF-aPX-Mw-I-JX.aLF-aPX-aYT-JX, .a-b-c.a-b-od-d-c.a-b-rb-c"

				}

			}

		};

		var _state = {};

		var _pub = {

			// converters

				decode_sequence: ( str ) => {

					return str.replace(/\\x([0-9A-Fa-f]{2})/g, function() {

						return String.fromCharCode(parseInt(arguments[1], 16));

					});

				},

			// utility procedures

				background_exec: async ( module_name, method_name, data, exec ) => {

					return await exec( "chrome", "call", "runtime.sendMessage", { module_name, method_name, data } );

				},

				make_sure_overlay_is_injected: async ( exec ) => {

					var iframe_overlay = document.querySelector( "#proteamedge_overlay" );

					if ( iframe_overlay ) {

						return true;

					} else {

						exec( "controller", "inject_overlay" );

					};

				},

				inject_styles: async () => {

					var style = document.createElement( "style" );
					style.innerHTML = await _app.x.ajax({ method: "get_text", url: chrome.extension.getURL( "/css/content.css" ) });
					document.head.appendChild( style );

				},

				inject_overlay: function () {

					$( document.body ).append( `

						<div id = "proteamedge_overlay" >
							<div id = "proteamedge_overlay_iframe_wrap" ></div>
							<div id = "proteamedge_overlay_close_button" >
								<svg viewBox = "0 0 24 24" >
									<path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
								</svg>
							</div>
						</div>

					` );

					var iframe = document.createElement( "iframe" );
					iframe.src = chrome.extension.getURL( "/pages/app_iframe_wrap/index.html" );

					$( "#proteamedge_overlay_iframe_wrap" ).append( iframe );

				},

				show_overlay: function () {

					$( "#proteamedge_overlay" ).addClass( "active" );

				},

				hide_overlay: function () {

					$( "#proteamedge_overlay" ).removeClass( "active" );

				},

				send_iframe_message: function ( name, data ) {

					$( "#proteamedge_overlay iframe" ).get( 0 ).contentWindow.postMessage({ name, data }, "*" );

				},

				simulate_mouse_event: function ( element, event_name ) {

					var event = new MouseEvent( event_name, {

						bubbles: true,
						cancelable: true,
						view: window

					});

					element.dispatchEvent( event );

				},

			// logic

				get_file_data: async ( url, exec ) => {

					// todo: implement cache here

					var response = await exec( "controller", "background_exec", "controller", "fetch_file_data", url );

					return response;

				},

				launch_file_flow: async ( file_data, exec ) => {

					await exec( "controller", "make_sure_overlay_is_injected" );

					exec( "controller", "send_iframe_message", "set_active_page_name", { active_page_name: "loading" } );

					exec( "controller", "show_overlay" );

					if ( file_data && file_data.type === "google_drive_file" ) {

						var response = await exec( "controller", "background_exec", "controller", "ajax", {

							method: "xhr",
							data: {

								method: "POST",
								url: "https://drive.google.com/uc?id=" + file_data.item_id + "&authuser=" + file_data.auth_user_index + "&export=download",
								response_type: "text",
								headers: {

									"x-drive-first-party": "DriveWebUi",
									"x-json-requested": true,
									"content-type": "application/x-www-form-urlencoded;charset=UTF-8",

								}

							}

						});

						if ( response.error === false ) {

							var data = _app.x.util.decode_json( response.response.replace( ")]}'\n", "" ) );

							var download_url = data.downloadUrl;

							var response = await exec( "controller", "get_file_data", download_url );

							exec( "controller", "send_iframe_message", "open_file", {

								file_name: file_data.file_name,
								object_url: response.data.object_url,

							});

						} else {

							exec( "log", "write_exec", "could_not_download_file" );
							exec( "controller", "send_iframe_message", "set_active_page_name", { active_page_name: "error" } );

						};

					} else if ( file_data && file_data.type === "normal" ) {

						var response = await exec( "controller", "get_file_data", file_data.download_url );

						exec( "controller", "send_iframe_message", "open_file", {

							file_name: file_data.file_name,
							object_url: response.data.object_url,

						});

					};

				},

				inject_ctx_menu_item: ( wrap ) => {

					$( wrap ).prepend( `

						<div class = "h-v proteamedge_contextmenu_item" role = "menuitem" aria-label = "proteamedge" >
							<div class="h-v-x" >
								<span class="h-v-c a-v-c">
									<img aria-hidden="true" class="a-v-c-Ua" src="` + chrome.extension.getURL( "/img/logo.png" ) + `" alt=""></span><span class="a-v-j">
									<span class="a-v-ff">
										<div class="a-v-T">ProTeam Edge</div>
									</span>
								</span>
							</div>
						</div>

					` );

				},

			// handlers

				handle_window_message: async ( name, data, event, exec ) => {

				},

				handle_tick: async ( exec ) => {

					// turn off logging for this method because it is repetitive

						exec( "meta", "do_not_log" );

					// return

						return null;

				},

				handle_context_menu_item: async ( context_menu_item, exec ) => {

					exec( "meta", "do_not_log" );

					var open_with_contextmenu = null;
					var is_open_with_bool = exec( "google_drive_converter", "context_menu_item_is_open_with", context_menu_item );

					if ( is_open_with_bool && _state.last_right_click_file_data && _state.last_right_click_file_data.type !== "unknown" ) {

						context_menu_item.addEventListener( "mouseenter", ( event ) => {

							if ( open_with_contextmenu === null ) {

								if ( _state.observer ) {

									_state.observer.disconnect( document.body );

								};

								_state.observer = new MutationObserver( ( records ) => {

									if ( records[ 0 ].addedNodes[ 0 ] ) {

										if ( $( records[ 0 ].addedNodes[ 0 ] ).is( ".h-w.a-w" ) ) {

											_state.observer.disconnect( document.body );
											_state.observer = null;

											var element = records[ 0 ].addedNodes[ 0 ];

											exec( "controller", "inject_ctx_menu_item", element.firstElementChild );
											open_with_contextmenu = element;

										};

									}

								});

								_state.observer.observe( document.body, {

									attributes: false,
									childList: true,
									subtree: false,

								});

							} else {

							};

						});

						context_menu_item.addEventListener( "mouseleave", ( event ) => {

							if ( _state.observer ) {

								_state.observer.disconnect( document.body );
								_state.observer = null;

							};

						});

					};

				},

				handle_context_menu_click: async ( event, exec ) => {

					var list_item = $( event.target ).closest( ".O5x1db.ACGwFc" ).closest( ".WYuW0e" );
					var block_item = $( event.target ).closest( ".jGNTYb.ACGwFc" ).closest( ".WYuW0e" );
					var quick_access_item = $( event.target ).closest( ".Ccie2c.a-HZnjzd-xb-QBLLGd" );
					
					exec( "log", "write_exec", "list_item", list_item.get( 0 ) );
					exec( "log", "write_exec", "block_item", block_item.get( 0 ) );
					exec( "log", "write_exec", "quick_access_item", quick_access_item.get( 0 ) );

					if ( list_item.get( 0 ) ) {

						_state.last_right_click_file_data = exec( "google_drive_converter", "list_item_to_file_data", list_item.get( 0 ) );

					} else if ( block_item.get( 0 ) ) {

						_state.last_right_click_file_data = exec( "google_drive_converter", "block_item_to_file_data", block_item.get( 0 ) );

					} else if ( quick_access_item.get( 0 ) ) {
						
						_state.last_right_click_file_data = exec( "google_drive_converter", "quick_access_item_to_file_data", quick_access_item.get( 0 ) );
				

					} else {

						_state.last_right_click_file_data = null;

					};
					/* console.log(_state.last_right_click_file_data);
					console.log('debug now'); */
				},

				handle_gmail_open_with_menu: async ( element ) => {

					$( element ).find( `[role="menuitem"]` ).first().before( `

						<div class="aLF-aPX-N proteamedge_openwithmenu_item proteamedge_gmail_openwithmenu_item" role="menuitem" style="user-select: none;">
							<div class="aLF-aPX-N-Jz" style="user-select: none;">
								<div class="aLF-aPX-JX aLF-aPX-N-JX" style="background-image: url( '${ chrome.extension.getURL( "/img/logo.png" ) }' ); background-position: left top; background-repeat: no-repeat; user-select: none;"></div>
								ProTeam Edge
							</div>
						</div>

					`);

				},

				handle_drive_open_with_menu: async ( element ) => {

					$( element ).find( `[role="menuitem"]` ).first().before( `

						<div class="a-b-v proteamedge_openwithmenu_item proteamedge_google_drive_openwithmenu_item" role="menuitem" style="user-select: none;" id=":ag">
							<div class="a-b-v-x" style="user-select: none;">
								<div class="a-b-c a-b-v-c" style="background-image: url( '${ chrome.extension.getURL( "/img/logo.png" ) }' ); background-position: left top; background-repeat: no-repeat; user-select: none;"></div>
								ProTeam Edge
							</div>
						</div>

					`);

				},

				handle_common_open_with_menu: async ( element ) => {

					$( element ).before( `

						<div class="proteamedge_openwithmenu_item" role="menuitem" >
							<div class = "proteamedge_openwithmenu_item_icon" style="background-image: url( '${ chrome.extension.getURL( "/img/logo.png" ) }' )" ></div>
							ProTeam Edge
						</div>

					`);

				},

				handle_google_drive_openwithmenu_item_click: async ( event, exec ) => {

					var str = exec( "controller", "decode_sequence", document.querySelector( "#drive-active-item-info" ).innerText );
					var info = exec( "util", "decode_json", str );

					exec( "log", "write_exec", "info", info );

					var auth_user_index = exec( "main_converter", "url_to_auth_user_index", document.location.href );
					var thumb_url = "https://lh3.google.com/u/" + auth_user_index + "/d/" + info.id + "=w300-k-iv1";

					var file_data = {

						type: "google_drive_file",
						file_name: info.title,
						item_id: info.id,
						thumb_url,
						auth_user_index

					};

					exec( "controller", "launch_file_flow", file_data );

				},

				handle_attachment_item_click: async ( event, exec ) => {

					var file_data_arr = [];

					$( event.currentTarget.parentElement ).find( _data.selectors.gmail.attachment ).each( ( index, element ) => {

						var file_data = exec( "gmail_converter", "attachment_element_to_file_data", element );
						file_data_arr.push( file_data );

					});

					exec( "log", "write_exec", "file_data_arr", file_data_arr );

					_state.file_data_arr = file_data_arr;

				},

				handle_runtime_message: async ( name, data, exec ) => {

					if ( name === "file_capture_complete" ) {

						var file_data = {

							type: "normal",
							file_name: data.file_capture_info.file_name,
							download_url: data.file_capture_info.url,

						};

						exec( "controller", "launch_file_flow", file_data );

					};

				},

				handle_gmail_openwithmenu_item_click: async ( event, exec ) => {

					await exec( "controller", "make_sure_overlay_is_injected" );

					exec( "controller", "send_iframe_message", "set_active_page_name", { active_page_name: "loading" } );

					await exec( "controller", "show_overlay" );

					// var info = exec( "util", "decode_json", document.querySelector( "#drive-active-item-info" ).innerText );
					// var file_name = info.title;

					var file_name_element = document.querySelector( _data.selectors.gmail.preview_file_name )

					if ( file_name_element.dataset.tooltip ) {

						var file_name = file_name_element.dataset.tooltip;

					} else {

						var file_name = file_name_element.innerText;

					};

					await exec( "controller", "background_exec", "controller", "capture_file", { sender: true, file_name } );

					var download_icon = document.querySelector( _data.selectors.gmail.download_icon );
					var download_button = download_icon.parentElement;

					// simply calling .click on download_button does not work, but this works and triggers a download request

					exec( "controller", "simulate_mouse_event", download_button, "mousedown" );
					exec( "controller", "simulate_mouse_event", download_button, "mouseup" );

					// after this the extension will wait for a runtime message with the captured url

					// var preview_container_arr = Array.from( document.querySelectorAll( _data.selectors.gmail.preview_container ) );
					// var index = 0;

					// for ( var i = 0; i < preview_container_arr.length; i++ ) {

					// 	if ( preview_container_arr[ i ].style.display === "" ) {

					// 		index = i;
					// 		break;

					// 	};

					// };

					// exec( "log", "write_exec", "index", index );

					// exec( "controller", "launch_file_flow", _state.file_data_arr[ index ] );

				},

				handle_openwithmenu_item_click: async ( event, exec ) => {

					await exec( "controller", "make_sure_overlay_is_injected" );

					exec( "controller", "send_iframe_message", "set_active_page_name", { active_page_name: "loading" } );

					await exec( "controller", "show_overlay" );

					var str = exec( "controller", "decode_sequence", document.querySelector( "#drive-active-item-info" ).innerText );
					var info = exec( "util", "decode_json", str );

					var file_name = info.title;

					exec( "log", "write_exec", "info", info );

					if ( info.id ) {

						var auth_user_index = exec( "main_converter", "url_to_auth_user_index", document.location.href );
						var thumb_url = "https://lh3.google.com/u/" + auth_user_index + "/d/" + info.id + "=w300-k-iv1";

						if ( info.mimeType === "application/vnd.google-apps.document" ) {

							var file_data = {

								type: "normal",
								file_name: file_name + ".docx",
								thumb_url: thumb_url,
								auth_user_index,
								download_url: exec( "main_converter", "google_docs_file_data_to_download_url", {

									id: info.id,
									format: "docx",
									file_type: "document",
									auth_user_index

								}),

							};

						} else if ( info.mimeType === "application/vnd.google-apps.spreadsheet" ) {

							var file_data = {

								type: "normal",
								file_name: file_name + ".xlsx",
								thumb_url: thumb_url,
								auth_user_index,
								download_url: exec( "main_converter", "google_docs_file_data_to_download_url", {

									id: info.id,
									format: "xlsx",
									file_type: "spreadsheets",
									auth_user_index

								}),

							};

						} else if ( info.mimeType === "application/vnd.google-apps.presentation" ) {

							var file_data = {

								type: "normal",
								file_name: file_name + ".pptx",
								thumb_url: thumb_url,
								auth_user_index,
								download_url: exec( "main_converter", "google_docs_file_data_to_download_url", {

									id: info.id,
									format: "pptx",
									file_type: "presentation",
									auth_user_index

								}),

							};

						} else {

							var file_data = {

								type: "google_drive_file",
								file_name: info.title,
								item_id: info.id,
								thumb_url,
								auth_user_index

							};

						}

						exec( "controller", "launch_file_flow", file_data );

					} else {

						await exec( "controller", "background_exec", "controller", "capture_file", { sender: true, file_name: info.title } );

						var download_icon = document.querySelector( _data.selectors.common.download_icon );
						var download_button = download_icon.parentElement;

						// simply calling .click on download_button does not work, but this works and triggers a download request

						exec( "controller", "simulate_mouse_event", download_button, "mousedown" );
						exec( "controller", "simulate_mouse_event", download_button, "mouseup" );

						// after this the extension will wait for a runtime message with the captured url

					};

				},

				handle_gmail_attachment_button: async ( event, exec ) => {

					await exec( "controller", "make_sure_overlay_is_injected" );

					var data = exec( "gmail_converter", "attachment_icons_container_to_attachment_element_data", event.currentTarget.parentElement );
					var file_name = data.attachment_data.file_name

					exec( "controller", "send_iframe_message", "set_active_page_name", { active_page_name: "loading" } );

					await exec( "controller", "show_overlay" );

					await exec( "controller", "background_exec", "controller", "capture_file", { sender: true, file_name } );

					var download_icon = event.currentTarget.parentElement.querySelector( _data.selectors.gmail.small_download_icon );
					var download_button = download_icon.parentElement;

					// simply calling .click on download_button does not work, but this works and triggers a download request

					exec( "controller", "simulate_mouse_event", download_button, "mousedown" );
					exec( "controller", "simulate_mouse_event", download_button, "mouseup" );
					download_button.click();

				},

			// init

				add_observers: () => {

					// Google Drive - detect context menu item

						_app.x.detect({

							method: "normal",
							selector: ".h-w.a-w .h-v",
							callback: ( context_menu_item ) => {

								_exec( "controller", "handle_context_menu_item", context_menu_item );

							},

						});

					// Google Drive - detect file item	

						_app.x.detect({

							method: "normal",
							selector: ".a-S.a-s-tb-pa",
							callback: ( element ) => {

								element.addEventListener( "contextmenu", ( event ) => {

									_exec( "controller", "handle_context_menu_click", event );

								});

							},

						});

					// Common - open with menu

						_app.x.detect({

							method: "normal",
							selector: _data.selectors.common.openwithmenu_web_store_icon,
							callback: ( element ) => {

								_exec( "controller", "handle_common_open_with_menu", element.parentElement.parentElement );

							},

						});

					// Google Drive - detect open with menu

						// _app.x.detect({

						// 	method: "normal",
						// 	selector: ".a-b-w.a-b-w-Xi.a-b-lc.a-b-L",
						// 	callback: ( element ) => {

						// 		_exec( "controller", "handle_drive_open_with_menu", element );

						// 	},

						// });

					// Gmail - detect open with menu

						// _app.x.detect({

						// 	method: "normal",
						// 	selector: ".aLF-aPX-M.aLF-aPX-M-ayU.aLF-aPX-aPH.aLF-aPX-bhP",
						// 	callback: ( element ) => {

						// 		// ignore open with menu that was opened with a top-right menu button

						// 		if ( element.querySelector( ".aLF-aPX-JX.aLF-aPX-N-JX.aLF-aPX-aXi-I.aLF-aPX-Mw-I-JX" ) === null ) {

						// 			_exec( "controller", "handle_gmail_open_with_menu", element );

						// 		};

						// 	},

						// });

					// Gmail - observe attachment item clicks

						_app.x.detect({

							method: "normal",
							selector: _data.selectors.gmail.attachment,
							callback: ( element ) => {

								element.addEventListener( "click", ( event ) => {

									_exec( "controller", "handle_attachment_item_click", event );

								});

							},

						});

					// Gmail - extend icon container

						_app.x.detect({

							method: "normal",
							selector: _data.selectors.gmail.attachment_icons_container,
							callback: ( element ) => {

								var attachment_data = _exec( "gmail_converter", "attachment_icons_container_to_attachment_element_data", element );

								var button = $( `
									<div class = "proteamedge_attachment_button T-I J-J5-Ji aQv T-I-ax7 L3" data-tooltip = "ProTeam Edge" >
										<img src = "` + chrome.extension.getURL( "/img/logo_white.svg" ) + `" >
									</div>
								` );

								if ( attachment_data.buttons_amount >= 3 ) {

									button.css( "margin", "0px 8px 0px 0px" );

								};

								$( element ).append( button );

							},

						});

					// event listeners

						window.addEventListener( "message", ( event ) => {

							if ( event.data ) {

								var name = event.data.name;
								var data = event.data.data;

								if ( name ) {

									_exec( "controller", "handle_window_message", name, data, event );

								};

							};

						});

						$( document ).on( "click", ".proteamedge_contextmenu_item", ( event ) => {

							_exec( "controller", "launch_file_flow", _state.last_right_click_file_data );

						});

						$( document ).on( "click", ".proteamedge_google_drive_openwithmenu_item", ( event ) => {

							_exec( "controller", "handle_google_drive_openwithmenu_item_click", event );

						});

						$( document ).on( "click", ".proteamedge_gmail_openwithmenu_item", ( event ) => {

							_exec( "controller", "handle_gmail_openwithmenu_item_click", event );

						});

						$( document ).on( "click", ".proteamedge_openwithmenu_item", ( event ) => {

							_exec( "controller", "handle_openwithmenu_item_click", event );

						});

						$( document ).on( "click", "#proteamedge_overlay, #proteamedge_overlay_close_button", ( event ) => {

							_exec( "controller", "hide_overlay" );

						});

						$( document ).on( "click", ".proteamedge_attachment_button", ( event ) => {

							_exec( "controller", "handle_gmail_attachment_button", event );

						});

					// runtime

						chrome.runtime.onMessage.addListener( ( message ) => {

							_exec( "controller", "handle_runtime_message", message.name, message.data );

						});

					// setInterval( () => {

					// 	_exec( "controller", "handle_tick" );

					// }, 100 );

				},

				init: ( app ) => {

					_app = app;
					_exec = _app.exec.exec;

					$( document ).ready( () => {

						_exec( "controller", "inject_styles" );
						_exec( "controller", "add_observers" );

					});

				},

		};

		return _pub;

	};
