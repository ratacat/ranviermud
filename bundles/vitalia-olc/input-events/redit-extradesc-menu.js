'use strict';

/**
 * Room edit - Room extra desc menu
 */

const sprintf = require('sprintf-js').sprintf;

module.exports = (srcPath) => {
  const EventUtil     = require(srcPath + 'EventUtil');
  const Logger        = require(srcPath + 'Logger');

  return {
    event: state => (socket, room, args) => {
      const say      = EventUtil.genSay(socket);
      const write    = EventUtil.genWrite(socket);

      if (!args.extra_selected) args.extra_selected = '';
      if (!room.extraDescs) room.extraDescs = {};

      if (args.extra_selected == '') {
        let printedTitle = false;
        for (let desc in room.extraDescs) {
          if (!printedTitle) {
            say('Descrições extras atuais:');
            printedTitle = true;
          }
          say(sprintf("<green>%15s</green> : <yellow>%s</yellow>", desc, room.extraDescs[desc]));
        }

        say('');
        say('[<green>Q</green>]  Voltar ao menu principal');
        say('');
        if (typeof args.errorMsg != 'undefined' && args.errorMsg != '') {
          say(`<red>${args.errorMsg}</red>`);
          args.errorMsg = '';
        }
        say('Para apagar uma descrição extra, entre com as keywords e coloque a descrição em branco.');
        write('Entre com as keywords da descrição extra (separadas por virgula, sem espaço): ');
        socket.once('data', val => {
          val = val.toString().trim().toLowerCase();
          if (val == 'q') {
            args.mod_selected = '';
            return socket.emit('redit-main-menu', socket, room, args);
          }
          if (val ==  '') {
            args.errorMsg = 'Keywords em branco!';
          } else {
            args.extra_selected = val;
          }
          return socket.emit('redit-extradesc-menu', socket, room, args);
        });
      } else {
        // Enter the description
        say('');
        if (typeof args.errorMsg != 'undefined' && args.errorMsg != '') {
          say(`<red>${args.errorMsg}</red>`);
          args.errorMsg = '';
        }
        write('Entre a descrição (Não use quebra de linha): ');
        socket.once('data', val => {
          val = val.toString().trim();
          if (val == '') {
            if (room.extraDescs[args.extra_selected + '']) {
              delete room.extraDescs[args.extra_selected + ''];
            }
          } else {
            room.extraDescs[args.extra_selected + ''] = val;
          }
          args.extra_selected = '';
          return socket.emit('redit-extradesc-menu', socket, room, args);
        });
      }
    }
  };
};
