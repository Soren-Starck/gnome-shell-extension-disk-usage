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
const GLib = imports.gi.GLib;
const Clutter = imports.gi.Clutter;


const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;

const _ = ExtensionUtils.gettext;

let timeout, statusText, finalText;

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


const Indicator = GObject.registerClass(
class Indicator extends PanelMenu.Button {
    _init() {
        super._init(0.0, _('My Shiny Indicator'));
        
        let storageIcon = new St.Icon({ icon_name: 'drive-harddisk-symbolic',
                                 style_class: 'system-status-icon' });
        
        let box = new St.BoxLayout({ style_class: 'system-status-icon-box' });
        
        box.add_child(storageIcon);
        var [ok, out, err, exit] = GLib.spawn_command_line_sync('df -h /');
        finalText = extraireAvantPourcentage(out.toString().substring(out.toString().indexOf("/") + 1));
        //"DISK\n" + 
        statusText = new St.Label({
            style_class : "statusText",
	    	text : finalText
	    });
	    statusText.y_align = Clutter.ActorAlign.CENTER;
	    statusText.x_align = Clutter.ActorAlign.CENTER;
	    box.add_child(statusText);
	    
	    
	    
        this.add_child(box);
        
        let credits = new PopupMenu.PopupMenuItem(_('Credits'));
        
        credits.connect('activate', () => {
            Main.notify(_('Extension created by 0CT0PUCE'));
        });
        
        let reload = new PopupMenu.PopupMenuItem(_('Reload'));
        reload.connect('activate', () => {
        	var [ok, out, err, exit] = GLib.spawn_command_line_sync('df -h /');
        	finalText = extraireAvantPourcentage(out.toString().substring(out.toString().indexOf("/") + 1));
    		statusText.set_text(finalText);
        });
        
        this.menu.addMenuItem(reload);
        this.menu.addMenuItem(credits);
        
        intervalId = window.setInterval(function(){
  			var [ok, out, err, exit] = GLib.spawn_command_line_sync('df -h /');
        	finalText = extraireAvantPourcentage(out.toString().substring(out.toString().indexOf("/") + 1));
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
	clearInterval(intervalId);
        this._indicator.destroy();
        this._indicator = null;
    }
}

function init(meta) {
  return new Extension(meta.uuid);
}
