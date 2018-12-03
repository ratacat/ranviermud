'use strict';

/**
 * Mob edit - Mob Attributes menu
 */

const sprintf = require('sprintf-js').sprintf;

module.exports = (srcPath) => {
  const EventUtil     = require(srcPath + 'EventUtil');
  const Logger        = require(srcPath + 'Logger');

  return {
    event: state => (socket, mob, args) => {
      const say      = EventUtil.genSay(socket);
      const write    = EventUtil.genWrite(socket);
      const availableMods = ['STR', 'DEX', 'INT', 'WIS', 'CON', 'LUK'];

      if (!args.mod_selected) args.mod_selected = '';
      if (!mob.attributes) mob.attributes = {};

      if (args.mod_selected == '') {
        say('-- Atributos do Mob:');
        // Select the modifier
        let i = 0;
        let modifiers = [];
        for (let modifier in availableMods) {
          modifiers.push(availableMods[modifier].toLowerCase());
          write(sprintf("<green>%-20s</green>", availableMods[modifier]));
          if (++i % 3 === 0) {
            say('');
          }
        }
        say('Ou use ALL para setar todos atributos.');
        say('');
        let printedTitle = false;
        for (let mod in mob.attributes) {
          if (!printedTitle) {
            say('Atributos atuais:');
            printedTitle = true;
          }
          say(sprintf("<green>%15s</green> : <yellow>%s</yellow>", mod.toUpperCase(), mob.attributes[mod]));
        }
        say('');
        say('[<green>Q</green>]  Voltar ao menu principal');
        say('');
        if (typeof args.errorMsg != 'undefined' && args.errorMsg != '') {
          say(`<red>${args.errorMsg}</red>`);
          args.errorMsg = '';
        }

        write('Digite o Atributo: ');
        socket.once('data', val => {
          val = val.toString().trim().toLowerCase();
          if (val == 'q') {
            args.mod_selected = '';
            return socket.emit('medit-main-menu', socket, mob, args);
          }
          let quantityStr = '';
          if (val.indexOf(' ') >= 0) {
            quantityStr = val.split(' ')[1].toString().trim();
            val = val.split(' ')[0].toString().trim();
          }
          let idx = modifiers.indexOf(val.toLowerCase());
          if (idx < 0 && val != 'all') {
            args.errorMsg = 'Modificador inválido!';
          } else {
            if (quantityStr != '') {
              const quantity = parseInt(quantityStr);
              if (isNaN(quantity) || quantity <= -10000 || quantity > 10000) {
                args.errorMsg = 'Número inválido!';
                return socket.emit('medit-attributes-menu', socket, mob, args);
              }
              if (quantity == 0) {
                if (val == 'all') {
                  delete mob.attributes;
                  mob.attributes = {};
                } else {
                  if (mob.attributes[val + '']) {
                    delete mob.attributes[val + ''];
                  }
                }
              } else {
                if (val == 'all') {
                  for (let x in availableMods) {
                    mob.attributes[availableMods[x].toLowerCase() + ''] = quantity;
                  }
                } else {
                  mob.attributes[val + ''] = quantity;
                }
              }
            } else {
              args.mod_selected = val;
            }
          }
          return socket.emit('medit-attributes-menu', socket, mob, args);
        });
      } else {
        // Select the quantity
        say('');
        if (typeof args.errorMsg != 'undefined' && args.errorMsg != '') {
          say(`<red>${args.errorMsg}</red>`);
          args.errorMsg = '';
        }
        write('Entre a quantidade do modificador: ');
        socket.once('data', val => {
          val = parseFloat(val, 10);
          if (isNaN(val) || val <= -10000 || val > 10000) {
            args.errorMsg = 'Número inválido!';
            return socket.emit('medit-attributes-menu', socket, mob, args);
          } else {
            if (val == 0) {
              if (args.mod_selected == 'all') {
                  delete mob.attributes;
                  mob.attributes = {};
              } else {
                if (mob.attributes[args.mod_selected + '']) {
                  delete mob.attributes[args.mod_selected + ''];
                }
              }
            } else {
              if (args.mod_selected == 'all') {
                for (let x in availableMods) {
                  mob.attributes[availableMods[x].toLowerCase() + ''] = val;
                }
              } else {
                mob.attributes[args.mod_selected + ''] = val;
              }
            }
            args.mod_selected = '';
            return socket.emit('medit-attributes-menu', socket, mob, args);
          }
        });
      }
    }
  };
};
