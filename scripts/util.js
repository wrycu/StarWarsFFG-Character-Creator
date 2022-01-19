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