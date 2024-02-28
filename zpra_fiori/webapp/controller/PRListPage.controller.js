sap.ui.define([
	"zprap/zfprap/controller/App.controller",
	"zprap/zfprap/utils/Utils",
	"sap/m/MessageToast"
], function (
	Controller, Utils, MessageToast
) {
	"use strict";

	return Controller.extend("zprap.zfprap.controller.PRListPage", {

		onInit: function () {
			var oRouter = this.getOwnerComponent().getRouter();
			oRouter.getRoute("prlistpage").attachMatched(function (oEvent) {
				this.loadData(oEvent.getParameter("arguments"));
			}, this);
			this.supplyPlant = "";
		},

		clearTableSelection: function () {
			const oLocalModel = this.getOwnerComponent().getModel("localModel");
			oLocalModel.setProperty("/enableListPRActions", false);
			this.byId("idPRListTable").removeSelections();
		},

		getPRListData: function () {
			this.clearTableSelection();
			const aFilter = Utils.getFilterArray([
				{
					sPath: "MATNR",
					sValue: this.material
				},
				{
					sPath: "BANFN",
					sValue: this.purchaseReqNo
				},
				{
					sPath: "WERKS",
					sValue: this.plant
				},
				{
					sPath: "FRGZU",
					sValue: this.releaseCode
				},
				{
					sPath: "BSART",
					sValue: this.docType
				}
			]);
			const oView = this.getView();
			oView.byId("idPRListTable").getBinding("items").filter(aFilter);
			this.supplyPlant = "";
		},

		loadData: async function (param) {
			this.releaseCode = param.releaseCode;
			this.material = param["?query"].material;
			this.purchaseReqNo = param["?query"].purchaseReqNo;
			this.plant = param["?query"].plant;
			this.docType = param["?query"].docType;
			this.getPRListData();
		},

		onDetailsButtonNavToPRdetailsPagePress: function () {
			const oView = this.getView();
			const aSelectedContext = oView.byId("idPRListTable").getSelectedContexts();
			if (aSelectedContext && aSelectedContext.length === 1) {
				const oContext = aSelectedContext[0].getObject();
				this.getRouter().navTo("prdetailslistpage", {
					purchaseReqNo: oContext.BANFN,
					"?query": {
						plant: oContext.WERKS,
						releaseCode: this.releaseCode,
						material: oContext.MATNR,
						docType: oContext.BSART,
						prItemNo: oContext.BNFPO
					}
				});
			} else {
				Utils.displayErrorMessagePopup(Utils.getI18nText(oView, "errorMessageMultiSelect"));
			}
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
			if (this.supplyPlant) {
				Utils.updateSupplyPlantToHeadList.call(this, this.supplyPlant);
			}
		},

		onPressStockView: async function () {
			const oView = this.getView();
			const aSelectedContext = oView.byId("idPRListTable").getSelectedContexts();
			if (aSelectedContext && aSelectedContext.length === 1) {
				const oContext = aSelectedContext[0].getObject();
				const aFilter = Utils.getFilterArray([
					{
						sPath: "MATNR",
						sValue: oContext.MATNR || ""
					}
				]);
				Utils.openStoackDetailsFragment.call(this, aFilter);
			} else {
				Utils.displayErrorMessagePopup(Utils.getI18nText(oView, "errorMessageMultiSelect"));
			}
		},

		onPressApproveOrRejectHeaderItem: async function (oEvent, sAction) {
			const oView = this.getView();
			try {
				const oTable = oView.byId("idPRListTable");
				const sConfirmMsg = Utils.getI18nText(oView, (sAction === "Accept" ? "mgsConfirmAcceptHead" : "mgsConfirmRejectHead"));
				await Utils.displayConfirmMessageBox(sConfirmMsg, "Proceed");
				const aSelectedContext = oTable.getSelectedContexts();
				const oPayload = Utils.getHeadSetUpdatePayload.call(this, aSelectedContext, this.supplyPlant, sAction, this.releaseCode);
				oView.setBusy(true);
				const aResponse = await Utils.updateOdataCallList.call(this, "/ZHeadSet", oPayload);
				oView.setBusy(false);
				if (aResponse && aResponse.length > 0) {
					const msg = Utils.getI18nText(oView, (sAction === "Accept" ? "msgApproveSuccess" : "msgRejectSuccess"));
					MessageToast.show(msg);
				}
				this.getPRListData();
			} catch (error) {
				oView.setBusy(false);
				if ((typeof error === "object") && !error.popup) {
					const sErrorMsg = error && (error.responseText || "Error while updating List - " + error.message);
					Utils.displayErrorMessagePopup(sErrorMsg);
				}
			} finally {
				oView.setBusy(false);
			}
		}

	});
});
