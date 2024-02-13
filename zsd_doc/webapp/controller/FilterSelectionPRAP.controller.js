sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/UIComponent",
    "com/denpro/sd/document/utils/ValueHelpFilter",
    "com/denpro/sd/document/utils/Utils"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, UIComponent, ValueHelpFilter, Utils) {
        "use strict";

        return Controller.extend("com.denpro.sd.document.controller.FilterSelectionPRAP", {
            onInit: function () {
                this.oFragment = {}
            },

            /**
             * Convenience method for accessing the router.
             * @public
             * @returns {sap.ui.core.routing.Router} the router for this component
             */
            getRouter: function () {
                return UIComponent.getRouterFor(this);
            },

            /**
             * Shows the selected item on the object page
             * @param {sap.m.ObjectListItem} oItem selected Item
             * @private
             */
            onSearchButtonNavToListPress: function () {
                if (Utils.checkMandatoryParams.call(this)) {
                    const oView = this.getView();
                    const sSalesDoc = oView.byId("idSalesDocumentInput").getValue();
                    this.getRouter().navTo("detailslistpage", {
                        salesDocument: "SD",
                        "?query": {
                            createdBy: oView.byId("idCreatedByInput").getValue(),
                            salesDocument: sSalesDoc
                        }
                    });
                }
            },

            onInputCommonValueHelpRequest: function (oEvent) {
                ValueHelpFilter.onInputCommonValueHelpRequest.call(this, oEvent);
            },

            onValueHelpSearch: function (oEvent) {
                ValueHelpFilter.onValueHelpSearch.call(this, oEvent);
            },

            onValueHelpClose: function (oEvent, sValueInputProperty) {
                ValueHelpFilter.onValueHelpClose.call(this, oEvent, sValueInputProperty);
            },

            onChangeInputValue: function (oEvent, sValueInputProperty) {
                this.getOwnerComponent().getModel("localModel").setProperty(sValueInputProperty, oEvent.getSource().getValue());
            },

            onChangeInputValueComboBox: function (oEvent, sValueInputProperty) {
                this.getOwnerComponent().getModel("localModel").setProperty(sValueInputProperty, oEvent.getSource().getSelectedKey());
            }
        });
    });
