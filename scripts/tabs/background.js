/*
  Functions used exclusively on the Race tab
*/
import { Step, StepEnum } from '../step.js';
import * as Utils from '../util.js';
import * as Constants from '../constants.js';
import {get_background_entries} from "../util.js";
import SearchableIndexEntryOption from '../options/search_option.js';

class _Background extends Step {
    background_entries;
    $context;

    constructor() {
        super(StepEnum.Background);
    }

    section = () => $('#raceDiv');

    setListeners() {
        this.$context = $('[data-ffg_cc-background_data]', this.section());
    }

    async setSourceData() {
        this.background_entries = await get_background_entries();
    }

    renderData() {
        Utils.setPanelScrolls(this.section());
        $('[data-hct_race_data]').hide();
        if (!this.background_entries) {
            ui.notifications.error("Unable to find backgrounds");
            return;
        }

        const searchableOption = new SearchableIndexEntryOption(
            this.step,
            'item',
            this.background_entries,
            (background_id) => {
                // callback on selected
                if (!this.background_entries) {
                    ui.notifications.error("No background was selected!");
                    return;
                }
                const selected_background = this.background_entries.find((e) => e._id === background_id);
                if (!selected_background) {
                    throw new Error(`No background found with id ${background_id}`);
                }
                this.updateBackground();
                console.log("got selected race")
                console.log(selected_background)
                // update icon and description
                $('[data-hct_race_icon]').attr('src', selected_background.img || Constants.MYSTERY_MAN);
                $('[data-hct_race_description]').html(TextEditor.enrichHTML(selected_background.content));
            },
            game.i18n.localize('ffg-cc.background.background'),
        );
        searchableOption.render($('[data-hct-race-search]'), this.background_entries);
    }

    updateBackground() {
        this.clearOptions();
        this.$context.show();
    }
}
const BackgroundTab = new _Background();
export default BackgroundTab;
