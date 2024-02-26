sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/UIComponent",
    "zrelease/rel/com/denpro/utils/Utils",
    "sap/m/MessageToast"
  ],
  function (BaseController, UIComponent, Utils, MessageToast) {
    "use strict";

    return BaseController.extend("zrelease.rel.com.denpro.controller.App", {
      onInit() {
        this.changeSetId = 1;
      },

      /**
        * Convenience method for accessing the router.
        * @public
        * @returns {sap.ui.core.routing.Router} the router for this component
        */
      getRouter: function () {
        return UIComponent.getRouterFor(this);
      },

      onPressSupplyPlant: function () {
        Utils.openSupplyPlantDialog.call(this);
      },

      onPressCloseDialog: function (oEvent) {
        const dialog = oEvent?.getSource()?.getParent();
        dialog?.close();
      },

      onChangeApprovedQty: function (oEvent, sProperty) {
        const sValue = oEvent.getSource().getValue();
        const oContext = oEvent.getSource().getBinding("value").getContext() || {};
        oContext.getModel().setProperty(oContext.getPath() + sProperty, sValue);
      },

      dateConversion: function (inputDate) {
        if (inputDate && inputDate.length === 8) {
          return inputDate.substr(0, 4) + "-" + inputDate.substr(4, 2) + "-" + inputDate.substr(6, 2);
        }
        return inputDate;
      },

      onPressApproveOrReject: async function (oEvent, sAction, sTableId, sEntity) {
        const oView = this.getView();
        try {
          this.changeSetId = this.changeSetId ? this.changeSetId : 1;
          const oTable = oView.byId(sTableId);
          const sConfirmMsg = Utils.getI18nText(oView, (sAction === "ACCEPT" ? "mgsConfirmAcceptHead" : "mgsConfirmRejectHead"));
          await Utils.displayConfirmMessageBox(sConfirmMsg, "Proceed");
          const aSelectedContext = oTable.getSelectedContexts();
          const oPayload = Utils.getHeadSetUpdatePayload.call(this, aSelectedContext, sAction);
          oView.setBusy(true);
          const aResponse = await Utils.updateODataCallList.call(this, sEntity, oPayload);
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
  }
);
