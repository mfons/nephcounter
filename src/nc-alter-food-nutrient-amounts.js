import { PolymerElement } from '@polymer/polymer/polymer-element.js';
import './shared-styles.js';
import '@polymer/paper-card/paper-card.js';
import '@polymer/paper-input/paper-input.js';
import '@polymer/paper-button/paper-button.js';
import '@polymer/paper-icon-button/paper-icon-button.js';
import './my-icons.js';
import './mixins/multiRecordEditMixin.js';
import './mixins/dataMixin.js';
import './redux-store.js';
import { html } from '@polymer/polymer/lib/utils/html-tag.js';
class NcAlterFoodNutrientAmounts extends
    MultiRecordEditMixin(
        DataMixin(
            ReduxMixin(
                PolymerElement
            )
        )
    ) {
  static get template() {
    return html`
        <style include="shared-styles">
            :host {
                display: block;
            }
        </style>

        <paper-card heading="Alter Nutrient Amounts" alt="Alter Nutrient Amounts">
            <div class="card-content">
                <paper-input id="nutrientNameField" readonly="" label="Nutrient Name" value="[[nutrientName]]"></paper-input>
                <paper-input id="nutrientValueField" required="" label="Value" value="{{nutrientValue}}"></paper-input>
                <paper-input id="nutrientUnitField" readonly="" label="Unit of Measure" value="[[nutrientUnit]]"></paper-input>
            </div>
            <div class="card-actions">
                <paper-button on-tap="update">Update</paper-button>
                <paper-button on-tap="restore">Restore</paper-button>
                <paper-icon-button on-tap="previousRecord" icon="my-icons:chevron-left"></paper-icon-button>
                <paper-icon-button on-tap="nextRecord" icon="my-icons:chevron-right"></paper-icon-button>
            </div>
        </paper-card>
`;
  }

  static get is() { return 'nc-alter-food-nutrient-amounts'; }
  // TODO continue refactoring old version from nephcount project...
  // along with behaviors and whatever else is needed.

  static get properties() {
      return {
          foodNutrients: Array,
          multiplier: Number,
          alteredNutrients: {
              type: Array,
              value: []
          },
          nutrientName: String,
          nutrientValue: String,
          nutrientUnit: String
      };
  }

  static get observers() {
      return [
          '_foodNutrientsChanged(foodNutrients.*, multiplier)',
          '_currentRecordIndexChanged(alteredNutrients.*, currentRecordIndex)'
      ];
  }

  static get actions() {
      return {
          saveAlteredFoodNutrients: (consumptionFormAlteredNutrients) => {
              return {
                  type: 'SAVE_ALTERED_CONSUMPTION_FORM_FOOD_NUTRIENTS',
                  consumptionFormAlteredNutrients:  consumptionFormAlteredNutrients
              }
          }
      };
  }

  _foodNutrientsChanged(changeRecord, multiplier) {
      if (!changeRecord.base) return;
      this.splice('alteredNutrients', 0, this.alteredNutrients.length);
      for (var i = 0; i < changeRecord.base.length; i++) {
          var nutrientClone = this.cloneIt(changeRecord.base[i]);
          nutrientClone.value = (changeRecord.base[i].value === "--") ? "--" : changeRecord.base[i].value * multiplier;
          this.push('alteredNutrients', nutrientClone);
      }
      this.restore();
  }

  restore() {
      if (this.alteredNutrients.length === 0 ||
          this.currentRecordIndex >= this.alteredNutrients.length) {
          return;
      }
      this.nutrientName = this.alteredNutrients[this.currentRecordIndex].nutrient;
      this.nutrientValue = this.alteredNutrients[this.currentRecordIndex].value;
      this.nutrientUnit = this.alteredNutrients[this.currentRecordIndex].unit;
  }

  update() {
      this.set('alteredNutrients.' + this.currentRecordIndex + '.value', this.nutrientValue);
      this.dispatch('saveAlteredFoodNutrients', this.alteredNutrients);
  }
}

window.customElements.define(NcAlterFoodNutrientAmounts.is, NcAlterFoodNutrientAmounts);
