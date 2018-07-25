import { PolymerElement } from '@polymer/polymer/polymer-element.js';
import './shared-styles.js';
import '@polymer/iron-ajax/iron-ajax.js';
import './redux-store.js';
import { html } from '@polymer/polymer/lib/utils/html-tag.js';
class NcFoodsByTextSearch extends ReduxMixin(PolymerElement) {
  static get template() {
    return html`
        <style include="shared-styles">
            :host {
                display: none;
            }
        </style>
            <iron-ajax id="foodSearchAjaxId" method="GET" url="https://api.nal.usda.gov/ndb/search/" handle-as="json" params="[[ajaxParams]]" on-response="_tasksLoaded">
        </iron-ajax>
`;
  }

  static get is() { return 'nc-foods-by-text-search'; }

  static get properties() {
      return {
          // ds=Standard+Referece limits to just a basic set of foods
          // that the USDA has a full set of nutrient information
          // on.  Without ds param set like this, you get lots of
          // brand name foods, most of which do not have nutrient information
          // against them.  Some do however, so you may want to opt in
          // occasionally...hence this boolean control.
          isStandardReference: Boolean,
          customFoods: {
              type: Array,
          },
          foods: {
              type: Array,
           },
          textSearch: {
              type: String
          },
          ajaxParams: {
              type: Object,
              value: {"format":"json", "q":"butter", "sort":"n", 
                  "max":"500", "offset":"0", "api_key":"JrBeMt1k9YsrhBrqfbt2GmmQJAu7XVgt3ttjAxJt",
                  "ds" : "Standard Reference"}
          }
      };
  }

  static get observers() {
      return [
          '_textSearchChanged(textSearch)',
          '_isStandardReferenceChanged(isStandardReference)'
      ]
  }

  _textSearchChanged(newValue) {
     this.set('ajaxParams.q', newValue);
     console.info("nc foods by text search got in text-search attribute", newValue);
     this.$.foodSearchAjaxId.generateRequest();
  }

  _isStandardReferenceChanged(newValue, oldValue) {
      if (newValue) {
          this.set('ajaxParams.ds', 'Standard Reference');
      }
      else {
          this.set('ajaxParams.ds', '');
      }
      this.$.foodSearchAjaxId.generateRequest();
  }

  _tasksLoaded(data) {
      console.log("nc-foods-by-text-search._tasksLoaded() data was: ", data.detail.response);
      if (typeof data.detail.response.list !== 'undefined' &&
          typeof data.detail.response.list.item !== 'undefined') {
          this.foods = data.detail.response.list.item;
          this.dispatch('saveFoodList', this.foods, false, data.detail.response.q);
      }
      else if (typeof data.detail.response.errors !== "undefined" && data.detail.response.errors.error[0].status === 400) {
          this.dispatch('saveFoodList', [], true, data.detail.response.q);
      }
  }

  static get actions() {
      return {
          saveFoodList: (latestFoodList, latestQueryBroughtBackNoFoodList, latestFoodListQueryString) => {
              return {
                  type: 'SAVE_FOOD_LIST',
                  latestFoodList:  latestFoodList,
                  latestQueryBroughtBackNoFoodList: latestQueryBroughtBackNoFoodList,
                  latestFoodListQueryString: latestFoodListQueryString 
              }
          }
      };
  }
}

window.customElements.define(NcFoodsByTextSearch.is, NcFoodsByTextSearch);
