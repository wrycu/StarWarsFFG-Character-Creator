/*
import { StepEnum } from '../Step';
import { ActorDataConstructorData } from '@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs/actorData';
import HeroOption, { apply } from './HeroOption';
 */
import HeroOption, { apply } from './character_option.js';

/**
 * Represents a value needs to be selected by the player with a single output onto the created actor.
 * (e.g. Dwarven's Tool Proficiency is a single option between three defined ones)
 * @class
 */
export default class SelectableOption extends HeroOption {
    settings = { addValues: true, customizable: true };
    constructor(
        origin,
        key,
        options,
        label,
        changeCallback,
        callbackMapping,
    ) {
        super();
        this.origin = origin;
        this.key = key;
        this.options = options;
        this.label = label;
        this.$elem = $(`<select class="hct-grow">`);
        this.change_callback = changeCallback;
        if (!settings.default) {
            this.$elem.append(
                $(`<option value="" selected disabled hidden>
                ${game.i18n.localize('HCT.Common.SelectPlaceholder')}</option>`),
            );
        }

        if (this.settings.customizable) {
            this.$elem.on('change', () => {
                const val = this.$elem.val();
                if (this.change_callback) this.change_callback(val);
            });
        }

        console.log("yes hello")
        console.log(options[0])

        this.$elem.append(
            this.options.map(
                (option) => $(`<option value="${option.value}" ${option.default ? 'selected' : ''}>${game.i18n.localize(option.value,)}</option>`,),
            ),
        );
    }

    isCustom = false;

    $customValue;

    isFulfilled() {
        return !!this.value();
    }

    applyToHero(actor) {
        apply(actor, this.key, this.value(), this.settings.addValues);
    }

    $elem;

    /**
    * Builds the HTML element for this option and appends it to the parent
    * @param {JQuery} $parent
    */
    render($parent, options) {
        const $block = $('<div class="hct-option hct-grow">');
        if (this.label) {
            $block.append($('<span class="hct-pr-sm">').text(this.label));
        }
        $block.append(this.$elem);
        const $container = $('<div>');
        if (this.settings.customizable) {
            $container.append($block);
            $container.append($('<div class="hct-option">').append(this.$customValue));
        }

        $parent.append(this.settings.customizable ? $container : $block);
    }

    /**
    * @returns the current value of this option
    */
    value() {
        if (this.settings.customizable && this.$customValue.val()) {
            return this.$customValue.val();
        }
        return this.$elem.val();
    }
}