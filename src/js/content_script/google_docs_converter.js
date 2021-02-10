
	function google_docs_converter () {
		alert("google docs converter if")
		return {

			document_to_file_data ( document, conv ) {

				if ( document.location.href.indexOf( "https://docs.google.com/document" ) === 0 ) {
					alert("google docs converter document found if")
					var match = document.location.pathname.match( /^\/document\/d\/(.+?)\// );
					var main_page_url = $( "#docs-branding-container>a" ).attr( "href" );
					var auth_user_index = conv( "main", "url", "auth_user_index", main_page_url );

					if ( match ) {
						alert("google docs converter document match")
						return {

							type: "normal",
							file_name: $( ".docs-title-input-label-inner", document ).text() + ".docx",
							auth_user_index: auth_user_index,
							thumb_url: "https://lh3.google.com/u/" + auth_user_index + "/d/" + match[ 1 ] + "=w300-k-iv1",
							download_url: conv( "main", "google_docs_file_data", "download_url", {

								id: match[ 1 ],
								format: "docx",
								file_type: "document",
								auth_user_index,

							}),

						};

					} else {
						alert("google docs converter document found first else")
						return null;

					};

				} else if ( document.location.href.indexOf( "https://docs.google.com/spreadsheets" ) === 0 ) {
					alert("google docs converter spreadsheet found else if")
					var match = document.location.pathname.match( /^\/spreadsheets\/d\/(.+?)\// );

					if ( match ) {
						alert("google docs converter spreadsheet found if")
						return {

							type: "normal",
							file_name: $( ".docs-title-input-label-inner", document ).text() + ".xlsx",
							auth_user_index: auth_user_index,
							thumb_url: "https://lh3.google.com/u/" + auth_user_index + "/d/" + match[ 1 ] + "=w300-k-iv1",
							download_url: conv( "main", "google_docs_file_data", "download_url", {

								id: match[ 1 ],
								format: "xlsx",
								file_type: "spreadsheets",
								auth_user_index,

							}),

						};

					} else {
						alert("google docs converter spreadsheet found else")
						return null;

					};

				} else {
					alert("google docs converter spreadsheet found first else")
					return null;

				};

			},

		};

	};

