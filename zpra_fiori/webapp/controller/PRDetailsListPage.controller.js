sap.ui.define([
	"zprap/zfprap/controller/App.controller",
	"sap/ui/core/routing/History",
	"zprap/zfprap/utils/Utils",
	"sap/m/MessageToast"
], function (
	Controller, History, Utils, MessageToast
) {
	"use strict";

	return Controller.extend("zprap.zfprap.controller.PRDetailsListPage", {

		onInit: function () {
			var oRouter = this.getOwnerComponent().getRouter();
			oRouter.getRoute("prdetailslistpage").attachMatched(function (oEvent) {
				this.loadData(oEvent.getParameter("arguments"));
			}, this);
			this.material = "";
			this.supplyPlant = "";
		},

		clearTableSelection: function () {
			const oLocalModel = this.getOwnerComponent().getModel("localModel");
			oLocalModel.setProperty("/enableListPRDetailsActions", false);
			this.byId("idPRDetailsListTable").removeSelections();
		},

		onBackButtonNavToPRListPagePress: function () {
			var oHistory, sPreviousHash;
			oHistory = History.getInstance();
			sPreviousHash = oHistory.getPreviousHash();
			if (sPreviousHash !== undefined) {
				window.history.go(-1);
			} else {
				this.getRouter().navTo("RouteFilterSelectionPRAP", {}, true /*no history*/);
			}
		},

		getPRDetailsData: async function () {
			this.clearTableSelection();
			const oView = this.getView();
			this.supplyPlant = "";
			try {
				oView.setBusy(true);
				const aFilter = Utils.getFilterArray([
					{
						sPath: "BANFN",
						sValue: this.prNo
					},
					{
						sPath: "MATNR",
						sValue: this.material
					},
					{
						sPath: "BNFPO",
						sValue: this.prItemNo
					},
					{
						sPath: "FRGZU",
						sValue: this.releaseCode
					}
				]);
				const oResponse = await Utils.readOdataCall.call(this, "/ZHeadSet", aFilter, {
					"$expand": "ZITEMNAV"
				});
				let LineItems = [], headItem = [];
				if (oResponse && Array.isArray(oResponse.results) && oResponse.results.length > 0) {
					headItem = oResponse['results'][0];
					LineItems = oResponse['results'][0].ZITEMNAV.results || [];
				}
				const oLocalModel = this.getOwnerComponent().getModel("localModel");
				oLocalModel.setProperty("/lineTableCount", LineItems.length);
				oLocalModel.setProperty("/LineDetails", LineItems);
				oLocalModel.setProperty("/HeadDetails", headItem);
				oView.setBusy(false);
			} catch (error) {
				oView.setBusy(false);
				Utils.displayErrorMessagePopup("Error while fetching Head Set data - " + error?.message);
			} finally {
				oView.setBusy(false);
			}
		},

		loadData: async function (param) {
			this.material = param["?query"].material;
			this.releaseCode = param["?query"].releaseCode;
			this.prItemNo = param["?query"].prItemNo;
			this.prNo = param.purchaseReqNo;
			this.getPRDetailsData();
		},

		onPressStockView: async function () {
			const oView = this.getView();
			if (this.material) {
				const aFilter = Utils.getFilterArray([
					{
						sPath: "MATNR",
						sValue: this.material || ""
					}
				]);
				Utils.openStoackDetailsFragment.call(this, aFilter);
			} else {
				Utils.displayErrorMessagePopup(Utils.getI18nText(oView, "noMaterial"));
			}
		},

		onPressSupplyPlantToListItems: function (oEvent) {
			const oView = this.getView();
			const sSuppPlantValue = oView.byId("idInputSupplyPlant10").getValue();
			if (sSuppPlantValue) {
				this.supplyPlant = sSuppPlantValue;
				Utils.updateSupplyPlantToLineItemList.call(this, sSuppPlantValue);
				this.onPressCloseDialog(oEvent);
			} else {
				this.supplyPlant = "";
				const msg = Utils.getI18nText(oView, "noPlant");
				MessageToast.show(msg);
			}
		},

		onPressApproveOrRejectLineItem: async function (oEvent, sAction) {
			const oView = this.getView();
			try {
				const oTable = oView.byId("idPRDetailsListTable");
				const sconfirmMsg = Utils.getI18nText(oView, (sAction === "Accept" ? "mgsConfirmAccept" : "mgsConfirmReject"));
				await Utils.displayConfirmMessageBox(sconfirmMsg, "Proceed");
				const aContext = oTable.getSelectedContexts();
				const oLocalModel = this.getOwnerComponent().getModel("localModel");
				const oPayload = Utils.getLineItemSetUpdatePayload.call(this, aContext, this.supplyPlant, sAction, oLocalModel.getProperty("/HeadDetails"), this.releaseCode);
				oView.setBusy(true);
				const aResponse = await Utils.updateOdataCallList.call(this, "/ZHeadSet", [oPayload]);
				oView.setBusy(false);
				if (aResponse && aResponse.length > 0) {
					const msg = Utils.getI18nText(oView, (sAction === "Accept" ? "msgApproveSuccess" : "msgRejectSuccess"));
					MessageToast.show(msg);
				}
				this.getPRDetailsData();
				oTable.getBinding("items").refresh();
			} catch (error) {
				oView.setBusy(false);
				if ((typeof error === "object") && !error.popup) {
					const sErrorMsg = error && (error.responseText || "Error while updating List - " + error.message);
					Utils.displayErrorMessagePopup(sErrorMsg);
				}
			}
		},

		onSelectPRDetailsList: function (oEvent) {
			const aSelectedContext = oEvent.getSource().getSelectedContexts() || [];
			Utils.updateActionEnableDetailsPage.call(this, aSelectedContext);
		}

	});
});
