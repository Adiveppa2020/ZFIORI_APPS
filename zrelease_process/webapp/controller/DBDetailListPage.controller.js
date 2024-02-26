sap.ui.define([
	"zrelease/rel/com/denpro/controller/App.controller",
	"zrelease/rel/com/denpro/utils/Utils"
], function (
	Controller, Utils
) {
	"use strict";

	return Controller.extend("zrelease.rel.com.denpro.controller.DBDetailListPage", {

		onInit: function () {
			var oRouter = this.getOwnerComponent().getRouter();
			oRouter.getRoute("deliveryBlockListPage").attachMatched(function (oEvent) {
				this.loadData(oEvent.getParameter("arguments"));
			}, this);
		},



		clearTableSelection: function () {
			const oLocalModel = this.getOwnerComponent().getModel("localModel");
			oLocalModel.setProperty("/enableListPRActions", false);
			this.byId("idDeliveryBlockListTable").removeSelections();
		},

		loadData: async function (param) {
			this.clearTableSelection();
			const aFilter = Utils.getFilterArray([
				{
					sPath: "Bukrs",
					sValue: param["?query"].companyCode
				},
				{
					sPath: "Vkorg",
					sValue: param["?query"].salesOrg
				},
				{
					sPath: "Vbeln",
					sValue: param["?query"].SalesDoc
				},
				{
					sPath: "Lifsp",
					sValue: param["?query"].blockCode
				}
			]);
			const oView = this.getView();
			oView.byId("idDeliveryBlockListTable").getBinding("items").filter(aFilter);
		},

		onSelectPRList: function (oEvent) {
			const aSelectedContext = oEvent.getSource().getSelectedContexts() || [];
			Utils.updateActionEnable.call(this, aSelectedContext);
		},

		updateFinishedTable: function (oEvent) {
			const oLocalModel = this.getOwnerComponent().getModel("localModel");
			oLocalModel.setProperty("/headTableCount", oEvent.getParameter("total"));
			const aSelectedContext = oEvent.getSource().getSelectedContexts() || [];
			Utils.updateActionEnable.call(this, aSelectedContext);
		}

	});
});
