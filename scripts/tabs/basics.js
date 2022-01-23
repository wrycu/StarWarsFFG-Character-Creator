/*
  Functions used exclusively on the Basics tab
*/

import { Step, StepEnum } from '../step.js';
import InputOption from "../options/input_option.js";
import * as Constants from '../constants.js';
/*
import InputOption from '../options/InputOption';
import SettingKeys from '../settings.js';
 */


const ImgType = {
  AVATAR : 'avatar',
  TOKEN : 'token',
}

class _Basics extends Step {
  constructor() {
    super(StepEnum.Basics);
  }

  section = () => $('#basicsDiv');

  avatarOption;
  tokenOption;
  nameOption;

  useTokenizer;

  fileChangedCallback(type, path) {
      console.log(type)
      console.log(path)
    const $img = $(`[data-img=${type}]`);
    if (type === 'avatar') {
        $('#data-hero_avatar').val(path);
    } else {
        $('#data-hero_token').val(path);
    }
    $img.attr('src', path);
  }

  setListeners() {
    $('[data-filepick]', this.section()).on('click', (event) => {
      const pick = $(event.target).data('filepick');

      if (this.useTokenizer && !event.shiftKey) {
        const module = game.modules.get('vtta-tokenizer');

        if (!module) {
          ui.notifications?.warn(game.i18n.localize('HCT.Integration.Tokenizer.Error.ModuleNotFound'));
          this.openFilePicker(pick);
          return;
        }
        if (!module.active) {
          ui.notifications?.warn(game.i18n.localize('HCT.Integration.Tokenizer.Error.ModuleInactive'));
          this.openFilePicker(pick);
          return;
        }
        const tokenizerVersion = module?.data.version;
        if (!tokenizerVersion) {
          ui.notifications?.error(game.i18n.localize('HCT.Integration.Tokenizer.Error.VersionUnobtainable'));
          this.openFilePicker(pick);
          return;
        }
        const lastUnsupportedVersion = Constants.INTEGRATION.TOKENIZER.VERSION;
        // search for newer than last unsupported version
        if (!isNewerVersion(tokenizerVersion, lastUnsupportedVersion)) {
          ui.notifications?.error(
            game.i18n.format('HCT.Integration.Tokenizer.Error.VersionIncompatible', {
              version: lastUnsupportedVersion,
            }),
          );
          this.openFilePicker(pick);
          return;
        }
        if (!this.nameOption.value()) {
          ui.notifications?.error(game.i18n.localize('HCT.Integration.Tokenizer.NeedActorName'));
          return;
        }
        const tokenizerOptions = {
          name: this.nameOption.value(),
          type: 'pc',
          avatarFilename: this.avatarOption.value(),
          tokenFilename: this.tokenOption.value(),
        };
        (window).Tokenizer.launch(tokenizerOptions, (response) => {
          this.fileChangedCallback(ImgType.AVATAR, response.avatarFilename);
          this.fileChangedCallback(ImgType.TOKEN, response.tokenFilename);
        });
        return;
      }
      this.openFilePicker(pick);
    });
  }

  setSourceData() {
    this.useTokenizer = false;
  }

  renderData(data) {
    this.clearOptions();
    this.nameOption = new InputOption(
      this.step,
      'name',
      game.i18n.localize('ffg-cc.basics.name'),
      data?.actorName ?? '',
    );
    this.nameOption.render($('[data-hero_name]', this.section()));

    this.avatarOption = new InputOption(this.step, 'img', Constants.MYSTERY_MAN, Constants.MYSTERY_MAN);
    this.avatarOption.render($('[data-hero_avatar]', this.section()));

    this.tokenOption = new InputOption(this.step, 'token.img', Constants.MYSTERY_MAN, Constants.MYSTERY_MAN);
    this.tokenOption.render($('[data-hero_token]', this.section()));

    this.stepOptions.push(this.nameOption, this.avatarOption, this.tokenOption);

    $('[data-tokenizer-warning]').toggle(this.useTokenizer);
  }

  openFilePicker(input) {
    const path1 = '/';
    const type = input === 'avatar' ? ImgType.AVATAR : ImgType.TOKEN;
    const fp2 = new FilePicker({
      type: 'image',
      current: path1,
      callback: (path) => this.fileChangedCallback(type, path),
    });
    fp2.browse();
  }
}
const BasicsTab = new _Basics();
export default BasicsTab;
