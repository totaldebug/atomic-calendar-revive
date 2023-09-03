import { LovelaceCard, LovelaceCardEditor } from 'custom-card-helpers';


declare global {
    interface HTMLElementTagNameMap {
        'atomic-calendar-card-editor': LovelaceCardEditor;
        'atomic-calendar-card': LovelaceCard;
    }
}
