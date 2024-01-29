import { withPluginApi } from "discourse/lib/plugin-api";
import { isEmpty } from "@ember/utils";
const { iconNode } = require("discourse-common/lib/icon-library");

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

function createEbayPopup(ebay_url, event) {

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
  ebayLinkButton.onclick = () => {
    window.open(ebay_url, '_blank');
    popup.remove();
  }
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

  function handleClickOutside(event) {
    if (popup && !popup.contains(event.target)) {
      popup.remove();
      document.removeEventListener('click', handleClickOutside);
    }
  }

  setTimeout(() => {
    document.addEventListener('click', handleClickOutside, true);
  }, 0);
}

function decorate_post_with_links(api, siteSettings) {
  api.includePostAttributes("collection_thread");
  api.includePostAttributes("wtb_thread");
  api.includePostAttributes("ebay_username");
  api.includePostAttributes("instagram_username");
  api.includePostAttributes("x_username");
  api.includePostAttributes("youtube_username");

  api.decorateWidget(`poster-name:after`, (dec) => {
    const attrs = dec.attrs;

    let buttons = []

    function make_button(url, title, icon){
      return dec.h('a.icon', { href:url, target:"_blank", title: title }, iconNode(icon));
    }

    if (siteSettings.instagram_link_allowed && !isEmpty(attrs.collection_thread)){
      const collectionId = getTopicIdFromString(attrs.collection_thread);
      const button = make_button("/t/"+collectionId, 'Collection: '+"/t/"+collectionId, "hand-holding-heart")
      buttons.push(button);
    }

    if (siteSettings.instagram_link_allowed && !isEmpty(attrs.wtb_thread)){
      const wtbId = getTopicIdFromString(attrs.wtb_thread);
      const button = make_button("/t/"+wtbId, 'WTB: '+"/t/"+wtbId, "comment-dollar")
      buttons.push(button);
    }

    if (siteSettings.instagram_link_allowed && !isEmpty(attrs.instagram_username)){
      const button = make_button("https://www.instagram.com/"+attrs.instagram_username, 'Instagram: @'+attrs.instagram_username, "fab-instagram")
      buttons.push(button);
    }
    
    if (siteSettings.youtube_link_allowed && !isEmpty(attrs.youtube_username)){
      const button = make_button("https://www.youtube.com/@"+attrs.youtube_username, 'Youtube: @'+attrs.youtube_username, "fab-youtube")
      buttons.push(button);
    }


    if (siteSettings.x_link_allowed && !isEmpty(attrs.x_username)){
      const button = make_button("https://www.x.com/"+attrs.x_username, 'X: @'+attrs.x_username, "fab-twitter")
      buttons.push(button);
    }
    

    if (siteSettings.ebay_link_allowed && !isEmpty(attrs.ebay_username)) {

      const ebay_url = "https://www.ebay.com/usr/" + attrs.ebay_username;

      if (siteSettings.ebay_affiliate_id){

        const affiliate_url = ebay_url + "?mkevt=1&mkcid=1&mkrid=711-53200-19255-0&campid=" + siteSettings.ebay_affiliate_id + "&toolid=1001";
                
        let button = dec.h('a.icon', { 
              href: "#ebay-disclaimer", 
              onclick: (event) => {
                event.preventDefault();
                createEbayPopup(affiliate_url, event);
              }, 
              title: attrs.ebay_username 
            }, 
            iconNode('fab-ebay')
          );          
          
        buttons.push(button);

      } else {
        const button = make_button(ebay_url, attrs.youtube_username, "fab-ebay")
        buttons.push(button);
      }
    }

    if (buttons.length == 0){ 
      return;
    }
    
    return [ dec.h("div.user-links", buttons) ];
  });
}

export default {
  name: "extend-for-user-links",
  initialize(container) {
    const siteSettings = container.lookup("site-settings:main");
    withPluginApi("0.8", (api) => {    
      decorate_post_with_links(api, siteSettings)
    });
  },
};
