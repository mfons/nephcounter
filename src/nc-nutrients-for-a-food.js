/* http://api.data.gov/docs/rate-limits/  with this api_key we can do 1000 requests in an hour. */
/* Purpose of this element: to provide an array, "foodNutrients", which is an array of
amounts of a parametrically provided list of nutrients for a parametrically provided food
item number from the usda database    */
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
import { PolymerElement } from '@polymer/polymer/polymer-element.js';

import './shared-styles.js';
import '@polymer/iron-ajax/iron-ajax.js';
import './redux-store.js';
import { html } from '@polymer/polymer/lib/utils/html-tag.js';
class NcNutrientsForAFood extends ReduxMixin(PolymerElement) {
  static get template() {
    return html`
        <style include="shared-styles">
            :host {
                display: none;
            }
        </style>
        <iron-ajax id="ajaxNutrientsList" method="GET" url="https://api.nal.usda.gov/ndb/nutrients/" handle-as="json" params="[[ajaxParams]]" on-response="tasksLoaded" sync="[[sync]]">
        </iron-ajax>
`;
  }

  static get is() { return 'nc-nutrients-for-a-food'; }

  static get properties() {
      return {
          sync: {
              type: Boolean,
              value: false
            },
            nutrientsOfInterest: {
                type: Array,
                statePath: 'nutrientsOfInterest'
            },
            customFoods: Array,
            nutrientIdsOfInterest: Array,
            foodNutrients: {
                type: Array,
                value:  function() {
                    return [
//example json
//                        {
//                            "ndbno": "45090566",
//                            "name": "CLIF, BUILDER'S, PROTEIN BAR, CHOCOLATE MINT, UPC: 722252168528",
//                            "weight": 68.0,
//                            "measure": "68.0 g",
//                            "nutrients": [
//                                {
//                                    "nutrient_id": "306",
//                                    "nutrient": "Potassium, K",
//                                    "unit": "mg",
//                                    "value": "190",
//                                    "gm": 279.0
//                                },
//                                {
//                                    "nutrient_id": "305",
//                                    "nutrient": "Phosphorus, P",
//                                    "unit": "mg",
//                                    "value": "--",
//                                    "gm": "--"
//                                }
//                            ]
//                        }
                    ];
                }
            },
            ajaxParams: {
                type: Object,
                value: function () {
                    // The purpose of providing this default value is to document the expected structure of the object for this property.
                    return {"format":"json", "max":"500", "offset":"0", "api_key":"JrBeMt1k9YsrhBrqfbt2GmmQJAu7XVgt3ttjAxJt", "nutrients": ["205", "204", "208", "269"], "ndbno": "01009"};
                }
            },
            foodId : String,
            foodName: String,
      }; // end return
  }

  static get observers() {
      return [
          'nutrientsOfInterestAndFoodIdChanged(nutrientsOfInterest.*, foodId, foodName)',
          '_foodIdChanged(foodId)'
      ]
  }

  tasksLoaded(data) {
      console.log('nc-nutrients-for-a-food came back with ', data.detail.response);
      if (!data.detail.response.report) {
              return;
      }
      this.foodNutrients = data.detail.response.report.foods;
      this.dispatch('saveFoodNutrients', this.foodNutrients);
      console.log('food nutrient save dispatched');
  }

  nutrientsOfInterestAndFoodIdChanged(changeRecord, newFoodId, newFoodName) {
      console.log('nutrientsOfInterestAndFoodIdChanged fired...');
      if (this._isCustomFood(newFoodId)) {
          console.log("do this when there is custom food passed in...");
          this.foodNutrients = [];
          for (var i = 0; i < this.customFoods.length; i++) {
              if (this.foodName === this.customFoods[i].name) {
                  this.push('foodNutrients', this.customFoods[i]);
              }
          }
      }
      else {
          console.log("about to set nutrients param with ", changeRecord.base);
          this.set('ajaxParams.nutrients',
                   this.generateNutrientIdsOfInterest(changeRecord.base));
          this.set('ajaxParams.ndbno', newFoodId);
          console.log("about to get food nutrients for food id ", newFoodId);
          this.$.ajaxNutrientsList.generateRequest();
      }
  }

  _foodIdChanged(newValue, oldValue) {
      console.log("foodId has changed in nffs..." + newValue);
  }

  generateNutrientIdsOfInterest(detailArray) {
      var returnArray = new Array();
      var arrayLength = detailArray.length;
      for (var i = 0; i < arrayLength; i++) {
          returnArray.push(detailArray[i].id);
      }
      console.log("altered array into nutrient id list ", returnArray);
      return returnArray;
  }

  _isCustomFood (foodId) {
      return foodId === "-1";
  }

  static get actions() {
      return {
          saveFoodNutrients: (foodNutrientsForCurrentlySelectedFood) => {
              return {
                  type: 'SAVE_FOOD_NUTRIENTS_FOR_CURRENTLY_SELECTED_FOOD',
                  foodNutrientsForCurrentlySelectedFood:  foodNutrientsForCurrentlySelectedFood
              }
          }
      };
  }
}

window.customElements.define(NcNutrientsForAFood.is, NcNutrientsForAFood);
