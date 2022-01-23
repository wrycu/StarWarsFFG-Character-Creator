/*
  Functions used exclusively on the Race tab
*/
import { Step, StepEnum } from '../step.js';
import * as Utils from '../util.js';
import * as Constants from '../constants.js';
import {get_background_entries} from "../util.js";
import SearchableIndexEntryOption from '../options/search_option.js';
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

class _Background extends Step {
  raceEntries;
  pickableRaces;
  raceFeatures;

  feats;

  $context;

  subraceBlacklist;

  constructor() {
    super(StepEnum.Background);
  }

  section = () => $('#raceDiv');

  setListeners() {
    this.$context = $('[data-hct_race_data]', this.section());
  }

  async setSourceData() {
    this.raceEntries = await get_background_entries();
    console.log("HELLO")
    console.log(this.raceEntries)
    const raceNames = this.raceEntries.filter((entry) => entry.data?.requirements == '').map((race) => race.name);

    const raceFeatureIndexEntries = await get_background_entries();
    this.raceFeatures = raceFeatureIndexEntries?.filter((entry) => !raceNames.includes(entry.name)); //filters out subraces from features

    //const featIndexEntries = await getFeatEntries();
      const featIndexEntries = [];
    this.feats = featIndexEntries.sort((a, b) => a.name.localeCompare(b.name));

    this.subraceBlacklist = [];
  }

  renderData() {
    Utils.setPanelScrolls(this.section());
    $('[data-hct_race_data]').hide();
    if (!this.raceEntries) {
      ui.notifications.error(game.i18n.format('HCT.Error.UpdateValueLoad', { value: 'Races' }));
      return;
    }

    const searchableOption = new SearchableIndexEntryOption(
      this.step,
      'item',
      getPickableRaces(this.raceEntries, this.subraceBlacklist ?? []),
      (raceId) => {
        // callback on selected
          console.log("getpickableraces")
        if (!this.raceEntries) {
          ui.notifications.error(game.i18n.format('HCT.Error.UpdateValueLoad', { value: 'Races' }));
          return;
        }
        const selectedRace = this.raceEntries.find((e) => e._id === raceId);
        if (!selectedRace) {
          throw new Error(`No race found for id ${raceId}`);
        }
        const parentRace = getParentRace(selectedRace, this.raceEntries);
        this.updateRace(selectedRace.name, parentRace ? [parentRace, selectedRace] : [selectedRace]);
        console.log("got selected race")
        console.log(selectedRace)
          console.log(parentRace)

        // update icon and description
        $('[data-hct_race_icon]').attr('src', selectedRace.img || Constants.MYSTERY_MAN);
        if (parentRace) {
          $('[data-hct_race_description]').html(TextEditor.enrichHTML(selectedRace.name));
          $('[data-hct_subrace_description]').html(TextEditor.enrichHTML(selectedRace.content));
        } else {
          $('[data-hct_race_description]').html(TextEditor.enrichHTML(selectedRace.data.description.value));
          $('[data-hct_subrace_description]').empty();
        }
        $('[data-hct_subrace_separator]').toggle(!!parentRace);
      },
      game.i18n.localize('ffg-cc.background.background'),
    );
    searchableOption.render($('[data-hct-race-search]'), this.raceEntries);
  }

  updateRace(raceName, raceItems) {
    this.clearOptions();
    this.resetFeat();
    /*

    this.setAbilityScoresUi();
    this.setSizeUi();
    this.setSensesUi();
    this.setMovementUi();
    this.setProficienciesUi();


    this.setRaceFeaturesUi(raceItems);
    this.setFeatsUi();
    */

    this.$context.show();

    //this.stepOptions.push(new HiddenOption(StepEnum.Race, 'items', raceItems, { addValues: true }));
    //this.stepOptions.push(new HiddenOption(StepEnum.Race, 'data.details.race', raceName));
  }

  resetFeat() {
    $('[data-hct_feat_icon] img', this.$context)
      .attr('src', Constants.MYSTERY_MAN)
      .removeClass('hct-hover-shadow-accent');
  }

  async setProficienciesUi() {
    const $proficienciesSection = $('section', $('[data-hct_race_area=proficiencies]', this.$context)).empty();
    const options = [];
    options.push(
      ProficiencyUtils.prepareSkillOptions({
        step: this.step,
        $parent: $proficienciesSection,
        pushTo: this.stepOptions,
        quantity: 0,
        addValues: true,
        expandable: true,
        customizable: false,
      }),
    );

    options.push(
      await ProficiencyUtils.prepareWeaponOptions({
        step: this.step,
        $parent: $proficienciesSection,
        pushTo: this.stepOptions,
        quantity: 0,
        addValues: true,
        expandable: true,
        customizable: true,
      }),
    );

    options.push(
      await ProficiencyUtils.prepareArmorOptions({
        step: this.step,
        $parent: $proficienciesSection,
        pushTo: this.stepOptions,
        quantity: 0,
        addValues: true,
        expandable: true,
        customizable: true,
      }),
    );

    options.push(
      await ProficiencyUtils.prepareToolOptions({
        step: this.step,
        $parent: $proficienciesSection,
        pushTo: this.stepOptions,
        quantity: 0,
        addValues: true,
        expandable: true,
        customizable: true,
      }),
    );

    options.push(
      ProficiencyUtils.prepareLanguageOptions({
        step: this.step,
        $parent: $proficienciesSection,
        pushTo: this.stepOptions,
        quantity: 0,
        addValues: true,
        expandable: true,
        customizable: true,
      }),
    );

    options.forEach((o) => o.render($proficienciesSection));
    this.stepOptions.push(...options);
  }

  setMovementUi() {
    const movementOption = new InputOption(StepEnum.Race, 'data.attributes.movement.walk', '', 30, {
      addValues: false,
      type: 'number',
      preLabel: game.i18n.localize(`HCT.Common.Movement.walk`),
      postLabel: 'ft',
      class: 'hct-width-half',
    });
    const $movementSection = $('section', $('[data-hct_race_area=movement]', this.$context)).empty();
    movementOption.render($movementSection);
    this.stepOptions.push(movementOption);
  }

  setSensesUi() {
    const sensesOption = new InputOption(StepEnum.Race, 'data.attributes.senses.darkvision', '', 0, {
      addValues: false,
      type: 'number',
      preLabel: game.i18n.localize(`HCT.Common.Senses.darkvision`),
      postLabel: 'ft',
      class: 'hct-width-half',
    });
    const $sensesSection = $('section', $('[data-hct_race_area=senses]', this.$context)).empty();
    sensesOption.render($sensesSection);
    this.stepOptions.push(sensesOption);
  }

  setSizeUi() {
    const sizeOption = new SelectableOption(StepEnum.Race, 'data.traits.size', getSizeOptions(), '', {
      addValues: false,
      default: 'med',
      customizable: false,
    });
    const $sizeSection = $('section', $('[data-hct_race_area=size]', this.$context)).empty();
    sizeOption.render($sizeSection);
    this.stepOptions.push(sizeOption);
  }

  setAbilityScoresUi() {
      // don't actually care because this isn't D&D
      return;
    const foundryAbilities = (game).dnd5e.config.abilities;
    const options = Object.keys(foundryAbilities).map((key) => {
      return new InputOption(StepEnum.Race, `data.abilities.${(key).toLowerCase()}.value`, '', 0, {
        addValues: true,
        type: 'number',
        preLabel: `${foundryAbilities[key]}`,
        class: 'hct-width-half',
        data: `data-hct-race-ability='${key}'`,
      });
    });
    const $abilityScoreSection = $('section', $('[data-hct_race_area=abilityScores]', this.$context)).empty();
    options.forEach((o) => o.render($abilityScoreSection));
    this.stepOptions.push(...options);
  }

  setRaceFeaturesUi(raceItems) {
    const options = [];
    const raceFeatures = Utils.filterItemList({
      filterValues: raceItems.map((r) => r.name),
      filterField: 'data.requirements',
      itemList: this.raceFeatures,
    });
    raceFeatures.forEach((feature) => {
      const featureOption = new FixedOption(RaceTab.step, 'items', feature, undefined, {
        addValues: true,
        type: OptionType.ITEM,
      });
      options.push(featureOption);
    });

    const $raceFeaturesSection = $('section', $('[data-hct_race_area=features]', this.$context)).empty();
    options.forEach((o) => o.render($raceFeaturesSection));
    this.stepOptions.push(...options);
  }

  setFeatsUi() {
    const featOption = new SearchableIndexEntryOption(this.step, 'items', this.feats ?? [], (featId) => {
      const featEntry = this.feats?.find((f) => f._id == featId);
      if (!featEntry) {
        ui.notifications.error(game.i18n.format('HCT.Error.UpdateValueLoad', { value: 'Feats' }));
        return;
      }
      const $imgLink = $('[data-hct_feat_icon]', this.$context);
      $imgLink.attr('data-pack', featEntry._pack ?? '');
      $imgLink.attr('data-id', featEntry._id ?? '');
      $('img', $imgLink)
        .attr('src', featEntry.img ?? Constants.MYSTERY_MAN)
        .addClass('hct-hover-shadow-accent');
    });
    const $raceFeaturesSection = $('section', $('[data-hct_race_area=feat]', this.$context)).empty();
    featOption.render($raceFeaturesSection);
    this.stepOptions.push(featOption);
  }
}
const BackgroundTab = new _Background();
export default BackgroundTab;

function getSizeOptions() {
  const foundrySizes = (game).dnd5e.config.actorSizes;

  return Object.keys(foundrySizes).map((k) => ({ key: k, value: foundrySizes[k] }));
}

function validSubraceName(name, misleadingFeatureNames) {
  return !misleadingFeatureNames.includes(name);
}

function subraceNameIsPartOfRaceName(subraceName, parentName) {
  if (parentName.includes(' ')) {
    return subraceName.includes(parentName);
  } else {
    return subraceName.includes(' ') ? subraceName.split(' ').includes(parentName) : subraceName.includes(parentName);
  }
}

function parentListedAsRequirement(subrace, parentName) {
  return true;
}

function getPickableRaces(raceEntries, misleadingFeatureNames) {
    console.log("looking for pickable races")
  const pickableRaces = raceEntries; // start with parent races / races without subclasses
    // bunch of D&D-specific stuff, skip it
    return pickableRaces.sort((a, b) => a.name.localeCompare(b.name));

  const notParentEntries = raceEntries;
  const parentsToRemove = new Set(); // all classes with children are deleted at the end
  notParentEntries.forEach((e) => {
    if (validSubraceName(e.name, misleadingFeatureNames)) {
      const parent = pickableRaces.find(
        (p) => parentListedAsRequirement(e, p.name) && subraceNameIsPartOfRaceName(e.name, p.name),
      );
      if (parent) {
        // if parent found, add it to the set so main races with children are later removed from the list
        parentsToRemove.add(parent);
        pickableRaces.push(e);
      }
    }
  });
  parentsToRemove.forEach((p) => pickableRaces.splice(pickableRaces.indexOf(p), 1));

  return pickableRaces.sort((a, b) => a.name.localeCompare(b.name));
}

function getParentRace(selectedRace, raceEntries) {
    return raceEntries;
  if (selectedRace.data.requirements == '') return null;

  return raceEntries.find((e) => e.name === selectedRace.data.requirements);
}
