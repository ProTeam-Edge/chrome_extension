
	( async function ( x ) {

		var resources = await x.util.load_resources([

			[ "config", "json", "local/config.json" ],

		]);

		var app = window.app = {

			name: "content",

			x: x,
			config: resources.config,

			log: x.modules.log(),
			exec: x.modules.exec(),

			chrome: x.modules.chrome(),

			google_drive_converter: google_drive_converter(),
			gmail_converter: gmail_converter(),
			main_converter: main_converter(),

			controller: controller(),

		};

		app.log.init( app );
		app.exec.init( app );

		app.chrome.init( app );

		// add exec modules

			app.exec.add_module( "log", app.log );
			app.exec.add_module( "chrome", app.chrome );

			app.exec.add_module( "util", app.x.util );
			app.exec.add_module( "google_drive_converter", app.google_drive_converter );
			app.exec.add_module( "gmail_converter", app.gmail_converter );
			app.exec.add_module( "main_converter", app.main_converter );

			app.exec.add_module( "controller", app.controller );

		// init controller

			app.controller.init( app );

	} ( window[ window.webextension_library_name ] ) );