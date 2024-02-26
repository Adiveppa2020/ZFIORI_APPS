sap.ui.define([
	"zrelease/rel/com/denpro/controller/App.controller",
	"zrelease/rel/com/denpro/utils/Utils"
], function (
	Controller, Utils
) {
	"use strict";

	return Controller.extend("zrelease.rel.com.denpro.controller.EDADetailListPage", {

		onInit: function () {
			var oRouter = this.getOwnerComponent().getRouter();
			oRouter.getRoute("empDemoApproveListPage").attachMatched(function (oEvent) {
				this.loadData(oEvent.getParameter("arguments"));
			}, this);
		},



		clearTableSelection: function () {
			const oLocalModel = this.getOwnerComponent().getModel("localModel");
			oLocalModel.setProperty("/enableListPRActions", false);
			this.byId("idEDAListTable").removeSelections();
		},

		loadData: async function (param) {
			this.clearTableSelection();
			this.salesOrder = param["?query"].salesOrder;
			const aFilter = Utils.getFilterArray([
				{
					sPath: "Lifnr",
					sValue: param["?query"].supplier
				},
				{
					sPath: "Werks",
					sValue: param["?query"].plant
				}
			]);

			const oDateFilter = Utils.getDateFilter({
				sPath: "Budat",
				FromDate: param["?query"].PDFrom,
				ToDate: param["?query"].PDTo
			});
			if (oDateFilter) {
				aFilter.push(oDateFilter);
			}

			const oView = this.getView();
			oView.byId("idEDAListTable").getBinding("items").filter(aFilter);
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
