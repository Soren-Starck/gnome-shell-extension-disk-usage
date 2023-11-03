/**********************************************************************
*
*   Extension created by :
*   ___   _____ _______ ___  _____  _    _  _____ ______
*  / _ \ / ____|__   __/ _ \|  __ \| |  | |/ ____|  ____|
* | | | | |       | | | | | | |__) | |  | | |    | |__
* | | | | |       | | | | | |  ___/| |  | | |    |  __|
* | |_| | |____   | | | |_| | |    | |__| | |____| |____
*  \___/ \_____|  |_|  \___/|_|     \____/ \_____|______|
*
*  Special thanks to Psykar
*
* DiskUsage is free software: you can redistribute it and/or modify
* it under the terms of the GNU General Public License version 3 as
* published by the Free Software Foundation.
*
**********************************************************************/


import GObject  from  'gi://GObject';
import St from 'gi://St';
import GLib from 'gi://GLib';
import Clutter from 'gi://Clutter';

import { Extension, gettext as _ } from 'resource:///org/gnome/shell/extensions/extension.js';
import { notify, panel } from 'resource:///org/gnome/shell/ui/main.js';
import {Button} from 'resource:///org/gnome/shell/ui/panelMenu.js';
import { PopupMenuItem } from 'resource:///org/gnome/shell/ui/popupMenu.js';

var intervalId;

function extraireAvantPourcentage(chaine) {
  let result = '';
  for (let i = 0; i < chaine.length; i++) {
    if (chaine[i] === '%' && i > 1) {
      result += chaine[i - 2] + chaine[i - 1] + '%';
    }
  }
  return result;
}

function glibOutToPercent(u) {
  let tmpText = new TextDecoder().decode(u);
  return extraireAvantPourcentage(tmpText.substring(tmpText.indexOf("/") + 1));
}


const Indicator = GObject.registerClass(
  class Indicator extends Button {
    _init() {
      super._init(0.0, _('My Shiny Indicator'));

      let statusText;

      let storageIcon = new St.Icon({ icon_name: 'drive-harddisk-symbolic',
                                style_class: 'system-status-icon' });

      let box = new St.BoxLayout({ style_class: 'system-status-icon-box' });

      box.add_child(storageIcon);
      var [ok, out, err, exit] = GLib.spawn_command_line_sync('df -h /');
      //"DISK\n" +
      statusText = new St.Label({
            style_class : "statusText",
        text : glibOutToPercent(out)
      });
      statusText.y_align = Clutter.ActorAlign.CENTER;
      statusText.x_align = Clutter.ActorAlign.CENTER;
      box.add_child(statusText);

      this.add_child(box);

      let credits = new PopupMenuItem(_('Credits'));

      credits.connect('activate', () => {
        notify(_('Extension created by 0CT0PUCE'));
      });

      let reload = new PopupMenuItem(_('Reload'));
      reload.connect('activate', () => {
        var [ok, out, err, exit] = GLib.spawn_command_line_sync('df -h /');
        statusText.set_text(glibOutToPercent(out));
      });

      this.menu.addMenuItem(reload);
      this.menu.addMenuItem(credits);

      intervalId = window.setInterval(function(){
        var [ok, out, err, exit] = GLib.spawn_command_line_sync('df -h /');
        statusText.set_text(glibOutToPercent(out));
      }, 15000);
    }
  }
);



export default class DiskUsageExtension extends Extension {
  enable() {
    this._indicator = new Indicator();
    panel.addToStatusArea(this._uuid, this._indicator);
  }
  disable() {
    clearInterval(intervalId);
    intervalId = null;
    this._indicator.destroy();
    this._indicator = null;
  }
}

