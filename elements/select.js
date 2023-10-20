import { styles as listItemStyles } from '@material/mwc-list//mwc-list-item.css';
import { ListBase } from '@material/mwc-list/mwc-list-base';
import { ListItemBase } from '@material/mwc-list/mwc-list-item-base';
import { styles as listStyles } from '@material/mwc-list/mwc-list.css';
import { MenuBase } from '@material/mwc-menu/mwc-menu-base';
import { MenuSurfaceBase } from '@material/mwc-menu/mwc-menu-surface-base';
import { styles as menuSurfaceStyles } from '@material/mwc-menu/mwc-menu-surface.css';
import { styles as menuStyles } from '@material/mwc-menu/mwc-menu.css';
import { NotchedOutlineBase } from '@material/mwc-notched-outline/mwc-notched-outline-base';
import { styles as notchedOutlineStyles } from '@material/mwc-notched-outline/mwc-notched-outline.css';
import { RippleBase } from '@material/mwc-ripple/mwc-ripple-base';
import { styles as rippleStyles } from '@material/mwc-ripple/mwc-ripple.css';
import { SelectBase } from '@material/mwc-select/mwc-select-base';
import { styles as selectStyles } from '@material/mwc-select/mwc-select.css';

export const selectDefinition = {
	'mwc-select': class extends SelectBase {
		static get styles() {
			return selectStyles;
		}
	},
	'mwc-list': class extends ListBase {
		static get styles() {
			return listStyles;
		}
	},
	'mwc-list-item': class extends ListItemBase {
		static get styles() {
			return listItemStyles;
		}
	},
	'mwc-ripple': class extends RippleBase {
		static get styles() {
			return rippleStyles;
		}
	},
	'mwc-menu': class extends MenuBase {
		static get styles() {
			return menuStyles;
		}
	},
	'mwc-menu-surface': class extends MenuSurfaceBase {
		static get styles() {
			return menuSurfaceStyles;
		}
	},
	'mwc-notched-outline': class extends NotchedOutlineBase {
		static get styles() {
			return notchedOutlineStyles;
		}
	},
};
