/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"zprap/zf_prap/test/unit/AllTests"
	], function () {
		QUnit.start();
	});
});
