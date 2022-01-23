import { init as settings_init } from './scripts/settings.js'
import {log_msg as log, addActorDirectoryButton, preloadTemplates, buildSourceIndexes} from './scripts/util.js'
import CharacterCreationTool from './scripts/app.js'

const heroCreationTool = new CharacterCreationTool();

// Initialize module
Hooks.once('init', async () => {
    //registerSettings();
    await preloadTemplates();
});

Hooks.on('renderCharacterCreationTool', async function (app, html, data) {
    await buildSourceIndexes();
    await heroCreationTool.setupData();
    heroCreationTool.renderChildrenData();
});

Hooks.once('init', async function() {
    log('base_module', 'Initializing');

    settings_init();

    log('base_module', 'registering helpers');
    Handlebars.registerHelper("iff", function (a, operator, b, opts) {
        var bool = false;
        switch (operator) {
            case "==":
                bool = a == b;
                break;
            case ">":
                bool = a > b;
                break;
            case "<":
                bool = a < b;
                break;
            case "!=":
                bool = a != b;
                break;
            case "in":
                bool = b.indexOf(a) > 0;
                break;
            case "not in":
                bool = b.indexOf(a) < 0;
                break;
            case "contains":
                if (a && b) {
                    bool = a.includes(b);
                } else {
                    bool = false;
                }
                break;
            default:
                throw "Unknown operator " + operator;
        }

        if (bool) {
            return opts.fn(this);
        } else {
            return opts.inverse(this);
        }
    });
    Handlebars.registerHelper("times", function (times, opts) {
        var out = "";
        var i;
        var data = {};

        if ( times ) {
            for ( i = 0; i < times; i += 1 ) {
                data.index = i;
                out += opts.fn(this, {
                    data: data
                });
            }
        } else {

            out = opts.inverse(this);
        }

        return out;
    });

    log('base_module', 'Done registering helpers');
    log('base_module', 'Initializing finished');
});

Hooks.once('ready', () => {
    /* register functionality here */
});

// Rendering the button on Actor's directory
Hooks.on('renderActorDirectory', () => {
    addActorDirectoryButton(heroCreationTool);
});

function register_hooks() {
    libWrapper.register(
        'ffg-star-wars-char-creator',
        'game.ffg.RollFFG.prototype.toMessage',
        function (wrapped, ...args) {
            /*
                we may want to monkeypatch a different function in the future. this location doesn't seem to have access
                to the actual weapon in use. I'm not sure if we actually care yet, but worth considering.
             */
            return wrapped(...data);
        }
    );
}