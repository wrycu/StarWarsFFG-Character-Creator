/*
  Functions used exclusively on the Background tab
*/
/*
import * as Utils from '../utils';
import * as Constants from '../constants';
import * as ProficiencyUtils from '../proficiencyUtils';

 */
import { Step, StepEnum } from '../step.js';
/*
import SelectableOption from '../options/SelectableOption';
import SelectOrCustomItemOption from '../options/SelectOrCustomItemOption';
import { BackgroundFeatureEntry, getBackgroundFeatureEntries, getRuleJournalEntryByName } from '../indexUtils';

 */

class _BackgroundTab extends Step {
  constructor() {
    super(StepEnum.Background);
  }

  section = () => $('#backgroundDiv');

  backgroundFeatures;

  async setSourceData() {
    this.backgroundFeatures = await getBackgroundFeatureEntries();
  }

  async renderData() {
    Utils.setPanelScrolls(this.section());
    // Show rules on the side panel
    const rulesCompendiumName = game.i18n.localize('HCT.Background.RulesJournalName');
    const backgroundRules = await getRuleJournalEntryByName(rulesCompendiumName);
    if (backgroundRules) {
      $('[data-hct_background_description]', this.section()).html(TextEditor.enrichHTML(backgroundRules.content));
    } else {
      console.error(`Unable to find backgrounds' rule journal on compendium ${rulesCompendiumName}`);
    }

    this.setBackgroundNameUi();
    this.setAlignmentUi();
    this.setProficienciesUi();
    this.setBackgroundFeatureUi();
  }

  async setProficienciesUi() {
    const $proficienciesArea = $('[data-hct_area=proficiences]', this.section());
    const options = [];
    options.push(
      ProficiencyUtils.prepareSkillOptions({
        step: this.step,
        $parent: $proficienciesArea,
        pushTo: this.stepOptions,
        quantity: 2,
        addValues: true,
        expandable: true,
        customizable: false,
      }),
    );
    options.push(
      await ProficiencyUtils.prepareToolOptions({
        step: this.step,
        $parent: $proficienciesArea,
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
        $parent: $proficienciesArea,
        pushTo: this.stepOptions,
        quantity: 0,
        addValues: true,
        expandable: true,
        customizable: true,
      }),
    );

    options.forEach((o) => o.render($proficienciesArea));
    this.stepOptions.push(...options);
  }

  setBackgroundFeatureUi() {
    const $featureArea = $('[data-hct_area=feature]', this.section());
    const customFeatureOption = new SelectOrCustomItemOption(
      this.step,
      { type: 'feat', source: 'Background' },
      () => {
        // properties callback
        const $name = $('input', $('[data-hct_area=name]', this.section()));
        return { requirements: $name.val() };
      },
      this.backgroundFeatures,
      {
        addValues: true,
        allowNulls: true,
      },
    );
    customFeatureOption.render($featureArea);
    this.stepOptions.push(customFeatureOption);
  }

  setAlignmentUi() {
    const foundryAligments = (game).dnd5e.config.alignments;
    const alignmentChoices = Object.keys(foundryAligments).map((k) => ({
      key: foundryAligments[k],
      value: foundryAligments[k],
    }));
    const alignmentOption = new SelectableOption(this.step, 'data.details.alignment', alignmentChoices, '', {
      addValues: false,
      customizable: false,
    });
    alignmentOption.render($('[data-hct_area=alignment]', this.section()));
    this.stepOptions.push(alignmentOption);
  }

  setBackgroundNameUi() {
    const nameChoices = this.backgroundFeatures
      .filter((f) => f.data.requirements)
      .map((f) => ({ key: f.data.requirements, value: f.data.requirements }));
    const nameOption = new SelectableOption(
      StepEnum.Background,
      'data.details.background',
      nameChoices,
      '',
      { addValues: false, customizable: true },
      this.onBackgroundSelect,
      new Map(this.backgroundFeatures.map((obj) => [(obj.data).requirements, obj.name])),
    );
    nameOption.render($('[data-hct_area=name]', this.section()));
    this.stepOptions.push(nameOption);
  }

  onBackgroundSelect(backgroundFeatureName) {
    const $featureArea = $('[data-hct_area=feature]', $('#backgroundDiv'));
    const $select = $('select', $featureArea);
    const $img = $('img', $featureArea);
    const $name = $('input', $featureArea);
    const $desc = $('textarea', $featureArea);
    let isCustomTouched = false;
    if ($name.val() != '' || $desc.val() != '') isCustomTouched = true;

    if (!isCustomTouched) {
      if (backgroundFeatureName === 'custom') {
        $('option:selected', $select).prop('selected', false);
        $("option[value='']", $select).prop('selected', 'true');
        $img.attr('src', Constants.MYSTERY_MAN);
        return;
      }
      const value = $('option', $select)
        .filter(function () {
          return $(this).text() === backgroundFeatureName;
        })
        .first()
        .attr('value');
      if (value) {
        $select.val(value);
        $select.trigger('change');
      }
    }
  }
}
const BackgroundTab = new _BackgroundTab();
export default BackgroundTab;