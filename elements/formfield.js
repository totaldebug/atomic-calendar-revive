import { FormfieldBase } from '@material/mwc-formfield/mwc-formfield-base';
import { styles as formfieldStyles } from '@material/mwc-formfield/mwc-formfield.css';

export const formfieldDefinition = {
	'mwc-formfield': class extends FormfieldBase {
		static get styles() {
			return formfieldStyles;
		}
	},
};
