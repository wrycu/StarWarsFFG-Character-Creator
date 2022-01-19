export class Step {
  constructor(step) {
    this.step = step;
    this.stepOptions = [];
  }

  /**
   * Delegation method for this tab to set its own listeners when Application.activateListeners()
   * is called. Here all HTML event listeners should be registered.
   */
  setListeners() {
    return;
  }

  /**
   * Method called by the Application for each tab to provide any specific
   * data this tab might need. Called during the **first** 'renderApp' Hook.
   *
   * Might not be needed for every tab.
   */
  setSourceData() {
    return;
  }

  /**
   * Method called by the Application for each tab to render their internal HTML.
   * Called at the end of every 'renderApp' Hook.
   */
  renderData(data) {
    return;
  }

  /**
   * Method called by the Application when on final submit,
   * for every tab to return their options.
   *
   * Some options might be defined before, this method been the last chance to created
   * HeroOptions derived from data, for example on the Abilities tab.
   *
   * By default returns stepOptions, but should be overloaded as needed.
   */
  getOptions() {
    return this.stepOptions;
  }

  /**
   * Method called when another tab needs data from this one, to abstract the internal complexities
   */
  getUpdateData() {
    throw Error('getUpdateData() not implemented in step ' + this.constructor.name);
  }

  /**
   * Method called when switching to this tab, useful when trying to update this tab's content based on external data
   * e.g. Updating Spells' spellcasting ability based on Class
   */
  update(data) {
    throw Error('update() not implemented in step ' + this.constructor.name);
  }

  clearOptions() {
    this.stepOptions.splice(0, this.stepOptions.length);
  }

  /**
   * Helper method that returns the JQuery element representing this tab's entire section.
   */
  section() {}
}

export var StepEnum = {
  Basics: 'basics',
  Abilities : 'abilities',
  Background : 'background',
}
