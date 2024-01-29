import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { isEmpty } from "@ember/utils";
import { withPluginApi } from "discourse/lib/plugin-api";

function getMatches(string, regex, index) {
  if (isEmpty(string)){ return []; }
  index || (index = 1);
  var matches = [];
  var match;
  while (match = regex.exec(string)) {
    matches.push(match[index]);
  }
  return matches;
}

function getTopicIdFromString(string) {
  const match = getMatches(string, /\/t\/[^\/]*\/(\d+)[\/]?/g);
  if (match.length > 0){
    return match[0];
  }
    return string;
}


export default class UserLinkSettings extends Component {
  @tracked modifiedUsername = '';
  @tracked model = null;
  @tracked siteSettings = null;

  @tracked collectionId = null;
  @tracked wtbId = null;


  constructor() {
    super(...arguments);
    this.model = this.args.model;
    this.siteSettings = this.args.siteSettings;

    this.collectionId = getTopicIdFromString(this.model.custom_fields.collection_thread);
    this.wtbId = getTopicIdFromString(this.model.custom_fields.wtb_thread);

  }

  @action
  getCollectionTopicId(event) {
    let string = event.target.value;
    this.collectionId = getTopicIdFromString(string);
  }

  @action
  getWtbTopicId(event) {
    let string = event.target.value;
    this.wtbId = getTopicIdFromString(string);
  }
}
