!customElements.get("ha-switch")&&customElements.get("paper-toggle-button")&&customElements.define("ha-switch",customElements.get("paper-toggle-button"));const e=Object.getPrototypeOf(customElements.get("hui-view")),o=e.prototype.html,t=e.prototype.css;class s extends e{setConfig(e){this._config={...e}}static get properties(){return{hass:{},_config:{}}}get _name(){return this._config.name||""}get _showColors(){return this._config&&this._config.showColors||!0}get _showLocation(){return this._config&&this._config.showLocation||!0}get _showMonth(){return this._config&&this._config.showMonth||!1}get _showLoader(){return this._config&&this._config.showLoader||!0}render(){return this.hass?o`
        <div class="card-config">
          <div>
            <paper-input
              label="Name"
              .value="${this._name}"
              .configValue="${"name"}"
              @value-changed="${this._valueChanged}"
            ></paper-input>
            <ha-switch
            aria-label=${`Toggle Colors ${this._showColors?"off":"on"}`}
            .checked=${!1!==this._showColors}
            .configValue=${"showColors"}
            @change=${this._valueChanged}
            >Show Colors</ha-switch
            >
            <ha-switch
            aria-label=${`Toggle Location ${this._showLocation?"off":"on"}`}
            .checked=${!1!==this._showLocation}
            .configValue=${"showLocation"}
            @change=${this._valueChanged}
            >Show Location</ha-switch
            >
            <ha-switch
            aria-label=${`Toggle Month ${this._showMonth?"on":"off"}`}
            .checked=${!1!==this._showMonth}
            .configValue=${"showMonth"}
            @change=${this._valueChanged}
            >Show Month</ha-switch
            >
            <ha-switch
            aria-label=${`Toggle Loader ${this._showLoader?"off":"on"}`}
            .checked=${!1!==this._showLoader}
            .configValue=${"showLoader"}
            @change=${this._valueChanged}
            >Show Loader</ha-switch
            >
          </div>
        </div>
      `:o``}_valueChanged(e){if(!this._config||!this.hass)return;const o=e.target;this[`_${o.configValue}`]!==o.value&&(o.configValue&&(""===o.value?delete this._config[o.configValue]:this._config={...this._config,[o.configValue]:void 0!==o.checked?o.checked:o.value}),((e,o,t,s)=>{s=s||{},t=null==t?{}:t;const i=new Event(o,{bubbles:void 0===s.bubbles||s.bubbles,cancelable:Boolean(s.cancelable),composed:void 0===s.composed||s.composed});i.detail=t,e.dispatchEvent(i)})(this,"config-changed",{config:this._config}))}static get styles(){return t`
        ha-switch {
          padding-top: 16px;
        }
        .side-by-side {
          display: flex;
        }
        .side-by-side > * {
          flex: 1;
          padding-right: 4px;
        }
      `}}customElements.define("atomic-calendar-revive-editor",s);export{s as AtomicCalendarReviveEditor};
