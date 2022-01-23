import { StepEnum } from '../step.js';
/*
import { ActorDataConstructorData } from '@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs/actorData';
import { IndexEntry } from '../indexUtils';
 */
import * as Constants from '../constants.js';
import HeroOption, { apply } from './character_option.js';


/**
 * Represents a value needs to be selected by the player with a single output onto the created actor.
 * (e.g. Dwarven's Tool Proficiency is a single option between three defined ones)
 * @class
 */
export default class SearchableIndexEntryOption extends HeroOption {
  settings = { addValues: true, customizable: false };

  constructor(
    origin,
    key,
    options,
    selectCallback,
    placeholder,
  ) {
            super();
    this.searchArray = [];
    this.origin = origin;
    this.key = key;
    this.options = options;
    this.selectCallback = selectCallback;
    this.placeholder = placeholder;
  }

  isFulfilled() {
    return !!this.value();
  }

  applyToHero(actor) {
    apply(actor, this.key, [this.value()], this.settings.addValues);
  }

  $input;
  $resultBox;
  searchArray;
  selected;

  render($parent, options) {
      console.log("rendering with options")
      console.log(options)
      this.options = options
    const $form = $(`<form data-hct-searchbar autocomplete="off">`);
    const $searchWrapper = $(`<div class="hct-search-wrapper">`);
    this.$input = $(
      `<input type="text" placeholder="${this.placeholder ?? game.i18n.localize('HCT.Common.Searchbar.Placeholder')}">`,
    );
    this.$input.on('click', (e) => {
      if (this.$input.val() == '') {
        this.searchArray = this.options;
      }
      this.$input.trigger('select');
      $searchWrapper.addClass('active');
      this.showSuggestions(this.searchArray);
      this.setSuggestionsInteraction($searchWrapper);
    });
    this.$input.on('keyup', (e) => {
      const userInput = (e.target).value;
      console.log("got input")
        console.log(userInput)
      if (userInput) {
        this.searchArray = this.options.filter((value) => {
          return (value.name)
            .toLocaleLowerCase()
            .replaceAll(/\s/g, '')
            .includes(userInput.toLocaleLowerCase().replaceAll(/\s/g, ''));
        });
        $searchWrapper.addClass('active');
        this.showSuggestions(this.searchArray);
        this.setSuggestionsInteraction($searchWrapper);
      } else {
        $searchWrapper.removeClass('active');
      }
    });
    $searchWrapper.append(this.$input);

    this.$resultBox = $(`<div class="hct-search-autocom-box" data-hct-searchbar-results>`);
    $searchWrapper.append(this.$resultBox);

    $form.append($searchWrapper);
    $form.on('submit', (e) => false);
    if (options?.prepend) {
      $parent.prepend($form);
    } else {
      $parent.append($form);
    }
  }

  setSuggestionsInteraction($searchWrapper) {
    $('div', this.$resultBox).on('click', (event) => {
        console.log("detected item selection")
      const id = $(event.currentTarget).data('key');
        console.log(id)
      $searchWrapper.removeClass('active');
      this.$input.val(this.options.find((o) => o._id == id)?.name ?? id);
      if (this.selectCallback) this.selectCallback(id);
      this.selected = this.options.find((o) => o._id === id || o.name === id); // Results use id, Items use name
    });
  }

  value() {
    return this.selected;
  }

  showSuggestions(searchArray) {
      console.log("suggestions")
      console.log(searchArray)
    let listData;
    if (!searchArray.length) {
      listData = `<li>${'No matches'}</li>`;
    } else {
      listData = searchArray
        .map(
          (result) =>
            `<li>
              <div class="hct-icon-with-context" data-key=\"${result._id ?? result.name}\">
                <img class="hct-icon-square-med hct-bg-black hct-border-0" src="${result.img ?? Constants.MYSTERY_MAN}">
                <span>${result.name}</span>
              </div>
            </li>`,
        )
        .join('');
    }
    this.$resultBox.html(listData);
  }
}
