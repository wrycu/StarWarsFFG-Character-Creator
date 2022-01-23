import * as Constants from './constants.js';

export function log_msg(feature, message) {
    if (game.settings.get('starwarsffg', 'enableDebug')) {
        console.log('ffg-star-wars-char-creator | ' + feature + ' | ' + message);
    }
}

export function addActorDirectoryButton(app) {
    console.log(`Adding actors directory button`);

    $('.directory-header', $('[data-tab="actors"]'))
        .filter((i, e) => !$(e).has('.header-hct-button').length)
        .prepend(
            `<button class='header-hct-button' data-hct_start><i class='fas fa-dice-d20'></i>CREATE</button>`,
        );
    $('[data-hct_start]').on('click', function () {
        if (userHasRightPermissions()) app.openForNewActor();
    });
}

function userHasRightPermissions() {
    const userRole = (game).user.role;

    // create actor (REQUIRED)
    if (!((game).permissions.ACTOR_CREATE).includes(userRole)) {
        ui.notifications?.error(game.i18n.localize('HCT.Permissions.NeedCreateActorError'));
        return false;
    }

    // create item (optional)
    if (!((game).permissions.ITEM_CREATE).includes(userRole)) {
        ui.notifications?.warn(game.i18n.localize('HCT.Permissions.NeedCreateItemWarn'));
    }

    // upload files (optional)
    if (!((game).permissions.FILES_UPLOAD).includes(userRole)) {
        ui.notifications?.warn(game.i18n.localize('HCT.Permissions.NeedFileUploadWarn'));
    }

    // browse files (optional)
    if (!((game).permissions.FILES_BROWSE).includes(userRole)) {
        ui.notifications?.warn(game.i18n.localize('HCT.Permissions.NeedFileBrowseWarn'));
    }
    return true;
}

export async function preloadTemplates() {
    console.log(`Loading templates`);

    const templatePaths = [
        Constants.MODULE_PATH + '/templates/nav-tabs.html',
        Constants.MODULE_PATH + '/templates/nav-buttons.html',
        Constants.MODULE_PATH + '/templates/tabs/background.html',
        Constants.MODULE_PATH + '/templates/tabs/basics.html',
        Constants.MODULE_PATH + '/templates/tabs/start.html',
    ];

    return loadTemplates(templatePaths);
}

async function getIndexEntriesForSource(source) {
    const sources = {
        'background': ['world.oggdudebackgrounds'],
    };

    const indexEntries = [];
    for (const packName of sources[source]) {
        const pack = game.packs.get(packName);
        if (!pack) ui.notifications.warn(`No pack for name [${packName}]!`);
        const itemPack = pack;
        if ((itemPack).indexed) {
            const packIndexEntries = [...(await itemPack.index)];
            indexEntries.push(...packIndexEntries.map((e) => ({...e, _pack: packName})));
        } else {
            console.error(`Index not built for pack [${packName}] - skipping it`);
        }
    }
    return indexEntries;
}

export async function get_background_entries() {
    const backgroundEntries = await ((getIndexEntriesForSource('background')));
    console.log("backgrounds")
    console.log(backgroundEntries)
    // sanitize entries to remove anything nonconforming to a Feature (for now, until Race becomes a type)
    return backgroundEntries;
}

export async function buildSourceIndexes() {
    console.log(`Indexing source compendiums`);
    const sourcePacks = {
        'background': ['world.oggdudebackgrounds'],
    };
  const itemsPromises = [];
  game.packs.filter((p) => p.documentName != 'REMOVE_ME').forEach((p) => {
      const name = p.collection;
      const fieldsToIndex = new Set();

      // name added by default on all when indexed
      addBackgroundFields(fieldsToIndex, sourcePacks, name);
      //addRacialFeaturesFields(fieldsToIndex, sourcePacks, name);
      //addClassFields(fieldsToIndex, sourcePacks, name);
      //addClassFeaturesFields(fieldsToIndex, sourcePacks, name);
      //addSpellFields(fieldsToIndex, sourcePacks, name);
      //addFeatFields(fieldsToIndex, sourcePacks, name);
      //addBackgroundFeaturesFields(fieldsToIndex, sourcePacks, name);

      if (fieldsToIndex.size) {
        fieldsToIndex.add('img');
        fieldsToIndex.add('content');
        itemsPromises.push((p).getIndex({ fields: [...fieldsToIndex] }));
      }
    });
  await Promise.all(itemsPromises);
}

function addBackgroundFields(fieldsToIndex, source, packName) {
  if (source['background'].includes(packName)) {
    fieldsToIndex.add('data.requirements'); // for figuring subraces
    fieldsToIndex.add('data.content'); // for sidebar
  }
}

export function setPanelScrolls($section) {
  const individualScrolls = [];
  const scroll = 'hct-overflow-y-scroll';
  const height = 'hct-h-full';

  const $leftPanel = $('.hct-panel-left', $section);
  const $rightPanel = $('.hct-panel-right', $section);
  const $panelContainer = $('.hct-panel-container', $section);

  if (individualScrolls) {
    $leftPanel.addClass(scroll);
    $rightPanel.addClass(scroll);
    $panelContainer.addClass(height);
    $section.removeClass(scroll);
  } else {
    $leftPanel.removeClass(scroll);
    $rightPanel.removeClass(scroll);
    $panelContainer.removeClass(height);
    $section.addClass(scroll);
  }
}
