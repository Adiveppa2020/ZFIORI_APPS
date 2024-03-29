sap.ui.define([
	"com/denpro/sd/document/controller/App.controller",
	"com/denpro/sd/document/utils/Utils",
	"sap/m/MessageToast"
], function (
	Controller, Utils, MessageToast
) {
	"use strict";

	return Controller.extend("com.denpro.sd.document.controller.DetailListPage", {

		onInit: function () {
			var oRouter = this.getOwnerComponent().getRouter();
			oRouter.getRoute("detailslistpage").attachMatched(function (oEvent) {
				this.loadData(oEvent.getParameter("arguments"));
			}, this);
		},



		clearTableSelection: function () {
			const oLocalModel = this.getOwnerComponent().getModel("localModel");
			oLocalModel.setProperty("/enableListPRActions", false);
			this.byId("idPRListTable").removeSelections();
		},

		loadData: async function (param) {
			this.clearTableSelection();
			this.salesDocument = param["?query"].salesDocument;
			const aFilter = Utils.getFilterArray([
				{
					sPath: "Vbeln",
					sValue: param["?query"].salesDocument
				},
				{
					sPath: "Ernam",
					sValue: param["?query"].createdBy
				},
				{
					sPath: "Sbgrp",
					sValue: param["?query"].creditRepGrp
				},
				{
					sPath: "Knkli",
					sValue: param["?query"].creditAccount
				}
			]);
			const oDateFilter = Utils.getDateFilter({
				sPath: "Erdat",
				FromDate: param["?query"].fromDate,
				ToDate: param["?query"].toDate
			});
			if (oDateFilter) {
				aFilter.push(oDateFilter);
			}
			const oView = this.getView();
			oView.byId("idPRListTable").getBinding("items").filter(aFilter);
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
		},

		onPressApproveOrRejectHeaderItem: async function (oEvent, sAction) {
			const oView = this.getView();
			try {
				const oTable = oView.byId("idPRListTable");
				const sConfirmMsg = Utils.getI18nText(oView, (sAction === "ACCEPT" ? "mgsConfirmAcceptHead" : "mgsConfirmRejectHead"));
				await Utils.displayConfirmMessageBox(sConfirmMsg, "Proceed");
				const aSelectedContext = oTable.getSelectedContexts();
				const oPayload = Utils.getHeadSetUpdatePayload.call(this, aSelectedContext, sAction);
				oView.setBusy(true);
				const aResponse = await Utils.updateODataCallList.call(this, "/zdelivery_detailSet", oPayload);
				oView.setBusy(false);
				if (aResponse && aResponse.length > 0) {
					const msg = Utils.getI18nText(oView, (sAction === "ACCEPT" ? "msgApproveSuccess" : "msgRejectSuccess"));
					MessageToast.show(msg);
				}
				oTable.getBinding("items").refresh();
			} catch (error) {
				oView.setBusy(false);
				if ((typeof error === "object") && !error.popup) {
					const sErrorMsg = error && (error.responseText || "Error while updating List - " + error.message);
					Utils.displayErrorMessagePopup(sErrorMsg);
				}
			}
		}

	});
});
