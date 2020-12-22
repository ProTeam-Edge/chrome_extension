
	function controller () {

		var _app = null;
		var _exec = null;

		var _pub = {

			// converters - element_to_declaration_arr

				blob_to_base64: ( blob ) => {

					return new Promise( ( resolve ) => {

						var reader = new FileReader();
						reader.readAsDataURL( blob );
						reader.onloadend = function () {

							resolve( reader.result );

						};

					});

				},

			// api

				ajax: function ( data ) {

					return _app.x.ajax( data );

				},

				fetch_file_data: function ( url, exec ) {

					return new Promise( ( resolve ) => {

						// init

							var xhr = new XMLHttpRequest();
							xhr.open( "GET", url, true );

							// xhr.timeout = 20000;
							xhr.responseType = "blob";

						// define event listeners

							async function load_listener () {

								if ( ( xhr.status >= 200 && xhr.status < 400 ) || xhr.status === 0 ) {

									var object_url = URL.createObjectURL( this.response )

									resolve({

										meta: {

											error: false,
											source: "loaded",

										},

										data: {

											object_url: object_url,

										}

									});

								} else {

									resolve({

										meta: {

											error: true,

										}

									});

								};

							};

							function error_listener () {

								resolve({

									meta: {

										error: true,

									}

								});

							};

						// register listeners

							xhr.addEventListener( "load", load_listener );
							xhr.addEventListener( "error", error_listener );
							xhr.addEventListener( "abort", error_listener );
							xhr.addEventListener( "timeout", error_listener );

						// send

							xhr.send( null );

					});

				},

				kickstart: function ( exec ) {

					exec( "state", "set", "file_capture_info", {

						capture: false,

					});

				},

				capture_file: async function ( data, exec ) {

					exec( "state", "set", "file_capture_info", {

						capture: true,
						captured: false,
						tab_id: data.sender.tab.id,
						file_name: data.file_name,

					});

				},

			// handlers

				handle_runtime_message: async ( message, sender, callback, exec ) => {

					exec( "log", "write_exec", message.module_name );
					exec( "log", "write_exec", message.method_name );

					if ( message.data && message.data.sender ) {

						message.data.sender = sender;

					};

					var result = await exec( message.module_name, message.method_name, message.data );

					callback( result );

				},

				handle_on_before_request: ( details, exec ) => {

					var file_capture_info = exec( "state", "get", "file_capture_info" );

					if ( file_capture_info.capture === true ) {

						file_capture_info.capture = false;
						file_capture_info.captured = true;
						file_capture_info.url = details.url;

						exec( "state", "set", "file_capture_info", file_capture_info );

						exec( "chrome", "call", "tabs.sendMessage", file_capture_info.tab_id, {

							name: "file_capture_complete",
							data: { file_capture_info }

						});

						return {

							cancel: true,

						};

					} else {

						return null;

					};

				},

			// add_observers

				add_observers: () => {

					chrome.runtime.onMessage.addListener( function ( message, sender, callback ) {

						_exec( "controller", "handle_runtime_message", message, sender, callback );
						return true;

					});

					chrome.webRequest.onBeforeRequest.addListener( ( details ) => {

						return _exec( "controller", "handle_on_before_request", details );

					}, { urls: ["https://mail-attachment.googleusercontent.com/*" ] }, [ "blocking" ] );

				},

			// main

				init: ( app ) => {

					_app = app;
					_exec = app.exec.exec;

					_exec( "controller", "add_observers" );
					_exec( "controller", "kickstart" );

				},

		};

		return _pub;

	};
