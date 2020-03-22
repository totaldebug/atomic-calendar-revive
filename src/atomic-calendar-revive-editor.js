const EDITOR_VERSION = '1.0.0-alpha';

const fireEvent = (node, type, detail, options) => {
    options = options || {};
    detail = detail === null || detail === undefined ? {} : detail;
    const event = new Event(type, {
      bubbles: options.bubbles === undefined ? true : options.bubbles,
      cancelable: Boolean(options.cancelable),
      composed: options.composed === undefined ? true : options.composed
    });
    event.detail = detail;
    node.dispatchEvent(event);
    return event;
  };
  
  if (
    !customElements.get("ha-switch") &&
    customElements.get("paper-toggle-button")
  ) {
    customElements.define("ha-switch", customElements.get("paper-toggle-button"));
  }
  
  const LitElement = Object.getPrototypeOf(customElements.get("hui-view"));
  const html = LitElement.prototype.html;
  const css = LitElement.prototype.css;
  
  var linkTargets=["_blank","_self","_parent", "_top"];

  export class AtomicCalendarReviveEditor extends LitElement {

    setConfig(config) {
      this._config = { ...config };
    }
  
    static get properties() {
      return { hass: {}, _config: {} };
    }

    get _name() {
      return this._config.name || "";
    }
  
    get _showColors(){
      if (this._config) {
        return this._config.showColors || true;
      }
      return true;
    }
  
    get _showLocation(){
      if (this._config) {
        return this._config.showLocation || true;
      }
      return true;
    }

    get _showMonth(){
      if (this._config) {
        return this._config.showMonth || false;
      }
      return false;
    }

    get _showLoader(){
      if (this._config) {
        return this._config.showLoader || true;
      }
      return true;
    }

    get _showDate(){
      if (this._config) {
        return this._config.showDate || false;
      }
      return false;
    }
    
    get _showDescription(){
      if (this._config) {
        return this._config.showDescription || false;
      }
      return false;
    }

    get _showNoEventsForToday(){
      if (this._config) {
        return this._config.showNoEventsForToday || false;
      }
      return false;
    }

    get _sortByStartTime(){
      if (this._config) {
        return this._config.sortByStartTime || false;
      }
      return false;
    }

    get _disableEventLink(){
      if (this._config) {
        return this._config.disableEventLink || false;
      }
      return false;
    }

    get _disableLocationLink(){
      if (this._config) {
        return this._config.disableLocationLink || false;
      }
      return false;
    }

    get _linkTarget(){
      if (this._config) {
        return this._config.linkTarget || '_blank';
      }
  
      return '_blank';
    }

    render() {

      if (!this.hass) {
        return html``;
      }
  
      return html`
        <div class="card-config">
          <div>
            <paper-input
              label="Name"
              .value="${this._name}"
              .configValue="${"name"}"
              @value-changed="${this._valueChanged}"
            ></paper-input>

            <ha-switch
            aria-label=${`Toggle Colors ${this._showColors ? 'off' : 'on'}`}
            .checked=${this._showColors !== false}
            .configValue=${'showColors'}
            @change=${this._valueChanged}
            >Show Colors</ha-switch
            >
            <ha-switch
            aria-label=${`Toggle Location ${this._showLocation ? 'off' : 'on'}`}
            .checked=${this._showLocation !== false}
            .configValue=${'showLocation'}
            @change=${this._valueChanged}
            >Show Location</ha-switch
            >
            <ha-switch
            aria-label=${`Toggle Month ${this._showMonth ? 'on' : 'off' }`}
            .checked=${this._showMonth !== false}
            .configValue=${'showMonth'}
            @change=${this._valueChanged}
            >Show Month</ha-switch
            >
            <ha-switch
            aria-label=${`Toggle Loader ${this._showLoader ? 'off' : 'on'}`}
            .checked=${this._showLoader !== false}
            .configValue=${'showLoader'}
            @change=${this._valueChanged}
            >Show Loader</ha-switch
            >
            <ha-switch
            aria-label=${`Toggle Date ${this._showDate ? 'on' : 'off'}`}
            .checked=${this._showDate !== false}
            .configValue=${'showDate'}
            @change=${this._valueChanged}
            >Show Date</ha-switch
            >
            <ha-switch
            aria-label=${`Toggle Description  ${this._showDescription  ? 'on' : 'off'}`}
            .checked=${this._showDescription  !== false}
            .configValue=${'showDescription'}
            @change=${this._valueChanged}
            >Show Description</ha-switch
            >
            <ha-switch
            aria-label=${`Toggle No Events Today  ${this._showNoEventsForToday  ? 'on' : 'off'}`}
            .checked=${this._showNoEventsForToday  !== false}
            .configValue=${'showNoEventsForToday'}
            @change=${this._valueChanged}
            >Show 'No Events Today'</ha-switch
            >
            <ha-switch
            aria-label=${`Toggle sort by start time  ${this._sortByStartTime  ? 'on' : 'off'}`}
            .checked=${this._sortByStartTime  !== false}
            .configValue=${'sortByStartTime'}
            @change=${this._valueChanged}
            >Sort by Start Time</ha-switch
            >
            <ha-switch
            aria-label=${`Toggle event link  ${this._disableEventLink  ? 'on' : 'off'}`}
            .checked=${this._disableEventLink  !== false}
            .configValue=${'disableEventLink'}
            @change=${this._valueChanged}
            >Disable Event Link URL</ha-switch
            >
            <ha-switch
            aria-label=${`Toggle location link  ${this._disableLocationLink  ? 'on' : 'off'}`}
            .checked=${this._disableLocationLink  !== false}
            .configValue=${'disableLocationLink'}
            @change=${this._valueChanged}
            >Disable Location Link URL</ha-switch
            >
            <div class="values">
                <paper-dropdown-menu
                  label="Link Target"
                  @value-changed=${this._valueChanged}
                  .configValue=${'linkTarget'}
                >
                  <paper-listbox slot="dropdown-content" .selected=${linkTargets.indexOf(this._linkTarget)}>
                    ${linkTargets.map(linkTarget => {
                      return html`
                        <paper-item>${linkTarget}</paper-item>
                      `;
                    })}
                  </paper-listbox>
                </paper-dropdown-menu>
              </div>
          </div>
        </div>
      `;
    }
  
    _valueChanged(ev) {
      if (!this._config || !this.hass) {
        return;
      }
      const target = ev.target;
      if (this[`_${target.configValue}`] === target.value) {
        return;
      }
      if (target.configValue) {
        if (target.value === "") {
          delete this._config[target.configValue];
        } else {
          this._config = {
            ...this._config,
            [target.configValue]:
              target.checked !== undefined ? target.checked : target.value
          };
        }
      }
      fireEvent(this, "config-changed", { config: this._config });
    }
  
    static get styles() {
      return css`
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
      `;
    }
  }
  
  customElements.define("atomic-calendar-revive-editor", AtomicCalendarReviveEditor);
