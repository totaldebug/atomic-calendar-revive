const e=(e,t,i,o)=>{o=o||{},i=null==i?{}:i;const s=new Event(t,{bubbles:void 0===o.bubbles||o.bubbles,cancelable:Boolean(o.cancelable),composed:void 0===o.composed||o.composed});return s.detail=i,e.dispatchEvent(s),s};!customElements.get("ha-switch")&&customElements.get("paper-toggle-button")&&customElements.define("ha-switch",customElements.get("paper-toggle-button"));const t=Object.getPrototypeOf(customElements.get("hui-view")),i=t.prototype.html,o=t.prototype.css;var s=["_blank","_self","_parent","_top"];class a extends t{setConfig(e){this._config={...e}}configChanged(e){const t=new Event("config-changed",{bubbles:!0,composed:!0});t.detail={config:e},this.dispatchEvent(t)}static get properties(){return{hass:{},_config:{}}}get _name(){return this._config.name||""}get _Entities(){return!this._config||this._config.entities}get _showColors(){return this._config&&this._config.showColors||!0}get _showLocation(){return this._config&&this._config.showLocation||!0}get _showMonth(){return this._config&&this._config.showMonth||!1}get _showWeekDay(){return this._config&&this._config.showWeekDay||!1}get _showLoader(){return this._config&&this._config.showLoader||!0}get _showDate(){return this._config&&this._config.showDate||!1}get _showDescription(){return this._config&&this._config.showDescription||!1}get _showNoEventsForToday(){return this._config&&this._config.showNoEventsForToday||!1}get _sortByStartTime(){return this._config&&this._config.sortByStartTime||!1}get _disableEventLink(){return this._config&&this._config.disableEventLink||!1}get _disableLocationLink(){return this._config&&this._config.disableLocationLink||!1}get _linkTarget(){return this._config&&this._config.linkTarget||"_blank"}render(){return this.hass?i`
      <div class="card-config">
        <div>
          <span style="color:red;font-weight:bold">Editor Version: ${"1.1.0-alpha"}</span>
          <paper-input
            label="Name"
            .value="${this._name}"
            .configValue="${"name"}"
            @value-changed="${this._valueChanged}"
          ></paper-input>
          <h3>Entities (Required)</h3>
          <span>Entities can only be edited in the Code Editor, im working on it!</span>

          <h3>Basic Settings</h3>
          <ha-switch
          aria-label=${`Toggle Loader ${this._showLoader?"off":"on"}`}
          .checked=${!1!==this._showLoader}
          .configValue=${"showLoader"}
          @change=${this._valueChanged}
          >Show Loader</ha-switch
          >
          <ha-switch
          aria-label=${`Toggle Date ${this._showDate?"on":"off"}`}
          .checked=${!1!==this._showDate}
          .configValue=${"showDate"}
          @change=${this._valueChanged}
          >Show Date</ha-switch
          >
          <ha-switch
          aria-label=${`Toggle Colors ${this._showColors?"off":"on"}`}
          .checked=${!1!==this._showColors}
          .configValue=${"showColors"}
          @change=${this._valueChanged}
          >Show Colors</ha-switch
          >

          <h3>Event Mode</h3>
          <ha-switch
          aria-label=${`Toggle Month ${this._showMonth?"on":"off"}`}
          .checked=${!1!==this._showMonth}
          .configValue=${"showMonth"}
          @change=${this._valueChanged}
          >Show Month</ha-switch
          >
          <ha-switch
          aria-label=${`Toggle Week Day ${this._showWeekDay?"on":"off"}`}
          .checked=${!1!==this._showWeekDay}
          .configValue=${"showWeekDay"}
          @change=${this._valueChanged}
          >Show Week Day</ha-switch
          >
          <ha-switch
          aria-label=${`Toggle Location ${this._showLocation?"off":"on"}`}
          .checked=${!1!==this._showLocation}
          .configValue=${"showLocation"}
          @change=${this._valueChanged}
          >Show Location</ha-switch
          >
          <ha-switch
          aria-label=${`Toggle No Events Today  ${this._showNoEventsForToday?"on":"off"}`}
          .checked=${!1!==this._showNoEventsForToday}
          .configValue=${"showNoEventsForToday"}
          @change=${this._valueChanged}
          >Show 'No Events Today'</ha-switch
          >
          <ha-switch
          aria-label=${`Toggle Description  ${this._showDescription?"on":"off"}`}
          .checked=${!1!==this._showDescription}
          .configValue=${"showDescription"}
          @change=${this._valueChanged}
          >Show Description</ha-switch
          >
          <ha-switch
          aria-label=${`Toggle sort by start time  ${this._sortByStartTime?"on":"off"}`}
          .checked=${!1!==this._sortByStartTime}
          .configValue=${"sortByStartTime"}
          @change=${this._valueChanged}
          >Sort by Start Time</ha-switch
          >
          <ha-switch
          aria-label=${`Toggle event link  ${this._disableEventLink?"on":"off"}`}
          .checked=${!1!==this._disableEventLink}
          .configValue=${"disableEventLink"}
          @change=${this._valueChanged}
          >Disable Event Link URL</ha-switch
          >
          <ha-switch
          aria-label=${`Toggle location link  ${this._disableLocationLink?"on":"off"}`}
          .checked=${!1!==this._disableLocationLink}
          .configValue=${"disableLocationLink"}
          @change=${this._valueChanged}
          >Disable Location Link URL</ha-switch
          >
          <div class="values">
              <paper-dropdown-menu
                label="Link Target"
                @value-changed=${this._valueChanged}
                .configValue=${"linkTarget"}
              >
                <paper-listbox slot="dropdown-content" .selected=${s.indexOf(this._linkTarget)}>
                  ${s.map(e=>i`
                      <paper-item>${e}</paper-item>
                    `)}
                </paper-listbox>
              </paper-dropdown-menu>
            </div>
        </div>
      </div>
    `:i``}_addEntity(t){const i=t.target;if(""===i.value)return;const o=this[`_${i.configValue}`].concat({entity:i.value});i.value="",e(this,"entities-changed",{entities:o})}_valueChanged(t){if(!this._config||!this.hass)return;const i=t.target;this[`_${i.configValue}`]!==i.value&&(i.configValue&&(""===i.value?delete this._config[i.configValue]:this._config={...this._config,[i.configValue]:void 0!==i.checked?i.checked:i.value}),e(this,"config-changed",{config:this._config}))}static get styles(){return o`
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
    `}}customElements.define("atomic-calendar-revive-editor",a);export{a as AtomicCalendarReviveEditor};
