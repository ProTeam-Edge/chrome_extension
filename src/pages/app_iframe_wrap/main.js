( function () {

	function send_iframe_message ( name, data ) {
			console.log(name)
			console.log('name')
			console.log(data)
			console.log('data')
			document.querySelector( "#app_iframe" ).contentWindow.postMessage({ name, data }, "*" );
			//PTE by moving this here, the waiting indicate is not removed until my page is loaded and message is sent to my window.
			$( ".page" ).removeClass( "active" );
			$( ".page.app_iframe" ).addClass( "active" );
	};

	//PTE waits for a condition, retries according to settings.

	function pte_wait_for_ready(waitPeriod, tryFrequency, checkCondition, callback, errorHandler){
		//in milliseconds. Checks every tryFrequency for checkCondition. If true, then callback. Keeps trying up to waitPeriod. Fails to errorHandler.
		var tryTimes = parseInt(waitPeriod / tryFrequency);
		if (checkCondition()) {
			callback();
			return;
		}
		var tryCount = 1;
		var alpn_timer = setInterval(function(){
			if (checkCondition()) {
				clearInterval(alpn_timer);
				callback();
			}
			tryCount++;
			if (tryCount >= tryTimes) {
				clearInterval(alpn_timer);
				errorHandler();
			}
		}, tryFrequency);
	}

	window.addEventListener( "message", async ( event ) => {
	
		var name = event.data.name;
		var data = event.data.data;

		if (name == 'app_ready') {
	
			appReady = true;

		} else if ( name === "open_file" ) {
		
			var result = await fetch( data.object_url );
			var blob = await result.blob();
			URL.revokeObjectURL( data.object_url );

			pte_wait_for_ready(10000, 250,
				function(){
					if (typeof appReady !== "undefined") {
							return true;
					}
					return false;
				},
				function(){
					send_iframe_message( "open_file", {
						file_name: data.file_name,
						blob: blob,
					});
					appReady = false;
				},
				function(){ //Handle Error
					console.log("Error Sending Blob..."); //TODO Handle Error
				});


		} else if ( name === "set_active_page_name" ) {
		
			if ( data.active_page_name === "loading" ) {

				$( ".page" ).removeClass( "active" );
				$( ".page.loading" ).addClass( "active" );

			} else if ( data.active_page_name === "error" ) {

				$( ".page" ).removeClass( "active" );
				$( ".page.error" ).addClass( "active" );

			};

		};

	});

} () );
