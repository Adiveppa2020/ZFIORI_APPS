sap.ui.define([
    "sap/ui/core/Fragment",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
], function (Fragment, Filter, FilterOperator) {
    "use strict";

    return {
        onInputMaterialsValueHelpRequest: function (oEvent) {
            var sInputValue = oEvent.getSource().getValue(),
                oView = this.getView();
            const sFragmentName = "zprap.zfprap.fragments." + oEvent.getSource().getCustomData()[0].getValue();
            const sFilterProperty = oEvent.getSource().getCustomData()[1].getValue().prop1;
            if (!this.oFragment[sFragmentName]) {
                this.oFragment[sFragmentName] = Fragment.load({
                    id: oView.getId(),
                    name: sFragmentName,
                    controller: this
                }).then(function (oDialog) {
                    oView.addDependent(oDialog);
                    return oDialog;
                });
            }
            this.oFragment[sFragmentName].then(function (oDialog) {
                // Create a filter for the binding
                if (sInputValue) {
                    oDialog.getBinding("items").filter([new Filter(sFilterProperty, FilterOperator.Contains, sInputValue)]);
                }
                // Open ValueHelpDialog filtered by the input's value
                oDialog.open(sInputValue);
            });
        },

        onValueHelpSearch: function (oEvent) {
            const sFilterProperty = oEvent.getSource().getCustomData()[0].getValue().prop1;
            const sValue = oEvent.getParameter("value");
            let aFilter = [];
            if (sValue) {
                aFilter = [new Filter(sFilterProperty, FilterOperator.Contains, sValue)];
            }
            oEvent.getSource().getBinding("items").filter(aFilter);
        },

        onValueHelpClose: function (oEvent, sValueInputProperty) {
            var oSelectedItem = oEvent.getParameter("selectedItem");
            oEvent.getSource().getBinding("items").filter([]);
            if (!oSelectedItem) {
                return;
            }
            const sInputFieldId = oEvent.getSource().getCustomData()[1].getValue();
            this.byId(sInputFieldId).setValue(oSelectedItem.getTitle());
            this.getOwnerComponent().getModel("localModel").setProperty(sValueInputProperty, oSelectedItem.getTitle());
        }
    }
});
