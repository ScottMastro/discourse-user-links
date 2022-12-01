# frozen_string_literal: true

# name: discourse-user-links
# about: Adds user links to Discourse posts
# version: 0.1
# author: Scott Mastro
# url: https://github.com/ScottMastro/
# transpile_js: true

enabled_site_setting :user_links_enabled

register_svg_icon "fab-instagram" if respond_to?(:register_svg_icon)
register_svg_icon "fab-ebay" if respond_to?(:register_svg_icon)
register_svg_icon "fab-youtube" if respond_to?(:register_svg_icon)
register_svg_icon "fa-comment-dollar" if respond_to?(:register_svg_icon)
register_svg_icon "fa-hand-holding-heart" if respond_to?(:register_svg_icon)


DiscoursePluginRegistry.serialized_current_user_fields << "collection_thread"
DiscoursePluginRegistry.serialized_current_user_fields << "wtb_thread"
DiscoursePluginRegistry.serialized_current_user_fields << "instagram_username"
DiscoursePluginRegistry.serialized_current_user_fields << "youtube_username"
DiscoursePluginRegistry.serialized_current_user_fields << "ebay_username"

after_initialize do
  User.register_custom_field_type('collection_thread', :text)
  User.register_custom_field_type('wtb_thread', :text)
  User.register_custom_field_type('instagram_username', :text)
  User.register_custom_field_type('youtube_username', :text)
  User.register_custom_field_type('ebay_username', :text)

  register_editable_user_custom_field [:collection_thread, :wtb_thread, :instagram_username, :youtube_username, :ebay_username]

  allow_public_user_custom_field :collection_thread
  allow_public_user_custom_field :wtb_thread
  allow_public_user_custom_field :instagram_username
  allow_public_user_custom_field :youtube_username
  allow_public_user_custom_field :ebay_username

  add_to_serializer(:post, :collection_thread) do
      object.user.custom_fields['collection_thread'] if object.user
  end
  add_to_serializer(:post, :wtb_thread) do
      object.user.custom_fields['wtb_thread'] if object.user
  end

  add_to_serializer(:post, :instagram_username) do
      object.user.custom_fields['instagram_username'] if object.user
  end
  add_to_serializer(:post, :youtube_username) do
      object.user.custom_fields['youtube_username'] if object.user
  end
  add_to_serializer(:post, :ebay_username) do
    object.user.custom_fields['ebay_username'] if object.user
  end
end

register_asset "stylesheets/common/common.scss"
register_asset "stylesheets/mobile/mobile.scss", :mobile
