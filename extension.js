/* extension.js
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 */

/* exported init */

const GETTEXT_DOMAIN = 'my-indicator-extension';

const { GObject, St } = imports.gi;
const ExtensionUtils = imports.misc.extensionUtils;
const Main = imports.ui.main;
const Mainloop = imports.mainloop;
const GLib = imports.gi.GLib;

const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;

const _ = ExtensionUtils.gettext;

let panelButton, panelButtonText, timeout, statusText, finalText;



function extraireAvantPourcentage(chaine) {
  let result = '';
  for (let i = 0; i < chaine.length; i++) {
    if (chaine[i] === '%' && i > 1) {
      result += chaine[i - 2] + chaine[i - 1] + '%';
    }
  }
  return result;
}


const Indicator = GObject.registerClass(
class Indicator extends PanelMenu.Button {
    _init() {
        super._init(0.0, _('My Shiny Indicator'));
        var [ok, out, err, exit] = GLib.spawn_command_line_sync('df -h /');
        finalText = "DISK\n" + extraireAvantPourcentage(out.toString().substring(out.toString().indexOf("/") + 1));
        statusText = new St.Label({
            style_class : "statusText",
	    	text : finalText
	    });
        this.add_child(statusText);
        
        let credits = new PopupMenu.PopupMenuItem(_('Credits'));
        
        credits.connect('activate', () => {
            Main.notify(_('Extension created by 0CT0PUCE'));
        });
        
        let reload = new PopupMenu.PopupMenuItem(_('Reload'));
        reload.connect('activate', () => {
        	var [ok, out, err, exit] = GLib.spawn_command_line_sync('df -h /');
        	finalText = "DISK\n" + extraireAvantPourcentage(out.toString().substring(out.toString().indexOf("/") + 1));
    		statusText.set_text(finalText);
        });
        
        this.menu.addMenuItem(reload);
        this.menu.addMenuItem(credits);
        
        var intervalId = window.setInterval(function(){
  			var [ok, out, err, exit] = GLib.spawn_command_line_sync('df -h /');
        	finalText = "DISK\n" + extraireAvantPourcentage(out.toString().substring(out.toString().indexOf("/") + 1));
    		statusText.set_text(finalText);
		}, 15000);
    }
});



class Extension {
    constructor(uuid) {
        this._uuid = uuid;
        ExtensionUtils.initTranslations(GETTEXT_DOMAIN);
    }
    enable() {
        this._indicator = new Indicator();
        Main.panel.addToStatusArea(this._uuid, this._indicator);
    }
    disable() {
        this._indicator.destroy();
        this._indicator = null;
    }
}
/*
function setLabelText(){
  var [ok, out, err, exit] = GLib.spawn_command_line_sync('df -h /');
  if(err.toString() != null){
  	statusText.set_text(err.toString());
    Main.notify(_(err.toString()));
    finalText = "DISK\n" + extraireAvantPourcentage(out.toString().substring(out.toString().indexOf("/") + 1));
    statusText.set_text(finalText);
  }
  else{
  	finalText = "DISK\n" + extraireAvantPourcentage(out.toString().substring(out.toString().indexOf("/") + 1));
   	statusText.set_text(finalText);
  }
  return true;
}
*/         
function init(meta) {
  return new Extension(meta.uuid);
  timeout = Mainloop.timeout_add_seconds(5.0, setLabelText());
}

function enable() {
  init();
}

function disable() {
  Extension.disable();
}
