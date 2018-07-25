import { PolymerElement } from '@polymer/polymer/polymer-element.js';
import 'polymerfire/firebase-auth.js';
import '@polymer/paper-button/paper-button.js';
import './redux-store.js';
import { html } from '@polymer/polymer/lib/utils/html-tag.js';
class NephcounterLogin extends ReduxMixin(PolymerElement) {
  static get template() {
    return html`
    <style>
      .welcomebanner {
        font-weight: bold;
        font-size: .5em
      }
    </style>
    <firebase-auth id="auth" user="{{user}}" provider="google" status-known="{{statusKnown}}">
    </firebase-auth>
    <template is="dom-if" if="[[user]]">
       <div class="welcomebanner">Welcome [[user.displayName]]</div>
    </template>

    <paper-button id="signInButton" raised="" on-tap="login" hidden\$="[[user]]">Sign In</paper-button>
    <paper-button id="signOutButton" raised="" on-tap="logout" hidden\$="[[!user]]">Sign Out</paper-button>

    <!-- <h3>you have [[nutrientCount]] nutrients!</h3> -->
`;
  }

  static get is() { return 'nephcounter-login'; }

  static get properties() {
    return {
      user: {
        type: Object,
        notify: true,
      },
      // nutrients: {
      //   type: Array,
      //   statePath: 'nutrients',
      // },
      // nutrientCount: {
      //   type: Number,
      //   computed: 'computeNutrientCount(nutrients)',
      // },
    };
  }

  connectedCallback() {
      super.connectedCallback();
      const state = this.getState();
  }

  // computeNutrientCount(nutrients) {
  //   return nutrients.length;
  // }

  login() {
        this.$.auth.signInWithPopup()
            .then(function(response) {
            console.log("login succeeded.");
        })
            .catch(function(error) {
            console.log("login failed...", error);
        });;
    }

  logout() {
      this.$.auth.signOut();
  }
}

window.customElements.define(NephcounterLogin.is, NephcounterLogin);
