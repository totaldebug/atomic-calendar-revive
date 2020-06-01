import{c as t,_ as e,p as n,a as i,L as r,h as a}from"./app-d630b3ff.js";var o=/d{1,4}|M{1,4}|YY(?:YY)?|S{1,3}|Do|ZZ|Z|([HhMsDm])\1?|[aA]|"[^"]*"|'[^']*'/g,s="[^\\s]+",c=/\[([^]*?)\]/gm;function u(t,e){for(var n=[],i=0,r=t.length;i<r;i++)n.push(t[i].substr(0,e));return n}var d=function(t){return function(e,n){var i=n[t].map((function(t){return t.toLowerCase()})).indexOf(e.toLowerCase());return i>-1?i:null}};function g(t){for(var e=[],n=1;n<arguments.length;n++)e[n-1]=arguments[n];for(var i=0,r=e;i<r.length;i++){var a=r[i];for(var o in a)t[o]=a[o]}return t}var f=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],h=["January","February","March","April","May","June","July","August","September","October","November","December"],m=u(h,3),l={dayNamesShort:u(f,3),dayNames:f,monthNamesShort:m,monthNames:h,amPm:["am","pm"],DoFn:function(t){return t+["th","st","nd","rd"][t%10>3?0:(t-t%10!=10?1:0)*t%10]}},p=g({},l),v=function(t,e){for(void 0===e&&(e=2),t=String(t);t.length<e;)t="0"+t;return t},y={D:function(t){return String(t.getDate())},DD:function(t){return v(t.getDate())},Do:function(t,e){return e.DoFn(t.getDate())},d:function(t){return String(t.getDay())},dd:function(t){return v(t.getDay())},ddd:function(t,e){return e.dayNamesShort[t.getDay()]},dddd:function(t,e){return e.dayNames[t.getDay()]},M:function(t){return String(t.getMonth()+1)},MM:function(t){return v(t.getMonth()+1)},MMM:function(t,e){return e.monthNamesShort[t.getMonth()]},MMMM:function(t,e){return e.monthNames[t.getMonth()]},YY:function(t){return v(String(t.getFullYear()),4).substr(2)},YYYY:function(t){return v(t.getFullYear(),4)},h:function(t){return String(t.getHours()%12||12)},hh:function(t){return v(t.getHours()%12||12)},H:function(t){return String(t.getHours())},HH:function(t){return v(t.getHours())},m:function(t){return String(t.getMinutes())},mm:function(t){return v(t.getMinutes())},s:function(t){return String(t.getSeconds())},ss:function(t){return v(t.getSeconds())},S:function(t){return String(Math.round(t.getMilliseconds()/100))},SS:function(t){return v(Math.round(t.getMilliseconds()/10),2)},SSS:function(t){return v(t.getMilliseconds(),3)},a:function(t,e){return t.getHours()<12?e.amPm[0]:e.amPm[1]},A:function(t,e){return t.getHours()<12?e.amPm[0].toUpperCase():e.amPm[1].toUpperCase()},ZZ:function(t){var e=t.getTimezoneOffset();return(e>0?"-":"+")+v(100*Math.floor(Math.abs(e)/60)+Math.abs(e)%60,4)},Z:function(t){var e=t.getTimezoneOffset();return(e>0?"-":"+")+v(Math.floor(Math.abs(e)/60),2)+":"+v(Math.abs(e)%60,2)}},M=function(t){return+t-1},b=[null,"[1-9]\\d?"],D=[null,s],Y=["isPm",s,function(t,e){var n=t.toLowerCase();return n===e.amPm[0]?0:n===e.amPm[1]?1:null}],S=["timezoneOffset","[^\\s]*?[\\+\\-]\\d\\d:?\\d\\d|[^\\s]*?Z?",function(t){var e=(t+"").match(/([+-]|\d\d)/gi);if(e){var n=60*+e[1]+parseInt(e[2],10);return"+"===e[0]?n:-n}return 0}],x=(d("monthNamesShort"),d("monthNames"),{default:"ddd MMM DD YYYY HH:mm:ss",shortDate:"M/D/YY",mediumDate:"MMM D, YYYY",longDate:"MMMM D, YYYY",fullDate:"dddd, MMMM D, YYYY",isoDate:"YYYY-MM-DD",isoDateTime:"YYYY-MM-DDTHH:mm:ssZ",shortTime:"HH:mm",mediumTime:"HH:mm:ss",longTime:"HH:mm:ss.SSS"});var _=function(t,e,n){if(void 0===e&&(e=x.default),void 0===n&&(n={}),"number"==typeof t&&(t=new Date(t)),"[object Date]"!==Object.prototype.toString.call(t)||isNaN(t.getTime()))throw new Error("Invalid Date pass to format");var i=[];e=(e=x[e]||e).replace(c,(function(t,e){return i.push(e),"@@@"}));var r=g(g({},p),n);return(e=e.replace(o,(function(e){return y[e](t,r)}))).replace(/@@@/g,(function(){return i.shift()}))},w=(function(){try{(new Date).toLocaleDateString("i")}catch(t){return"RangeError"===t.name}}(),function(){try{(new Date).toLocaleString("i")}catch(t){return"RangeError"===t.name}}(),function(){try{(new Date).toLocaleTimeString("i")}catch(t){return"RangeError"===t.name}}(),function(t,e,n,i){i=i||{},n=null==n?{}:n;var r=new Event(e,{bubbles:void 0===i.bubbles||i.bubbles,cancelable:Boolean(i.cancelable),composed:void 0===i.composed||i.composed});return r.detail=n,t.dispatchEvent(r),r});const H=t`
  .entities {
    margin-top: 30px;
    margin-top: 30px;
  }
  .entities paper-checkbox {
    display: block;
    margin-bottom: 0px;
    margin-left: 10px;
  }
  .entity-select {
    margin-top: 20px;
  }
  .checkbox-options:first-of-type {
    margin-top: 10px;
  }
  .checkbox-options:last-of-type {
    margin-bottom: 10px;
  }
  .checkbox-options {
    display: flex;
  }
  .checkbox-options paper-checkbox {
    margin-top: 5px;
    width: 50%;
  }
  .overall-config {
    margin-bottom: 10px;
  }
  .origin-calendar {
    width: 50%;
    margin-left: 35px;
  }
`;let C=(()=>{let t=class extends r{static get styles(){return H}setConfig(t){this._config=Object.assign({},t)}get entityOptions(){return Object.keys(this.hass.states).filter(t=>"calendar"===t.substr(0,t.indexOf("."))).map(t=>{const e=this._config.entities.find(e=>(e&&e.entity||e)===t),n=this.hass.states[t];return{entity:t,name:e&&e.name||n.attributes.friendly_name||t,checked:!!e}})}render(){return this.hass?a`
      <div class="card-config">
        <span style="color:red;font-weight:bold">
          Editor Version: ${"1.0.0"}
        </span>
        <div class="entities">
          <h3>Entities (Required)</h3>
          ${this.entityOptions.map(t=>a`
              <div class="entity-select">
                <paper-checkbox
                  @checked-changed="${this.entityChanged}"
                  .checked=${t.checked}
                  .entityId="${t.entity}"
                >
                  ${t.entity}
                </paper-checkbox>
                ${this._config.showEventOrigin?a`
                      <div class="origin-calendar">
                        <paper-input
                          label="Calendar Origin"
                          .value="${t.name}"
                          .entityId="${t.entity}"
                          @value-changed="${this.entityNameChanged}"
                        ></paper-input>
                      </div>
                    `:a``}
              </div>
            `)}
        </div>
      </div>
    `:a``}checkboxChanged(t){if(this.cantFireEvent)return;const{target:{configValue:e},detail:{value:n}}=t;this._config=Object.assign({},this._config,{[e]:n}),w(this,"config-changed",{config:this._config})}inputChanged(t){if(this.cantFireEvent)return;const{target:{configValue:e},detail:{value:n}}=t;this._config=Object.assign({},this._config,{[e]:n}),w(this,"config-changed",{config:this._config})}get entities(){return[...this._config.entities||[]].map(t=>t.entity?t:{entity:t,name:t})}entityNameChanged({target:{entityId:t},detail:{value:e}}){if(this.cantFireEvent)return;let n=[...this.entities];n=n.map(n=>(n.entity===t&&(n.name=e||""),n)),this._config=Object.assign({},this._config,{entities:n}),w(this,"config-changed",{config:this._config})}entityChanged({target:{entityId:t},detail:{value:e}}){if(this.cantFireEvent)return;let n=[...this.entities];if(e){const e=this.hass.states[t];n.push({entity:t,name:e.attributes.friendly_name||t})}else n=n.filter(e=>e.entity!==t);this._config=Object.assign({},this._config,{entities:n}),w(this,"config-changed",{config:this._config})}get cantFireEvent(){return!this._config||!this.hass}};return e([n()],t.prototype,"hass",void 0),e([n()],t.prototype,"_config",void 0),e([n()],t.prototype,"_toggle",void 0),t=e([i("atomic-calendar-revive-editor")],t),t})();window.customCards=window.customCards||[],window.customCards.push({type:"atomic-calendar-revive",name:"Atomic Calendar Revive",description:"An advanced calendar card for Home Assistant with Lovelace."});export default C;
