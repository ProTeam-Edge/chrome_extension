
	function gmail_converter () {

		var selectors = {

			letter_container: ".h7",
			attachment_container: ".aZo",
			attachment_icons_container: ".aZo.N5jrZb[download_url] .aQw",
			reply_button: ".gE.iv.gt .gH.acX .aaq",
			attach_files_button: "div.a1",

		};

		return {

			document_to_file_data_arr: ( document, exec ) => {

				var file_data_arr = [];

				$(  selectors.attachment_container, document ).each( ( index, element ) => {

					var file_data = exec( "gmail_converter", "attachment_element_to_file_data", element );
					console.log(file_data);
					console.log('file_data');
					
					if ( file_data && file_data.type !== "unknown" ) {

						file_data_arr.push( file_data );

					};

				});

				return file_data_arr;

			},

			gmail_download_url_to_attachment_data ( gmail_download_url ) { 

				var gmail_download_url_parts = gmail_download_url.match( /(.+?)\:(.+?)\:(.+)/ );
				var attachment_data = {};

				attachment_data.mime_type = gmail_download_url_parts[ 1 ];
				attachment_data.file_name = decodeURIComponent( gmail_download_url_parts[ 2 ] );
				attachment_data.file_url = gmail_download_url_parts[ 3 ];

				return attachment_data;

			},

			attachment_icons_container_to_attachment_element_data ( attachment_icons_container, exec ) {

				var gmail_download_url = $( attachment_icons_container ).closest( selectors.attachment_container ).attr( "download_url" );
				var attachment_data = exec( "gmail_converter", "gmail_download_url_to_attachment_data", gmail_download_url );
				var buttons_amount = attachment_icons_container.querySelectorAll( "[role='button']" ).length;

				return {

					buttons_amount: buttons_amount,
					attachment_data: attachment_data,

				};

			},

			file_url_to_thumb_url ( file_url ) {

				var thumb_url = URI( attachment_data.file_url )
				.setQuery({

					view: "snatt",
					disp: "thd",
					stw: "800",

				}).toString();

				return thumb_url;

			},

			attachment_element_to_file_data ( element, exec ) {

				var good_extension_arr = [

					"doc",
					"dot",
					"wbk",
					"docx",
					"docm",
					"dotx",
					"dotm",
					"docb",
					"xls",
					"xlt",
					"xlm",
					"xlsx",
					"xlsm",
					"xltx",
					"xltm",
					"xlsb",
					"xla",
					"xlam",
					"xll",
					"xlw",
					"ppt",
					"pot",
					"pps",
					"pptx",
					"pptm",
					"potx",
					"potm",
					"ppam",
					"ppsx",
					"ppsm",
					"sldx",
					"sldm",
					"pub",
					"xps",

					"pdf",
					"txt",
					"csv",

					"jpeg",
					"jpg",
					"png",
					"webp"

				];

				var gmail_download_url = $( element ).attr( "download_url" );
				var auth_user_index = exec( "main_converter", "url_to_auth_user_index", element.ownerDocument.location.href );

				if ( gmail_download_url ) {

					var attachment_data = exec( "gmail_converter", "gmail_download_url_to_attachment_data", gmail_download_url );
					var file_extension = exec( "main_converter", "file_name_to_file_extension", attachment_data.file_name );

					if ( good_extension_arr.indexOf( file_extension ) >= 0 ) {

						return {

							type: "normal",
							file_name: attachment_data.file_name,
							download_url: attachment_data.file_url,

						};

					} else {

						return null;

					};

				} else if ( $( element ).children().filter( "a" ) && $( element ).children().filter( "a" ).attr( "href" ).indexOf( "https://docs.google.com/document/" ) === 0 ) {

					return {

						type: "normal",
						file_name: $( element ).find( ".aV3.a6U" ).text() + ".docx",
						download_url: exec( "main_converter", "google_docs_url_to_download_url", { auth_user_index, url: $( element ).children().filter( "a" ).attr( "href" ) } ),

					};

				} else if ( $( element ).children().filter( "a" ) && $( element ).children().filter( "a" ).attr( "href" ).indexOf( "https://docs.google.com/spreadsheets/" ) === 0 ) {

					return {

						type: "normal",
						file_name: $( element ).find( ".aV3.a6U" ).text() + ".xlsx",
						download_url: exec( "main_converter", "google_docs_url_to_download_url", { auth_user_index, url: $( element ).children().filter( "a" ).attr( "href" ) } ),

					};

				} else {

					return null;

				};

			},

		};

	};