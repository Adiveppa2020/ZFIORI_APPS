sap.ui.define([
	"zso/rel/com/denpro/controller/App.controller",
	"zso/rel/com/denpro/utils/Utils",
	"sap/m/MessageToast"
], function (
	Controller, Utils, MessageToast
) {
	"use strict";

	return Controller.extend("zso.rel.com.denpro.controller.DetailListPage", {

		onInit: function () {
			var oRouter = this.getOwnerComponent().getRouter();
			oRouter.getRoute("detailslistpage").attachMatched(function (oEvent) {
				this.loadData(oEvent.getParameter("arguments"));
			}, this);
		},



		clearTableSelection: function () {
			const oLocalModel = this.getOwnerComponent().getModel("localModel");
			oLocalModel.setProperty("/enableListPRActions", false);
			this.byId("idSOListTable").removeSelections();
		},

		loadData: async function (param) {
			this.clearTableSelection();
			this.salesOrder = param["?query"].salesOrder;
			const aFilter = Utils.getFilterArray([
				{
					sPath: "Salesdocument",
					sValue: param["?query"].salesOrder
				},
				{
					sPath: "CreatedBy",
					sValue: param["?query"].createdBy
				},
				{
					sPath: "Doctype",
					sValue: param["?query"].orderType
				}
			]);
			const oView = this.getView();
			oView.byId("idSOListTable").getBinding("items").filter(aFilter);
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
				const oTable = oView.byId("idSOListTable");
				const sConfirmMsg = Utils.getI18nText(oView, (sAction === "ACCEPT" ? "mgsConfirmAcceptHead" : "mgsConfirmRejectHead"));
				await Utils.displayConfirmMessageBox(sConfirmMsg, "Proceed");
				const aSelectedContext = oTable.getSelectedContexts();
				const oPayload = Utils.getHeadSetUpdatePayload.call(this, aSelectedContext, sAction);
				oView.setBusy(true);
				const aResponse = await Utils.updateODataCallList.call(this, "/ZSALES_DOC_INFOSet", oPayload);
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
