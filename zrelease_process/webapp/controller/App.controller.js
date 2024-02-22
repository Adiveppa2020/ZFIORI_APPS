sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/UIComponent",
    "zrelease/rel/com/denpro/utils/Utils"
  ],
  function (BaseController, UIComponent, Utils) {
    "use strict";

    return BaseController.extend("zrelease.rel.com.denpro.controller.App", {
      onInit() {

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

      onPressSupplyPlantToListItems: function (oEvent) {
        const oView = this.getView();
        const sSuppPlantValue = oView.byId("idInputSupplyPlant10").getValue();
        if (sSuppPlantValue) {
          this.supplyPlant = sSuppPlantValue;
          Utils.updateSupplyPlantToHeadList.call(this, sSuppPlantValue);
          this.onPressCloseDialog(oEvent);
        } else {
          this.supplyPlant = "";
          const msg = Utils.getI18nText(oView, "noPlant");
          MessageToast.show(msg);
        }
      },

      updateFinishedStockTable: function (oEvent) {
        const oLocalModel = this.getOwnerComponent().getModel("localModel");
        oLocalModel.setProperty("/stockTableCount", oEvent.getParameter("total"));
        const aContext = oEvent.getSource().getBinding("items").getContexts();
        if (aContext && aContext.length > 0) {
          const oContext = aContext[0].getObject();
          oLocalModel.setProperty("/stockMaterial", oContext.MATNR + "(" + oContext.MAKTX + ")");
        } else {
          oLocalModel.setProperty("/stockMaterial", "");
        }
  
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
      }

    });
  }
);
