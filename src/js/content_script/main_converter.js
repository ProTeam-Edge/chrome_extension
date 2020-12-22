
	function main_converter () {

		return {

			url_to_auth_user_index: function ( url ) {

				try {

					var auth_user_index = parseInt( url.match( /\/u\/([0-9]+)\// )[ 1 ] );

					if ( auth_user_index ) {

						return auth_user_index;

					} else {

						return 0;

					};

				} catch ( e ) {

					return 0;

				};

			},

			initial_data_to_download_url ( initial_data ) {

				var url_template = "https://docs.google.com/document/export?format=pdf&id={{id}}&token={{token}}&ouid={{ouid}}&includes_info_params={{includes_info_params}}";

				var includes_info_params = initial_data.info_params.includes_info_params;
				var token = initial_data.info_params.token;
				var ouid = initial_data[ "docs-pid" ];
				var id = initial_data.docs_abuse_link.replace( "https://docs.google.com/abuse?id=", "" );

				return url_template
					.replace( "{{id}}",							encodeURIComponent( id )							)
					.replace( "{{ouid}}",						encodeURIComponent( ouid )							)
					.replace( "{{token}}",						encodeURIComponent( token )							)
					.replace( "{{includes_info_params}}",		encodeURIComponent( includes_info_params )			);

			},

			context_menu_item_to_is_open_with: ( cmi_element ) => {

				var context_menu_item_icon_path_element = cmi_element.querySelector( "svg.a-s-fa-Ha-pa>path" );

				if ( context_menu_item_icon_path_element ) {

					var context_menu_item_icon_path = context_menu_item_icon_path_element.getAttribute( "d" );
					return context_menu_item_icon_path === "M11 5.83V10h2V5.83l1.83 1.83 1.41-1.42L12 2 7.76 6.24l1.41 1.42zm6.76 1.93l-1.42 1.41L18.17 11H14v2h4.17l-1.83 1.83 1.42 1.41L22 12zM13 18.17V14h-2v4.17l-1.83-1.83-1.41 1.42L12 22l4.24-4.24-1.41-1.42zM10 13v-2H5.83l1.83-1.83-1.42-1.41L2 12l4.24 4.24 1.42-1.41L5.83 13z";

				} else {

					return false;

				};

			},

			file_name_to_file_extension ( file_name ) {

				if ( file_name ) {

					var match = file_name.match( /\.[0-9a-z]+$/i );

					if ( match ) {

						return match[ 0 ];

					} else {

						return null;

					};

				} else {

					return null;

				};

			},

			url_to_file_name ( url ) {

				var match = url.match( /\/([^\/]+?)$/i );

				if ( match && match[ 1 ] ) {

					return match[ 1 ];

				} else {

					return null;

				};

			},

			file_name_to_file_extension ( file_name ) {

				var match = file_name.match( /\.([0-9a-z]+)$/i );

				if ( match ) {

					return match [ 1 ];

				};

				return null;

			},

			google_docs_file_data_to_download_url ( data ) {

				if ( typeof data.format === "undefined" ) {

					data.format = "pdf";

				} else if ( data.file_type === "presentation" ) {

					var download_url = "https://docs.google.com/" + data.file_type + "/u/" + data.auth_user_index + "/d/" + data.id + "/export/" + data.format;
					return download_url;

				} else {

					var download_url = "https://docs.google.com/" + data.file_type + "/u/" + data.auth_user_index + "/d/" + data.id + "/export?format=" + data.format;
					return download_url;

				};

			},

			google_docs_url_to_download_url ( data ) {

				var url = data.url;
				var auth_user_index = data.auth_user_index;

				if ( url.indexOf( "https://docs.google.com/document/d/" ) === 0 ) {

					var id = url.replace( "https://docs.google.com/document/d/", "" ).split( "/" )[ 0 ];
					var download_url = "https://docs.google.com/document/u/" + auth_user_index + "/d/" + id + "/export?format=docx";

					return download_url;

				} else if ( url.indexOf( "https://docs.google.com/spreadsheets/d/" ) === 0 ) {

					var id = url.replace( "https://docs.google.com/spreadsheets/d/", "" ).split( "/" )[ 0 ];
					var download_url = "https://docs.google.com/spreadsheets/u/" + auth_user_index + "/d/" + id + "/export?format=xlsx";

					return download_url;

				}

			},

			blob_to_base64 ( blob ) {

				return new Promise( ( resolve ) => {

					var reader = new FileReader();
					reader.readAsDataURL( blob ); 
					reader.onloadend = function () {

						resolve( reader.result );

					};

				});

			}

		}

	};