import { StepEnum } from '../step.js';
/*
import { ActorDataConstructorData } from '@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs/actorData';

 */
import HeroOption, { apply } from './character_option.js';

/**
 * Represents a manually inputed value by the player for the created actor.
 * Expected to be a String, but should be reasonably easy to use it for numbers or expand it for that use.
 * e.g. Hero name
 * @class
 */
export default class InputOption extends HeroOption {
  constructor(
    origin,
    key,
    placeholder,
    val,
    settings = { addValues: false, type: 'text' },
  ) {
      super();
    this.origin = origin;
    this.key = key;
    this.val = val;
    this.placeholder = placeholder;
    this.settings = settings;
  }

  $elem;

  render($parent, settings) {
    const $container = $('<div class="hct-option">');
    const min = this.settings.min ? `min="${this.settings.min}"` : '';
    const max = this.settings.max ? `max="${this.settings.max}"` : '';
    const wrapped = !!this.settings.postLabel;

    if (this.settings.preLabel) {
      const $preLabel = $(`<span class="hct-option-label">${this.settings.preLabel}</span>`);
      $container.append($preLabel);
    }

    const data = this.settings.data;
    if (wrapped) {
      const $wrapper = $(`<div class="hct-flex ${this.settings.class ?? ''}">`);
      this.$elem = $(`<input type="${this.settings.type}" placeholder="${this.placeholder}" ${data ?? ''} 
        value=${this.val} ${this.settings.type == 'number' ? `${min} ${max}` : ''}>`);
      $wrapper.append(this.$elem);

      if (this.settings.postLabel) {
        const $postLabel = $(`<p class='hct-postlabel'>${this.settings.postLabel}</p>`);
        $wrapper.append($postLabel);
      }
      $container.append($wrapper);
    } else {
      this.$elem = $(`<input class="${this.settings.class ?? ''}"
        type="${this.settings.type}" placeholder="${this.placeholder}"  ${data ?? ''}  
        value=${this.val} ${this.settings.type == 'number' ? `${min} ${max}` : ''}>`);
      $container.append(this.$elem);
    }

    if (settings?.beforeParent) {
      $parent.before($container);
    } else {
      $parent.append($container);
    }
  }

  value() {
    const val = this.$elem.val();
    if (this.settings.type == 'number') return val;
    return val;
  }

  isFulfilled() {
    return !!this.$elem.val();
  }

  applyToHero(actor) {
    apply(actor, this.key, this.value(), this.settings.addValues, this.settings.type === 'number');
  }
}