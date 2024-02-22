sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/UIComponent",
    "zrelease/rel/com/denpro/utils/ValueHelpFilter",
    "zrelease/rel/com/denpro/utils/Utils"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, UIComponent, ValueHelpFilter, Utils) {
        "use strict";

        return Controller.extend("zrelease.rel.com.denpro.controller.FilterSelectionPRAP", {
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

            onSelectRType: function (oEvent) {
                const sType = oEvent.getSource().getSelectedButton().getCustomData()[0].getValue();
                const oLocalModel = this.getOwnerComponent().getModel("localModel");
                if (sType === "DB" || sType === "BB") {
                    oLocalModel.setProperty("/visibleEmpDemoAppSelection", false);
                    oLocalModel.setProperty("/visibleDeliverySelection", true);
                } else {
                    oLocalModel.setProperty("/visibleEmpDemoAppSelection", true);
                    oLocalModel.setProperty("/visibleDeliverySelection", false);
                }
            },

            getQueryParam: function (sType) {
                const oView = this.getView();
                if (sType === "DB") {
                    return {
                        route: "",
                        queryParam: {
                            createdBy: oView.byId("idCreatedBySOInput").getValue(),
                            salesOrder: oView.byId("idSOInput").getValue()
                        }
                    };
                } else if (sType === "BB") {
                    return {
                        route: "",
                        queryParam: {
                            createdBy: oView.byId("idCreatedBySOInput").getValue(),
                            salesOrder: oView.byId("idSOInput").getValue()
                        }
                    };                    
                } else {
                    return {
                        route: "",
                        queryParam: {
                            createdBy: oView.byId("idCreatedBySOInput").getValue(),
                            salesOrder: oView.byId("idSOInput").getValue()
                        }
                    };                    
                }
            },


            getCreatedOnFilterDate: function () {
                function addZero(iMonth) {
                    if (iMonth < 10) {
                        return "0" + iMonth;
                    }
                    return iMonth;
                }
                const oFromDate = this.byId("idCreatedOnDateRangeSO").getFrom();
                const oToDate = this.byId("idCreatedOnDateRangeSO").getTo();
                const oDateRange = { from: "", to: "" };
                if (oFromDate && oToDate) {
                    let yyyy = oFromDate.getFullYear();
                    oDateRange.from = yyyy.toString() + addZero(oFromDate.getMonth() + 1) + addZero(oFromDate.getDate());
                    yyyy = oToDate.getFullYear();
                    oDateRange.to = yyyy.toString() + addZero(oToDate.getMonth() + 1) + addZero(oToDate.getDate());
                }
                return oDateRange;
            },

            /**
             * Shows the selected item on the object page
             * @param {sap.m.ObjectListItem} oItem selected Item
             * @private
             */
            onSearchButtonNavToListPress: function () {
                const sType = this.byId("relTypeId").getSelectedButton().getCustomData()[0].getValue();
                if (Utils.checkMandatoryParams.call(this, sType)) {
                    const oParam = this.getQueryParam(sType);
                    this.getRouter().navTo(oParam.route, {
                        id: sType,
                        "?query": oParam.queryParam
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
