import { PolymerElement } from '@polymer/polymer/polymer-element.js';
import '@polymer/iron-ajax/iron-ajax.js';
import './redux-store.js';
import { html } from '@polymer/polymer/lib/utils/html-tag.js';
class NcAjaxGetPossibleNutrients extends ReduxMixin(PolymerElement) {
  static get template() {
    return html`
        <style>
            :host {
                display: none;
            }
        </style>
        <iron-ajax id="ajaxNutrientsList" method="GET" url="https://api.nal.usda.gov/ndb/list?format=json&amp;lt=nr&amp;max=300&amp;sort=n&amp;api_key=JrBeMt1k9YsrhBrqfbt2GmmQJAu7XVgt3ttjAxJt" handle-as="json" on-response="_tasksLoaded">
        </iron-ajax>
`;
  }

  static get is() { return 'nc-ajax-get-possible-nutrients'; }

  static get properties() {
      return {
          possibleNutrients: {
              type: Array,
              statePath: 'nutrients'
          },
      };
  }

  static get actions() {
      return {
          loadAllNutrients: (allNutrients) => {
              return {
                  type: 'LOAD_ALL_NUTRIENTS',
                  nutrients: allNutrients
              }
          },
      };
  }

  static get observers() {
      return []
  }

  ready() {
      super.ready();
      this.getNutrientsFromUSDA();
  }

  getNutrientsFromUSDA() {
      console.info("nc-ajax-get-possible-nutrients about to request all possible nutrients from usda food db");
      if (this.possibleNutrients && this.possibleNutrients.length > 0) {
          return;
      }
      this.$.ajaxNutrientsList.generateRequest();
  }

  _tasksLoaded(data) {
      console.log("nc-ajax-get-possible-nutrients._tasksLoaded() data was: ", data.detail.response);
      if (typeof data.detail.response.list !== 'undefined' &&
          typeof data.detail.response.list.item !== 'undefined') {
          this.dispatch('loadAllNutrients', data.detail.response.list.item);
      }
      else if (typeof data.detail.response.errors !== "undefined" && data.detail.response.errors.error[0].status === 400) {
          this.dispatch('loadAllNutrients', []);
      }
  }
}

window.customElements.define(NcAjaxGetPossibleNutrients.is, NcAjaxGetPossibleNutrients);
