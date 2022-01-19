import BasicsTab from "./tabs/basics.js";
import BackgroundTab from "./tabs/background.js";
import { preloadTemplates } from './util.js';

// Initialize module
Hooks.once('init', async () => {
  //registerSettings();
  await preloadTemplates();
});

var StepIndex =
[
    'Basics',
    'Background',
    /*
    'Morality',
    'Species',
    'Career',
    'Specialization',
    'XP',
    'Motivation',
    'Gear',
    'Appearance',
     */
];

export default class CharacterCreationTool extends Application {
  constructor() {
    super();
    this.actor = undefined;
    this.steps = [BasicsTab, BackgroundTab];
  }

  static get defaultOptions() {
    const options = super.defaultOptions;
    options.template = 'modules/ffg-star-wars-char-creator/templates/app.html';
    options.width = 720;
    options.height = 680;
    options.resizable = true;
    return options;
  }

  async openForNewActor(actor_name) {
    this.actor = undefined;
    this.actorName = actor_name;
    this.options.title = "title goes here";
    this.steps.forEach((step) => step.clearOptions());
    this.currentTab = -1;
    this.render(true);
  }

  // for level up
  // async openForActor(actor: Actor) {
  //   this.actor = actor;
  //   this.options.title = game.i18n.localize('HCT.CreationWindowTitle');
  //   console.log(`${CONSTANTS.LOG_PREFIX} | Opening for ${actor.name} (id ${actor.id})`);
  //   this.steps.forEach(step => step.clearOptions());
  //   this.currentTab = -1;
  //   this.render(true);
  // }

  activateListeners() {

    // listeners specific for each tab
    for (const step of this.steps) {
      step.setListeners();
    }

    // set listeners for tab navigation
    $('[data-ffgcc_tab_index]').on('click', (event) => {
      this.currentTab = $(event.target).data('ffgcc_tab_index');
      this.openTab(this.currentTab);
    });
    $('[data-ffgcc_back]').on('click', () => {
      this.currentTab--;
      this.openTab(this.currentTab);
    });
    $('[data-ffgcc_next]').on('click', () => {
      this.currentTab++;
      this.openTab(this.currentTab);
    });
    $('[data-ffgcc_submit]').on('click', () => this.confirmSubmittion());

    this.openTab(-1);
  }

  async setupData() {
    console.log(`Setting up data-derived elements`);
    for (const step of this.steps) {
      await step.setSourceData();
    }
  }

  renderChildrenData() {
    for (const step of this.steps) {
      step.renderData({ actorName: this.actorName });
    }
  }

  async confirmSubmittion() {
    new Dialog({
      title: "title go here",
      content: "content go here",
      buttons: {
        yes: {
          icon: "<i class='fas fa-check'></i>",
          label: "yes",
          callback: () => {
            this.buildActor();
          },
        },
        no: {
          icon: "<i class='fas fa-times'></i>",
          label: "no",
        },
      },
      default: 'yes',
    }).render(true);
  }

  async buildActor() {
    console.log(`Building actor - data used:`);
    const newActorData = this.initializeActorData();
    let errors = false;
    // yeah, a loop label, sue me.
    mainloop: for (const step of this.steps) {
      for (const opt of step.getOptions()) {
        if (this.requiredOptionNotFulfilled(opt)) {
          errors = true;
          break mainloop;
        }
        await opt.applyToHero(newActorData);
      }
    }
    if (!errors) {
      // calculate whatever needs inter-tab values like HP
      cleanUpErroneousItems(newActorData);
      await calculateStartingHp(newActorData, this.steps[StepIndex.Class].getUpdateData());
      setTokenSettings(newActorData);
      const itemsFromActor = newActorData.items; // moving item index entries to a different variable
      newActorData.items = [];
      const cls = getDocumentClass('Actor');
      const actor = new cls(newActorData);

      const newActor = await Actor.create(actor.toObject());
      if (!newActor) {
        ui.notifications?.error(game.i18n.format('HCT.Error.ActorCreationError', { name: newActorData?.name }));
        return;
      }
      const itemsFromCompendia = await hydrateItems(itemsFromActor); // hydrating index entries for the actual items
      setClassLevel(itemsFromCompendia, this.steps[StepIndex.Class].getUpdateData());
      await newActor.createEmbeddedDocuments('Item', itemsFromCompendia); // adding items after actor creation to process active effects
      this.close();
    }
  }

  initializeActorData() {
      /*
    const newActor: ActorDataConstructorData & { items: IndexEntry[] } = {
      name: '',
      type: 'character',
      sort: 12000,
      img: CONSTANTS.MYSTERY_MAN,
      token: {
        actorLink: true,
        disposition: 1,
        img: CONSTANTS.MYSTERY_MAN,
        vision: true,
        dimSight: 0,
        bar1: { attribute: 'attributes.hp' },
        displayBars: 0,
        displayName: 0,
      },
      items: [],
    };
    return newActor;
    */
      // todo: create an actor here
      return {};
  }

  requiredOptionNotFulfilled(opt) {
    const key = opt.key;
    if (key === 'name' && !opt.isFulfilled()) {
      const errorMessage = game.i18n.format('HCT.Error.RequiredOptionNotFulfilled', { opt: opt.key });
      ui.notifications?.error(errorMessage);
      return true;
    }
    return false;
  }

  openTab(index) {
    handleNavs(index);
    $('.tab-body').hide();
    $('.tablinks').removeClass('active');
    $(`[data-ffgcc_tab_index=${index}]`).addClass('active');
    $(`[data-ffgcc_tab_section=${index}]`).show();
    switch (index) {
      case StepIndex.Spells:
        this.steps[StepIndex.Spells].update({ class: this.steps[StepIndex.Class].getUpdateData() });
        break;
      case StepIndex.Abilities:
        this.steps[StepIndex.Abilities].update();
        break;
    }
  }
}

async function calculateStartingHp(newActor, classUpdateData) {
  const totalCon = getProperty(newActor, 'data.abilities.con.value');
  const conModifier = totalCon ? Utils.getAbilityModifierValue(totalCon) : 0;
  if (!classUpdateData) return 10 + conModifier; // release valve in case there's no class selected

  const hitDie = classUpdateData?.hitDie;
  const startingLevel = classUpdateData?.level;
  const method = classUpdateData?.hpMethod;

  const startingHp = await hitDie.calculateHpAtLevel(startingLevel, method, conModifier);
  setProperty(newActor, 'data.attributes.hp.max', startingHp);
  setProperty(newActor, 'data.attributes.hp.value', startingHp);
}

function setTokenSettings(newActor) {
  const displayBarsSetting = game.settings.get(CONSTANTS.MODULE_NAME, SettingKeys.TOKEN_BAR);
  setProperty(newActor, 'token.displayBars', displayBarsSetting);

  const displayNameSetting = game.settings.get(CONSTANTS.MODULE_NAME, SettingKeys.TOKEN_NAME);
  setProperty(newActor, 'token.displayName', displayNameSetting);

  const dimSight = (newActor?.data)?.attributes?.senses.darkvision ?? 0;
  setProperty(newActor, 'token.dimSight', dimSight);
}

function cleanUpErroneousItems(newActor) {
  let items = getProperty(newActor, 'items');
  items = items?.filter(Boolean); // filter undefined items
  if (items) setProperty(newActor, 'items', items);
  else delete newActor.items;
}

function handleNavs(index) {
  // hides the tabs if switching to startDiv, else show them.
  $('.ffgcc-container .tabs').toggle(index !== -1);

  // disables back/next buttons where appropriate
  const $footer = $('.ffgcc-container footer');
  $('[data-ffgcc_back]', $footer).prop('disabled', index < 0 );
  $('[data-ffgcc_next]', $footer).prop('disabled', index >= StepIndex.length);
}

function setClassLevel(itemsFromCompendia, classData) {
  const classItem = itemsFromCompendia.find((i) => i.type === 'class');
  if (classItem) {
    (classItem).data.levels = classData.level;
  }
}