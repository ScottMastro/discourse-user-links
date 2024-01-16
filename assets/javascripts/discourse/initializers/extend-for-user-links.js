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

function createEbayPopup(ebay_url, event) {
  console.log(event)

  // Remove existing popup if any
  const existingPopup = document.getElementById('ebayPopup');
  if (existingPopup) {
    existingPopup.remove();
  }
  const buttonRect = event.target.getBoundingClientRect();
  
  // Create the popup div
  const popup = document.createElement('div');
  popup.style.left = `${buttonRect.left + window.scrollX}px`;
  popup.style.top = `${buttonRect.bottom + window.scrollY}px`;
  popup.id = 'ebayPopup';
  popup.style.position = 'absolute';

  // Add the disclaimer text
  const disclaimer = document.createElement('div');
  disclaimer.textContent = 'As an eBay Partner, this forum may be compensated if you make a purchase';
  popup.appendChild(disclaimer);

  const buttons = document.createElement('div');
  buttons.classList.add("ebay-buttons")

  // Add the eBay link button
  const ebayLinkButton = document.createElement('button');
  ebayLinkButton.textContent = 'Visit eBay Page';
  ebayLinkButton.classList.add("btn")
  ebayLinkButton.classList.add("btn-text")
  ebayLinkButton.classList.add("btn-primary")
  ebayLinkButton.onclick = () => window.open(ebay_url, '_blank');
  buttons.appendChild(ebayLinkButton);

  // Add a close button
  const closeButton = document.createElement('button');
  closeButton.textContent = 'Close';
  closeButton.classList.add("btn")
  closeButton.classList.add("btn-text")
  closeButton.classList.add("btn-danger")
  closeButton.onclick = () => popup.remove();
  buttons.appendChild(closeButton);

  popup.appendChild(buttons);

  // Append the popup to the body
  document.body.appendChild(popup);

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
    
      api.decorateWidget(`poster-name:after`, (dec) => {
        const attrs = dec.attrs;
    
        if (isEmpty(attrs.collection_thread) && isEmpty(attrs.wtb_thread) &&
            isEmpty(attrs.ebay_username) && isEmpty(attrs.instagram_username) &&
            isEmpty(attrs.youtube_username)) {
          return;
        }
    
        let buttons = []
        
        const collection_thread_match = getMatches(attrs.collection_thread, /\/t\/[^\/]*\/(\d+)[\/]?/g);
        if (collection_thread_match.length > 0){
          const collection_thread_id = collection_thread_match[0];
          let button = dec.h('a.icon', { href:"/t/"+collection_thread_id, target:"_blank", title: 'Collection' }, iconNode('hand-holding-heart'));
          buttons.push(button);
        }
        const wtb_thread_match = getMatches(attrs.wtb_thread, /\/t\/[^\/]*\/(\d+)[\/]?/g);
        if (wtb_thread_match.length > 0){
          const wtb_thread_id = wtb_thread_match[0];
          let button = dec.h('a.icon', { href:"/t/"+wtb_thread_id, target:"_blank", title: 'WTB' }, iconNode('comment-dollar'));
          buttons.push(button);
        }
        const instagram_match = getMatches(attrs.instagram_username, /([\d\._a-zA-Z]+)/g);
        if (instagram_match.length > 0){
          const instagram_name = instagram_match[0];
          let button = dec.h('a.icon', { href:"https://www.instagram.com/"+instagram_name, target:"_blank", title: 'Instagram' }, iconNode('fab-instagram'));
          buttons.push(button);
        }
        const youtube_match = getMatches(attrs.youtube_username, /([^@&'\(\)<>\s]+)/g);
        if (youtube_match.length > 0){
          const youtube_name = youtube_match[0];
          let button = dec.h('a.icon', { href:"https://www.youtube.com/@"+youtube_name, target:"_blank", title: 'YouTube' }, iconNode('fab-youtube'));
          buttons.push(button);
        }
        const ebay_match = getMatches(attrs.ebay_username, /([^@&'\(\)<>\s\\\/]+)/g);
        if (ebay_match.length > 0) {
          const ebay_name = ebay_match[0];
          const ebay_url = "https://www.ebay.com/usr/" + ebay_name + "?mkevt=1&mkcid=1&mkrid=711-53200-19255-0&campid=5338700715&toolid=1001";
                
          let button = dec.h('a.icon', { 
                href: "#ebay-disclaimer", 
                onclick: (e) => {
                  e.preventDefault();
                  console.log("here")
                  createEbayPopup(ebay_url, event);
                }, 
                title: 'eBay' 
              }, 
              iconNode('fab-ebay')
            );          
            
            buttons.push(button);
          }
            
          return [ dec.h("div.user-links", buttons) ];
      });

    });
  
    withPluginApi("0.8", (api) => addSetting(api, siteSettings));
  },
  
};
