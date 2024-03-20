import { LovelaceCard, LovelaceCardEditor } from '../types/lovelace';

declare global {
	interface HTMLElementTagNameMap {
		'atomic-calendar-card-editor': LovelaceCardEditor;
		'atomic-calendar-card': LovelaceCard;
	}
}
