/*
  Functions used exclusively on the Race tab
*/
import { Step, StepEnum } from '../step.js';
import * as Utils from '../util.js';
import * as Constants from '../constants.js';
import {get_emotional_strengths, get_emotional_weaknesses, get_background_entries} from "../util.js";
import SearchableIndexEntryOption from '../options/search_option.js';
import SelectableOption from '../options/select_option.js';
/*
import * as ProficiencyUtils from '../proficiencyUtils';
import HeroOption from '../options/HeroOption';
import HiddenOption from '../options/HiddenOption';
import SelectableOption from '../options/SelectableOption';
import FixedOption, { OptionType } from '../options/FixedOption';
import InputOption from '../options/InputOption';
import {
  FeatEntry,
  getFeatEntries,
  getRaceEntries,
  getRaceFeatureEntries,
  IndexEntry,
  RaceEntry,
  RacialFeatureEntry,
} from '../indexUtils';
import SettingKeys from '../settings';
*/

const EntryMode = {
  ROLL: 'roll',
  STANDARD_ARRAY: 'standard',
  POINT_BUY: 'point-buy',
  MANUAL_ENTRY: 'manual',
}

class _Abilities extends Step {
    background_entries;
    $context;
    emotional_strengths;
    emotional_weaknesses;
    morality_choices;

    constructor() {
        super(StepEnum.Background);
    }

    section = () => $('#raceDiv');

    setListeners() {
        this.$context = $('[data-ffg_cc-background_data]', this.section());
    }

    async setSourceData() {
        this.background_entries = await get_background_entries();
        this.emotional_strengths = await get_emotional_strengths();
        this.emotional_weaknesses = await get_emotional_weaknesses();
        // todo: figure out how to populate this data in safer manner
        this.morality_choices = [
            {
                name: '+10 XP',
                value: '+10 XP',
                default: true,
            },
            {
                name: '+2,5000 credits',
                value: '+2,5000 credits',
                default: false,
            },
            {
                name: '+5 XP and +1,000 credits',
                value: '+5 XP and +1,000 credits',
                default: false,
            },
            {
                name: '+21 morality',
                value: '+21 morality',
                default: false,
            },
            {
                name: '-21 morality',
                value: '-21 morality',
                default: false,
            },
        ];
    }

    renderData() {
        Utils.setPanelScrolls(this.section());
        $('[data-hct_race_data]').hide();
        this.render_emotional_strength();
        this.render_emotional_weakness();
        this.render_morality_choice();
    }

    render_emotional_strength() {
        if (!this.emotional_strengths) {
            ui.notifications.error("Unable to find emotional strengths");
            return;
        }

        const searchableOption = new SearchableIndexEntryOption(
            this.step,
            'item',
            this.emotional_strengths,
            (emotional_strength_id) => {
                // callback on selected
                if (!this.emotional_strengths) {
                    ui.notifications.error("No emo str was selected!");
                    return;
                }
                const selected_strength = this.emotional_strengths.find((e) => e._id === emotional_strength_id);
                if (!selected_strength) {
                    throw new Error(`No emotional strength found with id ${emotional_strength_id}`);
                }
                this.update_emotion_strength();
                console.log("got selected emotional strength")
                console.log(selected_strength)
                // update icon and description
                $('[data-hct_emo_str_icon]').attr('src', selected_strength.img || Constants.MYSTERY_MAN);
                $('[data-hct_emo_str_description]').html(TextEditor.enrichHTML(selected_strength.content));
            },
            game.i18n.localize('ffg-cc.emo-str.background'),
        );

        searchableOption.render($('[data-hct-emo-str-search]'), this.emotional_strengths);
    }

    render_emotional_weakness() {
        if (!this.emotional_weaknesses) {
            ui.notifications.error("Unable to find emotional weakness");
            return;
        }

        const searchableOption = new SearchableIndexEntryOption(
            this.step,
            'item',
            this.emotional_weaknesses,
            (emotional_strength_id) => {
                // callback on selected
                if (!this.emotional_weaknesses) {
                    ui.notifications.error("No emo weakness was selected!");
                    return;
                }
                const selected_strength = this.emotional_weaknesses.find((e) => e._id === emotional_strength_id);
                if (!selected_strength) {
                    throw new Error(`No emotional strength found with id ${emotional_strength_id}`);
                }
                this.update_emotion_weakness();
                console.log("got selected emotional weakness")
                console.log(selected_strength)
                // update icon and description
                $('[data-hct_emo_weak_icon]').attr('src', selected_strength.img || Constants.MYSTERY_MAN);
                $('[data-hct_emo_weak_description]').html(TextEditor.enrichHTML(selected_strength.content));
            },
            game.i18n.localize('ffg-cc.emo-weak.background'),
        );

        searchableOption.render($('[data-hct-emo-weak-search]'), this.emotional_weaknesses);
    }

    render_morality_choice() {
        const morality_option = new SelectableOption(
            this.step,
            'item',
            this.morality_choices,
            '',
            this.update_morality, /* broken */
            new Map(this.morality_choices.map((obj) => [(obj.value), obj.name])), /* broken */
        );
        morality_option.render($('[data-hct_area=alignment]'), this.section())
        //this.stepOptions.push(morality_option);
    }

    update_emotion_strength() {
        this.clearOptions();
        this.$context.show();
    }

    update_emotion_weakness() {
        this.clearOptions();
        this.$context.show();
    }

    update_morality(val) {
        if (val === '+21 morality') {
            $('#starting_morality').text('Starting Morality: 71 (Light Side Paragon)');
        } else if (val === '-21 morality') {
            $('#starting_morality').text('Starting Morality: 29 (Dark Side Paragon)');
        } else {
            $('#starting_morality').text('Starting Morality: 50');
        }
    }
}

const AbilitiesTab = new _Abilities();
export default AbilitiesTab;

async function prepareRolls() {
  const abilityRoll = getModuleSetting(SettingKeys.ABILITY_ROLL_FORMULA);
  const roll = await new Roll(
    `${abilityRoll} + ${abilityRoll} + ${abilityRoll} + ${abilityRoll} + ${abilityRoll} + ${abilityRoll}`,
  ).evaluate({ async: true });
  if (getModuleSetting(SettingKeys.SHOW_ROLLS_AS_MESSAGES)) {
    roll.toMessage({ flavor: game.i18n.localize('HCT.Abilities.RollChatFlavor') });
  }
  return roll.result.split('+').map((r) => Number.parseInt(r.trim()));
}

function fillAbilitySelects(possibleValues, $section, isPointBuy) {
  const $selects = $('[data-hct-ability-score]', $section);
  $selects.empty();
  if (!isPointBuy) {
    $selects.append(
      $(
        `<option selected="true" disabled="disabled">${game.i18n.localize('HCT.Abilities.SelectPlaceholder')}</option>`,
      ),
    );
  }
  possibleValues.forEach((v) => {
    const opt = $(`<option value='${v}' ${isPointBuy && v == 8 ? 'selected' : ''}>${v}</option>`);
    $selects.append(opt);
  });
}

function recalculateTotalsAndModifiers(isPointBuy) {
  const abilities = Object.keys((game).dnd5e.config.abilities);
  let points = 0;
  abilities.forEach((ab) => {
    const score = parseInt(($(`[data-hct-ability-score='${ab}']`).val()) ?? 10);
    const race = parseInt($(`[data-hct-ability-score-race-bonus='${ab}']`).val());
    const $total = $(`[data-hct-ability-score-total='${ab}']`);
    const $mod = $(`[data-hct-ability-score-mod='${ab}']`);

    const total = score + race;
    $total.val(total).html(total + '');
    const modifier = getAbilityModifierValue(total);
    $mod.html((modifier < 0 ? '' : '+') + modifier);

    if (isPointBuy) {
      points += getPointBuyCost(score);
    }
  });
  if (isPointBuy) {
    $('[data-hct-point-buy-score]').val(points);
  }
}

function getPointBuyCost(score) {
  if (score < 14) return score - 8;
  return (score - 13) * 2 + 5;
}
