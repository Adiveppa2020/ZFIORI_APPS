/*global QUnit*/

sap.ui.define([
	"com/denpro/sd/document/controller/FilterSelectionPRAP.controller"
], function (Controller) {
	"use strict";

	QUnit.module("FilterSelectionPRAP Controller");

	QUnit.test("I should test the FilterSelectionPRAP controller", function (assert) {
		var oAppController = new Controller();
		oAppController.onInit();
		assert.ok(oAppController);
	});

});
