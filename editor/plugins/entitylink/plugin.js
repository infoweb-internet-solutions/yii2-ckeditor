/**
 * @license Copyright (c) 2016, Infoweb - Kurt Aerts. All rights reserved.
 */

'use strict';

(function() {
    CKEDITOR.plugins.add( 'entitylink', {
        requires: 'dialog,fakeobjects,link',
        init: function( editor ) {
            // Do nothing..
        }
    });

    /**
     * If you want to customize a dialog window, the easiest and most convenient way is to enable the Developer Tools
     * plugin that displays the names and IDs of all dialog window elements when you hover them with your mouse.
     * You can see the plugin demo in CKEditor SDK.
     * 
     * EXTRA RESOURCES: 
     * - http://sdk.ckeditor.com/samples/devtools.html
     * - https://gist.github.com/miracle2k/6261717
     * - http://docs.ckeditor.com/#!/api/CKEDITOR.dialog-static-method-add
     * - http://stackoverflow.com/questions/5293920/ckeditor-dynamic-select-in-a-dialog
     * - http://stackoverflow.com/questions/7762810/is-it-possible-to-reinitialize-a-ckeditor-combobox-drop-down-menu/8397198#8397198
     */

    CKEDITOR.on('dialogDefinition', function( ev ) {
        /**
         * Take the dialog name and its definition from the event data.
         */
        var dialog = ev.data;
        var dialogName = ev.data.name;
        var dialogDefinition = ev.data.definition;

        /**
         * Define global variables that define the entity
         */
        var entity = '';
        var entityId = 0;
        var entityUrl = '';

        /**
         * Define global variable for dyanmic dropdown box
         */
        var entitySelection = false;

        /**
         * Check if the definition is from the dialog we're interested
         * on (the "Link" dialog).
         */
        if(dialogName == 'link') {
            /**
             * Get a reference to the "Link Info" tab.
             */
            var infoTab = dialogDefinition.getContents('info');

            /**
             * Get a field in infoTab to the "linkType" tab.
             */
            var linkType = infoTab.get('linkType');
            
            /**
             * Are we using this plugin?
             * Checked by checking the select linkType select.
             */
            var entityFound = false;

            /**
             * Add CUSTOM 'LinkType'
             */
            $.each(CMS.getCkeditorEntitylinkConfiguration().linkableEntities, function(index, value) {
                linkType.items.push([value.label,index]);
            });

            /**
             * Add custom entity selection
             * To choose between different pages, menu's, ..
             */
            infoTab.add({
                type: 'select',
                id: 'entitySelection',
                label: CMS.getCkeditorEntitylinkConfiguration().translations.choose,
                items: [],
                'default': '',
                setup: function() {
                    entitySelection = this;
                    $('#'+ entitySelection.domId).hide();

                    /**
                     * Get url when we change this element.
                     */
                    $(document).on('change', '#'+ entitySelection.domId+' select', function() {
                        entityId = $(this).find('option:selected').val();
                        entityUrl = '';

                        $.ajax({
                            type: "POST",
                            url: CMS.getCkeditorEntitylinkConfiguration().url.getEntityUrl,
                            data: {
                                entity: entity,
                                entity_id: entityId
                            },
                            success: function(result) {                                
                                if(result.status == 200) {
                                    entityUrl = result.url;
                                }
                                else {
                                    alert('Error getEntityUrl: ' + result.status);
                                }
                            }
                        });
                    });
                },
                validate: function() {
                    if(entityUrl == '' && entity != '') {
                        alert(CMS.getCkeditorEntitylinkConfiguration().translations.no_url);
                        return false;
                    }

                    return true;
                }
            });

            dialogDefinition.dialog.on('ok', function(ev) {
                /**
                 * This event is triggerd just before the link plugin 'ok' event
                 * is triggerd. To hook into the same url processing we set the available fields
                 * with our data.
                 * That way the link plugin will render our url into a correct hyperlink
                 */

                if(entityFound) {
                    /**
                     * Retrieve field linkType in info tab.
                     * Then remove every selected options
                     * And select the option with url
                     */
                    var linkTypeSelect = $('#'+this.getContentElement("info","linkType").domId+' select');
                    linkTypeSelect.find('option').removeAttr('selected');
                    linkTypeSelect.find('option[value="url"]').attr('selected', 'selected');

                    /**
                     * Retrieve field protocol in info tab.
                     * Then remove every selected options
                     * And select the option with no value
                     */
                    var protocolSelect = $('#'+this.getContentElement("info","protocol").domId+' select');
                    protocolSelect.find('option').removeAttr('selected');
                    protocolSelect.find('option[value=""]').attr('selected', 'selected');

                    /**
                     * Retrieve field url in info tab.
                     * Then change value to entityUrl
                     */
                    $('#'+this.getContentElement("info","url").domId+' input').val(entityUrl);
                }
            });

            /**
             * When the user picks a new type in the select box:
             * Show or hide our controls.
             */
            linkType.onChange = CKEDITOR.tools.override(linkType.onChange, function(original) {
                return function() {
                    /**
                     * Run the default logic (handles all other select items)
                     */
                    original.call(this);

                    /**
                     * Define entity class
                     */
                    entity = this.getValue();

                    /**
                     * Its very important to reset every parameter
                     */
                    entityFound = false;
                    entityId = 0;
                    entityUrl = '';

                    /**
                     * Loop each link type
                     */
                    $.each(CMS.getCkeditorEntitylinkConfiguration().linkableEntities, function(index, value) {
                        /**
                         * Handle our own link type options
                         */
                        if(entity == index) {
                            entityFound = true;

                            $.ajax({
                                type: "POST",
                                url: CMS.getCkeditorEntitylinkConfiguration().url.getEntities,
                                data: {
                                    entity: index
                                },
                                success: function(result) {
                                    if(result.status == 200) {
                                        var element = $('#'+ entitySelection.domId + ' select');

                                        var html = '<option></option>';
                                        $.each(result.data, function(index, value) {
                                            html += '<option value="' + index + '">'+ value +'</option>';
                                        });

                                        $('#'+ entitySelection.domId + ' select').html(html);
                                        $('#'+ entitySelection.domId).show();
                                    }
                                    else {
                                        alert('Error getEntities: ' + result.status);
                                    }
                                }
                            });
                        }
                    });

                    if(!entityFound) {
                        entity = '';
                        $('#'+ entitySelection.domId).hide();
                    }
                };
            });
        }
    });
} )();