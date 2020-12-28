
	function google_drive_converter () {

		var x = window[ window.webextension_library_name ];

		return {

			context_menu_item_is_open_with: ( cmi_element ) => {

				var context_menu_item_icon_path_element = cmi_element.querySelector( "svg.a-s-fa-Ha-pa>path" );

				if ( context_menu_item_icon_path_element ) {

					var context_menu_item_icon_path = context_menu_item_icon_path_element.getAttribute( "d" );
					return context_menu_item_icon_path === "M11 5.83V10h2V5.83l1.83 1.83 1.41-1.42L12 2 7.76 6.24l1.41 1.42zm6.76 1.93l-1.42 1.41L18.17 11H14v2h4.17l-1.83 1.83 1.42 1.41L22 12zM13 18.17V14h-2v4.17l-1.83-1.83-1.41 1.42L12 22l4.24-4.24-1.41-1.42zM10 13v-2H5.83l1.83-1.83-1.42-1.41L2 12l4.24 4.24 1.42-1.41L5.83 13z";

				} else {

					return false;

				};

			},

			document_to_file_data_arr ( document, exec ) {

				// init

					var file_data_arr = [];

				// list items / block items

					var visible_container = $( "[ guidedhelpid = 'main_container' ]>div:not([ style ])", document );

					var list_items = $( ".WYuW0e .O5x1db.ACGwFc", visible_container ).closest( ".WYuW0e" );
					var block_items = $( ".WYuW0e .jGNTYb.ACGwFc", visible_container ).closest( ".WYuW0e" );
					var quick_access_items = $( ".Ccie2c.a-HZnjzd-xb-QBLLGd", visible_container );

					if ( quick_access_items.length > 0 ) {

						quick_access_items.each( ( index, quick_access_item ) => {

							var file_data = exec( "google_drive_converter", "quick_access_item_to_file_data", quick_access_item );

							if ( file_data && file_data.type !== "unknown" ) {

								file_data_arr.push( file_data );

							};

						});

					};

					if ( list_items.length > 0 ) {

						list_items.each( ( index, list_item ) => {

							var file_data = exec( "google_drive_converter", "list_item_to_file_data", list_item );

							if ( file_data && file_data.type !== "unknown" ) {

								file_data_arr.push( file_data );

							};

						});

					} else if ( block_items.length > 0 ) {

						block_items.each( ( index, block_item ) => {

							var file_data = exec( "google_drive_converter", "block_item_to_file_data", block_item );

							if ( file_data && file_data.type !== "unknown" ) {

								file_data_arr.push( file_data );

							};

						});

					};

				// return

					return file_data_arr;

			},

			list_item_to_file_data ( item, exec ) {

				var item_id = item.dataset.id;
				var file_name = x.util.doc_to_val([ item, ".KL4NAf", "attr", "aria-label" ]);
				var icon_src = x.util.doc_to_val([ item, ".V1mwke img", "attr", "src" ]);

				var auth_user_index = exec( "main_converter", "url_to_auth_user_index", item.ownerDocument.location.href );

				var file_data = exec( "google_drive_converter", "tile_entry_data_to_file_data", {

					item_id: item_id,
					file_name: file_name,
					icon_src: icon_src,
					auth_user_index: auth_user_index,

				});

				return file_data;

			},

			block_item_to_file_data ( item, exec ) {

				var item_id = item.dataset.id;
				var file_name = x.util.doc_to_val([ item, ".Q5txwe", "text" ]);
				var icon_src = x.util.doc_to_val([ item, ".tohzcb img", "attr", "src" ]);

				var file_data = exec( "google_drive_converter", "tile_entry_data_to_file_data", {

					item_id: item_id,
					file_name: file_name,
					icon_src: icon_src,

				});

				return file_data;

			},

			quick_access_item_to_file_data ( item, exec ) {

				var item_id = x.util.doc_to_val([ item, ".l-u-Ab-zb-Ua", "attr", "src" ]).match( /\/d\/(.+)\=/ )[ 1 ];
				var file_name = x.util.doc_to_val([ item, ".eAQ1W", "attr", "data-tooltip" ]);
				var icon_src = x.util.doc_to_val([ item, ".a-Ua-c", "attr", "src" ]);
				
				var file_data = exec( "google_drive_converter", "tile_entry_data_to_file_data", {

					item_id: item_id,
					file_name: file_name,
					icon_src: icon_src,

				});

				return file_data;

			},

			tile_entry_data_to_file_data ( tile_entry_data, exec ) {

				var item_id = tile_entry_data.item_id;
				var file_name = tile_entry_data.file_name;
				var icon_src = tile_entry_data.icon_src;
				
				/* console.log(item_id);
				console.log(file_name);
				console.log(icon_src); */
				
				var auth_user_index = exec( "main_converter", "url_to_auth_user_index", document.location.href );
				console.log(auth_user_index)
				var thumb_url = "https://lh3.google.com/u/" + auth_user_index + "/d/" + item_id + "=w300-k-iv1";

				if (

					icon_src && (

						// new

						icon_src === "https://drive-thirdparty.googleusercontent.com/16/type/image/jpeg" || // jpeg file icon
						icon_src === "https://drive-thirdparty.googleusercontent.com/16/type/image/jpg" || // jpg file icon
						icon_src === "https://drive-thirdparty.googleusercontent.com/16/type/image/png" || // png file icon
						icon_src === "https://drive-thirdparty.googleusercontent.com/16/type/image/bmp" || // png file icon
						icon_src === "https://drive-thirdparty.googleusercontent.com/16/type/image/tiff" || // png file icon
						icon_src === "https://drive-thirdparty.googleusercontent.com/16/type/image/heic" || // png file icon
						icon_src === "https://drive-thirdparty.googleusercontent.com/16/type/image/heif" || // png file icon
						icon_src === "https://drive-thirdparty.googleusercontent.com/16/type/image/svg+xml" || // svg file icon

						icon_src === "https://drive-thirdparty.googleusercontent.com/16/type/image/vnd.adobe.photoshop" || // psd file icon

						icon_src === "https://drive-thirdparty.googleusercontent.com/16/type/application/zip" || // zip file icon
						icon_src === "https://drive-thirdparty.googleusercontent.com/16/type/application/pdf" || // pdf file icon
						icon_src === "https://drive-thirdparty.googleusercontent.com/16/type/application/vnd.openxmlformats-officedocument.wordprocessingml.document" || // word file icon

						icon_src === "https://drive-thirdparty.googleusercontent.com/16/type/text/plain" || // text file icon
						icon_src === "https://drive-thirdparty.googleusercontent.com/16/type/text/html" || // html file icon
						icon_src === "https://drive-thirdparty.googleusercontent.com/16/type/text/rtf" || // rtf file icon
						icon_src === "https://drive-thirdparty.googleusercontent.com/16/type/text/richtext" || // richtext file icon

						// backwards compatibility

						icon_src === "//ssl.gstatic.com/docs/doclist/images/mediatype/icon_3_pdf_x16.png" || // pdf file icon
						icon_src === "//ssl.gstatic.com/docs/doclist/images/mediatype/icon_1_text_x16.png" || // text file icon
						icon_src === "//ssl.gstatic.com/docs/doclist/images/mediatype/icon_1_image_x16.png" || // image file icon
						icon_src === "//ssl.gstatic.com/docs/doclist/images/mediatype/icon_1_word_x16.png" // word file icon

					)

				) {

					var file_data = {

						type: "google_drive_file",
						file_name: file_name,
						item_id: item_id,
						thumb_url: thumb_url,
						auth_user_index

					};

					return file_data;

				} else if (

					// new

					icon_src === "https://drive-thirdparty.googleusercontent.com/16/type/application/vnd.google-apps.document" ||

					// legacy

					icon_src === "//ssl.gstatic.com/docs/doclist/images/mediatype/icon_1_document_x16.png"

				) { // docx file icon

					var file_data = {

						type: "normal",
						file_name: file_name + ".docx",
						thumb_url: thumb_url,
						auth_user_index,
						download_url: exec( "main_converter", "google_docs_file_data_to_download_url", {

							id: item_id,
							format: "docx",
							file_type: "document",
							auth_user_index

						}),

					};

					return file_data;

				} else if (

					// new

					icon_src === "https://drive-thirdparty.googleusercontent.com/16/type/application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
					icon_src === "https://drive-thirdparty.googleusercontent.com/16/type/application/vnd.google-apps.spreadsheet" ||

					// legacy

					icon_src === "//ssl.gstatic.com/docs/doclist/images/mediatype/icon_1_spreadsheet_x16.png"

				) { // xlsx file icon

					var file_data = {

						type: "normal",
						file_name: file_name + ".xlsx",
						thumb_url: thumb_url,
						auth_user_index,
						download_url: exec( "main_converter", "google_docs_file_data_to_download_url", {

							id: item_id,
							format: "xlsx",
							file_type: "spreadsheets",
							auth_user_index

						}),

					};

					return file_data;

				} else if (

					icon_src === "https://drive-thirdparty.googleusercontent.com/16/type/application/vnd.google-apps.presentation"

				) { // pptx file icon

					var file_data = {

						type: "normal",
						file_name: file_name + ".pptx",
						thumb_url: thumb_url,
						auth_user_index,
						download_url: exec( "main_converter", "google_docs_file_data_to_download_url", {

							id: item_id,
							format: "pptx",
							file_type: "presentation",
							auth_user_index

						}),

					};

					return file_data;

				} else if ( icon_src.indexOf( "https://drive-thirdparty.googleusercontent.com/16/type/" ) === 0 ) {

					var file_data = {

						type: "google_drive_file",
						file_name: file_name,
						item_id: item_id,
						thumb_url: thumb_url,
						auth_user_index

					};

					return file_data;

				} else {

					return {

						type: "unknown"

					};

				};

			}

		};

	};
