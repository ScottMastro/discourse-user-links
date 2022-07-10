import { withPluginApi } from "discourse/lib/plugin-api";
import { isEmpty } from "@ember/utils";
const { iconNode } = require("discourse-common/lib/icon-library");

function getMatches(string, regex, index) {
  if (isEmpty(string)){ return []; }
  index || (index = 1); // default to the first capturing group
  var matches = [];
  var match;
  while (match = regex.exec(string)) {
    matches.push(match[index]);
  }
  return matches;
}

function addSetting(api) {
  api.modifyClass("controller:preferences/profile", {
    pluginId: "discourse-user-links",

    actions: {
      save() {
        this.get("saveAttrNames").push("custom_fields");
        this._super();
      },
    },
  });
}

export default {
  name: "extend-for-user-links",
  initialize(container) {
    const siteSettings = container.lookup("site-settings:main");

    withPluginApi("0.1", (api) => {

      api.includePostAttributes("collection_thread");
      api.includePostAttributes("wtb_thread");
      api.includePostAttributes("ebay_username");
      api.includePostAttributes("instagram_username");
      api.includePostAttributes("youtube_username");
    
      const isMobileView = container.lookup("site:main").mobileView;
      const location = isMobileView ? "before" : "after";
      console.log(location)
      api.decorateWidget(`poster-name:after`, (dec) => {
        const attrs = dec.attrs;
    
        if (isEmpty(attrs.collection_thread) && isEmpty(attrs.wtb_thread) &&
            isEmpty(attrs.ebay_username) && isEmpty(attrs.instagram_username) &&
            isEmpty(attrs.youtube_username)) {
          return;
        }
    
        var buttons = []
        
        var collection_thread_match = getMatches(attrs.collection_thread, /\/t\/[^\/]*\/(\d+)[\/]?/g);
        if (collection_thread_match.length > 0){
          var collection_thread_id = collection_thread_match[0];
          var button = dec.h('a.icon', { href:"/t/"+collection_thread_id, title: 'Collection' }, iconNode('hand-holding-heart'));
          buttons.push(button);
        }
        var wtb_thread_match = getMatches(attrs.wtb_thread, /\/t\/[^\/]*\/(\d+)[\/]?/g);
        if (wtb_thread_match.length > 0){
          var wtb_thread_id = wtb_thread_match[0];
          var button = dec.h('a.icon', { href:"/t/"+wtb_thread_id, title: 'WTB' }, iconNode('comment-dollar'));
          buttons.push(button);
        }
        var instagram_match = getMatches(attrs.instagram_username, /([\d\._a-zA-Z]+)/g);
        if (instagram_match.length > 0){
          var instagram_name = instagram_match[0];
          var button = dec.h('a.icon', { href:"https://www.instagram.com/"+instagram_name, title: 'Instagram' }, iconNode('fab-instagram'));
          buttons.push(button);
        }
        var youtube_match = getMatches(attrs.youtube_username, /([^@&'\(\)<>\s\\\/]+)/g);
        if (youtube_match.length > 0){
          var youtube_name = youtube_match[0];
          var button = dec.h('a.icon', { href:"https://www.youtube.com/channel/"+youtube_name, title: 'YouTube' }, iconNode('fab-youtube'));
          buttons.push(button);
        }
        var ebay_match = getMatches(attrs.ebay_username, /([^@&'\(\)<>\s\\\/]+)/g);
        if (ebay_match.length > 0){
          var ebay_name = ebay_match[0];
          var button = dec.h('a.icon', { href:"https://www.ebay.com/usr/"+ebay_name, title: 'Ebay' }, iconNode('fab-ebay'));
          buttons.push(button);
        }
    
          return [ dec.h("div.user-links", buttons) ];
      });

    });
  
    withPluginApi("0.1", (api) => addSetting(api, siteSettings));
  },
};
