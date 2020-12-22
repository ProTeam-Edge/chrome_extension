
	( async function ( x ) {

		var resources = await x.util.load_resources([

			[ "config", "json", "local/config.json" ],

		]);

		var app = window.app = {

			name: "content",

			x: x,
			config: resources.config,

			log: x.modules.log(),
			state: x.modules.state(),
			exec: x.modules.exec(),

			chrome: x.modules.chrome(),

			controller: controller(),

		};

		app.log.init( app );
		app.exec.init( app );

		app.chrome.init( app );

		// add exec modules

			app.exec.add_module( "log", app.log );
			app.exec.add_module( "state", app.state );
			app.exec.add_module( "chrome", app.chrome );
			app.exec.add_module( "controller", app.controller );

		// init controller

			app.controller.init( app );

	} ( window[ window.webextension_library_name ] ) );